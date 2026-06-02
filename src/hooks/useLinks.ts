import useSWR, { mutate as globalMutate } from 'swr'

const fetcher = (url: string) => fetch(url).then(r => r.json())

export interface Link {
  id: string
  url: string
  title: string | null
  description: string | null
  thumbnail_url: string | null
  author: string | null
  site_name: string | null
  published_at: string | null
  content_type: string | null
  estimated_seconds: number | null
  word_count: number | null
  is_read: boolean | null
  folder_id: string | null
  created_at: string
  folders?: { name: string; color: string } | null
  link_tags?: Array<{ tags?: { id: string; name: string; color: string } | null }>
}

interface UseLinksOptions {
  folderId?: string
  tagId?: string
  contentType?: string
  isRead?: boolean
  search?: string
}

export function useLinks(options: UseLinksOptions = {}) {
  const params = new URLSearchParams()
  if (options.folderId) params.set('folder_id', options.folderId)
  if (options.tagId) params.set('tag_id', options.tagId)
  if (options.contentType) params.set('content_type', options.contentType)
  if (options.isRead !== undefined) params.set('is_read', String(options.isRead))
  if (options.search) params.set('search', options.search)

  const key = `/api/links?${params.toString()}`
  const { data, error, isLoading } = useSWR<Link[]>(key, fetcher)

  async function addLink(body: Record<string, unknown>) {
    await fetch('/api/links', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    globalMutate((k: string) => typeof k === 'string' && k.startsWith('/api/links'))
  }

  async function updateLink(id: string, body: Record<string, unknown>) {
    await fetch(`/api/links/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    globalMutate((k: string) => typeof k === 'string' && k.startsWith('/api/links'))
  }

  async function deleteLink(id: string) {
    await fetch(`/api/links/${id}`, { method: 'DELETE' })
    globalMutate((k: string) => typeof k === 'string' && k.startsWith('/api/links'))
  }

  async function toggleRead(id: string, currentValue: boolean) {
    await updateLink(id, {
      is_read: !currentValue,
      read_at: !currentValue ? new Date().toISOString() : null,
    })
  }

  return { links: data ?? [], error, isLoading, addLink, updateLink, deleteLink, toggleRead }
}
