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
  index?: number
  selectionMode: boolean
  isSelected: boolean
  onToggleSelect: () => void
  onToggleRead: () => void
  onDelete: () => void
  onMove: (folderId: string | null) => void
  folders: Folder[]
}

export default function LinkCard({
  link, index = 0, selectionMode, isSelected,
  onToggleSelect, onToggleRead, onDelete, onMove, folders,
}: Props) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [moveOpen, setMoveOpen] = useState(false)

  const domain = (() => {
    try { return new URL(link.url).hostname.replace('www.', '') }
    catch { return '' }
  })()

  return (
    <div
      className={`group relative bg-white dark:bg-zinc-900 border rounded-xl overflow-hidden transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 animate-fade-up ${
        isSelected
          ? 'border-violet-500 dark:border-violet-500 ring-2 ring-violet-200 dark:ring-violet-900'
          : 'border-zinc-200 dark:border-zinc-800'
      }`}
      style={{ animationDelay: `${Math.min(index * 40, 400)}ms` }}
    >
      {/* Thumbnail con overlay de selección */}
      {link.thumbnail_url && (
        <div
          className={`relative w-full h-36 bg-zinc-100 dark:bg-zinc-800 ${selectionMode ? 'cursor-pointer' : ''}`}
          onClick={selectionMode ? onToggleSelect : undefined}
        >
          <Image
            src={link.thumbnail_url}
            alt={link.title ?? ''}
            fill
            className={`object-cover transition-all duration-200 ${isSelected ? 'brightness-50' : ''}`}
            unoptimized
          />
          {isSelected && (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="w-10 h-10 rounded-full bg-violet-600 flex items-center justify-center shadow-lg animate-pop">
                <CheckIcon className="w-6 h-6 text-white" />
              </span>
            </div>
          )}
        </div>
      )}

      {/* Fila superior: checkbox + título + menú */}
      <div className="px-4 pt-3 pb-0 flex items-start gap-2">
        {/* Checkbox inline — solo visible en modo selección */}
        {selectionMode && (
          <button
            onClick={onToggleSelect}
            aria-label={isSelected ? 'Deseleccionar' : 'Seleccionar'}
            className={`flex-shrink-0 mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-150 ${
              isSelected
                ? 'bg-violet-600 border-violet-600 text-white scale-110'
                : 'bg-white dark:bg-zinc-800 border-zinc-400 dark:border-zinc-500 hover:border-violet-500'
            }`}
          >
            {isSelected && <CheckIcon className="w-3 h-3" />}
          </button>
        )}

        {/* Título y dominio */}
        <div className="flex-1 min-w-0">
          <a
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block font-medium text-zinc-900 dark:text-zinc-100 hover:text-violet-600 dark:hover:text-violet-400 truncate leading-snug"
            title={link.title ?? undefined}
            onClick={e => selectionMode && e.preventDefault()}
          >
            {link.title || link.url}
          </a>
          <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5">{domain}</p>
        </div>

        {/* Menú 3 puntos */}
        <div className="relative flex-shrink-0">
          <button
            onClick={() => { setMenuOpen(!menuOpen); setMoveOpen(false) }}
            className="p-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 transition-colors"
          >
            <EllipsisVerticalIcon className="w-5 h-5" />
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-7 z-20 w-44 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg shadow-lg py-1 text-sm max-w-[calc(100vw-2rem)]">
              <button
                onClick={() => setMoveOpen(!moveOpen)}
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

      {/* Contenido */}
      <div className="px-4 pb-4 pt-2 space-y-2">
        {link.description && (
          <p className="text-sm text-zinc-500 dark:text-zinc-400 line-clamp-2">{link.description}</p>
        )}

        {(link.estimated_seconds ?? 0) > 0 && (
          <div className="flex items-center gap-1.5 py-1.5 px-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 w-fit">
            <TimeEstimate
              seconds={link.estimated_seconds}
              contentType={link.content_type}
              showLabel
              className="text-sm"
            />
            {(link.word_count ?? 0) > 0 && (link.content_type === 'article' || link.content_type === 'pdf') && (
              <span className="text-xs text-zinc-400 dark:text-zinc-500 border-l border-zinc-200 dark:border-zinc-600 pl-1.5">
                {(link.word_count ?? 0).toLocaleString()} palabras
              </span>
            )}
          </div>
        )}

        <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
          <span>{TYPE_ICONS[link.content_type ?? 'other']} {link.content_type ?? 'other'}</span>
          {link.author && <span>· {link.author}</span>}
          {link.published_at && <span>· {formatDate(link.published_at)}</span>}
        </div>

        {link.link_tags && link.link_tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {link.link_tags.map(lt =>
              lt.tags ? <TagBadge key={lt.tags.id} name={lt.tags.name} color={lt.tags.color} /> : null
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
          {link.is_read
            ? <CheckCircleSolid className="w-4 h-4" />
            : <CheckCircleIcon className="w-4 h-4" />
          }
          {link.is_read ? 'Leído' : 'Marcar como leído'}
        </button>
      </div>

      {menuOpen && (
        <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
      )}
    </div>
  )
}
