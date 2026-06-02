import type { LinkWithRelations } from './index'

const MONTHS_ES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
]

function formatApaDate(dateStr: string | null): { year: string; full: string } {
  if (!dateStr) return { year: 's.f.', full: 's.f.' }
  const d = new Date(dateStr)
  const year = d.getFullYear().toString()
  const day = d.getDate()
  const month = MONTHS_ES[d.getMonth()]
  return { year, full: `${year}, ${day} de ${month}` }
}

function getAuthor(link: LinkWithRelations): string {
  return link.author || link.site_name || 'Autor desconocido'
}

function formatCitation(link: LinkWithRelations): string {
  const author = getAuthor(link)
  const date = formatApaDate(link.published_at ?? null)
  const title = link.title || link.url
  const url = link.url
  const siteName = link.site_name || ''

  switch (link.content_type) {
    case 'video':
      return `${author} [${author}]. (${date.full}). ${title} [Video]. YouTube. ${url}`

    case 'podcast':
      return `${author}. (Presentador). (${date.full}). ${title} [Episodio de podcast]. En ${siteName || 'Podcast'}. ${url}`

    case 'pdf':
      return `${author}. (${date.year}). ${title} [Archivo PDF]. ${siteName || 'Editorial'}. ${url}`

    case 'article':
    default:
      return `${author}. (${date.full}). ${title}. ${siteName}. ${url}`
  }
}

export function formatApa(links: LinkWithRelations[]): string {
  const citations = links.map(formatCitation)
  return `Referencias\n\n${citations.join('\n\n')}`
}
