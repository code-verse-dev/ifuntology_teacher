import { useMemo, useState, type FormEvent } from 'react'
import { buildLinearGradientCss, type GradientStopInput } from '../lib/linearGradientCss'

type StopRow = { id: string; color: string; percent: number }

function newId(): string {
  return typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`
}

const DIRECTION_OPTIONS: { value: string; label: string }[] = [
  { value: 'to bottom', label: '↓ To bottom' },
  { value: 'to top', label: '↑ To top' },
  { value: 'to right', label: '→ To right' },
  { value: 'to left', label: '← To left' },
  { value: 'to bottom right', label: '↘ To bottom right' },
  { value: 'to bottom left', label: '↙ To bottom left' },
  { value: 'to top right', label: '↗ To top right' },
  { value: 'to top left', label: '↖ To top left' },
  { value: '__angle__', label: 'Custom angle' },
]

type Props = {
  disabled: boolean
  onCancel: () => void
  onAdd: (label: string, css: string) => Promise<void>
  onValidationError: (msg: string | null) => void
  /** Primary button label when not submitting (default: Add to library). */
  submitLabel?: string
  /** Primary button label while `disabled` (default: Adding…). */
  savingLabel?: string
}

function normalizeHex(c: string): string {
  const t = c.trim()
  if (/^#([0-9a-f]{6})$/i.test(t)) return t.toLowerCase()
  if (/^#([0-9a-f]{3})$/i.test(t)) {
    const x = t.slice(1)
    return `#${x[0]}${x[0]}${x[1]}${x[1]}${x[2]}${x[2]}`.toLowerCase()
  }
  return ''
}

export function GradientLibraryForm({
  disabled,
  onCancel,
  onAdd,
  onValidationError,
  submitLabel = 'Add to library',
  savingLabel = 'Adding…',
}: Props) {
  const [name, setName] = useState('')
  const [dirMode, setDirMode] = useState('to bottom')
  const [angleDeg, setAngleDeg] = useState(180)
  const [stops, setStops] = useState<StopRow[]>(() => [
    { id: newId(), color: '#e0f2fe', percent: 0 },
    { id: newId(), color: '#ffffff', percent: 100 },
  ])

  const directionCss =
    dirMode === '__angle__' ? `${angleDeg}deg` : dirMode

  const gradientCss = useMemo(() => {
    const clean: GradientStopInput[] = stops.map((s) => ({
      color: normalizeHex(s.color) || '#cccccc',
      percent: Math.min(100, Math.max(0, Number(s.percent) || 0)),
    }))
    return buildLinearGradientCss(directionCss, clean)
  }, [directionCss, stops])

  const addStop = () => {
    if (stops.length >= 12) return
    const sorted = [...stops].sort((a, b) => a.percent - b.percent)
    let p = 50
    if (sorted.length >= 2) {
      let bestGap = 0
      let insert = 50
      for (let i = 0; i < sorted.length - 1; i++) {
        const gap = sorted[i + 1].percent - sorted[i].percent
        if (gap > bestGap) {
          bestGap = gap
          insert = sorted[i].percent + gap / 2
        }
      }
      p = Math.round(insert * 10) / 10
    }
    setStops((s) => [...s, { id: newId(), color: '#94a3b8', percent: p }])
  }

  const removeStop = (id: string) => {
    setStops((s) => (s.length <= 2 ? s : s.filter((x) => x.id !== id)))
  }

  const updateStop = (
    id: string,
    patch: Partial<Pick<StopRow, 'color' | 'percent'>>,
  ) => {
    setStops((s) =>
      s.map((row) => (row.id === id ? { ...row, ...patch } : row)),
    )
  }

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    onValidationError(null)
    const label = name.trim()
    if (!label) {
      onValidationError('Name is required')
      return
    }
    const cleanStops: GradientStopInput[] = []
    for (const s of stops) {
      const hex = normalizeHex(s.color)
      if (!hex) {
        onValidationError('Each color must be a hex like #aabbcc')
        return
      }
      const pct = Number(s.percent)
      if (Number.isNaN(pct) || pct < 0 || pct > 100) {
        onValidationError('Each position must be between 0 and 100')
        return
      }
      cleanStops.push({ color: hex, percent: pct })
    }
    const css = buildLinearGradientCss(directionCss, cleanStops)
    await onAdd(label, css)
  }

  return (
    <form
      className="bg-modal-sub__form bg-modal-sub__form--gradient"
      onSubmit={submit}
    >
      <div
        className="bg-modal-sub__gradient-preview"
        style={{ background: gradientCss }}
        aria-hidden
      />
      <label className="bg-modal-sub__label">
        Name
        <input
          className="bg-modal-sub__input"
          placeholder="e.g. My sunset"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoFocus
          disabled={disabled}
        />
      </label>
      <label className="bg-modal-sub__label">
        Direction
        <select
          className="bg-modal-sub__select"
          value={dirMode}
          onChange={(e) => setDirMode(e.target.value)}
          disabled={disabled}
        >
          {DIRECTION_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </label>
      {dirMode === '__angle__' ? (
        <label className="bg-modal-sub__label">
          Angle (degrees)
          <input
            type="number"
            className="bg-modal-sub__input"
            min={0}
            max={360}
            step={1}
            value={angleDeg}
            onChange={(e) => setAngleDeg(Number(e.target.value) || 0)}
            disabled={disabled}
          />
        </label>
      ) : null}
      <div className="bg-modal-sub__stops-head">
        <span className="bg-modal-sub__stops-title">Colors</span>
        <button
          type="button"
          className="bg-modal-sub__add-stop"
          onClick={addStop}
          disabled={disabled || stops.length >= 12}
        >
          + Add color
        </button>
      </div>
      <ul className="bg-modal-sub__stops" role="list">
        {stops.map((row) => (
          <li key={row.id} className="bg-modal-sub__stop-row">
            <input
              type="color"
              className="bg-modal-sub__color-picker"
              value={normalizeHex(row.color) || '#888888'}
              onChange={(e) => updateStop(row.id, { color: e.target.value })}
              disabled={disabled}
              aria-label="Stop color"
            />
            <input
              type="text"
              className="bg-modal-sub__input bg-modal-sub__input--hex-inline"
              value={row.color}
              onChange={(e) => updateStop(row.id, { color: e.target.value })}
              disabled={disabled}
              placeholder="#rrggbb"
              aria-label="Stop hex"
            />
            <input
              type="number"
              className="bg-modal-sub__input bg-modal-sub__input--percent"
              min={0}
              max={100}
              step={0.5}
              value={row.percent}
              onChange={(e) =>
                updateStop(row.id, { percent: Number(e.target.value) })
              }
              disabled={disabled}
              aria-label="Stop position percent"
            />
            <span className="bg-modal-sub__percent-suffix" aria-hidden>
              %
            </span>
            <button
              type="button"
              className="bg-modal-sub__remove-stop"
              onClick={() => removeStop(row.id)}
              disabled={disabled || stops.length <= 2}
              title="Remove stop"
              aria-label="Remove color stop"
            >
              ×
            </button>
          </li>
        ))}
      </ul>
      <p className="bg-modal-sub__hint">
        Add several colors and set each position along the gradient (0%–100%).
        Preview updates as you edit.
      </p>
      <div className="bg-modal-sub__actions">
        <button
          type="button"
          className="bg-modal-sub__btn bg-modal-sub__btn--ghost"
          disabled={disabled}
          onClick={onCancel}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="bg-modal-sub__btn bg-modal-sub__btn--primary"
          disabled={disabled}
        >
          {disabled ? savingLabel : submitLabel}
        </button>
      </div>
    </form>
  )
}
