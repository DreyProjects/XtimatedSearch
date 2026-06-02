'use client'

import { FolderIcon, FolderOpenIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline'
import { useState } from 'react'
import type { Folder } from '@/hooks/useFolders'

interface Props {
  folders: Folder[]
  selectedFolderId?: string
  onSelect: (id: string | undefined) => void
  onCreateFolder: (data: { name: string; color?: string; parent_id?: string }) => void
  onDeleteFolder: (id: string) => void
}

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6']

function FolderNode({
  folder,
  children,
  depth,
  isSelected,
  onSelect,
  onDelete,
}: {
  folder: Folder
  children: React.ReactNode
  depth: number
  isSelected: boolean
  onSelect: () => void
  onDelete: () => void
}) {
  const [open, setOpen] = useState(true)
  return (
    <div>
      <div
        className={`group flex items-center gap-2 px-2 py-1.5 rounded-lg cursor-pointer text-sm transition-colors ${
          isSelected
            ? 'bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300'
            : 'hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
        }`}
        style={{ paddingLeft: `${8 + depth * 16}px` }}
        onClick={onSelect}
      >
        {open ? (
          <FolderOpenIcon className="w-4 h-4 flex-shrink-0" style={{ color: folder.color }} />
        ) : (
          <FolderIcon className="w-4 h-4 flex-shrink-0" style={{ color: folder.color }} />
        )}
        <span className="flex-1 truncate">{folder.name}</span>
        <button
          onClick={e => { e.stopPropagation(); onDelete() }}
          className="opacity-0 group-hover:opacity-100 p-0.5 hover:text-red-500 transition-all"
        >
          <TrashIcon className="w-3.5 h-3.5" />
        </button>
      </div>
      {open && <div>{children}</div>}
    </div>
  )
}

export default function FolderTree({
  folders,
  selectedFolderId,
  onSelect,
  onCreateFolder,
  onDeleteFolder,
}: Props) {
  const [creating, setCreating] = useState(false)
  const [newName, setNewName] = useState('')
  const [newColor, setNewColor] = useState(COLORS[0])

  const rootFolders = folders.filter(f => !f.parent_id)

  function renderFolder(folder: Folder, depth: number): React.ReactNode {
    const subs = folders.filter(f => f.parent_id === folder.id)
    return (
      <FolderNode
        key={folder.id}
        folder={folder}
        depth={depth}
        isSelected={selectedFolderId === folder.id}
        onSelect={() => onSelect(folder.id)}
        onDelete={() => onDeleteFolder(folder.id)}
      >
        {subs.map(sub => renderFolder(sub, depth + 1))}
      </FolderNode>
    )
  }

  async function handleCreate() {
    if (!newName.trim()) return
    await onCreateFolder({ name: newName.trim(), color: newColor })
    setNewName('')
    setCreating(false)
  }

  return (
    <div className="space-y-0.5">
      {rootFolders.map(f => renderFolder(f, 0))}

      {creating ? (
        <div className="px-2 py-1.5 space-y-2">
          <input
            autoFocus
            value={newName}
            onChange={e => setNewName(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleCreate(); if (e.key === 'Escape') setCreating(false) }}
            placeholder="Nombre de carpeta"
            className="w-full px-2 py-1 text-sm border border-zinc-300 dark:border-zinc-600 rounded bg-white dark:bg-zinc-800 focus:outline-none focus:ring-1 focus:ring-violet-500"
          />
          <div className="flex gap-1">
            {COLORS.map(c => (
              <button
                key={c}
                onClick={() => setNewColor(c)}
                className={`w-5 h-5 rounded-full transition-transform ${newColor === c ? 'scale-125 ring-2 ring-offset-1 ring-zinc-400' : ''}`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
          <div className="flex gap-1">
            <button onClick={handleCreate} className="px-2 py-1 text-xs bg-violet-600 text-white rounded hover:bg-violet-700">Crear</button>
            <button onClick={() => setCreating(false)} className="px-2 py-1 text-xs border border-zinc-300 dark:border-zinc-600 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800">Cancelar</button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setCreating(true)}
          className="flex items-center gap-2 w-full px-2 py-1.5 text-sm text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
        >
          <PlusIcon className="w-4 h-4" />
          Nueva carpeta
        </button>
      )}
    </div>
  )
}
