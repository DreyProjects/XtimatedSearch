export interface VimeoResult {
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

export async function scrapeVimeo(url: string): Promise<VimeoResult> {
  try {
    const res = await fetch(
      `https://vimeo.com/api/oembed.json?url=${encodeURIComponent(url)}`,
      { signal: AbortSignal.timeout ? AbortSignal.timeout(8000) : undefined }
    )
    if (!res.ok) throw new Error('oEmbed failed')
    const data = await res.json()

    return {
      title: data.title ?? url,
      description: data.description?.slice(0, 300) ?? '',
      thumbnail_url: data.thumbnail_url ?? '',
      author: data.author_name ?? '',
      site_name: 'Vimeo',
      published_at: null,
      content_type: 'video',
      estimated_seconds: typeof data.duration === 'number' ? data.duration : 0,
      word_count: 0,
    }
  } catch {
    return {
      title: url, description: '', thumbnail_url: '', author: '',
      site_name: 'Vimeo', published_at: null,
      content_type: 'video', estimated_seconds: 0, word_count: 0,
    }
  }
}
