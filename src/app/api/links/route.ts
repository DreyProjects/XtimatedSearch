import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const folderId = searchParams.get('folder_id')
  const tagId = searchParams.get('tag_id')
  const contentType = searchParams.get('content_type')
  const isRead = searchParams.get('is_read')
  const search = searchParams.get('search')

  let query = supabase
    .from('links')
    .select(`
      *,
      folders(name, color),
      link_tags(tags(id, name, color))
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (folderId) query = query.eq('folder_id', folderId)
  if (contentType) query = query.eq('content_type', contentType)
  if (isRead !== null) query = query.eq('is_read', isRead === 'true')
  if (search) query = query.ilike('title', `%${search}%`)
  if (tagId) {
    const { data: tagLinks } = await supabase
      .from('link_tags')
      .select('link_id')
      .eq('tag_id', tagId)
    const ids = tagLinks?.map(t => t.link_id) ?? []
    if (ids.length === 0) return NextResponse.json([])
    query = query.in('id', ids)
  }

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(request: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { tag_ids, ...linkData } = body

  const { data: link, error } = await supabase
    .from('links')
    .insert({ ...linkData, user_id: user.id })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  if (tag_ids && tag_ids.length > 0) {
    await supabase.from('link_tags').insert(
      tag_ids.map((tag_id: string) => ({ link_id: link.id, tag_id }))
    )
  }

  return NextResponse.json(link, { status: 201 })
}
