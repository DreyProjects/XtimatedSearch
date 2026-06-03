import useSWR, { mutate as globalMutate } from 'swr'
import { fetchWithAuth } from '@/lib/fetchWithAuth'

const fetcher = (url: string) => fetchWithAuth(url).then(r => r.json())

export interface Tag {
  id: string
  name: string
  color: string
  created_at: string
}

const KEY = '/api/tags'

export function useTags() {
  const { data, error, isLoading } = useSWR<Tag[]>(KEY, fetcher)

  async function createTag(body: { name: string; color?: string }) {
    await fetchWithAuth(KEY, { method: 'POST', body: JSON.stringify(body) })
    globalMutate(KEY)
  }

  async function deleteTag(id: string) {
    await fetchWithAuth(KEY, { method: 'DELETE', body: JSON.stringify({ id }) })
    globalMutate(KEY)
  }

  return { tags: Array.isArray(data) ? data : [], error, isLoading, createTag, deleteTag }
}
