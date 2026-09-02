import {
  clampRectToPageFromSafeCoords,
  characterPlacementBounds,
  clampTextBoxRect,
  readDrawableSizeFromPageSurface,
} from './pageContentBounds'
import {
  getPageCharacters,
  getPageTextBoxes,
  effectivePageFrame,
  type BookPageData,
} from '../types/bookPage'
import type { PageFrameSettings } from '../types/pageFrame'

export type GroupDragSnap = {
  groupId: string
  characters?: Array<{
    index: number
    x: number
    y: number
    widthPx?: number
    heightPx?: number
  }>
  textBoxes?: Array<{
    index: number
    x: number
    y: number
    widthPx: number
    heightPx: number
  }>
  thoughtBubble?: {
    x: number
    y: number
    widthPx: number
    heightPx: number
  }
  shapes?: Array<{
    index: number
    x: number
    y: number
    widthPx: number
    heightPx: number
  }>
}

export function captureGroupDragSnap(
  page: BookPageData,
  groupId: string | undefined,
): GroupDragSnap | null {
  if (!groupId || page.kind !== 'content') return null
  const out: GroupDragSnap = { groupId }
  const characters: GroupDragSnap['characters'] = []
  getPageCharacters(page).forEach((ch, index) => {
    if (ch.groupId === groupId) {
      characters.push({
        index,
        x: ch.x,
        y: ch.y,
        widthPx: ch.widthPx,
        heightPx: ch.heightPx,
      })
    }
  })
  if (characters.length > 0) {
    out.characters = characters
  }
  const textBoxes: NonNullable<GroupDragSnap['textBoxes']> = []
  getPageTextBoxes(page).forEach((tb, index) => {
    if (tb.groupId === groupId) {
      textBoxes.push({
        index,
        x: tb.x,
        y: tb.y,
        widthPx: tb.widthPx,
        heightPx: tb.heightPx,
      })
    }
  })
  if (textBoxes.length > 0) {
    out.textBoxes = textBoxes
  }
  if (page.thoughtBubble?.groupId === groupId) {
    out.thoughtBubble = {
      x: page.thoughtBubble.x,
      y: page.thoughtBubble.y,
      widthPx: page.thoughtBubble.widthPx,
      heightPx: page.thoughtBubble.heightPx,
    }
  }
  const shapes = page.shapes
    .map((s, i) =>
      s.groupId === groupId
        ? {
            index: i,
            x: s.x,
            y: s.y,
            widthPx: s.widthPx,
            heightPx: s.heightPx,
          }
        : null,
    )
    .filter(
      (
        it,
      ): it is {
        index: number
        x: number
        y: number
        widthPx: number
        heightPx: number
      } => !!it,
    )
  if (shapes.length > 0) {
    out.shapes = shapes
  }
  const n =
    (out.characters?.length ?? 0) +
    (out.textBoxes?.length ?? 0) +
    (out.thoughtBubble ? 1 : 0) +
    (out.shapes?.length ?? 0)
  return n >= 2 ? out : null
}

