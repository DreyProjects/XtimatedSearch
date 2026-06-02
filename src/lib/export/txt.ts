import type { LinkWithRelations } from './index'
import { formatTime } from '../time'

const TYPE_LABELS: Record<string, string> = {
  article: 'Artículo',
  video: 'Video',
  podcast: 'Podcast',
  pdf: 'PDF',
  other: 'Otro',
}

export function formatTxt(links: LinkWithRelations[]): string {
  const lines: string[] = []

  for (const link of links) {
    lines.push(link.title || link.url)
    lines.push(`URL: ${link.url}`)
    lines.push(`Tipo: ${TYPE_LABELS[link.content_type ?? 'other'] ?? 'Otro'}`)
    lines.push(`Tiempo estimado: ${formatTime(link.estimated_seconds ?? 0)}`)
    if (link.author) lines.push(`Autor: ${link.author}`)
    if (link.published_at) {
      const date = new Date(link.published_at).toLocaleDateString('es-ES')
      lines.push(`Fecha: ${date}`)
    }
    const tagNames = link.link_tags?.map(lt => lt.tags?.name).filter(Boolean)
    if (tagNames && tagNames.length > 0) lines.push(`Tags: ${tagNames.join(', ')}`)
    if (link.folders?.name) lines.push(`Carpeta: ${link.folders.name}`)
    lines.push(`Estado: ${link.is_read ? 'Leído' : 'No leído'}`)
    lines.push('—'.repeat(40))
    lines.push('')
  }

  return lines.join('\n')
}
