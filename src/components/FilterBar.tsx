'use client'

interface Filters {
  contentType: string
  isRead: string
  tagId: string
}

interface Props {
  filters: Filters
  onChange: (filters: Filters) => void
  onSelectModeToggle: () => void
  selectionMode: boolean
}

const TYPES = [
  { value: '', label: 'Todos' },
  { value: 'article', label: 'Artículos' },
  { value: 'video', label: 'Videos' },
  { value: 'podcast', label: 'Podcasts' },
  { value: 'pdf', label: 'PDFs' },
]

const READ_STATES = [
  { value: '', label: 'Todos' },
  { value: 'false', label: 'No leídos' },
  { value: 'true', label: 'Leídos' },
]

export default function FilterBar({ filters, onChange, onSelectModeToggle, selectionMode }: Props) {
  return (
    <div className="flex flex-wrap items-center gap-2 py-2">
      <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800 rounded-lg p-1">
        {TYPES.map(t => (
          <button
            key={t.value}
            onClick={() => onChange({ ...filters, contentType: t.value })}
            className={`px-3 py-1 text-sm rounded-md transition-colors ${
              filters.contentType === t.value
                ? 'bg-white dark:bg-zinc-700 text-violet-600 dark:text-violet-400 shadow-sm font-medium'
                : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800 rounded-lg p-1">
        {READ_STATES.map(s => (
          <button
            key={s.value}
            onClick={() => onChange({ ...filters, isRead: s.value })}
            className={`px-3 py-1 text-sm rounded-md transition-colors ${
              filters.isRead === s.value
                ? 'bg-white dark:bg-zinc-700 text-violet-600 dark:text-violet-400 shadow-sm font-medium'
                : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      <button
        onClick={onSelectModeToggle}
        className={`ml-auto px-3 py-1.5 text-sm rounded-lg transition-colors ${
          selectionMode
            ? 'bg-violet-600 text-white'
            : 'border border-zinc-300 dark:border-zinc-600 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
        }`}
      >
        Seleccionar
      </button>
    </div>
  )
}
