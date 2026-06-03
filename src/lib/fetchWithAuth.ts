import { createClient } from './supabase/client'

export async function fetchWithAuth(input: string, init: RequestInit = {}): Promise<Response> {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()
  const token = session?.access_token ?? ''

  return fetch(input, {
    ...init,
    headers: {
      ...(init.headers ?? {}),
      'Authorization': `Bearer ${token}`,
      ...(init.body ? { 'Content-Type': 'application/json' } : {}),
    },
  })
}
