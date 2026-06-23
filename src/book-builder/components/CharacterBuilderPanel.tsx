import { useMemo, useState } from 'react'
import type { CatalogCategory } from '../types/character'
import { CharacterComposite, type SelectionMap } from './CharacterComposite'
import { assetUrl } from '../lib/api'

type Props = {
  catalog: CatalogCategory[]
  selection: SelectionMap
  onSelectionChange: (next: SelectionMap) => void
  onUndo: () => void
  onRedo: () => void
  canUndo: boolean
  canRedo: boolean
}

export function CharacterBuilderPanel({
  catalog,
  selection,
  onSelectionChange,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
}: Props) {
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(
    () => catalog[0]?.id ?? null,
  )

  const activeCategory = useMemo(
    () => catalog.find((c) => c.id === activeCategoryId) ?? null,
    [catalog, activeCategoryId],
  )

  if (catalog.length === 0) {
    return (
      <div className="char-panel char-panel--empty">
        <p>No character categories yet.</p>
        <p className="hint">
          Open the admin portal, add categories, and upload PNG layers for each
          one.
        </p>
      </div>
    )
  }

  return (
    <div className="char-panel">
      <div className="char-panel__actions">
        <button
          type="button"
          className="icon-btn"
          title="Undo"
          onClick={onUndo}
          disabled={!canUndo}
        >
          ↶
        </button>
        <button
          type="button"
          className="icon-btn"
          title="Redo"
          onClick={onRedo}
          disabled={!canRedo}
        >
          ↷
        </button>
      </div>

      <div className="char-panel__body">
        <nav className="char-panel__cats" aria-label="Layer categories">
          {catalog
            .slice()
            .sort((a, b) => a.layerOrder - b.layerOrder)
            .map((c) => (
              <button
                key={c.id}
                type="button"
                className={
                  'char-panel__cat-icon' +
                  (c.id === activeCategoryId ? ' is-active' : '')
                }
                title={c.name}
                onClick={() => setActiveCategoryId(c.id)}
              >
                <span className="char-panel__cat-initial">
                  {c.name.slice(0, 1)}
                </span>
              </button>
            ))}
        </nav>

        <div className="char-panel__grid-wrap">
          {activeCategory && (
            <>
              <h3 className="char-panel__grid-title">{activeCategory.name}</h3>
              <div className="char-panel__grid">
                <button
                  type="button"
                  className={
                    'char-panel__tile' +
                    (!selection[activeCategory.id] ? ' is-selected' : '')
                  }
                  onClick={() =>
                    onSelectionChange({
                      ...selection,
                      [activeCategory.id]: null,
                    })
                  }
                >
                  <span className="char-panel__none">∅</span>
                  <span className="char-panel__tile-label">None</span>
                </button>
                {activeCategory.variations.map((v) => (
                  <button
                    key={v.id}
                    type="button"
                    className={
                      'char-panel__tile' +
                      (selection[activeCategory.id] === v.id
                        ? ' is-selected'
                        : '')
                    }
                    onClick={() =>
                      onSelectionChange({
                        ...selection,
                        [activeCategory.id]: v.id,
                      })
                    }
                  >
                    <img
                      src={assetUrl(v.imagePath)}
                      alt=""
                      className="char-panel__thumb"
                    />
                    <span className="char-panel__tile-label">{v.label}</span>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      <div className="char-panel__preview">
        <div className="char-panel__preview-inner">
          <CharacterComposite
            catalog={catalog}
            selection={selection}
            className="char-panel__preview-composite"
          />
        </div>
      </div>
    </div>
  )
}
