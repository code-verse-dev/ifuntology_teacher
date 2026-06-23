export type PageBorderStyle = 'none' | 'solid' | 'dashed' | 'dotted'

/** Spacing and Content: border + padding + spacing controls for page layout. */
export type PageFrameSettings = {
  borderWidthPx: number
  borderColor: string
  borderStyle: PageBorderStyle
  showSpacingColor: boolean
  showPaddingColor: boolean
  /** Space inside the page border, before content. */
  paddingTopPx: number
  paddingRightPx: number
  paddingBottomPx: number
  paddingLeftPx: number
  /** Space around the page preview inside the frame (outside the page box). */
  outerMarginTopPx: number
  outerMarginRightPx: number
  outerMarginBottomPx: number
  outerMarginLeftPx: number
}

export function defaultPageFrameSettings(): PageFrameSettings {
  return {
    borderWidthPx: 1,
    borderColor: '#94a3b8',
    borderStyle: 'solid',
    showSpacingColor: true,
    showPaddingColor: true,
    paddingTopPx: 10,
    paddingRightPx: 10,
    paddingBottomPx: 10,
    paddingLeftPx: 10,
    outerMarginTopPx: 10,
    outerMarginRightPx: 10,
    outerMarginBottomPx: 10,
    outerMarginLeftPx: 10,
  }
}

function clamp(n: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, n))
}

const BORDER_STYLES: PageBorderStyle[] = [
  'none',
  'solid',
  'dashed',
  'dotted',
]

function readPaddingFromRaw(
  o: Record<string, unknown>,
  d: PageFrameSettings,
): Pick<
  PageFrameSettings,
  'paddingTopPx' | 'paddingRightPx' | 'paddingBottomPx' | 'paddingLeftPx'
> {
  const pt = Number(o.paddingTopPx)
  const pr = Number(o.paddingRightPx)
  const pb = Number(o.paddingBottomPx)
  const pl = Number(o.paddingLeftPx)
  if (
    Number.isFinite(pt) ||
    Number.isFinite(pr) ||
    Number.isFinite(pb) ||
    Number.isFinite(pl)
  ) {
    return {
      paddingTopPx: Number.isFinite(pt) ? clamp(pt, 0, 160) : d.paddingTopPx,
      paddingRightPx: Number.isFinite(pr) ? clamp(pr, 0, 160) : d.paddingRightPx,
      paddingBottomPx: Number.isFinite(pb) ? clamp(pb, 0, 160) : d.paddingBottomPx,
      paddingLeftPx: Number.isFinite(pl) ? clamp(pl, 0, 160) : d.paddingLeftPx,
    }
  }
  // Legacy: margin* was used as content inset (now padding).
  const mt = Number(o.marginTopPx)
  const mr = Number(o.marginRightPx)
  const mb = Number(o.marginBottomPx)
  const ml = Number(o.marginLeftPx)
  return {
    paddingTopPx: Number.isFinite(mt) ? clamp(mt, 0, 160) : d.paddingTopPx,
    paddingRightPx: Number.isFinite(mr) ? clamp(mr, 0, 160) : d.paddingRightPx,
    paddingBottomPx: Number.isFinite(mb) ? clamp(mb, 0, 160) : d.paddingBottomPx,
    paddingLeftPx: Number.isFinite(ml) ? clamp(ml, 0, 160) : d.paddingLeftPx,
  }
}

function readOuterMarginFromRaw(
  o: Record<string, unknown>,
  d: PageFrameSettings,
): Pick<
  PageFrameSettings,
  | 'outerMarginTopPx'
  | 'outerMarginRightPx'
  | 'outerMarginBottomPx'
  | 'outerMarginLeftPx'
> {
  const mt = Number(o.outerMarginTopPx)
  const mr = Number(o.outerMarginRightPx)
  const mb = Number(o.outerMarginBottomPx)
  const ml = Number(o.outerMarginLeftPx)
  return {
    outerMarginTopPx: Number.isFinite(mt) ? clamp(mt, 0, 120) : d.outerMarginTopPx,
    outerMarginRightPx: Number.isFinite(mr)
      ? clamp(mr, 0, 120)
      : d.outerMarginRightPx,
    outerMarginBottomPx: Number.isFinite(mb)
      ? clamp(mb, 0, 120)
      : d.outerMarginBottomPx,
    outerMarginLeftPx: Number.isFinite(ml) ? clamp(ml, 0, 120) : d.outerMarginLeftPx,
  }
}

export function normalizePageFrameSettings(raw: unknown): PageFrameSettings {
  const d = defaultPageFrameSettings()
  if (!raw || typeof raw !== 'object') return d
  const o = raw as Record<string, unknown>
  const bw = Number(o.borderWidthPx)
  const bs = o.borderStyle
  const showSpacingColor =
    typeof o.showSpacingColor === 'boolean'
      ? o.showSpacingColor
      : d.showSpacingColor
  const showPaddingColor =
    typeof o.showPaddingColor === 'boolean'
      ? o.showPaddingColor
      : d.showPaddingColor
  const bc =
    typeof o.borderColor === 'string' && o.borderColor.trim().length > 0
      ? o.borderColor.trim()
      : d.borderColor
  const pad = readPaddingFromRaw(o, d)
  const outer = readOuterMarginFromRaw(o, d)
  return {
    borderWidthPx:
      Number.isFinite(bw) ? clamp(Math.round(bw), 0, 16) : d.borderWidthPx,
    borderColor: bc,
    borderStyle: BORDER_STYLES.includes(bs as PageBorderStyle)
      ? (bs as PageBorderStyle)
      : d.borderStyle,
    showSpacingColor,
    showPaddingColor,
    ...pad,
    ...outer,
  }
}
