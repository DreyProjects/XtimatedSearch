'use client'

import Image from 'next/image'
import { useState } from 'react'
import { CheckIcon, EllipsisVerticalIcon, TrashIcon, FolderOpenIcon, CheckCircleIcon } from '@heroicons/react/24/outline'
import { CheckCircleIcon as CheckCircleSolid } from '@heroicons/react/24/solid'
import TagBadge from './TagBadge'
import TimeEstimate from './TimeEstimate'
import { formatDate } from '@/lib/time'
import type { Link } from '@/hooks/useLinks'
import type { Folder } from '@/hooks/useFolders'

const TYPE_ICONS: Record<string, string> = {
  article: '📄',
  video: '🎬',
  podcast: '🎙️',
  pdf: '📑',
  other: '🔗',
}

interface Props {
  link: Link
  selectionMode: boolean
  isSelected: boolean
  onToggleSelect: () => void
  onToggleRead: () => void
  onDelete: () => void
  onMove: (folderId: string | null) => void
  folders: Folder[]
}

export default function LinkCard({
  link,
  selectionMode,
  isSelected,
  onToggleSelect,
  onToggleRead,
  onDelete,
  onMove,
  folders,
}: Props) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [moveOpen, setMoveOpen] = useState(false)

  const domain = (() => {
    try { return new URL(link.url).hostname.replace('www.', '') }
    catch { return '' }
  })()

  return (
    <div
      className={`group relative bg-white dark:bg-zinc-900 border rounded-xl overflow-hidden transition-all hover:shadow-md ${
        isSelected
          ? 'border-violet-400 dark:border-violet-500 ring-2 ring-violet-200 dark:ring-violet-900'
          : 'border-zinc-200 dark:border-zinc-800'
      }`}
    >
      {(selectionMode || isSelected) && (
        <button
          onClick={onToggleSelect}
          className={`absolute top-2 left-2 z-10 w-5 h-5 rounded flex items-center justify-center border-2 transition-colors ${
            isSelected
              ? 'bg-violet-600 border-violet-600 text-white'
              : 'bg-white dark:bg-zinc-800 border-zinc-300 dark:border-zinc-600 opacity-0 group-hover:opacity-100'
          }`}
        >
          {isSelected && <CheckIcon className="w-3 h-3" />}
        </button>
      )}

      {link.thumbnail_url && (
        <div className="relative w-full h-36 bg-zinc-100 dark:bg-zinc-800">
          <Image
            src={link.thumbnail_url}
            alt={link.title ?? ''}
            fill
            className="object-cover"
            unoptimized
          />
        </div>
      )}

      <div className="p-4 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <a
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block font-medium text-zinc-900 dark:text-zinc-100 hover:text-violet-600 dark:hover:text-violet-400 truncate"
              title={link.title ?? undefined}
            >
              {link.title || link.url}
            </a>
            <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5">{domain}</p>
          </div>
          <div className="relative flex-shrink-0">
            <button
              onClick={() => { setMenuOpen(!menuOpen); setMoveOpen(false) }}
              className="p-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 transition-colors"
            >
              <EllipsisVerticalIcon className="w-5 h-5" />
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-7 z-20 w-44 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg shadow-lg py-1 text-sm">
                <button
                  onClick={() => { setMoveOpen(!moveOpen) }}
                  className="flex items-center gap-2 w-full px-3 py-2 hover:bg-zinc-50 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200"
                >
                  <FolderOpenIcon className="w-4 h-4" /> Mover a carpeta
                </button>
                {moveOpen && (
                  <div className="border-t border-zinc-100 dark:border-zinc-700 py-1">
                    <button
                      onClick={() => { onMove(null); setMenuOpen(false) }}
                      className="w-full px-3 py-1.5 text-left hover:bg-zinc-50 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-300"
                    >
                      Sin carpeta
                    </button>
                    {folders.map(f => (
                      <button
                        key={f.id}
                        onClick={() => { onMove(f.id); setMenuOpen(false) }}
                        className="w-full px-3 py-1.5 text-left hover:bg-zinc-50 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-300 truncate"
                      >
                        {f.name}
                      </button>
                    ))}
                  </div>
                )}
                <button
                  onClick={() => { onDelete(); setMenuOpen(false) }}
                  className="flex items-center gap-2 w-full px-3 py-2 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600"
                >
                  <TrashIcon className="w-4 h-4" /> Eliminar
                </button>
              </div>
            )}
          </div>
        </div>

        {link.description && (
          <p className="text-sm text-zinc-500 dark:text-zinc-400 line-clamp-2">{link.description}</p>
        )}

        <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
          <span>{TYPE_ICONS[link.content_type ?? 'other']} {link.content_type ?? 'other'}</span>
          <TimeEstimate seconds={link.estimated_seconds} />
          {link.author && <span>· {link.author}</span>}
          {link.published_at && <span>· {formatDate(link.published_at)}</span>}
        </div>

        {link.link_tags && link.link_tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {link.link_tags.map(lt =>
              lt.tags ? (
                <TagBadge key={lt.tags.id} name={lt.tags.name} color={lt.tags.color} />
              ) : null
            )}
          </div>
        )}

        <button
          onClick={onToggleRead}
          className={`flex items-center gap-1.5 text-xs transition-colors ${
            link.is_read
              ? 'text-green-600 dark:text-green-400'
              : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200'
          }`}
        >
          {link.is_read ? (
            <CheckCircleSolid className="w-4 h-4" />
          ) : (
            <CheckCircleIcon className="w-4 h-4" />
          )}
          {link.is_read ? 'Leído' : 'Marcar como leído'}
        </button>
      </div>

      {menuOpen && (
        <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
      )}
    </div>
  )
}
