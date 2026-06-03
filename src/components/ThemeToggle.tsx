'use client'

import { useTheme } from 'next-themes'
import { SunIcon, MoonIcon } from '@heroicons/react/24/outline'
import { useEffect, useState } from 'react'

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [spinning, setSpinning] = useState(false)

  useEffect(() => setMounted(true), [])
  if (!mounted) return <div className="w-9 h-9" />

  function toggle() {
    setSpinning(true)
    setTheme(theme === 'dark' ? 'light' : 'dark')
    setTimeout(() => setSpinning(false), 400)
  }

  return (
    <button
      onClick={toggle}
      className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
      aria-label="Cambiar tema"
    >
      <span className={spinning ? 'animate-spin-once block' : 'block'}>
        {theme === 'dark' ? (
          <SunIcon className="w-5 h-5" />
        ) : (
          <MoonIcon className="w-5 h-5" />
        )}
      </span>
    </button>
  )
}
