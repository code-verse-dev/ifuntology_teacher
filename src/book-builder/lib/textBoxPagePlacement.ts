import type { PlacedTextBox, TextBoxPagePlacement } from '../types/bookPage'
import { clampTextBoxRect } from './pageContentBounds'

export const TEXT_BOX_PAGE_PLACEMENT_ORDER: TextBoxPagePlacement[] = [
  'free',
  'margin_top_left',
  'margin_top_center',
  'margin_top_right',
  'margin_center',
  'margin_bottom_left',
  'margin_bottom_center',
  'margin_bottom_right',
  'margin_fill',
]

export const TEXT_BOX_PAGE_PLACEMENT_LABELS: Record<
  TextBoxPagePlacement,
  string
> = {
  free: 'Free (drag)',
  margin_top_left: 'Top left (in margins)',
  margin_top_center: 'Top center',
  margin_top_right: 'Top right',
  margin_center: 'Center',
  margin_bottom_left: 'Bottom left',
  margin_bottom_center: 'Bottom center',
  margin_bottom_right: 'Bottom right',
  margin_fill: 'Fill margin area',
}

export function resolveTextBoxLayout(
  tb: PlacedTextBox,
  cw: number,
  ch: number,
): { x: number; y: number; widthPx: number; heightPx: number } {
  const p = tb.pagePlacement ?? 'free'
  if (p === 'free') {
    return clampTextBoxRect(tb.x, tb.y, tb.widthPx, tb.heightPx, cw, ch)
  }
  const w0 = tb.widthPx
  const h0 = tb.heightPx
  if (p === 'margin_fill') {
    return clampTextBoxRect(0, 0, cw, ch, cw, ch)
  }
  let x = tb.x
  let y = tb.y
  const w = clamp(w0, 24, Math.max(24, cw))
  const h = clamp(h0, 24, Math.max(24, ch))
  switch (p) {
    case 'margin_top_left':
      x = 0
      y = 0
      break
    case 'margin_top_center':
      x = (cw - w) / 2
      y = 0
      break
    case 'margin_top_right':
      x = cw - w
      y = 0
      break
    case 'margin_center':
      x = (cw - w) / 2
      y = (ch - h) / 2
      break
    case 'margin_bottom_left':
      x = 0
      y = ch - h
      break
    case 'margin_bottom_center':
      x = (cw - w) / 2
      y = ch - h
      break
    case 'margin_bottom_right':
      x = cw - w
      y = ch - h
      break
    default:
      break
  }
  return clampTextBoxRect(x, y, w, h, cw, ch)
}

function clamp(n: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, n))
}
