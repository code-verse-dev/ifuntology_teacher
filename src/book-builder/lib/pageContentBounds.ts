import type { CSSProperties } from 'react'
import type { PageFrameSettings } from '../types/pageFrame'

/**
 * Drawable size inside padding. `surface` is the `.book-page` element
 * (`clientWidth` / `clientHeight` include padding, exclude border).
 */
export function readDrawableSizeFromPageSurface(
  surface: HTMLElement | null | undefined,
  s: PageFrameSettings,
): { cw: number; ch: number } | null {
  const borderPx =
    s.borderStyle !== 'none' && s.borderWidthPx > 0 ? s.borderWidthPx : 0
  const insetX =
    s.outerMarginLeftPx +
    s.outerMarginRightPx +
    s.paddingLeftPx +
    s.paddingRightPx +
    borderPx * 2
  const insetY =
    s.outerMarginTopPx +
    s.outerMarginBottomPx +
    s.paddingTopPx +
    s.paddingBottomPx +
    borderPx * 2
  if (surface == null) return null
  const cw = Math.max(0, surface.clientWidth - insetX)
  const ch = Math.max(0, surface.clientHeight - insetY)
  if (cw <= 0 || ch <= 0) return null
  return { cw, ch }
}

/** Border on the outer `.book-page` surface. */
export function pageFrameBorderStyle(_s: PageFrameSettings): CSSProperties {
  return {
    // Border is rendered on the inner safe layer (between spacing and padding),
    // so keep the page surface borderless.
    border: 'none',
    outline: 'none',
    boxSizing: 'border-box',
  }
}

/** Padding inside the page border (Elementor-style). */
export function pageFramePaddingStyle(s: PageFrameSettings): CSSProperties {
  const st = s.outerMarginTopPx
  const sr = s.outerMarginRightPx
  const sb = s.outerMarginBottomPx
  const sl = s.outerMarginLeftPx
  const t = s.paddingTopPx
  const r = s.paddingRightPx
  const b = s.paddingBottomPx
  const l = s.paddingLeftPx
  return {
    paddingTop: t,
    paddingRight: r,
    paddingBottom: b,
    paddingLeft: l,
    // Visualize spacing (red) and padding (green) as internal canvas bands.
    boxShadow: [
      s.showSpacingColor && st > 0
        ? `inset 0 ${st}px 0 rgba(239, 68, 68, 0.35)`
        : '',
      s.showSpacingColor && sb > 0
        ? `inset 0 -${sb}px 0 rgba(239, 68, 68, 0.35)`
        : '',
      s.showSpacingColor && sl > 0
        ? `inset ${sl}px 0 0 rgba(239, 68, 68, 0.35)`
        : '',
      s.showSpacingColor && sr > 0
        ? `inset -${sr}px 0 0 rgba(239, 68, 68, 0.35)`
        : '',
      s.showPaddingColor && t > 0
        ? `inset 0 ${st + t}px 0 rgba(34, 197, 94, 0.35)`
        : '',
      s.showPaddingColor && b > 0
        ? `inset 0 -${sb + b}px 0 rgba(34, 197, 94, 0.35)`
        : '',
      s.showPaddingColor && l > 0
        ? `inset ${sl + l}px 0 0 rgba(34, 197, 94, 0.35)`
        : '',
      s.showPaddingColor && r > 0
        ? `inset -${sr + r}px 0 0 rgba(34, 197, 94, 0.35)`
        : '',
    ]
      .filter(Boolean)
      .join(', '),
    boxSizing: 'border-box',
  }
}

/** Margin around the page card in the builder frame (Elementor-style). */
export function pageFrameOuterMarginStyle(
  _s: PageFrameSettings,
): CSSProperties {
  return {
    // Spacing is rendered inside the page canvas, so wrapper layout stays unchanged.
    margin: 0,
    borderRadius: 6,
  }
}

