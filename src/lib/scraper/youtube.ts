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

function parseISODuration(duration: string): number {
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/)
  if (!match) return 0
  const hours = parseInt(match[1] || '0')
  const minutes = parseInt(match[2] || '0')
  const seconds = parseInt(match[3] || '0')
  return hours * 3600 + minutes * 60 + seconds
}

export async function scrapeYoutube(url: string): Promise<YoutubeResult> {
  const apiKey = process.env.YOUTUBE_API_KEY
  const videoIdMatch = url.match(/(?:v=|youtu\.be\/)([^&?/]+)/)
  const videoId = videoIdMatch?.[1]

  if (!videoId) {
    return {
      title: url,
      description: '',
      thumbnail_url: '',
      author: '',
      site_name: 'YouTube',
      published_at: null,
      content_type: 'video',
      estimated_seconds: 0,
      word_count: 0,
    }
  }

  if (!apiKey) {
    return {
      title: `Video de YouTube`,
      description: '',
      thumbnail_url: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
      author: '',
      site_name: 'YouTube',
      published_at: null,
      content_type: 'video',
      estimated_seconds: 0,
      word_count: 0,
    }
  }

  const res = await fetch(
    `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails&id=${videoId}&key=${apiKey}`
  )
  const data = await res.json()
  const item = data.items?.[0]

  if (!item) {
    return {
      title: url,
      description: '',
      thumbnail_url: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
      author: '',
      site_name: 'YouTube',
      published_at: null,
      content_type: 'video',
      estimated_seconds: 0,
      word_count: 0,
    }
  }

  const snippet = item.snippet
  const duration = item.contentDetails?.duration ?? ''

  return {
    title: snippet.title,
    description: snippet.description?.slice(0, 300) ?? '',
    thumbnail_url: snippet.thumbnails?.maxres?.url ?? snippet.thumbnails?.high?.url ?? '',
    author: snippet.channelTitle ?? '',
    site_name: 'YouTube',
    published_at: snippet.publishedAt ?? null,
    content_type: 'video',
    estimated_seconds: parseISODuration(duration),
    word_count: 0,
  }
}
