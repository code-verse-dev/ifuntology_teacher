import {
  getPageCharacters,
  getPageTextBoxes,
  type BookPageData,
  type CanvasSelectableKind,
} from '../types/bookPage'

const KINDS: CanvasSelectableKind[] = [
  'character',
  'textBox',
  'thoughtBubble',
]

function layerPresent(
  page: BookPageData,
  kind: CanvasSelectableKind,
): boolean {
  if (page.kind !== 'content') return false
  if (kind === 'character') return getPageCharacters(page).length > 0
  if (kind === 'textBox') return getPageTextBoxes(page).length > 0
  return !!page.thoughtBubble
}

/** Default back-to-front order for elements that exist on the page. */
export function defaultCanvasLayerOrder(page: BookPageData): CanvasSelectableKind[] {
  if (page.kind !== 'content') return []
  const out: CanvasSelectableKind[] = []
  for (const k of KINDS) {
    if (layerPresent(page, k)) out.push(k)
  }
  return out
}

export function normalizeCanvasLayerOrder(
  raw: unknown,
): CanvasSelectableKind[] | undefined {
  if (!Array.isArray(raw)) return undefined
  const out: CanvasSelectableKind[] = []
  for (const x of raw) {
    if (x === 'character' || x === 'textBox' || x === 'thoughtBubble') {
      if (!out.includes(x)) out.push(x)
    }
  }
  return out.length > 0 ? out : undefined
}

/** Resolves stored order with missing layers appended in default order. */
export function effectiveCanvasLayerOrder(
  page: BookPageData,
): CanvasSelectableKind[] {
  const present = defaultCanvasLayerOrder(page)
  if (page.kind !== 'content') return present
  const raw = page.canvasLayerOrder
  if (!raw?.length) return present
  const seen = new Set<CanvasSelectableKind>()
  const ordered: CanvasSelectableKind[] = []
  for (const k of raw) {
    if (!present.includes(k) || seen.has(k)) continue
    ordered.push(k)
    seen.add(k)
  }
  for (const k of present) {
    if (!seen.has(k)) ordered.push(k)
  }
  return ordered
}

export function bringKindToFront(
  order: CanvasSelectableKind[],
  kind: CanvasSelectableKind,
): CanvasSelectableKind[] {
  if (!order.includes(kind)) return order
  return [...order.filter((k) => k !== kind), kind]
}

export function sendKindToBack(
  order: CanvasSelectableKind[],
  kind: CanvasSelectableKind,
): CanvasSelectableKind[] {
  if (!order.includes(kind)) return order
  return [kind, ...order.filter((k) => k !== kind)]
}

export function moveKindForward(
  order: CanvasSelectableKind[],
  kind: CanvasSelectableKind,
): CanvasSelectableKind[] {
  const i = order.indexOf(kind)
  if (i < 0 || i >= order.length - 1) return order
  const next = [...order]
  ;[next[i], next[i + 1]] = [next[i + 1], next[i]]
  return next
}

export function moveKindBackward(
  order: CanvasSelectableKind[],
  kind: CanvasSelectableKind,
): CanvasSelectableKind[] {
  const i = order.indexOf(kind)
  if (i <= 0) return order
  const next = [...order]
  ;[next[i - 1], next[i]] = [next[i], next[i - 1]]
  return next
}

export function ordersEqual(
  a: CanvasSelectableKind[],
  b: CanvasSelectableKind[],
): boolean {
  return a.length === b.length && a.every((k, i) => k === b[i])
}

export function applyCanvasStackOp(
  page: BookPageData,
  kind: CanvasSelectableKind,
  op: 'front' | 'back' | 'forward' | 'backward',
): BookPageData {
  if (page.kind !== 'content') return page
  const cur = effectiveCanvasLayerOrder(page)
  if (!cur.includes(kind)) return page
  let next: CanvasSelectableKind[]
  switch (op) {
    case 'front':
      next = bringKindToFront(cur, kind)
      break
    case 'back':
      next = sendKindToBack(cur, kind)
      break
    case 'forward':
      next = moveKindForward(cur, kind)
      break
    case 'backward':
      next = moveKindBackward(cur, kind)
      break
    default:
      next = cur
  }
  if (ordersEqual(next, cur)) return page
  const def = defaultCanvasLayerOrder(page)
  if (ordersEqual(next, def)) {
    const { canvasLayerOrder: _cl, ...rest } = page
    return rest as BookPageData
  }
  return { ...page, canvasLayerOrder: next }
}

export function resolveCanvasStackKeyTarget(
  pages: BookPageData[],
  activePageIndex: number,
  textBoxSelectedPageId: string | null,
  thoughtBubbleSelectedPageId: string | null,
): { pageId: string; kind: CanvasSelectableKind } | null {
  const p = pages[activePageIndex]
  if (!p || p.kind !== 'content') return null
  const pid = p.id
  if (thoughtBubbleSelectedPageId === pid && p.thoughtBubble) {
    return { pageId: pid, kind: 'thoughtBubble' }
  }
  if (textBoxSelectedPageId === pid && getPageTextBoxes(p).length > 0) {
    return { pageId: pid, kind: 'textBox' }
  }
  if (getPageCharacters(p).length > 0) {
    return { pageId: pid, kind: 'character' }
  }
  return null
}
