'use client'

import { InboxIcon, BookOpenIcon, ArrowRightOnRectangleIcon, TrashIcon, XMarkIcon } from '@heroicons/react/24/outline'
import FolderTree, { type FolderStats } from './FolderTree'
import type { Folder } from '@/hooks/useFolders'
import type { Tag } from '@/hooks/useTags'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface Props {
  folders: Folder[]
  tags: Tag[]
  selectedFolderId?: string
  selectedTagId?: string
  view: 'all' | 'unread' | 'folder' | 'tag' | 'trash'
  folderStats?: Record<string, FolderStats>
  trashCount?: number
  open: boolean
  onClose: () => void
  onViewChange: (view: 'all' | 'unread' | 'folder' | 'tag' | 'trash', id?: string) => void
  onCreateFolder: (data: { name: string; color?: string; parent_id?: string }) => void
  onDeleteFolder: (id: string) => void
  userEmail?: string
}

const navItem = (active: boolean) =>
  `flex items-center gap-2 w-full px-3 py-2 text-sm rounded-lg transition-colors ${
    active
      ? 'bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 font-medium'
      : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
  }`

export default function Sidebar({
  folders, tags, selectedFolderId, selectedTagId, view,
  folderStats = {}, trashCount = 0, open, onClose,
  onViewChange, onCreateFolder, onDeleteFolder, userEmail,
}: Props) {
  const router = useRouter()

  async function signOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  function handleNav(v: 'all' | 'unread' | 'folder' | 'tag' | 'trash', id?: string) {
    onViewChange(v, id)
    onClose()
  }

  return (
    <>
      {/* Backdrop mobile */}
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar panel */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-40 flex flex-col w-64 bg-zinc-50 dark:bg-zinc-900
          border-r border-zinc-200 dark:border-zinc-800
          transform transition-transform duration-200 ease-in-out
          md:relative md:translate-x-0 md:z-auto md:flex-shrink-0
          ${open ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-200 dark:border-zinc-800">
          <h1 className="text-base font-bold text-violet-600 dark:text-violet-400 truncate">
            Xtimated Search
          </h1>
          <button
            onClick={onClose}
            className="md:hidden p-1 rounded hover:bg-zinc-200 dark:hover:bg-zinc-700"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-0.5 scrollbar-thin animate-fade-in">
          <button onClick={() => handleNav('all')} className={navItem(view === 'all')}>
            <InboxIcon className="w-4 h-4 flex-shrink-0" />
            Todos los links
          </button>

          <button onClick={() => handleNav('unread')} className={navItem(view === 'unread')}>
            <BookOpenIcon className="w-4 h-4 flex-shrink-0" />
            No leídos
          </button>

          <button
            onClick={() => handleNav('trash')}
            className={`flex items-center gap-2 w-full px-3 py-2 text-sm rounded-lg transition-colors ${
              view === 'trash'
                ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 font-medium'
                : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
            }`}
          >
            <TrashIcon className="w-4 h-4 flex-shrink-0" />
            <span className="flex-1 text-left">Papelera</span>
            {trashCount > 0 && (
              <span className="text-xs bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 px-1.5 py-0.5 rounded-full">
                {trashCount}
              </span>
            )}
          </button>

          <div className="pt-3 pb-1">
            <p className="px-3 text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
              Carpetas
            </p>
          </div>

          <FolderTree
            folders={folders}
            selectedFolderId={view === 'folder' ? selectedFolderId : undefined}
            folderStats={folderStats}
            onSelect={id => id && handleNav('folder', id)}
            onCreateFolder={onCreateFolder}
            onDeleteFolder={onDeleteFolder}
          />

          {tags.length > 0 && (
            <>
              <div className="pt-3 pb-1">
                <p className="px-3 text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                  Tags
                </p>
              </div>
              {tags.map(tag => (
                <button
                  key={tag.id}
                  onClick={() => handleNav('tag', tag.id)}
                  className={navItem(view === 'tag' && selectedTagId === tag.id)}
                >
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: tag.color }} />
                  <span className="truncate">{tag.name}</span>
                </button>
              ))}
            </>
          )}
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <p className="flex-1 text-xs text-zinc-500 dark:text-zinc-400 truncate min-w-0">{userEmail}</p>
            <button
              onClick={signOut}
              className="p-1.5 rounded hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-500 transition-colors flex-shrink-0"
              aria-label="Cerrar sesión"
            >
              <ArrowRightOnRectangleIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}
