export interface YoutubeResult {
  title: string
  description: string
  thumbnail_url: string
  author: string
  site_name: string
  published_at: string | null
  content_type: 'video'
  estimated_seconds: number
  word_count: number
}

function parseIsoDuration(iso: string): number {
  const m = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/)
  if (!m) return 0
  return (parseInt(m[1] ?? '0') * 3600) + (parseInt(m[2] ?? '0') * 60) + parseInt(m[3] ?? '0')
}

function extractVideoId(url: string): string | null {
  const patterns = [
    /[?&]v=([^&#]+)/,
    /youtu\.be\/([^?&#]+)/,
    /shorts\/([^?&#]+)/,
    /embed\/([^?&#]+)/,
  ]
  for (const re of patterns) {
    const m = url.match(re)
    if (m?.[1]) return m[1]
  }
  return null
}

async function getDurationFromPage(videoId: string): Promise<number> {
  try {
    const res = await fetch(`https://www.youtube.com/watch?v=${videoId}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      signal: AbortSignal.timeout ? AbortSignal.timeout(10000) : undefined,
    })
    const html = await res.text()

    // Intentar obtener duración exacta en segundos del JSON embebido
    const lengthMatch = html.match(/"lengthSeconds"\s*:\s*"(\d+)"/)
    if (lengthMatch) return parseInt(lengthMatch[1])

    // Fallback: meta itemprop duration (ISO 8601)
    const isoMatch = html.match(/itemprop="duration"\s+content="([^"]+)"/)
    if (isoMatch) return parseIsoDuration(isoMatch[1])
  } catch {}
  return 0
}

async function getMetaFromOembed(url: string): Promise<{
  title: string
  author: string
  thumbnail_url: string
  published_at: string | null
  description: string
} | null> {
  try {
    const res = await fetch(
      `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`,
      { signal: AbortSignal.timeout ? AbortSignal.timeout(6000) : undefined }
    )
    if (!res.ok) return null
    const data = await res.json()
    return {
      title: data.title ?? '',
      author: data.author_name ?? '',
      thumbnail_url: data.thumbnail_url ?? '',
      published_at: null,
      description: '',
    }
  } catch {
    return null
  }
}

async function getMetaFromApi(videoId: string): Promise<{
  title: string
  author: string
  thumbnail_url: string
  published_at: string | null
  description: string
  duration: number
} | null> {
  const apiKey = process.env.YOUTUBE_API_KEY
  if (!apiKey) return null
  try {
    const res = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails&id=${videoId}&key=${apiKey}`
    )
    const data = await res.json()
    const item = data.items?.[0]
    if (!item) return null
    return {
      title: item.snippet.title,
      author: item.snippet.channelTitle,
      thumbnail_url: item.snippet.thumbnails?.maxres?.url ?? item.snippet.thumbnails?.high?.url ?? '',
      published_at: item.snippet.publishedAt ?? null,
      description: item.snippet.description?.slice(0, 300) ?? '',
      duration: parseIsoDuration(item.contentDetails?.duration ?? ''),
    }
  } catch {
    return null
  }
}

export async function scrapeYoutube(url: string): Promise<YoutubeResult> {
  const videoId = extractVideoId(url)

  if (!videoId) {
    return {
      title: url, description: '', thumbnail_url: '', author: '',
      site_name: 'YouTube', published_at: null,
      content_type: 'video', estimated_seconds: 0, word_count: 0,
    }
  }

  // Intentar API de YouTube primero (si hay key)
  const apiMeta = await getMetaFromApi(videoId)
  if (apiMeta) {
    return {
      title: apiMeta.title,
      description: apiMeta.description,
      thumbnail_url: apiMeta.thumbnail_url,
      author: apiMeta.author,
      site_name: 'YouTube',
      published_at: apiMeta.published_at,
      content_type: 'video',
      estimated_seconds: apiMeta.duration,
      word_count: 0,
    }
  }

  // Sin API key: oEmbed para metadatos + scraping para duración (en paralelo)
  const [oembedMeta, duration] = await Promise.all([
    getMetaFromOembed(url),
    getDurationFromPage(videoId),
  ])

  return {
    title: oembedMeta?.title ?? `Video de YouTube`,
    description: oembedMeta?.description ?? '',
    thumbnail_url:
      oembedMeta?.thumbnail_url ??
      `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
    author: oembedMeta?.author ?? '',
    site_name: 'YouTube',
    published_at: oembedMeta?.published_at ?? null,
    content_type: 'video',
    estimated_seconds: duration,
    word_count: 0,
  }
}
