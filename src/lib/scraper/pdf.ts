export interface PdfResult {
  title: string
  description: string
  thumbnail_url: string
  author: string
  site_name: string
  published_at: string | null
  content_type: 'pdf'
  estimated_seconds: number
  word_count: number
}

export async function scrapePdf(url: string): Promise<PdfResult> {
  let numPages = 10
  let author = ''
  let title = ''

  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(15000) })
    const buffer = await res.arrayBuffer()
    const pdfParse = (await import('pdf-parse')).default
    const data = await pdfParse(Buffer.from(buffer))
    numPages = data.numpages
    author = (data.info?.Author as string) ?? ''
    title = (data.info?.Title as string) ?? ''
  } catch {}

  const filename = url.split('/').pop()?.replace('.pdf', '') ?? 'Documento PDF'

  return {
    title: title || filename,
    description: '',
    thumbnail_url: '',
    author,
    site_name: new URL(url).hostname.replace('www.', ''),
    published_at: null,
    content_type: 'pdf',
    estimated_seconds: numPages * 90,
    word_count: 0,
  }
}
