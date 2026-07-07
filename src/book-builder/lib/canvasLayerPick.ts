export type CanvasPickTarget =
  | { kind: 'shape'; shapeIndex: number }
  | { kind: 'character'; characterIndex: number }
  | { kind: 'textBox' }
  | { kind: 'thoughtBubble' }

export function canvasPickKey(target: CanvasPickTarget): string {
  if (target.kind === 'shape') return `shape:${target.shapeIndex}`
  if (target.kind === 'character') return `character:${target.characterIndex}`
  return target.kind
}

export function parseCanvasPickAttr(raw: string | null): CanvasPickTarget | null {
  if (!raw?.trim()) return null
  if (raw === 'textBox') return { kind: 'textBox' }
  if (raw === 'thoughtBubble') return { kind: 'thoughtBubble' }
  const shape = /^shape:(\d+)$/.exec(raw)
  if (shape) return { kind: 'shape', shapeIndex: Number(shape[1]) }
  const ch = /^character:(\d+)$/.exec(raw)
  if (ch) return { kind: 'character', characterIndex: Number(ch[1]) }
  return null
}

export function pickTargetsEqual(a: CanvasPickTarget, b: CanvasPickTarget): boolean {
  return canvasPickKey(a) === canvasPickKey(b)
}

export function pickStacksEqual(a: CanvasPickTarget[], b: CanvasPickTarget[]): boolean {
  if (a.length !== b.length) return false
  return a.every((t, i) => pickTargetsEqual(t, b[i]!))
}

/** Top-most first (same order as `elementsFromPoint`). */
export function collectCanvasPickStack(
  clientX: number,
  clientY: number,
  root: HTMLElement,
): CanvasPickTarget[] {
  const seen = new Set<string>()
  const out: CanvasPickTarget[] = []
  for (const el of document.elementsFromPoint(clientX, clientY)) {
    if (!root.contains(el)) continue
    const node = (el as HTMLElement).closest?.('[data-canvas-pick]')
    if (!node || !root.contains(node)) continue
    const parsed = parseCanvasPickAttr(node.getAttribute('data-canvas-pick'))
    if (!parsed) continue
    const key = canvasPickKey(parsed)
    if (seen.has(key)) continue
    seen.add(key)
    out.push(parsed)
  }
  return out
}

export function pickTargetElement(
  root: HTMLElement,
  target: CanvasPickTarget,
): HTMLElement | null {
  return root.querySelector(
    `[data-canvas-pick="${canvasPickKey(target)}"]`,
  ) as HTMLElement | null
}

export function clientPointInPickTarget(
  root: HTMLElement,
  target: CanvasPickTarget,
  clientX: number,
  clientY: number,
): boolean {
  const el = pickTargetElement(root, target)
  if (!el) return false
  const r = el.getBoundingClientRect()
  return (
    clientX >= r.left &&
    clientX <= r.right &&
    clientY >= r.top &&
    clientY <= r.bottom
  )
}

export type PickCycleState = {
  pageIndex: number
  x: number
  y: number
  stack: CanvasPickTarget[]
  index: number
  at: number
}

const CYCLE_MS = 700
const CYCLE_PX = 10

export function resolveCanvasPickIndex(
  pageIndex: number,
  clientX: number,
  clientY: number,
  stack: CanvasPickTarget[],
  prefer: CanvasPickTarget | null,
  cycle: PickCycleState | null,
): { index: number; nextCycle: PickCycleState | null } {
  if (stack.length === 0) {
    return { index: -1, nextCycle: null }
  }
  const now = Date.now()
  const sameCycle =
    cycle != null &&
    cycle.pageIndex === pageIndex &&
    now - cycle.at <= CYCLE_MS &&
    Math.hypot(cycle.x - clientX, cycle.y - clientY) <= CYCLE_PX &&
    pickStacksEqual(cycle.stack, stack)

  if (sameCycle && stack.length > 1) {
    const index = (cycle.index + 1) % stack.length
    return {
      index,
      nextCycle: { pageIndex, x: clientX, y: clientY, stack, index, at: now },
    }
  }

  let index = 0
  if (prefer) {
    const pi = stack.findIndex((t) => pickTargetsEqual(t, prefer))
    if (pi >= 0) index = pi
  }

  return {
    index,
    nextCycle:
      stack.length > 1
        ? { pageIndex, x: clientX, y: clientY, stack, index, at: now }
        : null,
  }
}
