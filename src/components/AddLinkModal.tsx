'use client'

import { useState } from 'react'
import { XMarkIcon, LinkIcon } from '@heroicons/react/24/outline'
import Image from 'next/image'
import TagBadge from './TagBadge'
import TimeEstimate from './TimeEstimate'
import type { Folder } from '@/hooks/useFolders'
import type { Tag } from '@/hooks/useTags'

interface ScrapeResult {
  title: string
  description: string
  thumbnail_url: string
  author: string
  site_name: string
  published_at: string | null
  content_type: string
  estimated_seconds: number
  word_count: number
}

interface Props {
  folders: Folder[]
  tags: Tag[]
  onClose: () => void
  onSave: (data: Record<string, unknown>) => Promise<void>
}

export default function AddLinkModal({ folders, tags, onClose, onSave }: Props) {
  const [url, setUrl] = useState('')
  const [scraping, setScraping] = useState(false)
  const [preview, setPreview] = useState<ScrapeResult | null>(null)
  const [selectedFolderId, setSelectedFolderId] = useState('')
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function handleAnalyze() {
    if (!url.trim()) return
    setScraping(true)
    setError('')
    try {
      const res = await fetch('/api/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      })
      if (!res.ok) throw new Error('Error al analizar la URL')
      setPreview(await res.json())
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error desconocido')
    } finally {
      setScraping(false)
    }
  }

  async function handleSave() {
    if (!url.trim()) return
    setSaving(true)
    await onSave({
      url,
      ...(preview ?? {}),
      folder_id: selectedFolderId || null,
      tag_ids: selectedTagIds,
    })
    setSaving(false)
    onClose()
  }

  function toggleTag(id: string) {
    setSelectedTagIds(prev =>
      prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-zinc-200 dark:border-zinc-800">
          <h2 className="font-semibold text-lg">Agregar link</h2>
          <button onClick={onClose} className="p-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800">
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-4 max-h-[80vh] overflow-y-auto">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <input
                type="url"
                value={url}
                onChange={e => setUrl(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAnalyze()}
                placeholder="https://ejemplo.com/articulo"
                className="w-full pl-9 pr-4 py-2 text-sm border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>
            <button
              onClick={handleAnalyze}
              disabled={scraping || !url.trim()}
              className="px-4 py-2 bg-violet-600 hover:bg-violet-700 disabled:opacity-60 text-white text-sm rounded-lg transition-colors"
            >
              {scraping ? 'Analizando...' : 'Analizar'}
            </button>
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          {scraping && (
            <div className="space-y-3 animate-pulse">
              <div className="h-36 bg-zinc-200 dark:bg-zinc-700 rounded-lg" />
              <div className="h-4 bg-zinc-200 dark:bg-zinc-700 rounded w-3/4" />
              <div className="h-3 bg-zinc-200 dark:bg-zinc-700 rounded w-full" />
              <div className="h-3 bg-zinc-200 dark:bg-zinc-700 rounded w-1/2" />
            </div>
          )}

          {preview && !scraping && (
            <div className="space-y-3 border border-zinc-200 dark:border-zinc-700 rounded-xl overflow-hidden">
              {preview.thumbnail_url && (
                <div className="relative w-full h-36 bg-zinc-100 dark:bg-zinc-800">
                  <Image src={preview.thumbnail_url} alt={preview.title} fill className="object-cover" unoptimized />
                </div>
              )}
              <div className="p-3 space-y-1">
                <p className="font-medium text-sm">{preview.title}</p>
                {preview.description && (
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2">{preview.description}</p>
                )}
                <div className="flex items-center gap-2 flex-wrap text-xs text-zinc-400">
                  <span className="capitalize">{preview.content_type}</span>
                  <TimeEstimate seconds={preview.estimated_seconds} />
                  {preview.author && <span>· {preview.author}</span>}
                </div>
              </div>
            </div>
          )}

          {folders.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Carpeta
              </label>
              <select
                value={selectedFolderId}
                onChange={e => setSelectedFolderId(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-violet-500"
              >
                <option value="">Sin carpeta</option>
                {folders.map(f => (
                  <option key={f.id} value={f.id}>{f.name}</option>
                ))}
              </select>
            </div>
          )}

          {tags.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                Tags
              </label>
              <div className="flex flex-wrap gap-2">
                {tags.map(tag => (
                  <button
                    key={tag.id}
                    onClick={() => toggleTag(tag.id)}
                    className={`transition-transform ${selectedTagIds.includes(tag.id) ? 'scale-105' : 'opacity-60 hover:opacity-100'}`}
                  >
                    <TagBadge name={tag.name} color={tag.color} />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm border border-zinc-300 dark:border-zinc-600 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !url.trim()}
            className="px-4 py-2 text-sm bg-violet-600 hover:bg-violet-700 disabled:opacity-60 text-white rounded-lg transition-colors"
          >
            {saving ? 'Guardando...' : 'Guardar link'}
          </button>
        </div>
      </div>
    </div>
  )
}
