interface Props {
  name: string
  color?: string
  onRemove?: () => void
}

export default function TagBadge({ name, color = '#8b5cf6', onRemove }: Props) {
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
      style={{ backgroundColor: `${color}22`, color }}
    >
      {name}
      {onRemove && (
        <button
          onClick={onRemove}
          className="hover:opacity-70 transition-opacity ml-0.5"
          aria-label={`Quitar tag ${name}`}
        >
          ×
        </button>
      )}
    </span>
  )
}
