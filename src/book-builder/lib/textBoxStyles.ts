import type { CSSProperties } from 'react'
import type { GlobalFont } from '../types/globalFont'
import type { PlacedTextBox } from '../types/bookPage'
import { tocExtraCssToReactStyle } from './tocFontLinks'

/**
 * Admin "extra CSS" must not set these — the text-box panel owns them.
 * `font` shorthand in particular resets font-weight in browsers even when
 * fontWeight is set earlier in the same style object.
 */
const STRIP_FROM_EXTRA = new Set([
  'font',
  'fontWeight',
  'fontSize',
  'fontFamily',
  'lineHeight',
  'letterSpacing',
  'color',
  'textAlign',
  'fontStyle',
  'textDecoration',
  'textTransform',
  'opacity',
  'verticalAlign',
])

function sanitizedExtra(extraCss: string): Record<string, string> {
  const raw = tocExtraCssToReactStyle(extraCss)
  const out: Record<string, string> = {}
  for (const k of Object.keys(raw)) {
    if (!STRIP_FROM_EXTRA.has(k)) out[k] = raw[k]!
  }
  return out
}

function verticalJustify(
  v: PlacedTextBox['verticalAlign'],
): 'flex-start' | 'center' | 'flex-end' {
  if (v === 'middle') return 'center'
  if (v === 'bottom') return 'flex-end'
  return 'flex-start'
}

/** Outer box (size + flex vertical alignment + scroll); inner (all typography). */
export function textBoxCanvasStyles(
  tb: PlacedTextBox,
  font: GlobalFont | undefined,
): { outer: CSSProperties; inner: CSSProperties } {
  const extra = sanitizedExtra(font?.extraCss ?? '')
  const letter =
    tb.letterSpacingPx === 0
      ? undefined
      : `${tb.letterSpacingPx}px`

  const inner: CSSProperties = {
    fontFamily: font?.fontFamily ?? 'system-ui, sans-serif',
    ...extra,
    padding: '0.2rem 0.35rem',
    fontSize: `${tb.fontSizePx}px`,
    fontWeight: tb.fontWeight,
    color: tb.color,
    textAlign: tb.textAlign,
    lineHeight: tb.lineHeight,
    letterSpacing: letter,
    fontStyle: tb.fontStyle,
    textDecoration: tb.textDecoration,
    textTransform: tb.textTransform,
    opacity: tb.opacity,
    width: '100%',
    maxWidth: '100%',
    boxSizing: 'border-box',
    margin: 0,
    minHeight: 0,
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
  }

  const outer: CSSProperties = {
    width: tb.widthPx,
    height: tb.heightPx,
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: verticalJustify(tb.verticalAlign),
    alignItems: 'stretch',
    overflow: 'auto',
  }

  return { outer, inner }
}
