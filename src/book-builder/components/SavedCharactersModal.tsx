import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { Link } from 'react-router-dom'
import { useBuilderPaths } from '../lib/builderPaths'
import { CharacterComposite } from './CharacterComposite'
import {
  deleteSavedCharacter,
  listSavedCharacters,
  type SavedCharacterDesign,
} from '../lib/savedCharacters'
import type { CatalogCategory } from '../types/character'

type Props = {
  open: boolean
  onClose: () => void
  catalog: CatalogCategory[]
  onPlace: (payload: {
    selection: Record<string, string | null>
    layerOrder: string[]
    layerVisibility: Record<string, boolean>
  }) => void
}

function formatSavedWhen(ts: number): string {
  try {
    return new Date(ts).toLocaleString(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    })
  } catch {
    return ''
  }
}

export function SavedCharactersModal({
  open,
  onClose,
  catalog,
  onPlace,
}: Props) {
  const { characterComposerUrl } = useBuilderPaths()
  const [items, setItems] = useState<SavedCharacterDesign[]>([])

  useEffect(() => {
    if (!open) return
    setItems(listSavedCharacters())
  }, [open])

  if (!open) return null

  const host = document.getElementById('portal-modal') ?? document.body

  const refresh = () => setItems(listSavedCharacters())

  return createPortal(
    <div
      className="builder-modal-overlay builder-modal-overlay--root-portal"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="builder-modal paper-size-modal saved-char-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="saved-char-modal-title"
      >
        <div className="builder-modal__head">
          <div>
            <h2 className="builder-modal__title" id="saved-char-modal-title">
              Characters
            </h2>
            <p className="builder-modal__sub">
              Saved designs from Character Builder. Click any character card to place
              it on the current page.
            </p>
          </div>
          <button type="button" className="builder-modal__close" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="paper-size-modal__body saved-char-modal__body">
          {catalog.length === 0 ? (
            <p className="paper-size-modal__hint">
              Character catalog is not loaded. Check your connection or admin catalog,
              then try again.
            </p>
          ) : null}

          {items.length === 0 ? (
            <p className="saved-char-modal__empty">
              No saved characters yet. Open Character Builder, design a character, and
              click Save.
            </p>
          ) : (
            <ul className="saved-char-modal__grid">
              {items.map((it) => (
                <li key={it.id} className="saved-char-modal__card">
                  <button
                    type="button"
                    className="saved-char-modal__pick-btn"
                    disabled={catalog.length === 0}
                    onClick={() => {
                      onPlace({
                        selection: it.selection,
                        layerOrder: it.layerOrder ?? [],
                        layerVisibility: it.layerVisibility ?? {},
                      })
                      onClose()
                    }}
                  >
                    <div className="saved-char-modal__preview" aria-hidden>
                      <CharacterComposite
                        catalog={catalog}
                        selection={it.selection}
                        layerOrder={it.layerOrder}
                        layerVisibility={it.layerVisibility}
                        className="saved-char-modal__composite"
                      />
                    </div>
                    <div className="saved-char-modal__meta">
                      <strong className="saved-char-modal__name">{it.name}</strong>
                      <span className="saved-char-modal__when">
                        {formatSavedWhen(it.createdAt)}
                      </span>
                    </div>
                  </button>
                  <div className="saved-char-modal__card-actions">
                    <Link
                      to={characterComposerUrl(it.id)}
                      className="saved-char-modal__btn saved-char-modal__btn--ghost saved-char-modal__btn--icon"
                      aria-label={`Edit ${it.name}`}
                      title={`Edit ${it.name}`}
                      onClick={onClose}
                    >
                      ✎
                    </Link>
                    <button
                      type="button"
                      className="saved-char-modal__btn saved-char-modal__btn--danger saved-char-modal__btn--icon"
                      aria-label={`Delete ${it.name}`}
                      title={`Delete ${it.name}`}
                      onClick={() => {
                        deleteSavedCharacter(it.id)
                        refresh()
                      }}
                    >
                      🗑
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="saved-char-modal__footer">
          <Link
            to={characterComposerUrl()}
            className="saved-char-modal__create-link"
            onClick={onClose}
          >
            Create new character
          </Link>
        </div>
      </div>
    </div>,
    host,
  )
}
