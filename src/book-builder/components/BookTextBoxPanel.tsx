import type { ChangeEvent } from 'react'
import type { GlobalFont } from '../types/globalFont'
import {
  TEXT_BOX_PAGE_PLACEMENT_LABELS,
  TEXT_BOX_PAGE_PLACEMENT_ORDER,
} from '../lib/textBoxPagePlacement'
import type {
  PlacedTextBox,
  TextBoxPagePlacement,
  TextBoxTextAlign,
  TextBoxTextTransform,
  TextBoxVerticalAlign,
} from '../types/bookPage'

type Props = {
  fonts: GlobalFont[]
  textBox: PlacedTextBox
  onChange: (next: PlacedTextBox) => void
  onRemove: () => void
  onClose: () => void
}

const TEXT_BOX_MIN_W = 48
const TEXT_BOX_MIN_H = 36
const TEXT_BOX_MAX_W = 640
const TEXT_BOX_MAX_H = 640

function IcoType({ active }: { active?: boolean }) {
  return (
    <svg
      width={18}
      height={18}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      aria-hidden
      className={active ? 'book-text-flyout__ico--on' : undefined}
    >
      <path d="M4 7V5h16v2M9 20h6M12 5v15" />
    </svg>
  )
}

function IcoSize() {
  return (
    <svg
      width={18}
      height={18}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      aria-hidden
    >
      <path d="M12 4v16M8 8l4-4 4 4M8 16l4 4 4-4" />
    </svg>
  )
}

function IcoPalette() {
  return (
    <svg
      width={18}
      height={18}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      aria-hidden
    >
      <path d="M12 3a7 7 0 1 0 7 7v-2a2 2 0 0 0-2-2h-1.5" />
      <circle cx="6.5" cy="11.5" r="1.5" fill="currentColor" stroke="none" />
      <circle cx="9.5" cy="7.5" r="1.5" fill="currentColor" stroke="none" />
      <circle cx="14.5" cy="7.5" r="1.5" fill="currentColor" stroke="none" />
      <circle cx="17.5" cy="11.5" r="1.5" fill="currentColor" stroke="none" />
    </svg>
  )
}

function IcoAlign(a: TextBoxTextAlign) {
  const d =
    a === 'left'
      ? 'M5 7h14M5 12h10M5 17h14'
      : a === 'center'
        ? 'M5 7h14M6 12h12M5 17h14'
        : a === 'right'
          ? 'M5 7h14M9 12h10M5 17h14'
          : 'M5 7h14M5 12h14M5 17h14'
  return (
    <svg
      width={18}
      height={18}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      aria-hidden
    >
      <path d={d} />
    </svg>
  )
}

function IcoValign(v: TextBoxVerticalAlign) {
  const y1 = v === 'top' ? 5 : v === 'middle' ? 9 : 13
  const y2 = y1 + 4
  const y3 = y1 + 8
  return (
    <svg
      width={18}
      height={18}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      aria-hidden
    >
      <path d={`M5 ${y1}h14M5 ${y2}h10M5 ${y3}h14`} />
    </svg>
  )
}

function IcoLineHeight() {
  return (
    <svg
      width={18}
      height={18}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      aria-hidden
    >
      <path d="M5 6h14M5 12h14M5 18h14M8 9l-2 3 2 3M16 9l2 3-2 3" />
    </svg>
  )
}

function IcoLetterSpace() {
  return (
    <svg
      width={18}
      height={18}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      aria-hidden
    >
      <path d="M8 7v10M16 7v10M5 12h2M17 12h2" />
    </svg>
  )
}

function IcoItalic() {
  return (
    <svg
      width={18}
      height={18}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      aria-hidden
    >
      <path d="M10 5h7M8 19h7M14 5 9 19" />
    </svg>
  )
}

function IcoUnderline() {
  return (
    <svg
      width={18}
      height={18}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      aria-hidden
    >
      <path d="M6 4v8a4 4 0 0 0 8 0V4M5 21h14" />
    </svg>
  )
}

function IcoCase(t: TextBoxTextTransform) {
  if (t === 'uppercase')
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
        <path d="M7 18 10 6h1l3 12M8.5 13h4" />
        <path d="M15 10v8M15 10h2a2 2 0 0 1 0 4h-2" />
      </svg>
    )
  if (t === 'capitalize')
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
        <path d="M6 18V6h4a3 3 0 0 1 0 6H6M14 12h6M14 8v8" />
      </svg>
    )
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
      <path d="M6 18V6l4 12h1L15 6v12" />
    </svg>
  )
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

