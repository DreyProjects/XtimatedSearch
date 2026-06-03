'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { XMarkIcon, LinkIcon } from '@heroicons/react/24/outline'
import Image from 'next/image'
import TagBadge from './TagBadge'
import TimeEstimate from './TimeEstimate'
import type { Folder } from '@/hooks/useFolders'
import type { Tag } from '@/hooks/useTags'
import { fetchWithAuth } from '@/lib/fetchWithAuth'

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

function isValidUrl(str: string): boolean {
  try {
    const u = str.startsWith('http') ? str : `https://${str}`
    new URL(u)
    return true
  } catch {
    return false
  }
}

export default function AddLinkModal({ folders, tags, onClose, onSave }: Props) {
  const [url, setUrl] = useState('')
  const [scraping, setScraping] = useState(false)
  const [preview, setPreview] = useState<ScrapeResult | null>(null)
  const [selectedFolderId, setSelectedFolderId] = useState('')
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [saveError, setSaveError] = useState('')
  const abortRef = useRef<AbortController | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const analyze = useCallback(async (targetUrl: string) => {
    if (!isValidUrl(targetUrl)) return

    // Cancelar análisis previo si hay uno en curso
    abortRef.current?.abort()
    abortRef.current = new AbortController()

    setScraping(true)
    setError('')
    setPreview(null)

    try {
      const res = await fetchWithAuth('/api/scrape', {
        method: 'POST',
        body: JSON.stringify({ url: targetUrl }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || `Error ${res.status}`)
      }
      setPreview(await res.json())
    } catch (e) {
      if ((e as Error).name !== 'AbortError') {
        setError(e instanceof Error ? e.message : 'Error al analizar la URL')
      }
    } finally {
      setScraping(false)
    }
  }, [])

  // Auto-análisis con debounce al escribir
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (!url.trim() || !isValidUrl(url)) {
      setPreview(null)
      setError('')
      return
    }
    debounceRef.current = setTimeout(() => analyze(url), 700)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [url, analyze])

  // Auto-análisis inmediato al pegar
  function handlePaste(e: React.ClipboardEvent<HTMLInputElement>) {
    const pasted = e.clipboardData.getData('text').trim()
    if (isValidUrl(pasted)) {
      if (debounceRef.current) clearTimeout(debounceRef.current)
      setTimeout(() => analyze(pasted), 0)
    }
  }

  async function handleSave() {
    if (!url.trim()) return
    setSaving(true)
    setSaveError('')
    try {
      await onSave({
        url,
        ...(preview ?? {}),
        folder_id: selectedFolderId || null,
        tag_ids: selectedTagIds,
      })
      onClose()
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : 'Error al guardar el link')
    } finally {
      setSaving(false)
    }
  }

  function toggleTag(id: string) {
    setSelectedTagIds(prev =>
      prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="w-full sm:max-w-lg bg-white dark:bg-zinc-900 rounded-t-2xl sm:rounded-2xl shadow-xl border-t border-x sm:border border-zinc-200 dark:border-zinc-800 overflow-hidden max-h-[92dvh] flex flex-col animate-sheet-up sm:animate-scale-in">

        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-zinc-200 dark:border-zinc-800">
          <h2 className="font-semibold text-lg">Agregar link</h2>
          <button onClick={onClose} className="p-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 space-y-4 overflow-y-auto flex-1">

          {/* Input URL */}
          <div className="relative">
            <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input
              type="url"
              autoFocus
              value={url}
              onChange={e => setUrl(e.target.value)}
              onPaste={handlePaste}
              placeholder="https://ejemplo.com/articulo"
              className="w-full pl-9 pr-4 py-2.5 text-sm border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-violet-500 transition-shadow"
            />
            {/* Indicador de carga inline */}
            {scraping && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                <span className="text-xs text-zinc-400">Analizando</span>
                <div className="flex gap-0.5">
                  {[0, 1, 2].map(i => (
                    <span
                      key={i}
                      className="w-1 h-1 bg-violet-500 rounded-full animate-bounce"
                      style={{ animationDelay: `${i * 100}ms` }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {error && <p className="text-sm text-red-500 animate-fade-down">{error}</p>}

          {/* Skeleton mientras analiza */}
          {scraping && (
            <div className="space-y-3 animate-pulse">
              <div className="h-32 bg-zinc-200 dark:bg-zinc-700 rounded-lg" />
              <div className="h-4 bg-zinc-200 dark:bg-zinc-700 rounded w-3/4" />
              <div className="h-3 bg-zinc-200 dark:bg-zinc-700 rounded" />
              <div className="h-3 bg-zinc-200 dark:bg-zinc-700 rounded w-1/2" />
            </div>
          )}

          {/* Preview */}
          {preview && !scraping && (
            <div className="space-y-3 border border-zinc-200 dark:border-zinc-700 rounded-xl overflow-hidden animate-fade-up">
              {preview.thumbnail_url && (
                <div className="relative w-full h-36 bg-zinc-100 dark:bg-zinc-800">
                  <Image src={preview.thumbnail_url} alt={preview.title} fill className="object-cover" unoptimized />
                </div>
              )}
              <div className="p-3 space-y-1.5">
                <p className="font-medium text-sm leading-snug">{preview.title}</p>
                {preview.description && (
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2">{preview.description}</p>
                )}
                <div className="flex items-center gap-2 flex-wrap text-xs text-zinc-400">
                  <span className="capitalize font-medium text-violet-600 dark:text-violet-400">
                    {preview.content_type}
                  </span>
                  {preview.site_name && <span>· {preview.site_name}</span>}
                  <TimeEstimate
                    seconds={preview.estimated_seconds}
                    contentType={preview.content_type}
                    showLabel
                  />
                  {(preview.word_count ?? 0) > 0 && (
                    preview.content_type === 'article' || preview.content_type === 'pdf'
                  ) && (
                    <span>· {preview.word_count.toLocaleString()} palabras</span>
                  )}
                  {preview.author && <span>· {preview.author}</span>}
                </div>
              </div>
            </div>
          )}

          {/* Carpeta */}
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

          {/* Tags */}
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
                    className={`transition-all duration-150 ${
                      selectedTagIds.includes(tag.id) ? 'scale-105 ring-2 ring-violet-400 ring-offset-1 rounded-full' : 'opacity-60 hover:opacity-100'
                    }`}
                  >
                    <TagBadge name={tag.name} color={tag.color} />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 space-y-2">
          {saveError && <p className="text-sm text-red-600 dark:text-red-400">{saveError}</p>}
          <div className="flex justify-end gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm border border-zinc-300 dark:border-zinc-600 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={saving || !url.trim() || scraping}
              className="px-4 py-2 text-sm bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white rounded-lg transition-colors"
            >
              {saving ? 'Guardando...' : 'Guardar link'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
