import type { LinkWithRelations } from './index'

const MONTHS_ES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
]

// Detecta si un string parece nombre de persona (ej. "Juan García") vs organización ("MIT Review")
function isPersonName(str: string): boolean {
  const words = str.trim().split(/\s+/)
  if (words.length < 2 || words.length > 4) return false
  // Cada palabra debe iniciar con mayúscula y contener solo letras
  return words.every(w => /^[A-ZÁÉÍÓÚÜÑ][a-záéíóúüñA-ZÁÉÍÓÚÜÑ'-]+$/.test(w))
}

// "Juan García" → "García, J."  |  "María José López" → "López, M. J."
// Organizaciones y canales se dejan igual
function formatAuthorApa(raw: string): string {
  if (!raw) return 'Autor desconocido'
  // Ya tiene formato "Apellido, I."
  if (/^[^\s,]+,\s+[A-ZÁÉÍÓÚÜÑ]\./.test(raw)) return raw
  if (!isPersonName(raw)) return raw

  const words = raw.trim().split(/\s+/)
  const lastName = words[words.length - 1]
  const initials = words.slice(0, -1).map(w => `${w[0].toUpperCase()}.`).join(' ')
  return `${lastName}, ${initials}`
}

interface ApaDate {
  year: string
  full: string   // para artículos/videos: "2023, 15 de enero"
  yearOnly: string // para PDFs: "2023"
}

function formatApaDate(dateStr: string | null | undefined): ApaDate {
  if (!dateStr) return { year: 's.f.', full: 's.f.', yearOnly: 's.f.' }
  try {
    const d = new Date(dateStr)
    if (isNaN(d.getTime())) return { year: 's.f.', full: 's.f.', yearOnly: 's.f.' }
    const year = d.getFullYear().toString()
    const day = d.getDate()
    const month = MONTHS_ES[d.getMonth()]
    return { year, full: `${year}, ${day} de ${month}`, yearOnly: year }
  } catch {
    return { year: 's.f.', full: 's.f.', yearOnly: 's.f.' }
  }
}

function formatCitation(link: LinkWithRelations): string {
  const rawAuthor = link.author || link.site_name || ''
  const author = formatAuthorApa(rawAuthor)
  const date = formatApaDate(link.published_at)
  const title = link.title || link.url
  const url = link.url
  const siteName = link.site_name || ''

  switch (link.content_type) {

    case 'video': {
      // APA7 video YouTube: Canal [Canal]. (Año, día de mes). Título [Video]. YouTube. URL
      // Si el autor es diferente del canal, se usa: Autor [Canal]. ...
      const channel = link.site_name === 'YouTube' || link.site_name === 'Vimeo'
        ? (link.author || link.site_name || 'Desconocido')
        : (link.author || 'Desconocido')
      const platform = link.site_name || 'YouTube'
      const authorFormatted = isPersonName(channel) ? formatAuthorApa(channel) : channel
      return `${authorFormatted} [${channel}]. (${date.full}). ${title} [Video]. ${platform}. ${url}`
    }

    case 'podcast':
      // APA7: Apellido, I. (Presentador). (Año, día de mes). Título [Episodio de podcast]. En Nombre del podcast. URL
      return `${author} (Presentador). (${date.full}). ${title} [Episodio de podcast]. En ${siteName || 'Podcast'}. ${url}`

    case 'pdf':
      // APA7: Apellido, I. (Año). Título [Archivo PDF]. Editorial. URL
      return `${author}. (${date.yearOnly}). ${title} [Archivo PDF]. ${siteName || 'Editorial'}. ${url}`

    case 'article':
    default:
      // APA7: Apellido, I. (Año, día de mes). Título del artículo. Nombre del sitio. URL
      return `${author}. (${date.full}). ${title}. ${siteName}. ${url}`
  }
}

export function formatApa(links: LinkWithRelations[]): string {
  if (links.length === 0) return 'Referencias\n\n(sin enlaces seleccionados)'
  const citations = links.map(formatCitation)
  return `Referencias\n\n${citations.join('\n\n')}`
}
