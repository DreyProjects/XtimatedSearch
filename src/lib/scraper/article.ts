import { calcReadingSeconds } from '../readingSpeed'

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

// ---------------------------------------------------------------------------
// Metadatos (regex, sin JSDOM)
// ---------------------------------------------------------------------------

function extractMeta(html: string, property: string): string {
  const patterns = [
    new RegExp(`<meta[^>]+property=["']${property}["'][^>]+content=["']([^"']+)["']`, 'i'),
    new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+property=["']${property}["']`, 'i'),
    new RegExp(`<meta[^>]+name=["']${property}["'][^>]+content=["']([^"']+)["']`, 'i'),
    new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+name=["']${property}["']`, 'i'),
  ]
  for (const re of patterns) {
    const m = html.match(re)
    if (m?.[1]) return m[1].trim()
  }
  return ''
}

function extractJsonLd(html: string): Record<string, unknown> {
  const matches = html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)
  for (const match of matches) {
    try {
      const data = JSON.parse(match[1])
      if (['Article', 'NewsArticle', 'TechArticle', 'BlogPosting'].includes(data['@type'])) return data
    } catch {}
  }
  return {}
}

function countWords(text: string): number {
  return text
    .replace(/https?:\/\/\S+/g, ' ')   // quitar URLs
    .replace(/[^\w\sáéíóúüñÁÉÍÓÚÜÑ]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length >= 2 && /[a-záéíóúüñA-ZÁÉÍÓÚÜÑA-Za-z]/.test(w))
    .length
}

// ---------------------------------------------------------------------------
// Extracción de texto completo con Readability + JSDOM
// ---------------------------------------------------------------------------

async function extractWithReadability(html: string, url: string): Promise<number> {
  try {
    const { JSDOM } = await import('jsdom')
    const { Readability } = await import('@mozilla/readability')

    const dom = new JSDOM(html, { url })
    const doc = dom.window.document

    // Eliminar elementos que siempre son ruido antes de pasar a Readability
    const noiseSelectors = [
      'script', 'style', 'nav', 'header', 'footer', 'aside',
      '[role="navigation"]', '[role="banner"]', '[role="contentinfo"]',
      '.sidebar', '.nav', '.menu', '.advertisement', '.cookie',
    ]
    noiseSelectors.forEach(sel => {
      doc.querySelectorAll(sel).forEach(el => el.remove())
    })

    const reader = new Readability(doc, { charThreshold: 0, nbTopCandidates: 10 })
    const article = reader.parse()

    if (article?.textContent) {
      const wc = countWords(article.textContent)
      if (wc > 50) return wc
    }

    // Si Readability no encontró artículo, usar todo el body limpio
    const bodyText = doc.body?.textContent ?? ''
    return countWords(bodyText)
  } catch {
    return 0
  }
}

function extractFallback(html: string): number {
  const cleaned = html
    .replace(/<(script|style|nav|header|footer|aside|noscript|iframe)[^>]*>[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&[a-z#0-9]+;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim()
  return countWords(cleaned)
}

// ---------------------------------------------------------------------------
// Scraper principal
// ---------------------------------------------------------------------------

export async function scrapeArticle(url: string): Promise<ArticleResult> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 15000)

  let html = ''
  let contentType = 'text/html'

  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'es,en;q=0.5',
      },
      signal: controller.signal,
    })
    contentType = res.headers.get('content-type') ?? 'text/html'

    // Si no es HTML, devolver resultado vacío con lo que se pueda extraer de la URL
    if (!contentType.includes('text/html') && !contentType.includes('xhtml')) {
      return {
        title: decodeURIComponent(url.split('/').pop() ?? url),
        description: '',
        thumbnail_url: '',
        author: '',
        site_name: new URL(url).hostname.replace('www.', ''),
        published_at: null,
        content_type: 'article',
        estimated_seconds: 0,
        word_count: 0,
      }
    }

    html = await res.text()
  } catch {
    return {
      title: new URL(url).hostname,
      description: '',
      thumbnail_url: '',
      author: '',
      site_name: new URL(url).hostname.replace('www.', ''),
      published_at: null,
      content_type: 'article',
      estimated_seconds: 0,
      word_count: 0,
    }
  } finally {
    clearTimeout(timeout)
  }

  const jsonLd = extractJsonLd(html)

  const title =
    (jsonLd['headline'] as string) ||
    extractMeta(html, 'og:title') ||
    html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1]?.trim() ||
    url

  const description =
    (jsonLd['description'] as string) ||
    extractMeta(html, 'og:description') ||
    extractMeta(html, 'description') ||
    extractMeta(html, 'twitter:description') ||
    ''

  const thumbnail_url =
    extractMeta(html, 'og:image') ||
    extractMeta(html, 'twitter:image') ||
    ''

  const authorRaw = jsonLd['author'] as { name?: string } | string | undefined
  const author =
    (typeof authorRaw === 'string' ? authorRaw : authorRaw?.name) ||
    extractMeta(html, 'article:author') ||
    extractMeta(html, 'author') ||
    ''

  const site_name =
    extractMeta(html, 'og:site_name') ||
    new URL(url).hostname.replace('www.', '')

  const published_at =
    (jsonLd['datePublished'] as string) ||
    extractMeta(html, 'article:published_time') ||
    null

  // Extraer texto con Readability; fallback a regex si falla
  let wordCount = await extractWithReadability(html, url)
  if (wordCount < 50) wordCount = extractFallback(html)

  const estimatedSeconds = calcReadingSeconds(wordCount)

  return {
    title: title.slice(0, 200),
    description: description.slice(0, 400),
    thumbnail_url,
    author,
    site_name,
    published_at,
    content_type: 'article',
    estimated_seconds: estimatedSeconds,
    word_count: wordCount,
  }
}
