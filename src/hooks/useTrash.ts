import useSWR, { mutate as globalMutate } from 'swr'
import { fetchWithAuth } from '@/lib/fetchWithAuth'
import type { Link } from './useLinks'

const fetcher = (url: string) => fetchWithAuth(url).then(r => r.json())
const KEY = '/api/links/trash'

function revalidateAll() {
  globalMutate((k: string) => typeof k === 'string' && k.startsWith('/api/links'))
}

export function useTrash() {
  const { data, error, isLoading } = useSWR<Link[]>(KEY, fetcher)

  async function restoreLink(id: string) {
    await fetchWithAuth(`/api/links/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ restore: true }),
    })
    revalidateAll()
  }

  async function deletePermanently(id: string) {
    await fetchWithAuth(`/api/links/${id}?permanent=true`, { method: 'DELETE' })
    revalidateAll()
  }

  async function emptyTrash() {
    await fetchWithAuth(KEY, { method: 'DELETE' })
    revalidateAll()
  }

  return {
    trashedLinks: Array.isArray(data) ? data : [],
    error,
    isLoading,
    restoreLink,
    deletePermanently,
    emptyTrash,
    count: Array.isArray(data) ? data.length : 0,
  }
}
