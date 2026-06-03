import { calcReadingSeconds } from '../readingSpeed'

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

function countWords(text: string): number {
  return text
    .split(/\s+/)
    .filter((w: string) => w.length >= 2 && /[a-záéíóúA-ZÁÉÍÓÚA-Za-z]/.test(w))
    .length
}

export async function scrapePdf(url: string): Promise<PdfResult> {
  let numPages = 0
  let wordCount = 0
  let author = ''
  let title = ''

  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) })
    const buffer = await res.arrayBuffer()
    const pdfParse = (await import('pdf-parse')).default
    const data = await pdfParse(Buffer.from(buffer))

    numPages = data.numpages
    author = (data.info?.Author as string) ?? ''
    title = (data.info?.Title as string) ?? ''
    wordCount = countWords(data.text ?? '')
  } catch {}

  const filename = url.split('/').pop()?.replace(/\.pdf$/i, '') ?? 'Documento PDF'

  // Si pdf-parse extrajo texto real, usarlo; si no, estimar por páginas (250 palabras/pág)
  const effectiveWordCount = wordCount > 50 ? wordCount : numPages * 250
  const estimatedSeconds = calcReadingSeconds(effectiveWordCount)

  return {
    title: title || filename,
    description: numPages > 0 ? `${numPages} páginas · ${effectiveWordCount.toLocaleString()} palabras` : '',
    thumbnail_url: '',
    author,
    site_name: (() => { try { return new URL(url).hostname.replace('www.', '') } catch { return '' } })(),
    published_at: null,
    content_type: 'pdf',
    estimated_seconds: estimatedSeconds,
    word_count: effectiveWordCount,
  }
}
