import { JSDOM } from 'jsdom'
import { Readability } from '@mozilla/readability'

export interface ArticleResult {
  title: string
  description: string
  thumbnail_url: string
  author: string
  site_name: string
  published_at: string | null
  content_type: 'article'
  estimated_seconds: number
  word_count: number
}

function extractFromMeta(doc: Document, property: string): string {
  return (
    doc.querySelector(`meta[property="${property}"]`)?.getAttribute('content') ??
    doc.querySelector(`meta[name="${property}"]`)?.getAttribute('content') ??
    ''
  )
}

function extractJsonLd(doc: Document): Record<string, unknown> {
  const scripts = Array.from(doc.querySelectorAll('script[type="application/ld+json"]'))
  for (const script of scripts) {
    try {
      const data = JSON.parse(script.textContent ?? '')
      if (data['@type'] === 'Article' || data['@type'] === 'NewsArticle') return data
    } catch {}
  }
  return {}
}

export async function scrapeArticle(url: string): Promise<ArticleResult> {
  const res = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; XtimatedSearch/1.0)' },
    signal: AbortSignal.timeout(10000),
  })
  const html = await res.text()
  const dom = new JSDOM(html, { url })
  const doc = dom.window.document

  const jsonLd = extractJsonLd(doc)

  const title =
    (jsonLd['headline'] as string) ||
    extractFromMeta(doc, 'og:title') ||
    doc.title ||
    url

  const description =
    (jsonLd['description'] as string) ||
    extractFromMeta(doc, 'og:description') ||
    extractFromMeta(doc, 'description') ||
    ''

  const thumbnail_url =
    extractFromMeta(doc, 'og:image') ||
    extractFromMeta(doc, 'twitter:image') ||
    ''

  const authorRaw =
    (jsonLd['author'] as { name?: string } | string | undefined) || ''
  const author =
    typeof authorRaw === 'string'
      ? authorRaw
      : authorRaw?.name ||
        extractFromMeta(doc, 'article:author') ||
        extractFromMeta(doc, 'author') ||
        ''

  const site_name =
    extractFromMeta(doc, 'og:site_name') ||
    new URL(url).hostname.replace('www.', '')

  const published_at =
    (jsonLd['datePublished'] as string) ||
    extractFromMeta(doc, 'article:published_time') ||
    null

  const reader = new Readability(doc.cloneNode(true) as Document)
  const article = reader.parse()
  const textContent = article?.textContent ?? ''
  const wordCount = textContent.split(/\s+/).filter(Boolean).length

  return {
    title,
    description: description.slice(0, 400),
    thumbnail_url,
    author,
    site_name,
    published_at,
    content_type: 'article',
    estimated_seconds: Math.round((wordCount / 200) * 60),
    word_count: wordCount,
  }
}
