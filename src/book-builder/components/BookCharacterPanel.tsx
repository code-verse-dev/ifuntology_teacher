import type { PlacedCharacter } from '../types/bookPage'
import { CanvasOpacityField } from './CanvasOpacityField'

type Props = {
  character: PlacedCharacter
  onChange: (next: PlacedCharacter) => void
  onRemove: () => void
  onClose: () => void
}

export function BookCharacterPanel({
  character,
  onChange,
  onRemove,
  onClose,
}: Props) {
  return (
    <aside className="book-text-flyout" aria-label="Character editor">
      <div className="book-text-flyout__head">
        <h2 className="book-text-flyout__title">Character</h2>
        <button
          type="button"
          className="book-text-flyout__close"
          onClick={onClose}
          aria-label="Close character editor"
        >
          ×
        </button>
      </div>

      <div className="book-text-flyout__scroll">
        <p className="book-text-flyout__hint book-text-flyout__hint--compact">
          Drag the character on the page to move it. Use the corner handle to resize
          and the rotate handle to turn it.
        </p>
        <CanvasOpacityField
          value={character.opacity}
          onChange={(opacity) => onChange({ ...character, opacity })}
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
