import type { PlacedShape, ShapeKind } from '../types/bookPage'
import { CanvasOpacityField } from './CanvasOpacityField'

type Props = {
  shape: PlacedShape
  onChange: (next: PlacedShape) => void
  onRemove: () => void
  onClose: () => void
}

export function BookShapePanel({ shape, onChange, onRemove, onClose }: Props) {
  const update = <K extends keyof PlacedShape>(key: K, value: PlacedShape[K]) => {
    onChange({ ...shape, [key]: value })
  }
  const updateNum = <K extends keyof PlacedShape>(
    key: K,
    raw: string,
    min?: number,
    max?: number,
  ) => {
    const parsed = Number(raw)
    if (!Number.isFinite(parsed)) return
    let next = parsed
    if (typeof min === 'number') next = Math.max(min, next)
    if (typeof max === 'number') next = Math.min(max, next)
    update(key, next as PlacedShape[K])
  }
  const rotateBy = (delta: number) => {
    const next = ((((shape.rotationDeg + delta) % 360) + 360) % 360) - 180
    update('rotationDeg', next)
  }

  return (
    <aside className="book-text-flyout" aria-label="Shape editor">
      <div className="book-text-flyout__head">
        <h2 className="book-text-flyout__title">Shape</h2>
        <button
          type="button"
          className="book-text-flyout__close"
          onClick={onClose}
          aria-label="Close shape editor"
        >
          ×
        </button>
      </div>
      <div className="book-text-flyout__scroll">
        <div className="book-text-flyout__field">
          <div className="book-text-flyout__field-head">Shape Type</div>
          <select
            className="book-text-flyout__select"
            value={shape.kind}
            onChange={(e) => update('kind', e.target.value as ShapeKind)}
          >
            <option value="rectangle">Rectangle</option>
            <option value="ellipse">Ellipse</option>
            <option value="triangle">Triangle</option>
            <option value="diamond">Diamond</option>
            <option value="pentagon">Pentagon</option>
            <option value="hexagon">Hexagon</option>
            <option value="star">Star</option>
            <option value="arrowRight">Arrow</option>
            <option value="parallelogram">Parallelogram</option>
            <option value="trapezoid">Trapezoid</option>
          </select>
        </div>

        <div className="book-text-flyout__field">
          <div className="book-text-flyout__field-head">Position & Size</div>
          <div className="book-shape-panel__grid">
            <label className="book-shape-panel__num">
              <span>X</span>
              <input
                className="book-text-flyout__color-hex"
                type="number"
                value={Math.round(shape.x)}
                onChange={(e) => updateNum('x', e.target.value)}
              />
            </label>
            <label className="book-shape-panel__num">
              <span>Y</span>
              <input
                className="book-text-flyout__color-hex"
                type="number"
                value={Math.round(shape.y)}
                onChange={(e) => updateNum('y', e.target.value)}
              />
            </label>
            <label className="book-shape-panel__num">
              <span>Width</span>
              <input
                className="book-text-flyout__color-hex"
                type="number"
                min={36}
                value={Math.round(shape.widthPx)}
                onChange={(e) => updateNum('widthPx', e.target.value, 36)}
              />
            </label>
            <label className="book-shape-panel__num">
              <span>Height</span>
              <input
                className="book-text-flyout__color-hex"
                type="number"
                min={36}
                value={Math.round(shape.heightPx)}
                onChange={(e) => updateNum('heightPx', e.target.value, 36)}
              />
            </label>
          </div>
          <div className="book-text-flyout__seg">
            <button
              type="button"
              className="book-text-flyout__seg-btn"
              onClick={() =>
                onChange({
                  ...shape,
                  widthPx: Math.max(36, shape.widthPx),
                  heightPx: Math.max(36, shape.widthPx),
                })
              }
            >
              Make square
            </button>
            <button
              type="button"
              className="book-text-flyout__seg-btn"
              onClick={() =>
                onChange({
                  ...shape,
                  widthPx: 180,
                  heightPx: 120,
                })
              }
            >
              Reset size
            </button>
          </div>
        </div>

        <div className="book-text-flyout__field">
          <div className="book-text-flyout__field-head">Rotation</div>
          <div className="book-shape-panel__range-row">
            <input
              className="book-text-flyout__range"
              type="range"
              min={-180}
              max={180}
              value={Math.round(shape.rotationDeg)}
              onChange={(e) => update('rotationDeg', Number(e.target.value))}
            />
            <input
              className="book-text-flyout__color-hex book-shape-panel__deg"
              type="number"
              min={-180}
              max={180}
              value={Math.round(shape.rotationDeg)}
              onChange={(e) => updateNum('rotationDeg', e.target.value, -180, 180)}
            />
          </div>
          <div className="book-text-flyout__seg">
            <button
              type="button"
              className="book-text-flyout__seg-btn"
              onClick={() => rotateBy(-15)}
            >
              -15 deg
            </button>
            <button
              type="button"
              className="book-text-flyout__seg-btn"
              onClick={() => update('rotationDeg', 0)}
            >
              Reset
            </button>
            <button
              type="button"
              className="book-text-flyout__seg-btn"
              onClick={() => rotateBy(15)}
            >
              +15 deg
            </button>
          </div>
        </div>
        {shape.kind !== 'image' ? (
          <>
            <div className="book-text-flyout__field book-text-flyout__field--color">
              <div className="book-text-flyout__field-head">Fill Color</div>
              <div className="book-text-flyout__color-row">
                <input
                  className="book-text-flyout__color-swatch"
                  type="color"
                  value={shape.fillColor}
                  onChange={(e) => update('fillColor', e.target.value)}
                />
                <input
                  className="book-text-flyout__color-hex"
                  type="text"
                  value={shape.fillColor}
                  onChange={(e) => update('fillColor', e.target.value)}
                />
              </div>
            </div>
            <div className="book-text-flyout__field book-text-flyout__field--color">
              <div className="book-text-flyout__field-head">Border</div>
              <div className="book-text-flyout__color-row">
                <input
                  className="book-text-flyout__color-swatch"
                  type="color"
                  value={shape.borderColor}
                  onChange={(e) => update('borderColor', e.target.value)}
                />
                <input
                  className="book-text-flyout__color-hex"
                  type="text"
                  value={shape.borderColor}
                  onChange={(e) => update('borderColor', e.target.value)}
                />
              </div>
              <div className="book-shape-panel__range-row">
                <input
                  className="book-text-flyout__range"
                  type="range"
                  min={0}
                  max={16}
                  value={shape.borderWidth}
                  onChange={(e) => update('borderWidth', Number(e.target.value))}
                />
                <span className="book-shape-panel__range-value">
                  {Math.round(shape.borderWidth)}px
                </span>
              </div>
            </div>
          </>
        ) : null}
        <CanvasOpacityField
          value={shape.opacity}
          onChange={(opacity) => onChange({ ...shape, opacity })}
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
