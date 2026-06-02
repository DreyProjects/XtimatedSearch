import useSWR, { mutate as globalMutate } from 'swr'

const fetcher = (url: string) => fetch(url).then(r => r.json())

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
    await fetch(KEY, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    globalMutate(KEY)
  }

  async function deleteTag(id: string) {
    await fetch(KEY, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    globalMutate(KEY)
  }

  return { tags: data ?? [], error, isLoading, createTag, deleteTag }
}
