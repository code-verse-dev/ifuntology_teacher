import type { TocEntry, TocPageData } from '../types/bookToc'

export type TocFlatRow = {
  id: string
  title: string
  pageNumber: string
  depth: number
}

/** Approximate max TOC text lines per physical page (tune for 8.5×11 preview). */
export const TOC_LINES_PER_PAGE = 22

export function newTocEntryId(): string {
  return typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `toc-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

export function flattenTocEntries(entries: TocEntry[], depth = 0): TocFlatRow[] {
  const out: TocFlatRow[] = []
  for (const e of entries) {
    out.push({
      id: e.id,
      title: e.title,
      pageNumber: e.pageNumber,
      depth,
    })
    if (e.children?.length) {
      out.push(...flattenTocEntries(e.children, depth + 1))
    }
  }
  return out
}

export function countTocPagesNeeded(
  entries: TocEntry[],
  linesPerPage = TOC_LINES_PER_PAGE,
): number {
  const n = flattenTocEntries(entries).length
  if (n === 0) return 1
  return Math.max(1, Math.ceil(n / linesPerPage))
}

/** Split flat rows into one array per physical TOC sheet. */
export function splitTocFlatIntoPages(
  flat: TocFlatRow[],
  linesPerPage = TOC_LINES_PER_PAGE,
): TocFlatRow[][] {
  if (flat.length === 0) return [[]]
  const pages: TocFlatRow[][] = []
  for (let i = 0; i < flat.length; i += linesPerPage) {
    pages.push(flat.slice(i, i + linesPerPage))
  }
  return pages
}

export function emptyTocPageData(heading = 'Contents'): TocPageData {
  return {
    heading,
    entries: [
      {
        id: newTocEntryId(),
        title: 'New section',
        pageNumber: '1',
        children: [],
      },
    ],
  }
}

export function seedTocDataFromContentPages(
  contentLabels: string[],
  heading = 'Contents',
): TocPageData {
  return {
    heading,
    entries: contentLabels.map((label, idx) => ({
      id: newTocEntryId(),
      title: label,
      pageNumber: String(idx + 1),
      children: [],
    })),
  }
}
