import type { LinkWithRelations } from './index'
import { decodeEntities, formatAuthorApa } from './authorFormat'
import { parseDate } from './dateFormat'

const MONTHS_ES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
]

interface ApaDate { year: string; full: string; yearOnly: string }

function formatApaDate(dateStr: string | null | undefined): ApaDate {
  const d = parseDate(dateStr)
  if (!d) return { year: 's.f.', full: 's.f.', yearOnly: 's.f.' }

  const year = d.year.toString()

  if (d.month !== null && d.day !== null) {
    const month = MONTHS_ES[d.month - 1]
    return { year, full: `${year}, ${d.day} de ${month}`, yearOnly: year }
  }

  if (d.month !== null) {
    const month = MONTHS_ES[d.month - 1]
    return { year, full: `${year}, ${month}`, yearOnly: year }
  }

  return { year, full: year, yearOnly: year }
}

function clean(str: string | null | undefined): string {
  return decodeEntities(str ?? '')
}

function formatCitation(link: LinkWithRelations): string {
  const author = formatAuthorApa(clean(link.author) || clean(link.site_name) || '')
  const date = formatApaDate(link.published_at)
  const title = clean(link.title) || link.url
  const url = link.url
  const siteName = clean(link.site_name)

  switch (link.content_type) {

    case 'video': {
      // APA7: Canal [Canal]. (Año, día de mes). Título [Video]. Plataforma. URL
      const channel = clean(link.author) || clean(link.site_name) || 'Desconocido'
      const platform = siteName || 'YouTube'
      const channelFormatted = formatAuthorApa(channel)
      return `${channelFormatted} [${channel}]. (${date.full}). ${title} [Video]. ${platform}. ${url}`
    }

    case 'podcast':
      // APA7: Apellido, I. (Presentador). (Año, día de mes). Título [Episodio de podcast]. En Podcast. URL
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
  return `Referencias\n\n${links.map(formatCitation).join('\n\n')}`
}
