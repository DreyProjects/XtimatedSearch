import { formatTxt } from './txt'
import { formatApa } from './apa'
import { formatVancouver } from './vancouver'

export interface LinkWithRelations {
  id: string
  url: string
  title: string | null
  description: string | null
  thumbnail_url: string | null
  author: string | null
  site_name: string | null
  published_at: string | null
  content_type: string | null
  estimated_seconds: number | null
  word_count: number | null
  is_read: boolean | null
  folder_id: string | null
  folders?: { name: string } | null
  link_tags?: Array<{ tags?: { name: string; color: string } | null }>
}

export type ExportFormat = 'txt' | 'apa' | 'vancouver'

export function formatExport(links: LinkWithRelations[], format: ExportFormat): string {
  switch (format) {
    case 'txt':
      return formatTxt(links)
    case 'apa':
      return formatApa(links)
    case 'vancouver':
      return formatVancouver(links)
  }
}
