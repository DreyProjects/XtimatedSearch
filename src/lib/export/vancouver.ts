import type { LinkWithRelations } from './index'
import { decodeEntities, formatAuthorVancouver } from './authorFormat'
import { parseDate } from './dateFormat'

const MONTHS_SHORT = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']

function formatYear(dateStr: string | null | undefined): string {
  const d = parseDate(dateStr)
  return d ? d.year.toString() : 'fecha desconocida'
}

function formatCitedDate(): string {
  const now = new Date()
  return `${now.getFullYear()} ${MONTHS_SHORT[now.getMonth()]} ${String(now.getDate()).padStart(2, '0')}`
}

function clean(str: string | null | undefined): string {
  return decodeEntities(str ?? '')
}

function formatCitation(link: LinkWithRelations, index: number): string {
  const num = `${index + 1}.`
  const author = formatAuthorVancouver(clean(link.author) || clean(link.site_name) || '')
  const year = formatYear(link.published_at)
  const cited = formatCitedDate()
  const title = clean(link.title) || link.url
  const url = link.url
  const siteName = clean(link.site_name)

  switch (link.content_type) {

    case 'video':
      // Vancouver: N. Autor. Título [video en línea]. Plataforma; Año [citado Fecha]. Disponible en: URL
      return `${num} ${author}. ${title} [video en línea]. ${siteName || 'YouTube'}; ${year} [citado ${cited}]. Disponible en: ${url}`

    case 'podcast':
      // Vancouver: N. Autor. Título [podcast en línea]. Plataforma; Año [citado Fecha]. Disponible en: URL
      return `${num} ${author}. ${title} [podcast en línea]. ${siteName || 'Podcast'}; ${year} [citado ${cited}]. Disponible en: ${url}`

    case 'pdf':
      // Vancouver: N. Autor. Título [PDF en Internet]. Editorial; Año [citado Fecha]. Disponible en: URL
      return `${num} ${author}. ${title} [PDF en Internet]. ${siteName || 'Editorial'}; ${year} [citado ${cited}]. Disponible en: ${url}`

    case 'article':
    default:
      // Vancouver: N. Autor. Título. Sitio [Internet]. Año [citado Fecha]. Disponible en: URL
      return `${num} ${author}. ${title}. ${siteName} [Internet]. ${year} [citado ${cited}]. Disponible en: ${url}`
  }
}

export function formatVancouver(links: LinkWithRelations[]): string {
  if (links.length === 0) return 'Referencias\n\n(sin enlaces seleccionados)'
  return `Referencias\n\n${links.map((link, i) => formatCitation(link, i)).join('\n\n')}`
}
