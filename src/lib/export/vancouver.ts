import type { LinkWithRelations } from './index'

const MONTHS_SHORT = [
  'ene', 'feb', 'mar', 'abr', 'may', 'jun',
  'jul', 'ago', 'sep', 'oct', 'nov', 'dic',
]

function isPersonName(str: string): boolean {
  const words = str.trim().split(/\s+/)
  if (words.length < 2 || words.length > 4) return false
  return words.every(w => /^[A-ZÁÉÍÓÚÜÑ][a-záéíóúüñA-ZÁÉÍÓÚÜÑ'-]+$/.test(w))
}

// "Juan García" → "García J"  |  "María José López" → "López MJ"
// Organizaciones se dejan igual
function formatAuthorVancouver(raw: string): string {
  if (!raw) return 'Autor desconocido'
  if (!isPersonName(raw)) return raw

  const words = raw.trim().split(/\s+/)
  const lastName = words[words.length - 1]
  const initials = words.slice(0, -1).map(w => w[0].toUpperCase()).join('')
  return `${lastName} ${initials}`
}

function formatYear(dateStr: string | null | undefined): string {
  if (!dateStr) return 'fecha desconocida'
  try {
    const d = new Date(dateStr)
    if (isNaN(d.getTime())) return 'fecha desconocida'
    return d.getFullYear().toString()
  } catch {
    return 'fecha desconocida'
  }
}

// Vancouver: "[citado 2024 ene 15]"
function formatCitedDate(): string {
  const now = new Date()
  const day = now.getDate().toString().padStart(2, '0')
  const month = MONTHS_SHORT[now.getMonth()]
  const year = now.getFullYear()
  return `${year} ${month} ${day}`
}

function formatCitation(link: LinkWithRelations, index: number): string {
  const num = `${index + 1}.`
  const rawAuthor = link.author || link.site_name || ''
  const author = formatAuthorVancouver(rawAuthor)
  const year = formatYear(link.published_at)
  const cited = formatCitedDate()
  const title = link.title || link.url
  const url = link.url
  const siteName = link.site_name || ''

  switch (link.content_type) {

    case 'video': {
      // Vancouver: N. Autor. Título [video en línea]. Plataforma; Año [citado Fecha]. Disponible en: URL
      const platform = siteName || 'YouTube'
      return `${num} ${author}. ${title} [video en línea]. ${platform}; ${year} [citado ${cited}]. Disponible en: ${url}`
    }

    case 'podcast':
      // Vancouver: N. Autor. Título [podcast en línea]. Plataforma; Año [citado Fecha]. Disponible en: URL
      return `${num} ${author}. ${title} [podcast en línea]. ${siteName || 'Podcast'}; ${year} [citado ${cited}]. Disponible en: ${url}`

    case 'pdf':
      // Vancouver: N. Autor. Título [PDF en Internet]. Ciudad: Editorial; Año [citado Fecha]. Disponible en: URL
      return `${num} ${author}. ${title} [PDF en Internet]. ${siteName || 'Editorial'}; ${year} [citado ${cited}]. Disponible en: ${url}`

    case 'article':
    default:
      // Vancouver: N. Autor. Título. Nombre del sitio [Internet]. Año [citado Fecha]. Disponible en: URL
      return `${num} ${author}. ${title}. ${siteName} [Internet]. ${year} [citado ${cited}]. Disponible en: ${url}`
  }
}

export function formatVancouver(links: LinkWithRelations[]): string {
  if (links.length === 0) return 'Referencias\n\n(sin enlaces seleccionados)'
  const refs = links.map((link, i) => formatCitation(link, i))
  return `Referencias\n\n${refs.join('\n\n')}`
}
