import { normalizeCanvasElementOpacity } from '../types/bookPage'

type Props = {
  value: number | undefined
  onChange: (opacity: number) => void
  minPercent?: number
}

function IcoOpacity() {
  return (
    <svg
      width={18}
      height={18}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      aria-hidden
    >
      <circle cx="12" cy="12" r="8" opacity="0.35" />
      <path d="M12 4a8 8 0 0 1 0 16" />
    </svg>
  )
}

export function CanvasOpacityField({
  value,
  onChange,
  minPercent = 0,
}: Props) {
  const pct = Math.round(normalizeCanvasElementOpacity(value) * 100)

  return (
    <label className="book-text-flyout__field">
      <span className="book-text-flyout__field-head">
        <IcoOpacity />
        Opacity ({pct}%)
      </span>
      <input
        type="range"
        className="book-text-flyout__range"
        min={minPercent}
        max={100}
        value={Math.max(minPercent, pct)}
        onChange={(e) => onChange(Number(e.target.value) / 100)}
        aria-label="Opacity percent"
      />
    </label>
  )
}
