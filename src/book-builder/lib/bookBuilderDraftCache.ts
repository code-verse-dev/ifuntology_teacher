import type { BookPageData } from '../types/bookPage'
import type { BookPaperSize } from '../types/paperSize'
import type { PageFrameSettings } from '../types/pageFrame'

export type BuilderDraftSnapshot = {
  pages: BookPageData[]
  paperSize: BookPaperSize
  pageFrame: PageFrameSettings
  savedAt: number
}

function storageKey(bookId: string): string {
  return `ifuntology.builderDraft.${bookId}`
}

export function writeBuilderDraftCache(
  bookId: string,
  snapshot: Omit<BuilderDraftSnapshot, 'savedAt'>,
): void {
  if (!bookId) return
  try {
    const payload: BuilderDraftSnapshot = {
      ...snapshot,
      savedAt: Date.now(),
    }
    sessionStorage.setItem(storageKey(bookId), JSON.stringify(payload))
  } catch {
    /* quota / private mode */
  }
}

export function readBuilderDraftCache(bookId: string): BuilderDraftSnapshot | null {
  if (!bookId) return null
  try {
    const raw = sessionStorage.getItem(storageKey(bookId))
    if (!raw) return null
    const parsed = JSON.parse(raw) as BuilderDraftSnapshot
    if (!parsed?.pages?.length) return null
    return parsed
  } catch {
    return null
  }
}

export function clearBuilderDraftCache(bookId: string): void {
  if (!bookId) return
  try {
    sessionStorage.removeItem(storageKey(bookId))
  } catch {
    /* ignore */
  }
}
