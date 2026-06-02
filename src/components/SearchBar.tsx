'use client'

import { MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import { useRef } from 'react'

interface Props {
  value: string
  onChange: (value: string) => void
}

export default function SearchBar({ value, onChange }: Props) {
  const ref = useRef<HTMLInputElement>(null)
  return (
    <div className="relative w-full max-w-sm">
      <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
      <input
        ref={ref}
        type="search"
        placeholder="Buscar links..."
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full pl-9 pr-4 py-2 text-sm border border-zinc-200 dark:border-zinc-700 rounded-lg bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-violet-500"
      />
    </div>
  )
}
