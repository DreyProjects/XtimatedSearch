'use client'

import { useState } from 'react'
import { PlusIcon, ArrowUpTrayIcon, CheckCircleIcon, XMarkIcon } from '@heroicons/react/24/outline'
import Sidebar from '@/components/Sidebar'
import FilterBar from '@/components/FilterBar'
import LinkList from '@/components/LinkList'
import SearchBar from '@/components/SearchBar'
import ThemeToggle from '@/components/ThemeToggle'
import AddLinkModal from '@/components/AddLinkModal'
import ExportModal from '@/components/ExportModal'
import { useLinks } from '@/hooks/useLinks'
import { useFolders } from '@/hooks/useFolders'
import { useTags } from '@/hooks/useTags'
import { useSelection } from '@/hooks/useSelection'

type ViewType = 'all' | 'unread' | 'folder' | 'tag'

interface Props {
  userEmail: string
}

export default function DashboardClient({ userEmail }: Props) {
  const [view, setView] = useState<ViewType>('all')
  const [selectedFolderId, setSelectedFolderId] = useState<string>()
  const [selectedTagId, setSelectedTagId] = useState<string>()
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState({ contentType: '', isRead: '', tagId: '' })
  const [showAddModal, setShowAddModal] = useState(false)
  const [showExportModal, setShowExportModal] = useState(false)

  const selection = useSelection()
  const { folders, createFolder, deleteFolder } = useFolders()
  const { tags } = useTags()

  const linksOptions = {
    folderId: view === 'folder' ? selectedFolderId : undefined,
    tagId: view === 'tag' ? selectedTagId : (filters.tagId || undefined),
    contentType: filters.contentType || undefined,
    isRead: filters.isRead !== '' ? filters.isRead === 'true' : undefined,
    search: search || undefined,
  }
  if (view === 'unread') linksOptions.isRead = false

  const { links, isLoading, addLink, updateLink, deleteLink, toggleRead } = useLinks(linksOptions)

  function handleViewChange(v: ViewType, id?: string) {
    setView(v)
    if (v === 'folder') setSelectedFolderId(id)
    if (v === 'tag') setSelectedTagId(id)
    selection.clearSelection()
  }

  async function handleMarkAllRead() {
    await Promise.all(
      selection.selectedIds
        .map(id => {
          const link = links.find(l => l.id === id)
          if (link && !link.is_read) return toggleRead(id, false)
        })
        .filter(Boolean)
    )
    selection.clearSelection()
  }

  const viewTitle =
    view === 'folder'
      ? folders.find(f => f.id === selectedFolderId)?.name ?? 'Carpeta'
      : view === 'tag'
      ? tags.find(t => t.id === selectedTagId)?.name ?? 'Tag'
      : view === 'unread'
      ? 'No leídos'
      : 'Todos los links'

  return (
    <div className="flex h-screen overflow-hidden bg-white dark:bg-zinc-950">
      <Sidebar
        folders={folders}
        tags={tags}
        selectedFolderId={selectedFolderId}
        selectedTagId={selectedTagId}
        view={view}
        onViewChange={handleViewChange}
        onCreateFolder={createFolder}
        onDeleteFolder={deleteFolder}
        userEmail={userEmail}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="flex items-center gap-3 px-6 py-3 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
          <h2 className="font-semibold text-zinc-800 dark:text-zinc-100 flex-shrink-0">{viewTitle}</h2>
          <div className="flex-1" />
          <SearchBar value={search} onChange={setSearch} />
          <ThemeToggle />
        </header>

        <main className="flex-1 overflow-y-auto p-6 space-y-4">
          <FilterBar
            filters={filters}
            onChange={setFilters}
            onSelectModeToggle={() => {
              if (selection.selectionMode) selection.clearSelection()
              else selection.enterSelectionMode()
            }}
            selectionMode={selection.selectionMode}
          />

          <LinkList
            links={links}
            isLoading={isLoading}
            selectionMode={selection.selectionMode}
            selected={selection.selected}
            onToggleSelect={selection.toggle}
            onToggleRead={toggleRead}
            onDelete={deleteLink}
            onMove={(id, folderId) => updateLink(id, { folder_id: folderId })}
            folders={folders}
          />
        </main>
      </div>

      <button
        onClick={() => setShowAddModal(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-violet-600 hover:bg-violet-700 text-white rounded-full shadow-lg flex items-center justify-center transition-colors z-30"
        aria-label="Agregar link"
      >
        <PlusIcon className="w-7 h-7" />
      </button>

      {selection.count > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-3 px-5 py-3 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-2xl shadow-xl">
          <span className="text-sm font-medium">
            {selection.count} {selection.count === 1 ? 'link' : 'links'} seleccionado{selection.count > 1 ? 's' : ''}
          </span>
          <button
            onClick={() => setShowExportModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-violet-600 dark:bg-violet-600 text-white text-sm rounded-lg hover:bg-violet-700 transition-colors"
          >
            <ArrowUpTrayIcon className="w-4 h-4" />
            Exportar
          </button>
          <button
            onClick={handleMarkAllRead}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
          >
            <CheckCircleIcon className="w-4 h-4" />
            Marcar leídos
          </button>
          <button
            onClick={selection.clearSelection}
            className="p-1.5 rounded-lg hover:bg-zinc-700 dark:hover:bg-zinc-200 transition-colors"
          >
            <XMarkIcon className="w-4 h-4" />
          </button>
        </div>
      )}

      {showAddModal && (
        <AddLinkModal
          folders={folders}
          tags={tags}
          onClose={() => setShowAddModal(false)}
          onSave={addLink}
        />
      )}

      {showExportModal && (
        <ExportModal
          selectedIds={selection.selectedIds}
          onClose={() => { setShowExportModal(false); selection.clearSelection() }}
        />
      )}
    </div>
  )
}
