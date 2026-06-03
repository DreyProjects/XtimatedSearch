import { ClockIcon } from '@heroicons/react/24/outline'
import { formatTime } from '@/lib/time'

const TYPE_LABEL: Record<string, string> = {
  article: 'de lectura',
  pdf: 'de lectura',
  video: 'de video',
  podcast: 'de audio',
  other: '',
}

interface Props {
  seconds: number | null
  contentType?: string | null
  showLabel?: boolean
  className?: string
}

export default function TimeEstimate({ seconds, contentType, showLabel = false, className = '' }: Props) {
  if (!seconds || seconds <= 0) return null
  const label = showLabel ? (TYPE_LABEL[contentType ?? ''] ?? '') : ''
  return (
    <span className={`inline-flex items-center gap-1 ${className}`}>
      <ClockIcon className="w-3.5 h-3.5 flex-shrink-0 text-violet-500 dark:text-violet-400" />
      <span className="text-xs">
        <span className="font-semibold text-zinc-800 dark:text-zinc-100">{formatTime(seconds)}</span>
        {label && <span className="text-zinc-500 dark:text-zinc-400 ml-0.5">{label}</span>}
      </span>
    </span>
  )
}
