'use client'

import { useState, useEffect, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { PlusIcon, ArrowUpTrayIcon, CheckCircleIcon, XMarkIcon, Bars3Icon, TrashIcon } from '@heroicons/react/24/outline'
import Sidebar from '@/components/Sidebar'
import FilterBar from '@/components/FilterBar'
import LinkList from '@/components/LinkList'
import SearchBar from '@/components/SearchBar'
import ThemeToggle from '@/components/ThemeToggle'
import AddLinkModal from '@/components/AddLinkModal'
import ExportModal from '@/components/ExportModal'
import TimeSummary from '@/components/TimeSummary'
import TrashView from '@/components/TrashView'
import { useLinks } from '@/hooks/useLinks'
import { useFolders } from '@/hooks/useFolders'
import { useTags } from '@/hooks/useTags'
import { useSelection } from '@/hooks/useSelection'
import { useTrash } from '@/hooks/useTrash'
import type { FolderStats } from '@/components/FolderTree'

type ViewType = 'all' | 'unread' | 'folder' | 'tag' | 'trash'

interface Props {
  userEmail: string
}

export default function DashboardClient({ userEmail }: Props) {
  const [view, setView] = useState<ViewType>('all')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [selectedFolderId, setSelectedFolderId] = useState<string>()
  const [selectedTagId, setSelectedTagId] = useState<string>()
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState({ contentType: '', isRead: '', tagId: '' })
  const [showAddModal, setShowAddModal] = useState(false)
  const [showExportModal, setShowExportModal] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) window.location.href = '/login'
    })
  }, [])

  // Cerrar sidebar al rotar pantalla a desktop
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)')
    const handler = (e: MediaQueryListEvent) => { if (e.matches) setSidebarOpen(false) }
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  const selection = useSelection()
  const { folders, createFolder, deleteFolder } = useFolders()
  const { tags } = useTags()
  const { count: trashCount } = useTrash()

  const linksOptions = {
    folderId: view === 'folder' ? selectedFolderId : undefined,
    tagId: view === 'tag' ? selectedTagId : (filters.tagId || undefined),
    contentType: filters.contentType || undefined,
    isRead: filters.isRead !== '' ? filters.isRead === 'true' : undefined,
    search: search || undefined,
  }
  if (view === 'unread') linksOptions.isRead = false

  const { links, isLoading, error: linksError, addLink, updateLink, deleteLink, toggleRead } = useLinks(linksOptions)

  const totalSeconds = useMemo(
    () => links.reduce((sum, l) => sum + (l.estimated_seconds ?? 0), 0),
    [links]
  )

  const { links: allLinks } = useLinks(view === 'trash' ? { isRead: undefined } : {})
  const folderStats = useMemo<Record<string, FolderStats>>(() => {
    if (view === 'trash') return {}
    const stats: Record<string, FolderStats> = {}
    for (const link of allLinks) {
      if (!link.folder_id) continue
      if (!stats[link.folder_id]) stats[link.folder_id] = { count: 0, totalSeconds: 0 }
      stats[link.folder_id].count++
      stats[link.folder_id].totalSeconds += link.estimated_seconds ?? 0
    }
    return stats
  }, [allLinks, view])

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

  async function handleDeleteSelected() {
    await Promise.all(selection.selectedIds.map(id => deleteLink(id)))
    selection.clearSelection()
  }

  const viewTitle =
    view === 'folder' ? folders.find(f => f.id === selectedFolderId)?.name ?? 'Carpeta'
    : view === 'tag' ? tags.find(t => t.id === selectedTagId)?.name ?? 'Tag'
    : view === 'unread' ? 'No leídos'
    : view === 'trash' ? 'Papelera'
    : 'Todos los links'

  return (
    <div className="flex h-[100dvh] overflow-hidden bg-white dark:bg-zinc-950">
      <Sidebar
        folders={folders}
        tags={tags}
        selectedFolderId={selectedFolderId}
        selectedTagId={selectedTagId}
        view={view}
        folderStats={folderStats}
        trashCount={trashCount}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onViewChange={handleViewChange}
        onCreateFolder={createFolder}
        onDeleteFolder={deleteFolder}
        userEmail={userEmail}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="flex items-center gap-2 px-3 sm:px-6 py-3 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
          <button
            onClick={() => setSidebarOpen(true)}
            className="md:hidden p-2 -ml-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500"
            aria-label="Abrir menú"
          >
            <Bars3Icon className="w-5 h-5" />
          </button>
          <h2 className="font-semibold text-zinc-800 dark:text-zinc-100 truncate">{viewTitle}</h2>
          <div className="flex-1 hidden sm:block" />
          <div className="flex-1 sm:flex-none">
            <SearchBar value={search} onChange={setSearch} />
          </div>
          <ThemeToggle />
        </header>

        {/* Main */}
        <main className="flex-1 overflow-y-auto p-3 sm:p-6 space-y-3 sm:space-y-4 animate-fade-in">
          {linksError && view !== 'trash' && (
            <div className="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4 text-sm text-red-700 dark:text-red-300">
              Error cargando links: {linksError.message ?? 'Error desconocido'}. Verifica que ejecutaste el SQL de migración en Supabase.
            </div>
          )}

          {view === 'trash' ? (
            <TrashView />
          ) : (
            <>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <FilterBar
                  filters={filters}
                  onChange={setFilters}
                  onSelectModeToggle={() => {
                    if (selection.selectionMode) selection.clearSelection()
                    else selection.enterSelectionMode()
                  }}
                  selectionMode={selection.selectionMode}
                />
                {!isLoading && links.length > 0 && (
                  <TimeSummary totalSeconds={totalSeconds} count={links.length} />
                )}
              </div>

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
            </>
          )}
        </main>
      </div>

      {/* FAB agregar */}
      <button
        onClick={() => setShowAddModal(true)}
        className="fixed bottom-6 right-4 sm:right-6 bg-violet-600 hover:bg-violet-700 active:scale-90 text-white rounded-full shadow-lg flex items-center justify-center transition-all duration-150 z-30 animate-pop"
        aria-label="Agregar link"
        style={{ width: '52px', height: '52px' }}
      >
        <PlusIcon className="w-6 h-6 sm:w-7 sm:h-7" />
      </button>

      {/* Barra selección flotante */}
      {selection.count > 0 && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 w-[calc(100%-2rem)] sm:w-auto flex flex-wrap items-center justify-center gap-2 px-4 py-3 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-2xl shadow-xl animate-slide-up">
          <span className="text-sm font-medium w-full sm:w-auto text-center">
            {selection.count} {selection.count === 1 ? 'link' : 'links'} seleccionado{selection.count > 1 ? 's' : ''}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowExportModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-violet-600 text-white text-sm rounded-lg hover:bg-violet-700 transition-colors"
            >
              <ArrowUpTrayIcon className="w-4 h-4" />
              <span className="hidden sm:inline">Exportar</span>
            </button>
            <button
              onClick={handleMarkAllRead}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
            >
              <CheckCircleIcon className="w-4 h-4" />
              <span className="hidden sm:inline">Leídos</span>
            </button>
            <button
              onClick={handleDeleteSelected}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors"
            >
              <TrashIcon className="w-4 h-4" />
              <span className="hidden sm:inline">Eliminar</span>
            </button>
            <button
              onClick={selection.clearSelection}
              className="p-1.5 rounded-lg hover:bg-zinc-700 dark:hover:bg-zinc-200 transition-colors"
            >
              <XMarkIcon className="w-4 h-4" />
            </button>
          </div>
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
