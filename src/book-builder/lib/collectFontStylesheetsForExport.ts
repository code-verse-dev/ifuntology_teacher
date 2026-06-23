import type { BookPageData } from '../types/bookPage'
import type { GlobalFont } from '../types/globalFont'

/** Unique stylesheet URLs used on the book (TOC + text boxes) for PDF/export rendering. */
export function collectFontStylesheetsForExport(
  pages: BookPageData[],
  fonts: GlobalFont[],
): string[] {
  const urls = new Set<string>()
  for (const p of pages) {
    if (p.kind === 'toc') {
      const href = p.tocStyle?.font?.stylesheetUrl?.trim()
      if (href) urls.add(href)
    } else if (p.textBox?.globalFontId) {
      const f = fonts.find((x) => x.id === p.textBox!.globalFontId)
      const href = f?.stylesheetUrl?.trim()
      if (href) urls.add(href)
    }
  }
  return [...urls]
}