const FONT_WEIGHT_OPTIONS: { value: number; label: string }[] = [
  { value: 100, label: '100 — Thin' },
  { value: 200, label: '200 — Extra light' },
  { value: 300, label: '300 — Light' },
  { value: 400, label: '400 — Regular' },
  { value: 500, label: '500 — Medium' },
  { value: 600, label: '600 — Semi bold' },
  { value: 700, label: '700 — Bold' },
  { value: 800, label: '800 — Extra bold' },
  { value: 900, label: '900 — Black' },
]

const H_ALIGN_META: { key: TextBoxTextAlign; label: string }[] = [
  { key: 'left', label: 'Left' },
  { key: 'center', label: 'Center' },
  { key: 'right', label: 'Right' },
  { key: 'justify', label: 'Justify' },
]

const V_ALIGN_META: { key: TextBoxVerticalAlign; label: string }[] = [
  { key: 'top', label: 'Top' },
  { key: 'middle', label: 'Middle' },
  { key: 'bottom', label: 'Bottom' },
]

export function BookTextBoxPanel({
  fonts,
  textBox,
  onChange,
  onRemove,
  onClose,
}: Props) {
  const selectFontId = fonts.some((f) => f.id === textBox.globalFontId)
    ? textBox.globalFontId
    : (fonts[0]?.id ?? '')
  const selectedFont = fonts.find((f) => f.id === selectFontId) ?? null

  const fitToContent = () => {
    const rawText = textBox.text.replace(/\r\n/g, '\n')
    const lines = rawText.length > 0 ? rawText.split('\n') : ['']
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const cssFontStyle = textBox.fontStyle === 'italic' ? 'italic ' : ''
    const fontFamily = selectedFont?.fontFamily?.trim() || 'sans-serif'
    const fontSpec = `${cssFontStyle}${textBox.fontWeight} ${textBox.fontSizePx}px ${fontFamily}`
    let widest = 0
    if (ctx) {
      ctx.font = fontSpec
      for (const line of lines) {
        const content = line.length > 0 ? line : ' '
        const m = ctx.measureText(content).width
        const spacing = Math.max(0, content.length - 1) * textBox.letterSpacingPx
        widest = Math.max(widest, m + spacing)
      }
    } else {
      widest = Math.max(...lines.map((line) => line.length * textBox.fontSizePx * 0.6))
    }
    const horizontalPad = 22
    const verticalPad = 18
    const width = Math.round(
      Math.min(TEXT_BOX_MAX_W, Math.max(TEXT_BOX_MIN_W, widest + horizontalPad)),
    )
    const lineHeightPx = textBox.fontSizePx * textBox.lineHeight
    const height = Math.round(
      Math.min(
        TEXT_BOX_MAX_H,
        Math.max(TEXT_BOX_MIN_H, lines.length * lineHeightPx + verticalPad),
      ),
    )
    onChange({
      ...textBox,
      widthPx: width,
      heightPx: height,
    })
  }

  return (
    <aside className="book-text-flyout" aria-label="Text box editor">
      <div className="book-text-flyout__head">
        <h2 className="book-text-flyout__title">Text box</h2>
        <button
          type="button"
          className="book-text-flyout__close"
          onClick={onClose}
          aria-label="Close text editor"
        >
          ×
        </button>
      </div>

      <div className="book-text-flyout__scroll">
        <p className="book-text-flyout__hint book-text-flyout__hint--compact">
          Font family comes from <strong>Admin → Global fonts</strong>. Size,
          weight, color, and alignment below override admin “extra CSS”. Resize on
          the page with the corner handle.
        </p>

        {fonts.length === 0 ? (
          <p className="book-text-flyout__warn">
            No global fonts yet. Add one in admin, then refresh.
          </p>
        ) : (
          <>
            <label className="book-text-flyout__field">
              <span className="book-text-flyout__field-head">
                <IcoType />
                Font family
              </span>
              <select
                className="book-toc-editor__style-select"
                value={selectFontId}
                onChange={(e: ChangeEvent<HTMLSelectElement>) => {
                  onChange({ ...textBox, globalFontId: e.target.value })
                }}
                aria-label="Global font"
              >
                {fonts.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="book-text-flyout__field">
              <span className="book-text-flyout__field-head">
                Place on page
              </span>
              <select
                className="book-toc-editor__style-select"
                value={textBox.pagePlacement}
                onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                  onChange({
                    ...textBox,
                    pagePlacement: e.target.value as TextBoxPagePlacement,
                  })
                }
                aria-label="Position relative to page margins"
              >
                {TEXT_BOX_PAGE_PLACEMENT_ORDER.map((key) => (
                  <option key={key} value={key}>
                    {TEXT_BOX_PAGE_PLACEMENT_LABELS[key]}
                  </option>
                ))}
              </select>
            </label>
            <p className="book-text-flyout__hint book-text-flyout__hint--compact">
              Uses the margin-safe area from the sidebar <strong>Spacing and Content</strong>{' '}
              control. Dragging the box switches placement to{' '}
              <strong>Free (drag)</strong>.
            </p>
            <div className="book-text-flyout__field">
              <span className="book-text-flyout__field-head">Box tools</span>
              <div className="book-text-flyout__seg">
                <button
                  type="button"
                  className="book-text-flyout__seg-btn"
                  onClick={fitToContent}
                >
                  Fit to content
                </button>
                <button
                  type="button"
                  className="book-text-flyout__seg-btn"
                  onClick={() =>
                    onChange({
                      ...textBox,
                      widthPx: 200,
                      heightPx: 132,
                    })
                  }
                >
                  Reset box size
                </button>
              </div>
            </div>

            <label className="book-text-flyout__field">
              <span className="book-text-flyout__field-head">
                <IcoSize />
                Size ({textBox.fontSizePx}px)
              </span>
              <input
                type="range"
                className="book-text-flyout__range"
                min={8}
                max={200}
                value={textBox.fontSizePx}
                onChange={(e) =>
                  onChange({
                    ...textBox,
                    fontSizePx: Number(e.target.value),
                  })
                }
                aria-label="Font size in pixels"
              />
            </label>

            <label className="book-text-flyout__field">
              <span className="book-text-flyout__field-head">
                <IcoType active />
                Weight
              </span>
              <select
                className="book-toc-editor__style-select"
                value={String(textBox.fontWeight)}
                onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                  onChange({
                    ...textBox,
                    fontWeight: Number(e.target.value),
                  })
                }
                aria-label="Font weight"
              >
                {FONT_WEIGHT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="book-text-flyout__field book-text-flyout__field--color">
              <span className="book-text-flyout__field-head">
                <IcoPalette />
                Color
              </span>
              <div className="book-text-flyout__color-row">
                <input
                  type="color"
                  className="book-text-flyout__color-swatch"
                  value={
                    /^#[0-9a-fA-F]{6}$/.test(textBox.color)
                      ? textBox.color
                      : '#1e293b'
                  }
                  onChange={(e) =>
                    onChange({ ...textBox, color: e.target.value })
                  }
                  aria-label="Text color"
                />
                <input
                  type="text"
                  className="book-text-flyout__color-hex"
                  value={textBox.color}
                  onChange={(e) =>
                    onChange({ ...textBox, color: e.target.value })
                  }
                  spellCheck={false}
                  aria-label="Color as hex or CSS"
                />
              </div>
            </label>

            <div className="book-text-flyout__field">
              <span className="book-text-flyout__field-head">
                Horizontal alignment
              </span>
              <div
                className="book-text-flyout__icon-row book-text-flyout__icon-row--labeled"
                role="group"
                aria-label="Horizontal text alignment"
              >
                {H_ALIGN_META.map(({ key: a, label }) => (
                  <button
                    key={a}
                    type="button"
                    className={
                      'book-text-flyout__icon-btn book-text-flyout__icon-btn--stacked' +
                      (textBox.textAlign === a
                        ? ' book-text-flyout__icon-btn--active'
                        : '')
                    }
                    title={label}
                    aria-label={label}
                    aria-pressed={textBox.textAlign === a}
                    onClick={() => onChange({ ...textBox, textAlign: a })}
                  >
                    {IcoAlign(a)}
                    <span className="book-text-flyout__icon-btn__cap">
                      {label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="book-text-flyout__field">
              <span className="book-text-flyout__field-head">
                Vertical alignment
              </span>
              <p className="book-text-flyout__field-sub">
                Inside the text box height
              </p>
              <div
                className="book-text-flyout__icon-row book-text-flyout__icon-row--labeled"
                role="group"
                aria-label="Vertical text alignment"
              >
                {V_ALIGN_META.map(({ key: v, label }) => (
                  <button
                    key={v}
                    type="button"
                    className={
                      'book-text-flyout__icon-btn book-text-flyout__icon-btn--stacked' +
                      (textBox.verticalAlign === v
                        ? ' book-text-flyout__icon-btn--active'
                        : '')
                    }
                    title={label}
                    aria-label={label}
                    aria-pressed={textBox.verticalAlign === v}
                    onClick={() => onChange({ ...textBox, verticalAlign: v })}
                  >
                    {IcoValign(v)}
                    <span className="book-text-flyout__icon-btn__cap">
                      {label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <label className="book-text-flyout__field">
              <span className="book-text-flyout__field-head">
                <IcoLineHeight />
                Line height ({textBox.lineHeight.toFixed(2)})
              </span>
              <input
                type="range"
                className="book-text-flyout__range"
                min={100}
                max={250}
                value={Math.round(textBox.lineHeight * 100)}
                onChange={(e) =>
                  onChange({
                    ...textBox,
                    lineHeight: Number(e.target.value) / 100,
                  })
                }
                aria-label="Line height"
              />
            </label>

            <label className="book-text-flyout__field">
              <span className="book-text-flyout__field-head">
                <IcoLetterSpace />
                Letter spacing ({textBox.letterSpacingPx}px)
              </span>
              <input
                type="range"
                className="book-text-flyout__range"
                min={-2}
                max={10}
                step={0.5}
                value={textBox.letterSpacingPx}
                onChange={(e) =>
                  onChange({
                    ...textBox,
                    letterSpacingPx: Number(e.target.value),
                  })
                }
                aria-label="Letter spacing in pixels"
              />
            </label>

            <div className="book-text-flyout__field">
              <span className="book-text-flyout__field-head">Style</span>
              <div
                className="book-text-flyout__icon-row"
                role="group"
                aria-label="Text style"
              >
                <button
                  type="button"
                  className={
                    'book-text-flyout__icon-btn' +
                    (textBox.fontStyle === 'italic'
                      ? ' book-text-flyout__icon-btn--active'
                      : '')
                  }
                  title="Italic"
                  aria-pressed={textBox.fontStyle === 'italic'}
                  onClick={() =>
                    onChange({
                      ...textBox,
                      fontStyle:
                        textBox.fontStyle === 'italic' ? 'normal' : 'italic',
                    })
                  }
                >
                  <IcoItalic />
                </button>
                <button
                  type="button"
                  className={
                    'book-text-flyout__icon-btn' +
                    (textBox.textDecoration === 'underline'
                      ? ' book-text-flyout__icon-btn--active'
                      : '')
                  }
                  title="Underline"
                  aria-pressed={textBox.textDecoration === 'underline'}
                  onClick={() =>
                    onChange({
                      ...textBox,
                      textDecoration:
                        textBox.textDecoration === 'underline'
                          ? 'none'
                          : 'underline',
                    })
                  }
                >
                  <IcoUnderline />
                </button>
              </div>
            </div>

            <div className="book-text-flyout__field">
              <span className="book-text-flyout__field-head">Transform</span>
              <div
                className="book-text-flyout__icon-row"
                role="group"
                aria-label="Text transform"
              >
                {(
                  ['none', 'uppercase', 'capitalize'] as TextBoxTextTransform[]
                ).map((t) => (
                  <button
                    key={t}
                    type="button"
                    className={
                      'book-text-flyout__icon-btn' +
                      (textBox.textTransform === t
                        ? ' book-text-flyout__icon-btn--active'
                        : '')
                    }
                    title={t === 'none' ? 'As typed' : t}
                    aria-pressed={textBox.textTransform === t}
                    onClick={() => onChange({ ...textBox, textTransform: t })}
                  >
                    {IcoCase(t)}
                  </button>
                ))}
              </div>
            </div>

            <label className="book-text-flyout__field">
              <span className="book-text-flyout__field-head">
                <IcoOpacity />
                Opacity ({Math.round(textBox.opacity * 100)}%)
              </span>
              <input
                type="range"
                className="book-text-flyout__range"
                min={25}
                max={100}
                value={Math.round(textBox.opacity * 100)}
                onChange={(e) =>
                  onChange({
                    ...textBox,
                    opacity: Number(e.target.value) / 100,
                  })
                }
                aria-label="Opacity percent"
              />
            </label>

            <label className="book-text-flyout__textarea-label">
              <span>Content</span>
              <textarea
                className="book-text-flyout__textarea"
                rows={6}
                value={textBox.text}
                onChange={(e) =>
                  onChange({
                    ...textBox,
                    text: e.target.value.replace(/\r\n/g, '\n'),
                  })
                }
                placeholder="Type here…"
                aria-label="Text box content"
              />
            </label>
          </>
        )}
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
