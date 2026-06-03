import { scrapeYoutube } from './youtube'
import { scrapeVimeo } from './vimeo'
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

const YOUTUBE_HOSTS = ['youtube.com', 'youtu.be', 'youtube-nocookie.com', 'm.youtube.com']
const VIMEO_HOSTS = ['vimeo.com', 'player.vimeo.com']

function isYoutube(url: URL): boolean {
  const host = url.hostname.replace('www.', '')
  return YOUTUBE_HOSTS.some(h => host === h || host.endsWith('.' + h))
}

function isVimeo(url: URL): boolean {
  const host = url.hostname.replace('www.', '')
  return VIMEO_HOSTS.some(h => host === h)
}

async function probeUrl(url: string): Promise<{ contentType: string; finalUrl: string }> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 2500)
  try {
    const res = await fetch(url, {
      method: 'HEAD',
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; XtimatedSearch/1.0)' },
      redirect: 'follow',
      signal: controller.signal,
    })
    return { contentType: res.headers.get('content-type') ?? '', finalUrl: res.url ?? url }
  } catch {
    return { contentType: '', finalUrl: url }
  } finally {
    clearTimeout(timer)
  }
}

export async function scrapeUrl(url: string): Promise<ScrapeResult> {
  const normalized = url.startsWith('http') ? url : `https://${url}`

  try {
    const parsed = new URL(normalized)
    const pathname = parsed.pathname.toLowerCase()

    // — Video platforms —
    if (isYoutube(parsed)) return await scrapeYoutube(normalized)
    if (isVimeo(parsed)) return await scrapeVimeo(normalized)

    // — PDFs por extensión —
    if (pathname.endsWith('.pdf')) return await scrapePdf(normalized)

    // — HEAD request para detectar Content-Type real —
    const { contentType, finalUrl } = await probeUrl(normalized)

    if (contentType.includes('application/pdf')) return await scrapePdf(finalUrl)

    if (
      contentType.includes('application/rss') ||
      contentType.includes('application/atom') ||
      contentType.includes('text/xml') ||
      contentType.includes('application/xml')
    ) {
      return await scrapePodcast(finalUrl)
    }

    // — Contenido no-HTML (binarios, JSON, etc.) —
    if (
      contentType &&
      !contentType.includes('text/html') &&
      !contentType.includes('xhtml') &&
      !contentType.includes('text/plain')
    ) {
      return {
        title: decodeURIComponent(pathname.split('/').pop() ?? normalized),
        description: `Tipo de archivo: ${contentType.split(';')[0]}`,
        thumbnail_url: '', author: '', site_name: parsed.hostname.replace('www.', ''),
        published_at: null, content_type: 'other', estimated_seconds: 0, word_count: 0,
      }
    }

    // — Artículo / página web —
    return await scrapeArticle(finalUrl || normalized)

  } catch (err) {
    console.error('Scrape error:', err)
    return {
      title: url, description: '', thumbnail_url: '', author: '',
      site_name: '', published_at: null, content_type: 'other',
      estimated_seconds: 0, word_count: 0,
    }
  }
}
