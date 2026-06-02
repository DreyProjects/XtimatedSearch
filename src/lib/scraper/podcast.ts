export interface PodcastResult {
  title: string
  description: string
  thumbnail_url: string
  author: string
  site_name: string
  published_at: string | null
  content_type: 'podcast'
  estimated_seconds: number
  word_count: number
}

function parseDuration(duration: string): number {
  const parts = duration.split(':').map(Number)
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2]
  if (parts.length === 2) return parts[0] * 60 + parts[1]
  return parseInt(duration) || 0
}

export async function scrapePodcast(url: string): Promise<PodcastResult> {
  const res = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; XtimatedSearch/1.0)' },
    signal: AbortSignal.timeout(10000),
  })
  const xml = await res.text()

  const getTag = (tag: string) =>
    xml.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\/${tag}>`, 'i'))?.[1]?.trim() ?? ''

  const title = getTag('title').replace(/<!\[CDATA\[([\s\S]*?)\]\]>/, '$1')
  const description = getTag('description').replace(/<!\[CDATA\[([\s\S]*?)\]\]>/, '$1').slice(0, 300)
  const author =
    xml.match(/<itunes:author[^>]*>([\s\S]*?)<\/itunes:author>/i)?.[1]?.trim() ??
    getTag('author')
  const imageUrl =
    xml.match(/url>(https?:\/\/[^<]+)<\/url/i)?.[1] ??
    xml.match(/itunes:image href="([^"]+)"/i)?.[1] ??
    ''

  const durationRaw =
    xml.match(/<itunes:duration[^>]*>([\s\S]*?)<\/itunes:duration>/i)?.[1]?.trim() ?? ''
  const pubDate = getTag('pubDate')

  let published_at: string | null = null
  try {
    if (pubDate) published_at = new Date(pubDate).toISOString()
  } catch {}

  return {
    title,
    description,
    thumbnail_url: imageUrl,
    author,
    site_name: new URL(url).hostname.replace('www.', ''),
    published_at,
    content_type: 'podcast',
    estimated_seconds: parseDuration(durationRaw),
    word_count: 0,
  }
}
