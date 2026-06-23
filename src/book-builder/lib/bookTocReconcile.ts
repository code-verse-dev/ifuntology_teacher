import type { BookPageData } from '../types/bookPage'
import { countTocPagesNeeded } from './bookTocFlatten'

export function getTocBlockIndices(
  pages: BookPageData[],
  rootIndex: number,
): number[] {
  const root = pages[rootIndex]
  if (!root || root.kind !== 'toc' || !root.tocData || root.tocRootId) {
    return [rootIndex]
  }
  const indices: number[] = [rootIndex]
  for (let j = rootIndex + 1; j < pages.length; j++) {
    const p = pages[j]
    if (p.kind === 'toc' && p.tocRootId === root.id) indices.push(j)
    else break
  }
  return indices
}

export function getTocBlockRange(
  pages: BookPageData[],
  activeIndex: number,
): { rootIndex: number; start: number; end: number } | null {
  const p = pages[activeIndex]
  if (!p || p.kind !== 'toc') return null
  let rootIndex = activeIndex
  if (p.tocRootId) {
    const ri = pages.findIndex((x) => x.id === p.tocRootId)
    if (ri < 0) return null
    rootIndex = ri
  }
  const block = getTocBlockIndices(pages, rootIndex)
  return {
    rootIndex,
    start: block[0],
    end: block[block.length - 1],
  }
}

function makeContinuationPage(
  root: BookPageData,
  newPageId: () => string,
  indexInBlock: number,
): BookPageData {
  return {
    id: newPageId(),
    label:
      indexInBlock === 1
        ? `${root.label} (continued)`
        : `${root.label} (cont. ${indexInBlock})`,
    fill: root.fill,
    characters: [],
    thoughtBubble: null,
    shapes: [],
    textBox: null,
    kind: 'toc',
    tocStyle: root.tocStyle,
    tocData: null,
    tocRootId: root.id,
  }
}

/**
 * Ensures each root TOC has the right number of continuation pages immediately after it.
 * Skips stray continuation rows (rebuilt from root). Preserves non-TOC order otherwise.
 */
export function reconcileTocContinuationPages(
  pages: BookPageData[],
  newPageId: () => string,
): BookPageData[] {
  const out: BookPageData[] = []
  let i = 0
  while (i < pages.length) {
    const p = pages[i]
    if (p.kind === 'toc' && p.tocData && !p.tocRootId) {
      const root = p
      const tocData = p.tocData
      const blockIndices = getTocBlockIndices(pages, i)
      const existingCont = blockIndices.slice(1).map((idx) => pages[idx])
      const needed = countTocPagesNeeded(tocData.entries)

      out.push(root)

      for (let k = 1; k < needed; k++) {
        const existing = existingCont[k - 1]
        if (existing) {
          out.push({
            ...existing,
            tocStyle: root.tocStyle,
            tocRootId: root.id,
            tocData: null,
            kind: 'toc',
            fill: existing.fill ?? root.fill,
            thoughtBubble: existing.thoughtBubble ?? null,
            textBox: existing.textBox ?? null,
          })
        } else {
          out.push(makeContinuationPage(root, newPageId, k))
        }
      }

      i = blockIndices[blockIndices.length - 1] + 1
      continue
    }

    if (p.kind === 'toc' && p.tocRootId) {
      i++
      continue
    }

    out.push(p)
    i++
  }
  return out
}
