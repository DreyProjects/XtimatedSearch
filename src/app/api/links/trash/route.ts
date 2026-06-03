import { NextRequest, NextResponse } from 'next/server'
import { getAuthFromRequest } from '@/lib/supabase/server'

// GET: listar links en papelera
export async function GET(request: NextRequest) {
  const { user, supabase } = await getAuthFromRequest(request)
  if (!user || !supabase) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await supabase
    .from('links')
    .select(`*, folders(name, color), link_tags(tags(id, name, color))`)
    .eq('user_id', user.id)
    .not('deleted_at', 'is', null)
    .order('deleted_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

// DELETE: vaciar toda la papelera
export async function DELETE(request: NextRequest) {
  const { user, supabase } = await getAuthFromRequest(request)
  if (!user || !supabase) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { error } = await supabase
    .from('links')
    .delete()
    .eq('user_id', user.id)
    .not('deleted_at', 'is', null)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
