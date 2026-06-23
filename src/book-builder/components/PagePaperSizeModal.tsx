import { useEffect, useState, type ChangeEvent } from 'react'
import {
  dimensionsForPaper,
  paperPresetOptions,
  paperSelectValue,
  paperSizeSummary,
  paperSurfaceAspectStyle,
} from '../lib/paperSize'
import {
  normalizePageFrameSettings,
  type PageBorderStyle,
  type PageFrameSettings,
} from '../types/pageFrame'
import type { BookPaperSize } from '../types/paperSize'

type Props = {
  open: boolean
  onClose: () => void
  paperSize: BookPaperSize
  frameSettings: PageFrameSettings
  scopeMode?: 'global' | 'page'
  canEditPageScope?: boolean
  scopePageLabel?: string
  onScopeModeChange?: (mode: 'global' | 'page') => void
  initialTab?: PageSettingsTab
  onApply: (next: BookPaperSize, nextFrame: PageFrameSettings) => void
}

export type PageSettingsTab = 'size' | 'border' | 'padding' | 'spacing'

const BORDER_STYLES: PageBorderStyle[] = ['none', 'solid', 'dashed', 'dotted']

export function PagePaperSizeModal({
  open,
  onClose,
  paperSize,
  frameSettings,
  scopeMode = 'global',
  canEditPageScope = false,
  scopePageLabel,
  onScopeModeChange,
  initialTab = 'size',
  onApply,
}: Props) {
  const [draft, setDraft] = useState<BookPaperSize>(paperSize)
  const [frameDraft, setFrameDraft] = useState<PageFrameSettings>(
    normalizePageFrameSettings(frameSettings),
  )
  const [tab, setTab] = useState<PageSettingsTab>('size')
  const [lockPadding, setLockPadding] = useState(false)
  const [lockSpacing, setLockSpacing] = useState(false)
  const presets = paperPresetOptions()
  const quickPresets = presets.filter((o) => o.value !== 'custom').slice(0, 6)

  useEffect(() => {
    if (!open) return
    setDraft(paperSize)
    setFrameDraft(normalizePageFrameSettings(frameSettings))
    setTab(initialTab)
  }, [open, paperSize, frameSettings, initialTab])

  useEffect(() => {
    if (!open) return
    if (scopeMode === 'page' && tab === 'size') {
      setTab('border')
    }
  }, [open, scopeMode, tab])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  const onPresetChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const v = e.target.value
    if (v === 'custom') {
      const d = dimensionsForPaper(draft)
      setDraft({
        kind: 'custom',
        widthMm: d.widthMm,
        heightMm: d.heightMm,
      })
      return
    }
    setDraft({ kind: 'preset', presetId: v })
  }

  const dims = dimensionsForPaper(draft)
  const aspect = paperSurfaceAspectStyle(draft)
  const presetName =
    draft.kind === 'preset'
      ? (paperPresetOptions().find((o) => o.value === draft.presetId)?.label ??
        draft.presetId)
      : 'Custom trim'

  const apply = () => {
    onApply(draft, normalizePageFrameSettings(frameDraft))
    onClose()
  }

  const setPadding = (
    key:
      | 'paddingTopPx'
      | 'paddingRightPx'
      | 'paddingBottomPx'
      | 'paddingLeftPx',
    v: number,
  ) => {
    setFrameDraft((d) => {
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

  const setSpacing = (
    key:
      | 'outerMarginTopPx'
      | 'outerMarginRightPx'
      | 'outerMarginBottomPx'
      | 'outerMarginLeftPx',
    v: number,
  ) => {
    setFrameDraft((d) => {
      if (!lockSpacing) return normalizePageFrameSettings({ ...d, [key]: v })
      return normalizePageFrameSettings({
        ...d,
        outerMarginTopPx: v,
        outerMarginRightPx: v,
        outerMarginBottomPx: v,
        outerMarginLeftPx: v,
      })
    })
  }

  return (
    <div
      className="bg-modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="paper-size-modal-title"
      onClick={onClose}
    >
      <div
        className="bg-modal paper-size-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-modal__head">
          <div>
            <h2 id="paper-size-modal-title" className="bg-modal__title">
              Page settings
            </h2>
            <p className="bg-modal__sub">
              Choose a trim size for your book. The preview matches the page
              proportions in the builder.
            </p>
          </div>
          <div className="bg-modal__head-actions">
            <button
              type="button"
              className="bg-modal__close"
              aria-label="Close"
              onClick={onClose}
            >
              ×
            </button>
          </div>
        </div>

        <div className="page-frame-modal__tabs" role="tablist" aria-label="Page settings tabs">
          {scopeMode === 'global' ? (
            <button
              type="button"
              role="tab"
              aria-selected={tab === 'size'}
              className={
                'page-frame-modal__tab' +
                (tab === 'size' ? ' page-frame-modal__tab--active' : '')
              }
              onClick={() => setTab('size')}
            >
              Size
            </button>
          ) : null}
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'border'}
            className={
              'page-frame-modal__tab' +
              (tab === 'border' ? ' page-frame-modal__tab--active' : '')
            }
            onClick={() => setTab('border')}
          >
            Border
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'padding'}
            className={
              'page-frame-modal__tab' +
              (tab === 'padding' ? ' page-frame-modal__tab--active' : '')
            }
            onClick={() => setTab('padding')}
          >
            Padding
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'spacing'}
            className={
              'page-frame-modal__tab' +
              (tab === 'spacing' ? ' page-frame-modal__tab--active' : '')
            }
            onClick={() => setTab('spacing')}
          >
            Spacing
          </button>
        </div>
        {canEditPageScope ? (
          <div className="page-frame-modal__scope" aria-label="Settings scope">
            <span className="page-frame-modal__scope-label">Apply to</span>
            <button
              type="button"
              className={
                'page-frame-modal__scope-btn' +
                (scopeMode === 'global' ? ' page-frame-modal__scope-btn--active' : '')
              }
              onClick={() => onScopeModeChange?.('global')}
            >
              All pages
            </button>
            <button
              type="button"
              className={
                'page-frame-modal__scope-btn' +
                (scopeMode === 'page' ? ' page-frame-modal__scope-btn--active' : '')
              }
              onClick={() => onScopeModeChange?.('page')}
            >
              {scopePageLabel ? `This page (${scopePageLabel})` : 'This page'}
            </button>
          </div>
        ) : null}

        <div className="paper-size-modal__body">
          {tab === 'size' ? (
            <>
              <div className="paper-size-modal__preview-col">
            <div className="paper-size-modal__preview-stage" aria-hidden>
              <div
                className="paper-size-modal__preview-sheet"
                style={{
                  ...aspect,
                  width: 'min(220px, 38vw)',
                }}
              >
                <span className="paper-size-modal__preview-inner" />
              </div>
            </div>
            <p className="paper-size-modal__preview-caption">
              <strong>{dims.widthMm} × {dims.heightMm} mm</strong>
              <span className="paper-size-modal__preview-sep"> · </span>
              {presetName}
            </p>
              </div>

              <div className="paper-size-modal__controls">
                <div className="paper-size-modal__quick-row">
                  {quickPresets.map((o) => (
                    <button
                      key={o.value}
                      type="button"
                      className={
                        'paper-size-modal__quick-btn' +
                        (draft.kind === 'preset' && draft.presetId === o.value
                          ? ' paper-size-modal__quick-btn--active'
                          : '')
                      }
                      onClick={() => setDraft({ kind: 'preset', presetId: o.value })}
                    >
                      {o.label}
                    </button>
                  ))}
                </div>
                <label className="paper-size-modal__field-label" htmlFor="paper-size-preset">
                  Preset
                </label>
                <select
                  id="paper-size-preset"
                  className="paper-size-modal__select"
                  value={paperSelectValue(draft)}
                  onChange={onPresetChange}
                  aria-label="Paper trim preset"
                >
                  {presets.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>

                {draft.kind === 'custom' ? (
                  <div
                    className="paper-size-modal__custom"
                    title="Custom trim (millimeters, portrait)"
                  >
                    <span className="paper-size-modal__field-label paper-size-modal__field-label--inline">
                      Width × height
                    </span>
                    <div className="paper-size-modal__custom-row">
                      <input
                        type="number"
                        className="paper-size-modal__num"
                        min={40}
                        max={500}
                        step={0.1}
                        aria-label="Trim width in millimeters"
                        value={draft.widthMm}
                        onChange={(e) => {
                          const n = Number(e.target.value)
                          setDraft({
                            kind: 'custom',
                            widthMm: Number.isFinite(n) ? n : draft.widthMm,
                            heightMm: draft.heightMm,
                          })
                        }}
                      />
                      <span className="paper-size-modal__times" aria-hidden>
                        ×
                      </span>
                      <input
                        type="number"
                        className="paper-size-modal__num"
                        min={40}
                        max={500}
                        step={0.1}
                        aria-label="Trim height in millimeters"
                        value={draft.heightMm}
                        onChange={(e) => {
                          const n = Number(e.target.value)
                          setDraft({
                            kind: 'custom',
                            widthMm: draft.widthMm,
                            heightMm: Number.isFinite(n) ? n : draft.heightMm,
                          })
                        }}
                      />
                      <span className="paper-size-modal__unit">mm</span>
                    </div>
                  </div>
                ) : null}

                <p className="paper-size-modal__hint">
                  Current selection: {paperSizeSummary(draft)}
                </p>
              </div>
            </>
          ) : (
            <div className="paper-size-modal__controls">
              {tab === 'border' ? (
              <section className="page-frame-modal__section" aria-label="Global border">
                <h3 className="page-frame-modal__section-title">Border</h3>
                <div className="page-frame-modal__grid">
                  <label className="page-frame-modal__field">
                    <span>Style</span>
                    <select
                      className="paper-size-modal__select"
                      value={frameDraft.borderStyle}
                      onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                        setFrameDraft((d) =>
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
                      value={frameDraft.borderColor}
                      onChange={(e: ChangeEvent<HTMLInputElement>) =>
                        setFrameDraft((d) => ({ ...d, borderColor: e.target.value }))
                      }
                    />
                  </label>
                  <label className="page-frame-modal__field page-frame-modal__field--span">
                    <span>Width: {frameDraft.borderWidthPx}px</span>
                    <input
                      type="range"
                      min={0}
                      max={16}
                      value={frameDraft.borderWidthPx}
                      onChange={(e: ChangeEvent<HTMLInputElement>) =>
                        setFrameDraft((d) =>
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

              {tab === 'spacing' ? (
              <section className="page-frame-modal__section" aria-label="Global spacing">
                <div className="page-frame-modal__section-head">
                  <h3 className="page-frame-modal__section-title">Spacing</h3>
                  <label className="page-frame-modal__check">
                    <input
                      type="checkbox"
                      checked={lockSpacing}
                      onChange={(e) => setLockSpacing(e.target.checked)}
                    />
                    Link values
                  </label>
                </div>
                <div className="page-frame-modal__grid">
                  <label className="page-frame-modal__field">
                    <span>Top: {Math.round(frameDraft.outerMarginTopPx)}px</span>
                    <input
                      type="range"
                      min={0}
                      max={120}
                      value={frameDraft.outerMarginTopPx}
                      onChange={(e) =>
                        setSpacing('outerMarginTopPx', Number(e.target.value))
                      }
                    />
                  </label>
                  <label className="page-frame-modal__field">
                    <span>Right: {Math.round(frameDraft.outerMarginRightPx)}px</span>
                    <input
                      type="range"
                      min={0}
                      max={120}
                      value={frameDraft.outerMarginRightPx}
                      onChange={(e) =>
                        setSpacing('outerMarginRightPx', Number(e.target.value))
                      }
                    />
                  </label>
                  <label className="page-frame-modal__field">
                    <span>Bottom: {Math.round(frameDraft.outerMarginBottomPx)}px</span>
                    <input
                      type="range"
                      min={0}
                      max={120}
                      value={frameDraft.outerMarginBottomPx}
                      onChange={(e) =>
                        setSpacing('outerMarginBottomPx', Number(e.target.value))
                      }
                    />
                  </label>
                  <label className="page-frame-modal__field">
                    <span>Left: {Math.round(frameDraft.outerMarginLeftPx)}px</span>
                    <input
                      type="range"
                      min={0}
                      max={120}
                      value={frameDraft.outerMarginLeftPx}
                      onChange={(e) =>
                        setSpacing('outerMarginLeftPx', Number(e.target.value))
                      }
                    />
                  </label>
                </div>
              </section>
              ) : null}

              {tab === 'padding' ? (
              <section className="page-frame-modal__section" aria-label="Global padding">
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
                </div>
                <div className="page-frame-modal__grid">
                  <label className="page-frame-modal__field">
                    <span>Top: {Math.round(frameDraft.paddingTopPx)}px</span>
                    <input
                      type="range"
                      min={0}
                      max={160}
                      value={frameDraft.paddingTopPx}
                      onChange={(e) => setPadding('paddingTopPx', Number(e.target.value))}
                    />
                  </label>
                  <label className="page-frame-modal__field">
                    <span>Right: {Math.round(frameDraft.paddingRightPx)}px</span>
                    <input
                      type="range"
                      min={0}
                      max={160}
                      value={frameDraft.paddingRightPx}
                      onChange={(e) =>
                        setPadding('paddingRightPx', Number(e.target.value))
                      }
                    />
                  </label>
                  <label className="page-frame-modal__field">
                    <span>Bottom: {Math.round(frameDraft.paddingBottomPx)}px</span>
                    <input
                      type="range"
                      min={0}
                      max={160}
                      value={frameDraft.paddingBottomPx}
                      onChange={(e) =>
                        setPadding('paddingBottomPx', Number(e.target.value))
                      }
                    />
                  </label>
                  <label className="page-frame-modal__field">
                    <span>Left: {Math.round(frameDraft.paddingLeftPx)}px</span>
                    <input
                      type="range"
                      min={0}
                      max={160}
                      value={frameDraft.paddingLeftPx}
                      onChange={(e) => setPadding('paddingLeftPx', Number(e.target.value))}
                    />
                  </label>
                </div>
              </section>
              ) : null}
            </div>
          )}
        </div>

        <div className="paper-size-modal__actions">
          <button
            type="button"
            className="paper-size-modal__btn paper-size-modal__btn--ghost"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            type="button"
            className="paper-size-modal__btn paper-size-modal__btn--primary"
            onClick={apply}
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  )
}
