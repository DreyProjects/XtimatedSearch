import type { LinkWithRelations } from './index'

const MONTHS_SHORT = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']

function formatYear(dateStr: string | null): string {
  if (!dateStr) return 's.f.'
  return new Date(dateStr).getFullYear().toString()
}

function formatCitedDate(): string {
  const now = new Date()
  return `${now.getFullYear()}, ${now.getDate()} ${MONTHS_SHORT[now.getMonth()]}`
}

function getAuthor(link: LinkWithRelations): string {
  return link.author || link.site_name || 'Autor desconocido'
}

function formatCitation(link: LinkWithRelations, index: number): string {
  const num = `[${index + 1}]`
  const author = getAuthor(link)
  const year = formatYear(link.published_at ?? null)
  const cited = formatCitedDate()
  const title = link.title || link.url
  const url = link.url
  const siteName = link.site_name || ''

  switch (link.content_type) {
    case 'video':
      return `${num} ${author}. ${title} [video en Internet]. YouTube; ${year} [citado ${cited}]. Disponible en: ${url}`

    case 'podcast':
      return `${num} ${author}. ${title} [podcast en Internet]. ${siteName || 'Podcast'}; ${year} [citado ${cited}]. Disponible en: ${url}`

    case 'pdf':
      return `${num} ${author}. ${title} [PDF en Internet]. ${siteName || 'Editorial'}; ${year} [citado ${cited}]. Disponible en: ${url}`

    case 'article':
    default:
      return `${num} ${author}. ${title}. ${siteName} [Internet]. ${year} [citado ${cited}]. Disponible en: ${url}`
  }
}

export function formatVancouver(links: LinkWithRelations[]): string {
  const refs = links.map((link, i) => formatCitation(link, i))
  return `Referencias\n\n${refs.join('\n')}`
}
