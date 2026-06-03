'use client'

import LinkCard from './LinkCard'
import type { Link } from '@/hooks/useLinks'
import type { Folder } from '@/hooks/useFolders'

interface Props {
  links: Link[]
  isLoading: boolean
  selectionMode: boolean
  selected: Set<string>
  onToggleSelect: (id: string) => void
  onToggleRead: (id: string, isRead: boolean) => void
  onDelete: (id: string) => void
  onMove: (id: string, folderId: string | null) => void
  folders: Folder[]
}

export default function LinkList({
  links,
  isLoading,
  selectionMode,
  selected,
  onToggleSelect,
  onToggleRead,
  onDelete,
  onMove,
  folders,
}: Props) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl h-52 animate-pulse"
          />
        ))}
      </div>
    )
  }

  if (links.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-zinc-400 animate-fade-up">
        <p className="text-lg font-medium">No hay links aquí</p>
        <p className="text-sm mt-1">Pega una URL para empezar</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {links.map((link, i) => (
        <LinkCard
          key={link.id}
          link={link}
          index={i}
          selectionMode={selectionMode}
          isSelected={selected.has(link.id)}
          onToggleSelect={() => onToggleSelect(link.id)}
          onToggleRead={() => onToggleRead(link.id, !!link.is_read)}
          onDelete={() => onDelete(link.id)}
          onMove={folderId => onMove(link.id, folderId)}
          folders={folders}
        />
      ))}
    </div>
  )
}
