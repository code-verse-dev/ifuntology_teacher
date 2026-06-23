import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { apiUrl, assetUrl, builderFetch } from '../lib/api'
import { useBuilderPaths } from '../lib/builderPaths'

export type ThoughtBubbleCatalogItem = {
  id: string
  label: string
  value: string
}

type Props = {
  open: boolean
  onClose: () => void
  onSelect: (imageUrl: string) => void
}

export function TextBubblePickerModal({ open, onClose, onSelect }: Props) {
  const { fetchInit } = useBuilderPaths()
  const [items, setItems] = useState<ThoughtBubbleCatalogItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    setLoading(true)
    setError(null)
    void (async () => {
      try {
        const res = await builderFetch(apiUrl('/api/thought-bubbles'), fetchInit)
        if (!res.ok) throw new Error(await res.text())
        const rows = (await res.json()) as ThoughtBubbleCatalogItem[]
        setItems(Array.isArray(rows) ? rows : [])
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load bubbles')
      } finally {
        setLoading(false)
      }
    })()
  }, [open])

  if (!open) return null

  const portalHost =
    document.getElementById('portal-modal') ?? document.body

  return createPortal(
    <div
      className="builder-modal-overlay builder-modal-overlay--root-portal"
      onClick={onClose}
    >
      <div
        className="builder-modal paper-size-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="builder-modal__head">
          <div>
            <h2 className="builder-modal__title">Thought bubbles</h2>
            <p className="builder-modal__sub">
              Place a bubble image on the page (not page background). Drag to move;
              use the text tool if you want a text box.
            </p>
          </div>
          <div className="builder-modal__head-actions">
            <button type="button" className="builder-modal__close" onClick={onClose}>
              ×
            </button>
          </div>
        </div>
        <div className="paper-size-modal__body">
          {loading ? <p className="paper-size-modal__hint">Loading…</p> : null}
          {error ? <p className="paper-size-modal__hint">{error}</p> : null}
          {!loading && !error && items.length === 0 ? (
            <p className="paper-size-modal__hint">
              No thought bubbles in the library yet. Upload images in Admin &rarr;
              Thought bubbles, then refresh this dialog.
            </p>
          ) : null}
          <div className="text-bubble-modal__grid">
            {items.map((item) => (
              <button
                key={item.id}
                type="button"
                className="text-bubble-modal__tile"
                onClick={() => {
                  onSelect(item.value)
                  onClose()
                }}
              >
                <img src={assetUrl(item.value)} alt="Thought bubble" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>,
    portalHost,
  )
}
