import useSWR, { mutate as globalMutate } from 'swr'

const fetcher = (url: string) => fetch(url).then(r => r.json())

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
    await fetch(KEY, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    globalMutate(KEY)
  }

  async function deleteFolder(id: string) {
    await fetch(KEY, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    globalMutate(KEY)
  }

  return { folders: data ?? [], error, isLoading, createFolder, deleteFolder }
}
