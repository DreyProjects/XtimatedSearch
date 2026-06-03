'use client'

import { useState } from 'react'
import { XMarkIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline'
import { fetchWithAuth } from '@/lib/fetchWithAuth'

interface Props {
  selectedIds: string[]
  onClose: () => void
}

type Format = 'txt' | 'apa' | 'vancouver'

const FORMATS: Array<{ value: Format; label: string; description: string }> = [
  { value: 'txt', label: 'TXT', description: 'Lista simple para copiar o compartir' },
  { value: 'apa', label: 'APA 7', description: 'Formato académico American Psychological Association 7ma edición' },
  { value: 'vancouver', label: 'Vancouver', description: 'Sistema numérico usado en ciencias de la salud' },
]

export default function ExportModal({ selectedIds, onClose }: Props) {
  const [format, setFormat] = useState<Format>('txt')
  const [downloading, setDownloading] = useState(false)

  async function handleDownload() {
    setDownloading(true)
    try {
      const params = new URLSearchParams({ format, ids: selectedIds.join(',') })
      const res = await fetchWithAuth(`/api/export?${params}`)
      if (!res.ok) throw new Error('Error al exportar')
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `xtimated-search-export-${new Date().toISOString().slice(0, 10)}.txt`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      onClose()
    } catch (e) {
      console.error(e)
    } finally {
      setDownloading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="w-full sm:max-w-md bg-white dark:bg-zinc-900 rounded-t-2xl sm:rounded-2xl shadow-xl border-t border-x sm:border border-zinc-200 dark:border-zinc-800 animate-sheet-up sm:animate-scale-in">
        <div className="flex items-center justify-between p-4 border-b border-zinc-200 dark:border-zinc-800">
          <h2 className="font-semibold text-lg">Exportar links</h2>
          <button onClick={onClose} className="p-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800">
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            {selectedIds.length} {selectedIds.length === 1 ? 'link seleccionado' : 'links seleccionados'}
          </p>

          <fieldset className="space-y-2">
            <legend className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Formato de exportación
            </legend>
            {FORMATS.map(f => (
              <label
                key={f.value}
                className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                  format === f.value
                    ? 'border-violet-400 bg-violet-50 dark:bg-violet-900/20 dark:border-violet-600'
                    : 'border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800'
                }`}
              >
                <input
                  type="radio"
                  name="format"
                  value={f.value}
                  checked={format === f.value}
                  onChange={() => setFormat(f.value)}
                  className="mt-0.5 accent-violet-600"
                />
                <div>
                  <p className="font-medium text-sm">{f.label}</p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">{f.description}</p>
                </div>
              </label>
            ))}
          </fieldset>
        </div>

        <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm border border-zinc-300 dark:border-zinc-600 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="flex items-center gap-2 px-4 py-2 text-sm bg-violet-600 hover:bg-violet-700 disabled:opacity-60 text-white rounded-lg transition-colors"
          >
            <ArrowDownTrayIcon className="w-4 h-4" />
            {downloading ? 'Descargando...' : 'Descargar .txt'}
          </button>
        </div>
      </div>
    </div>
  )
}
