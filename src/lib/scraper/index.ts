import { scrapeYoutube } from './youtube'
import { scrapeArticle } from './article'
import { scrapePodcast } from './podcast'
import { scrapePdf } from './pdf'

export interface ScrapeResult {
  title: string
  description: string
  thumbnail_url: string
  author: string
  site_name: string
  published_at: string | null
  content_type: 'article' | 'video' | 'podcast' | 'pdf' | 'other'
  estimated_seconds: number
  word_count: number
}

async function isPodcastFeed(url: string): Promise<boolean> {
  try {
    const res = await fetch(url, {
      method: 'HEAD',
      signal: AbortSignal.timeout(5000),
    })
    const ct = res.headers.get('content-type') ?? ''
    return ct.includes('rss') || ct.includes('xml') || ct.includes('atom')
  } catch {
    return false
  }
}

export async function scrapeUrl(url: string): Promise<ScrapeResult> {
  const normalized = url.startsWith('http') ? url : `https://${url}`

  try {
    const parsed = new URL(normalized)
    const hostname = parsed.hostname.replace('www.', '')
    const pathname = parsed.pathname.toLowerCase()

    if (hostname === 'youtube.com' || hostname === 'youtu.be' || parsed.searchParams.has('v')) {
      return await scrapeYoutube(normalized)
    }

    if (pathname.endsWith('.pdf')) {
      return await scrapePdf(normalized)
    }

    if (await isPodcastFeed(normalized)) {
      return await scrapePodcast(normalized)
    }

    return await scrapeArticle(normalized)
  } catch (err) {
    console.error('Scrape error:', err)
    return {
      title: url,
      description: '',
      thumbnail_url: '',
      author: '',
      site_name: '',
      published_at: null,
      content_type: 'other',
      estimated_seconds: 0,
      word_count: 0,
    }
  }
}
