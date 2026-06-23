import { useEffect, useRef, useState, type ChangeEvent } from 'react'
import {
  defaultPageFrameSettings,
  normalizePageFrameSettings,
  type PageBorderStyle,
  type PageFrameSettings,
} from '../types/pageFrame'

export type PageFrameEditScope = 'global' | 'page'

type Props = {
  open: boolean
  onClose: () => void
  value: PageFrameSettings
  onApply: (next: PageFrameSettings) => void
  scope: PageFrameEditScope
  onScopeChange: (s: PageFrameEditScope) => void
  hideScopeTabs?: boolean
  /** When editing this page only, clear override and use book default. */
  onClearPageOverride?: () => void
}

const BORDER_STYLES: PageBorderStyle[] = [
  'none',
  'solid',
  'dashed',
  'dotted',
]

type FrameTab = 'border' | 'padding' | 'spacing'

export function PageFrameSettingsModal({
  open,
  onClose,
  value,
  onApply,
  scope,
  onScopeChange,
  hideScopeTabs = false,
  onClearPageOverride,
}: Props) {
  const [draft, setDraft] = useState<PageFrameSettings>(() =>
    defaultPageFrameSettings(),
  )
  const [initialValue, setInitialValue] = useState<PageFrameSettings>(() =>
    defaultPageFrameSettings(),
  )
  const [tab, setTab] = useState<FrameTab>('border')
  const [lockPadding, setLockPadding] = useState(false)
  const [lockOuterMargin, setLockOuterMargin] = useState(false)
  const wasOpenRef = useRef(false)
  /** Skip one live-apply after hydrating draft from `value` on open (avoids pushing stale draft). */
  const skipNextLiveApplyRef = useRef(false)

  useEffect(() => {
    if (open && !wasOpenRef.current) {
      const normalized = normalizePageFrameSettings(value)
      skipNextLiveApplyRef.current = true
      setDraft(normalized)
      setInitialValue(normalized)
    }
    wasOpenRef.current = open
  }, [open, value, scope])

  useEffect(() => {
    if (!open) return
    if (skipNextLiveApplyRef.current) {
      skipNextLiveApplyRef.current = false
      return
    }
    onApply(normalizePageFrameSettings(draft))
  }, [draft, open, onApply])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        cancelAndRevert()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [initialValue, onApply, onClose, open])

  if (!open) return null

  const setPadding = (
    key:
      | 'paddingTopPx'
      | 'paddingRightPx'
      | 'paddingBottomPx'
      | 'paddingLeftPx',
    v: number,
  ) => {
    setDraft((d) => {
      if (!lockPadding) return normalizePageFrameSettings({ ...d, [key]: v })
      return normalizePageFrameSettings({
        ...d,
        paddingTopPx: v,
        paddingRightPx: v,
        paddingBottomPx: v,
        paddingLeftPx: v,
      })
    })
  }

  const setOuterMargin = (
    key:
      | 'outerMarginTopPx'
      | 'outerMarginRightPx'
      | 'outerMarginBottomPx'
      | 'outerMarginLeftPx',
    v: number,
  ) => {
    setDraft((d) => {
      if (!lockOuterMargin) return normalizePageFrameSettings({ ...d, [key]: v })
      return normalizePageFrameSettings({
        ...d,
        outerMarginTopPx: v,
        outerMarginRightPx: v,
        outerMarginBottomPx: v,
        outerMarginLeftPx: v,
      })
    })
  }

  const keepAndClose = () => {
    onApply(normalizePageFrameSettings(draft))
    onClose()
  }

  const cancelAndRevert = () => {
    onApply(initialValue)
    onClose()
  }

  const reset = () => {
    const n = defaultPageFrameSettings()
    setDraft(n)
    onApply(n)
  }

  const borderVisible = draft.borderStyle !== 'none' && draft.borderWidthPx > 0

  return (
    <div
      className="bg-modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="page-frame-modal-title"
      onClick={cancelAndRevert}
    >
      <div
        className="bg-modal paper-size-modal page-frame-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-modal__head">
          <div>
            <h2 id="page-frame-modal-title" className="bg-modal__title">
              Spacing and Content
            </h2>
          </div>
          <div className="bg-modal__head-actions">
            <button
              type="button"
              className="bg-modal__close"
              aria-label="Close and cancel"
              onClick={cancelAndRevert}
            >
              ×
            </button>
          </div>
        </div>

        <div className="bg-modal__body paper-size-modal__body">
          {!hideScopeTabs ? (
            <div
              className="page-frame-modal__scope"
              role="tablist"
              aria-label="Frame scope"
            >
              <span className="page-frame-modal__scope-label">Scope</span>
              <button
                type="button"
                role="tab"
                aria-selected={scope === 'global'}
                className={
                  'page-frame-modal__scope-btn' +
                  (scope === 'global' ? ' page-frame-modal__scope-btn--active' : '')
                }
                onClick={() => onScopeChange('global')}
              >
                Global
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={scope === 'page'}
                className={
                  'page-frame-modal__scope-btn' +
                  (scope === 'page' ? ' page-frame-modal__scope-btn--active' : '')
                }
                onClick={() => onScopeChange('page')}
              >
                Page-wise
              </button>
            </div>
          ) : null}
          <div
            className="page-frame-modal__tabs"
            role="tablist"
            aria-label="Frame controls"
          >
            {(
              [
                ['border', 'Border'],
                ['padding', 'Padding'],
                ['spacing', 'Spacing'],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={tab === id}
                className={
                  'page-frame-modal__tab' +
                  (tab === id ? ' page-frame-modal__tab--active' : '')
                }
                onClick={() => setTab(id)}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="page-frame-modal__sections">
            {tab === 'border' ? (
              <section className="page-frame-modal__section" aria-label="Border">
                <h3 className="page-frame-modal__section-title">Border</h3>
                <div className="page-frame-modal__grid">
                  <label className="page-frame-modal__field">
                    <span>Style</span>
                    <select
                      className="paper-size-modal__select"
                      value={draft.borderStyle}
                      onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                        setDraft((d) =>
                          normalizePageFrameSettings({
                            ...d,
                            borderStyle: e.target.value as PageBorderStyle,
                          }),
                        )
                      }
                    >
                      {BORDER_STYLES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="page-frame-modal__field">
                    <span>Color</span>
                    <input
                      type="color"
                      value={draft.borderColor}
                      onChange={(e: ChangeEvent<HTMLInputElement>) =>
                        setDraft((d) => ({ ...d, borderColor: e.target.value }))
                      }
                    />
                  </label>
                  <label className="page-frame-modal__field page-frame-modal__field--span">
                    <span>Width: {draft.borderWidthPx}px</span>
                    <input
                      type="range"
                      min={0}
                      max={16}
                      value={draft.borderWidthPx}
                      onChange={(e: ChangeEvent<HTMLInputElement>) =>
                        setDraft((d) =>
                          normalizePageFrameSettings({
                            ...d,
                            borderWidthPx: Number(e.target.value),
                          }),
                        )
                      }
                    />
                  </label>
                </div>
              </section>
            ) : null}

            {tab === 'padding' ? (
              <section className="page-frame-modal__section" aria-label="Padding">
                <div className="page-frame-modal__section-head">
                  <h3 className="page-frame-modal__section-title">Padding</h3>
                  <label className="page-frame-modal__check">
                    <input
                      type="checkbox"
                      checked={lockPadding}
                      onChange={(e) => setLockPadding(e.target.checked)}
                    />
                    Link values
                  </label>
                  <label className="page-frame-modal__check">
                    <input
                      type="checkbox"
                      checked={draft.showPaddingColor}
                      onChange={(e) =>
                        setDraft((d) => ({ ...d, showPaddingColor: e.target.checked }))
                      }
                    />
                    Show padding color
                  </label>
                </div>
                <p className="page-frame-modal__hint">
                  Space inside the page border, before characters and text.
                </p>
                <div className="page-frame-modal__grid">
                  <label className="page-frame-modal__field">
                    <span>Top: {Math.round(draft.paddingTopPx)}px</span>
                    <input
                      type="range"
                      min={0}
                      max={160}
                      value={draft.paddingTopPx}
                      onChange={(e: ChangeEvent<HTMLInputElement>) =>
                        setPadding('paddingTopPx', Number(e.target.value))
                      }
                    />
                  </label>
                  <label className="page-frame-modal__field">
                    <span>Right: {Math.round(draft.paddingRightPx)}px</span>
                    <input
                      type="range"
                      min={0}
                      max={160}
                      value={draft.paddingRightPx}
                      onChange={(e: ChangeEvent<HTMLInputElement>) =>
                        setPadding('paddingRightPx', Number(e.target.value))
                      }
                    />
                  </label>
                  <label className="page-frame-modal__field">
                    <span>Bottom: {Math.round(draft.paddingBottomPx)}px</span>
                    <input
                      type="range"
                      min={0}
                      max={160}
                      value={draft.paddingBottomPx}
                      onChange={(e: ChangeEvent<HTMLInputElement>) =>
                        setPadding('paddingBottomPx', Number(e.target.value))
                      }
                    />
                  </label>
                  <label className="page-frame-modal__field">
                    <span>Left: {Math.round(draft.paddingLeftPx)}px</span>
                    <input
                      type="range"
                      min={0}
                      max={160}
                      value={draft.paddingLeftPx}
                      onChange={(e: ChangeEvent<HTMLInputElement>) =>
                        setPadding('paddingLeftPx', Number(e.target.value))
                      }
                    />
                  </label>
                </div>
              </section>
            ) : null}

            {tab === 'spacing' ? (
              <section className="page-frame-modal__section" aria-label="Spacing">
                <div className="page-frame-modal__section-head">
                  <h3 className="page-frame-modal__section-title">Spacing</h3>
                  <label className="page-frame-modal__check">
                    <input
                      type="checkbox"
                      checked={lockOuterMargin}
                      onChange={(e) => setLockOuterMargin(e.target.checked)}
                    />
                    Link values
                  </label>
                  <label className="page-frame-modal__check">
                    <input
                      type="checkbox"
                      checked={draft.showSpacingColor}
                      onChange={(e) =>
                        setDraft((d) => ({ ...d, showSpacingColor: e.target.checked }))
                      }
                    />
                    Show spacing color
                  </label>
                </div>
                <p className="page-frame-modal__hint">
                  Space between the page edge and the border (inside the canvas).
                </p>
                <div className="page-frame-modal__grid">
                  <label className="page-frame-modal__field">
                    <span>Top: {Math.round(draft.outerMarginTopPx)}px</span>
                    <input
                      type="range"
                      min={0}
                      max={120}
                      value={draft.outerMarginTopPx}
                      onChange={(e: ChangeEvent<HTMLInputElement>) =>
                        setOuterMargin('outerMarginTopPx', Number(e.target.value))
                      }
                    />
                  </label>
                  <label className="page-frame-modal__field">
                    <span>Right: {Math.round(draft.outerMarginRightPx)}px</span>
                    <input
                      type="range"
                      min={0}
                      max={120}
                      value={draft.outerMarginRightPx}
                      onChange={(e: ChangeEvent<HTMLInputElement>) =>
                        setOuterMargin('outerMarginRightPx', Number(e.target.value))
                      }
                    />
                  </label>
                  <label className="page-frame-modal__field">
                    <span>Bottom: {Math.round(draft.outerMarginBottomPx)}px</span>
                    <input
                      type="range"
                      min={0}
                      max={120}
                      value={draft.outerMarginBottomPx}
                      onChange={(e: ChangeEvent<HTMLInputElement>) =>
                        setOuterMargin('outerMarginBottomPx', Number(e.target.value))
                      }
                    />
                  </label>
                  <label className="page-frame-modal__field">
                    <span>Left: {Math.round(draft.outerMarginLeftPx)}px</span>
                    <input
                      type="range"
                      min={0}
                      max={120}
                      value={draft.outerMarginLeftPx}
                      onChange={(e: ChangeEvent<HTMLInputElement>) =>
                        setOuterMargin('outerMarginLeftPx', Number(e.target.value))
                      }
                    />
                  </label>
                </div>
              </section>
            ) : null}
          </div>

          <div className="page-frame-modal__preview-wrap" aria-hidden>
            <p className="page-frame-modal__preview-label">Preview</p>
            <div className="page-frame-modal__preview-canvas">
              <div
                className="page-frame-modal__preview-page"
                style={{
                  borderWidth: draft.borderWidthPx,
                  borderStyle: borderVisible ? draft.borderStyle : 'none',
                  borderColor: draft.borderColor,
                  padding: `${draft.paddingTopPx}px ${draft.paddingRightPx}px ${draft.paddingBottomPx}px ${draft.paddingLeftPx}px`,
                  boxShadow: [
                    draft.showSpacingColor && draft.outerMarginTopPx > 0
                      ? `inset 0 ${draft.outerMarginTopPx}px 0 rgba(239, 68, 68, 0.35)`
                      : '',
                    draft.showSpacingColor && draft.outerMarginBottomPx > 0
                      ? `inset 0 -${draft.outerMarginBottomPx}px 0 rgba(239, 68, 68, 0.35)`
                      : '',
                    draft.showSpacingColor && draft.outerMarginLeftPx > 0
                      ? `inset ${draft.outerMarginLeftPx}px 0 0 rgba(239, 68, 68, 0.35)`
                      : '',
                    draft.outerMarginRightPx > 0
                      && draft.showSpacingColor
                      ? `inset -${draft.outerMarginRightPx}px 0 0 rgba(239, 68, 68, 0.35)`
                      : '',
                    draft.paddingTopPx > 0 && draft.showPaddingColor
                      ? `inset 0 ${draft.outerMarginTopPx + draft.paddingTopPx}px 0 rgba(34, 197, 94, 0.35)`
                      : '',
                    draft.paddingBottomPx > 0 && draft.showPaddingColor
                      ? `inset 0 -${draft.outerMarginBottomPx + draft.paddingBottomPx}px 0 rgba(34, 197, 94, 0.35)`
                      : '',
                    draft.paddingLeftPx > 0 && draft.showPaddingColor
                      ? `inset ${draft.outerMarginLeftPx + draft.paddingLeftPx}px 0 0 rgba(34, 197, 94, 0.35)`
                      : '',
                    draft.paddingRightPx > 0 && draft.showPaddingColor
                      ? `inset -${draft.outerMarginRightPx + draft.paddingRightPx}px 0 0 rgba(34, 197, 94, 0.35)`
                      : '',
                  ]
                    .filter(Boolean)
                    .join(', '),
                  boxSizing: 'border-box',
                }}
              >
                <div className="page-frame-modal__preview-inner">Content area</div>
              </div>
            </div>
          </div>

          <div className="paper-size-modal__actions page-frame-modal__actions">
            <button
              type="button"
              className="paper-size-modal__btn paper-size-modal__btn--ghost"
              onClick={reset}
            >
              Reset defaults
            </button>
            {scope === 'page' && onClearPageOverride ? (
              <button
                type="button"
                className="paper-size-modal__btn paper-size-modal__btn--ghost"
                onClick={() => {
                  onClearPageOverride()
                  onClose()
                }}
              >
                Use book default
              </button>
            ) : null}
            <div style={{ flex: 1 }} />
            <button
              type="button"
              className="paper-size-modal__btn paper-size-modal__btn--ghost"
              onClick={cancelAndRevert}
            >
              Cancel
            </button>
            <button
              type="button"
              className="paper-size-modal__btn paper-size-modal__btn--primary"
              onClick={keepAndClose}
            >
              Apply
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
