import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { apiUrl, assetUrl, builderFetch } from '../lib/api'
import { useBuilderPaths } from '../lib/builderPaths'
import type { ShapeKind } from '../types/bookPage'

type UploadedShape = { _id: string; imagePath: string; label: string }
type BuiltInShape = { id: ShapeKind; label: string }

const BUILT_IN_SHAPES: BuiltInShape[] = [
  { id: 'rectangle', label: 'Rectangle' },
  { id: 'ellipse', label: 'Ellipse' },
  { id: 'triangle', label: 'Triangle' },
  { id: 'diamond', label: 'Diamond' },
  { id: 'pentagon', label: 'Pentagon' },
  { id: 'hexagon', label: 'Hexagon' },
  { id: 'octagon', label: 'Octagon' },
  { id: 'star', label: 'Star' },
  { id: 'heart', label: 'Heart' },
  { id: 'chevronRight', label: 'Chevron' },
  { id: 'arrowRight', label: 'Arrow' },
  { id: 'parallelogram', label: 'Parallelogram' },
  { id: 'trapezoid', label: 'Trapezoid' },
]

type Props = {
  open: boolean
  onClose: () => void
  onSelectBuiltIn: (kind: ShapeKind) => void
  onSelectUploaded: (imageUrl: string) => void
}

export function ShapePickerModal({
  open,
  onClose,
  onSelectBuiltIn,
  onSelectUploaded,
}: Props) {
  const { fetchInit } = useBuilderPaths()
  const [uploaded, setUploaded] = useState<UploadedShape[]>([])

  useEffect(() => {
    if (!open) return
    void (async () => {
      const res = await builderFetch(apiUrl('/api/shapes'), fetchInit)
      if (!res.ok) return
      const rows = (await res.json()) as UploadedShape[]
      setUploaded(Array.isArray(rows) ? rows : [])
    })()
  }, [open])

  if (!open) return null
  const portalHost = document.getElementById('portal-modal') ?? document.body

  return createPortal(
    <div
      className="builder-modal-overlay builder-modal-overlay--root-portal"
      onClick={onClose}
    >
      <div className="builder-modal paper-size-modal" onClick={(e) => e.stopPropagation()}>
        <div className="builder-modal__head">
          <div>
            <h2 className="builder-modal__title">Shapes</h2>
            <p className="builder-modal__sub">
              Pick from basic shapes or custom uploaded shape images.
            </p>
          </div>
          <button type="button" className="builder-modal__close" onClick={onClose}>
            ×
          </button>
        </div>
        <div className="paper-size-modal__body">
          <p className="paper-size-modal__hint">Basic shapes</p>
          <div className="text-bubble-modal__grid">
            {BUILT_IN_SHAPES.map((s) => (
              <button
                key={s.id}
                type="button"
                className="text-bubble-modal__tile"
                onClick={() => {
                  onSelectBuiltIn(s.id)
                  onClose()
                }}
              >
                <div
                  className={`book-page__shape book-page__shape--${s.id}`}
                  style={{
                    width: 86,
                    height: 64,
                    background: '#000000',
                    borderColor: '#1f2937',
                    borderWidth: 2,
                    margin: '0 auto',
                  }}
                />
                <span>{s.label}</span>
              </button>
            ))}
          </div>
          <p className="paper-size-modal__hint">Custom shapes</p>
          <div className="text-bubble-modal__grid">
            {uploaded.map((s) => (
              <button
                key={s._id}
                type="button"
                className="text-bubble-modal__tile"
                onClick={() => {
                  onSelectUploaded(s.imagePath)
                  onClose()
                }}
              >
                <img src={assetUrl(s.imagePath)} alt="" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>,
    portalHost,
  )
}