/** Fills the content box inside padding; dashed line = inner content boundary. */
export function pageSafeInsetStyle(s: PageFrameSettings): CSSProperties {
  const borderVisible =
    s.borderStyle !== 'none' && s.borderWidthPx > 0
  const borderPx = borderVisible ? s.borderWidthPx : 1
  return {
    position: 'absolute',
    // Strict content box: objects cannot overlap spacing, border, or padding.
    top: s.outerMarginTopPx + borderPx + s.paddingTopPx,
    left: s.outerMarginLeftPx + borderPx + s.paddingLeftPx,
    right: s.outerMarginRightPx + borderPx + s.paddingRightPx,
    bottom: s.outerMarginBottomPx + borderPx + s.paddingBottomPx,
    border: 'none',
    padding: 0,
    boxSizing: 'border-box',
    overflow: 'visible',
    background: 'transparent',
  }
}

export function safeBleedInsets(s: PageFrameSettings): {
  left: number
  right: number
  top: number
  bottom: number
} {
  const borderVisible =
    s.borderStyle !== 'none' && s.borderWidthPx > 0
  const borderPx = borderVisible ? s.borderWidthPx : 1
  return {
    left: s.outerMarginLeftPx + borderPx + s.paddingLeftPx,
    right: s.outerMarginRightPx + borderPx + s.paddingRightPx,
    top: s.outerMarginTopPx + borderPx + s.paddingTopPx,
    bottom: s.outerMarginBottomPx + borderPx + s.paddingBottomPx,
  }
}

export function clampRectToPageFromSafeCoords(
  x: number,
  y: number,
  widthPx: number,
  heightPx: number,
  cw: number,
  ch: number,
  s: PageFrameSettings,
): { x: number; y: number } {
  const bleed = safeBleedInsets(s)
  const minX = -bleed.left
  const minY = -bleed.top
  const maxX = cw + bleed.right - widthPx
  const maxY = ch + bleed.bottom - heightPx
  return {
    x: clamp(x, Math.min(minX, maxX), Math.max(minX, maxX)),
    y: clamp(y, Math.min(minY, maxY), Math.max(minY, maxY)),
  }
}

/** Approximate placed character size (matches `.book-page__character` CSS). */
export function characterOuterSize(cw: number): { w: number; h: number } {
  const w = Math.min(cw * 0.48, 300)
  const h = (w * 300) / 200
  return { w, h }
}

/** Bounds used for drag, outline, and grouping — prefers explicit `widthPx` / `heightPx` on the placed character. */
export function characterPlacementBounds(
  ch: { widthPx?: number; heightPx?: number },
  cw: number,
): { w: number; h: number } {
  const def = characterOuterSize(cw)
  const w =
    typeof ch.widthPx === 'number' &&
    Number.isFinite(ch.widthPx) &&
    ch.widthPx > 0
      ? ch.widthPx
      : def.w
  const h =
    typeof ch.heightPx === 'number' &&
    Number.isFinite(ch.heightPx) &&
    ch.heightPx > 0
      ? ch.heightPx
      : def.h
  return { w, h }
}

export function clampCharacterXY(
  x: number,
  y: number,
  cw: number,
  ch: number,
): { x: number; y: number } {
  const { w, h } = characterOuterSize(cw)
  const maxX = Math.max(0, cw - w)
  const maxY = Math.max(0, ch - h)
  return {
    x: clamp(x, 0, maxX),
    y: clamp(y, 0, maxY),
  }
}

export function clampTextBoxRect(
  x: number,
  y: number,
  widthPx: number,
  heightPx: number,
  cw: number,
  ch: number,
): { x: number; y: number; widthPx: number; heightPx: number } {
  const w = clamp(widthPx, 12, Math.max(12, cw))
  const h = clamp(heightPx, 12, Math.max(12, ch))
  const maxX = Math.max(0, cw - w)
  const maxY = Math.max(0, ch - h)
  return {
    x: clamp(x, 0, maxX),
    y: clamp(y, 0, maxY),
    widthPx: w,
    heightPx: h,
  }
}

function clamp(n: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, n))
}
