import { ClockIcon } from '@heroicons/react/24/outline'
import { formatTime } from '@/lib/time'

interface Props {
  seconds: number | null
}

export default function TimeEstimate({ seconds }: Props) {
  if (!seconds) return null
  return (
    <span className="inline-flex items-center gap-1 text-xs text-zinc-500 dark:text-zinc-400">
      <ClockIcon className="w-3.5 h-3.5" />
      {formatTime(seconds)}
    </span>
  )
}
