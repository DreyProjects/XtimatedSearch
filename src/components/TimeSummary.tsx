'use client'

import { ClockIcon } from '@heroicons/react/24/outline'
import { formatTime } from '@/lib/time'

interface Props {
  totalSeconds: number
  count: number
}

export default function TimeSummary({ totalSeconds, count }: Props) {
  if (count === 0) return null
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-800 animate-badge-in">
      <ClockIcon className="w-4 h-4 text-violet-500 dark:text-violet-400 flex-shrink-0" />
      <span className="text-sm text-violet-700 dark:text-violet-300">
        <span className="font-semibold">{formatTime(totalSeconds)}</span>
        <span className="text-violet-500 dark:text-violet-400 ml-1">en {count} {count === 1 ? 'link' : 'links'}</span>
      </span>
    </div>
  )
}
