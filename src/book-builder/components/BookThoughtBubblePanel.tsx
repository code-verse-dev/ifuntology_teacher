import type { PlacedThoughtBubble } from '../types/bookPage'
import { CanvasOpacityField } from './CanvasOpacityField'

type Props = {
  bubble: PlacedThoughtBubble
  onChange: (next: PlacedThoughtBubble) => void
  onRemove: () => void
  onClose: () => void
}

export function BookThoughtBubblePanel({
  bubble,
  onChange,
  onRemove,
  onClose,
}: Props) {
  return (
    <aside className="book-text-flyout" aria-label="Thought bubble editor">
      <div className="book-text-flyout__head">
        <h2 className="book-text-flyout__title">Thought bubble</h2>
        <button
          type="button"
          className="book-text-flyout__close"
          onClick={onClose}
          aria-label="Close thought bubble editor"
        >
          ×
        </button>
      </div>

      <div className="book-text-flyout__scroll">
        <p className="book-text-flyout__hint book-text-flyout__hint--compact">
          Drag the bubble on the page to move it. Use the corner handle to resize.
        </p>
        <CanvasOpacityField
          value={bubble.opacity}
          onChange={(opacity) => onChange({ ...bubble, opacity })}
        />
      </div>

      <div className="book-text-flyout__footer">
        <button
          type="button"
          className="book-text-flyout__btn-remove"
          onClick={onRemove}
        >
          Remove from page
        </button>
      </div>
    </aside>
  )
}
