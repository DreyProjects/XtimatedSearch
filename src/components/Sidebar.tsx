'use client'

import { InboxIcon, BookOpenIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline'
import FolderTree from './FolderTree'
import type { Folder } from '@/hooks/useFolders'
import type { Tag } from '@/hooks/useTags'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface Props {
  folders: Folder[]
  tags: Tag[]
  selectedFolderId?: string
  selectedTagId?: string
  view: 'all' | 'unread' | 'folder' | 'tag'
  onViewChange: (view: 'all' | 'unread' | 'folder' | 'tag', id?: string) => void
  onCreateFolder: (data: { name: string; color?: string; parent_id?: string }) => void
  onDeleteFolder: (id: string) => void
  userEmail?: string
}

export default function Sidebar({
  folders,
  tags,
  selectedFolderId,
  selectedTagId,
  view,
  onViewChange,
  onCreateFolder,
  onDeleteFolder,
  userEmail,
}: Props) {
  const router = useRouter()

  async function signOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <aside className="flex flex-col w-60 min-h-full border-r border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900">
      <div className="p-4 border-b border-zinc-200 dark:border-zinc-800">
        <h1 className="text-lg font-bold text-violet-600 dark:text-violet-400">Xtimated Search</h1>
      </div>

      <nav className="flex-1 overflow-y-auto p-3 space-y-1 scrollbar-thin">
        <button
          onClick={() => onViewChange('all')}
          className={`flex items-center gap-2 w-full px-3 py-2 text-sm rounded-lg transition-colors ${
            view === 'all'
              ? 'bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 font-medium'
              : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
          }`}
        >
          <InboxIcon className="w-4 h-4" />
          Todos los links
        </button>

        <button
          onClick={() => onViewChange('unread')}
          className={`flex items-center gap-2 w-full px-3 py-2 text-sm rounded-lg transition-colors ${
            view === 'unread'
              ? 'bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 font-medium'
              : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
          }`}
        >
          <BookOpenIcon className="w-4 h-4" />
          No leídos
        </button>

        <div className="pt-3 pb-1">
          <p className="px-3 text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
            Carpetas
          </p>
        </div>

        <FolderTree
          folders={folders}
          selectedFolderId={view === 'folder' ? selectedFolderId : undefined}
          onSelect={id => id && onViewChange('folder', id)}
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
                onClick={() => onViewChange('tag', tag.id)}
                className={`flex items-center gap-2 w-full px-3 py-1.5 text-sm rounded-lg transition-colors ${
                  view === 'tag' && selectedTagId === tag.id
                    ? 'bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300'
                    : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                }`}
              >
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: tag.color }} />
                <span className="truncate">{tag.name}</span>
              </button>
            ))}
          </>
        )}
      </nav>

      <div className="p-3 border-t border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center gap-2">
          <div className="flex-1 min-w-0">
            <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">{userEmail}</p>
          </div>
          <button
            onClick={signOut}
            className="p-1.5 rounded hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-500 transition-colors"
            aria-label="Cerrar sesión"
          >
            <ArrowRightOnRectangleIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  )
}