export function applyGroupTranslate(
  page: BookPageData,
  snap: GroupDragSnap,
  dx: number,
  dy: number,
  surface: HTMLDivElement | null,
  globalFrame: PageFrameSettings,
): BookPageData {
  if (page.kind !== 'content') return page
  const sz = readDrawableSizeFromPageSurface(
    surface,
    effectivePageFrame(page, globalFrame),
  )
  let next: BookPageData = {
    ...page,
    characters: [...getPageCharacters(page)],
    textBoxes: [...getPageTextBoxes(page)],
  }
  let tx = dx
  let ty = dy

  if (sz) {
    const frame = effectivePageFrame(page, globalFrame)
    const rects: Array<{ x: number; y: number; w: number; h: number }> = []
    if (snap.characters?.length) {
      for (const ch of snap.characters) {
        const live = next.characters[ch.index]
        if (!live) continue
        const dims = characterPlacementBounds(
          {
            widthPx: ch.widthPx ?? live.widthPx,
            heightPx: ch.heightPx ?? live.heightPx,
          },
          sz.cw,
        )
        rects.push({ x: ch.x, y: ch.y, w: dims.w, h: dims.h })
      }
    }
    if (snap.textBoxes?.length) {
      for (const tb of snap.textBoxes) {
        rects.push({
          x: tb.x,
          y: tb.y,
          w: tb.widthPx,
          h: tb.heightPx,
        })
      }
    }
    if (snap.thoughtBubble) {
      rects.push({
        x: snap.thoughtBubble.x,
        y: snap.thoughtBubble.y,
        w: snap.thoughtBubble.widthPx,
        h: snap.thoughtBubble.heightPx,
      })
    }
    if (snap.shapes?.length) {
      for (const sh of snap.shapes) {
        rects.push({
          x: sh.x,
          y: sh.y,
          w: sh.widthPx,
          h: sh.heightPx,
        })
      }
    }
    if (rects.length > 0) {
      const left = Math.min(...rects.map((r) => r.x))
      const top = Math.min(...rects.map((r) => r.y))
      const right = Math.max(...rects.map((r) => r.x + r.w))
      const bottom = Math.max(...rects.map((r) => r.y + r.h))
      const clamped = clampRectToPageFromSafeCoords(
        left + tx,
        top + ty,
        right - left,
        bottom - top,
        sz.cw,
        sz.ch,
        frame,
      )
      tx = clamped.x - left
      ty = clamped.y - top
    }
  }

  if (snap.characters?.length) {
    const byIndex = new Map(snap.characters.map((c) => [c.index, c]))
    next = {
      ...next,
      characters: next.characters.map((ch, i) => {
        const snapCh = byIndex.get(i)
        if (!snapCh) return ch
        const nx = snapCh.x + tx
        const ny = snapCh.y + ty
        const { x, y } =
          sz == null
            ? { x: nx, y: ny }
            : (() => {
                const dims = characterPlacementBounds(
                  {
                    widthPx: snapCh.widthPx ?? ch.widthPx,
                    heightPx: snapCh.heightPx ?? ch.heightPx,
                  },
                  sz.cw,
                )
                return clampRectToPageFromSafeCoords(
                  nx,
                  ny,
                  dims.w,
                  dims.h,
                  sz.cw,
                  sz.ch,
                  effectivePageFrame(page, globalFrame),
                )
              })()
        return { ...ch, x, y }
      }),
    }
  }
  if (snap.textBoxes?.length) {
    const byIndex = new Map(snap.textBoxes.map((t) => [t.index, t]))
    next = {
      ...next,
      textBoxes: next.textBoxes.map((tb, i) => {
        const snapTb = byIndex.get(i)
        if (!snapTb) return tb
        const nx = snapTb.x + tx
        const ny = snapTb.y + ty
        const c = sz
          ? clampTextBoxRect(nx, ny, tb.widthPx, tb.heightPx, sz.cw, sz.ch)
          : { x: nx, y: ny, widthPx: tb.widthPx, heightPx: tb.heightPx }
        return {
          ...tb,
          pagePlacement: 'free' as const,
          x: c.x,
          y: c.y,
          widthPx: c.widthPx,
          heightPx: c.heightPx,
        }
      }),
    }
  }
  if (snap.thoughtBubble && next.thoughtBubble) {
    const tb = next.thoughtBubble
    const nx = snap.thoughtBubble.x + tx
    const ny = snap.thoughtBubble.y + ty
    const c = sz
      ? {
          ...clampTextBoxRect(nx, ny, tb.widthPx, tb.heightPx, sz.cw, sz.ch),
          ...clampRectToPageFromSafeCoords(
            nx,
            ny,
            tb.widthPx,
            tb.heightPx,
            sz.cw,
            sz.ch,
            effectivePageFrame(page, globalFrame),
          ),
        }
      : {
          x: nx,
          y: ny,
          widthPx: tb.widthPx,
          heightPx: tb.heightPx,
        }
    next = {
      ...next,
      thoughtBubble: {
        ...tb,
        x: c.x,
        y: c.y,
        widthPx: c.widthPx,
        heightPx: c.heightPx,
      },
    }
  }
  if (snap.shapes?.length) {
    const byIndex = new Map(snap.shapes.map((s) => [s.index, s]))
    next = {
      ...next,
      shapes: next.shapes.map((s, i) => {
        const sh = byIndex.get(i)
        if (!sh) return s
        const nx = sh.x + tx
        const ny = sh.y + ty
        const c = sz
          ? clampRectToPageFromSafeCoords(
              nx,
              ny,
              s.widthPx,
              s.heightPx,
              sz.cw,
              sz.ch,
              effectivePageFrame(page, globalFrame),
            )
          : { x: nx, y: ny }
        return {
          ...s,
          x: c.x,
          y: c.y,
        }
      }),
    }
  }
  return next
}
