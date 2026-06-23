import type { CSSProperties } from 'react'
import {
  DEFAULT_PAPER_PRESET_ID,
  findPaperPresetById,
  PAPER_PRESETS,
} from '../data/paperSizePresets'
import type { BookPaperSize } from '../types/paperSize'

const MM_MIN = 40
const MM_MAX = 500

function clampMm(n: number): number {
  if (!Number.isFinite(n)) return MM_MIN
  return Math.min(MM_MAX, Math.max(MM_MIN, Math.round(n * 10) / 10))
}

export function defaultPaperSize(): BookPaperSize {
  return { kind: 'preset', presetId: DEFAULT_PAPER_PRESET_ID }
}

export function dimensionsForPaper(p: BookPaperSize): {
  widthMm: number
  heightMm: number
} {
  if (p.kind === 'custom') {
    let w = clampMm(p.widthMm)
    let h = clampMm(p.heightMm)
    if (h / w > 2.6) h = Math.round(w * 2.6 * 10) / 10
    if (w / h > 2.6) w = Math.round(h * 2.6 * 10) / 10
    return { widthMm: w, heightMm: h }
  }
  const meta =
    findPaperPresetById(p.presetId) ??
    findPaperPresetById(DEFAULT_PAPER_PRESET_ID)!
  return { widthMm: meta.widthMm, heightMm: meta.heightMm }
}

/**
 * Rough page drawable size in CSS px when the live `.book-page` surface is not
 * available (e.g. placement math before mount). Matches builder scaling (~560 × aspect).
 */
export function approximateDrawableSizePx(p: BookPaperSize): {
  cw: number
  ch: number
} {
  const { widthMm, heightMm } = dimensionsForPaper(p)
  let cardW = 560
  if (typeof window !== 'undefined') {
    cardW = Math.min(560, Math.max(280, window.innerWidth * 0.88))
  }
  const ch = Math.round((cardW * heightMm) / Math.max(widthMm, 1))
  return { cw: Math.round(cardW), ch }
}

/** Width ÷ height for cropper & exports (portrait page). */
export function cropAspectRatio(p: BookPaperSize): number {
  const { widthMm, heightMm } = dimensionsForPaper(p)
  return widthMm / heightMm
}

export function paperSurfaceAspectStyle(p: BookPaperSize): CSSProperties {
  const { widthMm, heightMm } = dimensionsForPaper(p)
  /* Numeric ratio + auto height: reliable live updates across browsers */
  return {
    aspectRatio: widthMm / heightMm,
    height: 'auto',
  }
}

export function parseDraftPaperSize(raw: unknown): BookPaperSize {
  if (!raw || typeof raw !== 'object') return defaultPaperSize()
  const o = raw as Record<string, unknown>
  if (o.kind === 'custom') {
    const w = Number(o.widthMm)
    const h = Number(o.heightMm)
    if (!Number.isFinite(w) || !Number.isFinite(h)) return defaultPaperSize()
    return { kind: 'custom', widthMm: w, heightMm: h }
  }
  if (o.kind === 'preset' && typeof o.presetId === 'string') {
    if (findPaperPresetById(o.presetId))
      return { kind: 'preset', presetId: o.presetId }
  }
  if (typeof o.presetId === 'string' && findPaperPresetById(o.presetId)) {
    return { kind: 'preset', presetId: o.presetId }
  }
  return defaultPaperSize()
}

export function paperSelectValue(p: BookPaperSize): string {
  return p.kind === 'custom' ? 'custom' : p.presetId
}

/** Options list for a `<select>` (preset ids + custom). */
export function paperPresetOptions(): { value: string; label: string }[] {
  return [
    ...PAPER_PRESETS.map((m) => ({ value: m.id, label: m.label })),
    { value: 'custom', label: 'Custom size…' },
  ]
}

/** Short label for tooltips and UI (preset name or "W × H mm"). */
export function paperSizeSummary(p: BookPaperSize): string {
  if (p.kind === 'custom') {
    const { widthMm, heightMm } = dimensionsForPaper(p)
    return `${widthMm} × ${heightMm} mm`
  }
  const v = paperSelectValue(p)
  const opt = paperPresetOptions().find((o) => o.value === v)
  return opt?.label ?? v
}
