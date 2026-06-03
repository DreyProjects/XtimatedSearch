import useSWR, { mutate as globalMutate } from 'swr'
import { fetchWithAuth } from '@/lib/fetchWithAuth'

const fetcher = (url: string) => fetchWithAuth(url).then(r => r.json())

export interface Folder {
  id: string
  name: string
  color: string
  parent_id: string | null
  created_at: string
}

const KEY = '/api/folders'

export function useFolders() {
  const { data, error, isLoading } = useSWR<Folder[]>(KEY, fetcher)

  async function createFolder(body: { name: string; color?: string; parent_id?: string }) {
    await fetchWithAuth(KEY, { method: 'POST', body: JSON.stringify(body) })
    globalMutate(KEY)
  }

  async function deleteFolder(id: string) {
    await fetchWithAuth(KEY, { method: 'DELETE', body: JSON.stringify({ id }) })
    globalMutate(KEY)
  }

  return { folders: Array.isArray(data) ? data : [], error, isLoading, createFolder, deleteFolder }
}
