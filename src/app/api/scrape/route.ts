import { NextRequest, NextResponse } from 'next/server'
import { getAuthFromRequest } from '@/lib/supabase/server'
import { scrapeUrl } from '@/lib/scraper'

export async function POST(request: NextRequest) {
  const { user } = await getAuthFromRequest(request)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { url } = await request.json()
  if (!url) return NextResponse.json({ error: 'URL requerida' }, { status: 400 })

  const result = await scrapeUrl(url)
  return NextResponse.json(result)
}
