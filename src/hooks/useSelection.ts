import { useState, useCallback } from 'react'

export function useSelection() {
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [selectionMode, setSelectionMode] = useState(false)

  const toggle = useCallback((id: string) => {
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  const selectAll = useCallback((ids: string[]) => {
    setSelected(new Set(ids))
  }, [])

  const clearSelection = useCallback(() => {
    setSelected(new Set())
    setSelectionMode(false)
  }, [])

  const enterSelectionMode = useCallback(() => {
    setSelectionMode(true)
  }, [])

  return {
    selected,
    selectionMode,
    toggle,
    selectAll,
    clearSelection,
    enterSelectionMode,
    count: selected.size,
    isSelected: (id: string) => selected.has(id),
    selectedIds: Array.from(selected),
  }
}
