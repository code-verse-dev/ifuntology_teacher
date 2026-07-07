import type { BookPageData } from '../types/bookPage'

export type BuilderDraftPayload = {
  pages?: BookPageData[] | null
  paperSize?: unknown
  pageFrame?: unknown
}

export function parseBuilderDraftResponse(json: unknown): BuilderDraftPayload {
  if (!json || typeof json !== 'object') return {}
  const o = json as Record<string, unknown>
  if (Array.isArray(o.pages) || o.pages === null) {
    return o as BuilderDraftPayload
  }
  const data = o.data
  if (data && typeof data === 'object') {
    const d = data as Record<string, unknown>
    if (Array.isArray(d.pages) || d.pages === null) {
      return d as BuilderDraftPayload
    }
  }
  return {}
}
