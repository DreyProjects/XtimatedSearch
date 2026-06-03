'use client'

import { useState } from 'react'
import Image from 'next/image'
import { ArrowUturnLeftIcon, TrashIcon, XCircleIcon } from '@heroicons/react/24/outline'
import { TrashIcon as TrashSolid } from '@heroicons/react/24/solid'
import TimeEstimate from './TimeEstimate'
import { formatDate } from '@/lib/time'
import { useTrash } from '@/hooks/useTrash'

export default function TrashView() {
  const { trashedLinks, isLoading, restoreLink, deletePermanently, emptyTrash } = useTrash()
  const [confirmEmpty, setConfirmEmpty] = useState(false)
  const [confirmId, setConfirmId] = useState<string | null>(null)

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-40 rounded-xl bg-zinc-100 dark:bg-zinc-800 animate-pulse" />
        ))}
      </div>
    )
  }

  if (trashedLinks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-zinc-400">
        <TrashSolid className="w-12 h-12 mb-3 opacity-30" />
        <p className="text-lg font-medium">La papelera está vacía</p>
        <p className="text-sm mt-1">Los links eliminados aparecerán aquí</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          {trashedLinks.length} {trashedLinks.length === 1 ? 'link' : 'links'} en la papelera
        </p>
        {!confirmEmpty ? (
          <button
            onClick={() => setConfirmEmpty(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          >
            <TrashIcon className="w-4 h-4" />
            Vaciar papelera
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <span className="text-sm text-zinc-600 dark:text-zinc-300">¿Confirmar borrado definitivo?</span>
            <button
              onClick={async () => { await emptyTrash(); setConfirmEmpty(false) }}
              className="px-3 py-1.5 text-sm bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
            >
              Sí, vaciar
            </button>
            <button
              onClick={() => setConfirmEmpty(false)}
              className="px-3 py-1.5 text-sm border border-zinc-300 dark:border-zinc-600 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              Cancelar
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {trashedLinks.map(link => {
          const domain = (() => { try { return new URL(link.url).hostname.replace('www.', '') } catch { return '' } })()
          return (
            <div
              key={link.id}
              className="relative bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden opacity-75 hover:opacity-100 transition-opacity"
            >
              {link.thumbnail_url && (
                <div className="relative w-full h-28 bg-zinc-100 dark:bg-zinc-800">
                  <Image src={link.thumbnail_url} alt={link.title ?? ''} fill className="object-cover grayscale" unoptimized />
                  <div className="absolute inset-0 bg-zinc-900/30" />
                </div>
              )}
              <div className="p-3 space-y-2">
                <div>
                  <p className="font-medium text-sm text-zinc-700 dark:text-zinc-300 truncate line-through decoration-zinc-400">
                    {link.title || link.url}
                  </p>
                  <p className="text-xs text-zinc-400 mt-0.5">{domain}</p>
                </div>
                <div className="flex items-center gap-2 text-xs text-zinc-400">
                  <span className="capitalize">{link.content_type ?? 'other'}</span>
                  <TimeEstimate seconds={link.estimated_seconds} contentType={link.content_type} />
                  {link.deleted_at && (
                    <span className="ml-auto">Eliminado {formatDate(link.deleted_at as string)}</span>
                  )}
                </div>
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => restoreLink(link.id)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs border border-zinc-300 dark:border-zinc-600 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300 transition-colors"
                  >
                    <ArrowUturnLeftIcon className="w-3.5 h-3.5" />
                    Restaurar
                  </button>
                  {confirmId === link.id ? (
                    <div className="flex-1 flex gap-1">
                      <button
                        onClick={async () => { await deletePermanently(link.id); setConfirmId(null) }}
                        className="flex-1 py-1.5 text-xs bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                      >
                        Borrar
                      </button>
                      <button
                        onClick={() => setConfirmId(null)}
                        className="px-2 py-1.5 text-xs border border-zinc-300 dark:border-zinc-600 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800"
                      >
                        <XCircleIcon className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setConfirmId(link.id)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs border border-red-200 dark:border-red-800 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 transition-colors"
                    >
                      <TrashIcon className="w-3.5 h-3.5" />
                      Borrar definitivo
                    </button>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
