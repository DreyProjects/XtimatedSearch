import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { formatExport, type ExportFormat } from '@/lib/export'

export async function GET(request: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const format = (searchParams.get('format') ?? 'txt') as ExportFormat
  const idsParam = searchParams.get('ids') ?? ''
  const ids = idsParam.split(',').filter(Boolean)

  if (ids.length === 0) return NextResponse.json({ error: 'IDs requeridos' }, { status: 400 })

  const { data: links, error } = await supabase
    .from('links')
    .select(`
      *,
      folders(name, color),
      link_tags(tags(id, name, color))
    `)
    .eq('user_id', user.id)
    .in('id', ids)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const content = formatExport(links ?? [], format)
  const date = new Date().toISOString().slice(0, 10)
  const filename = `xtimated-search-export-${date}.txt`

  return new NextResponse(content, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  })
}
