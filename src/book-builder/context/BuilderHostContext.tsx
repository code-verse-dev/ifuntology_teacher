import { createContext, useContext, useEffect, type ReactNode } from 'react'
import {
  BUILDER_DEFAULT_FETCH_INIT,
  setRuntimeAssetOrigin,
  setRuntimeFetchInit,
} from '../lib/api'

export type BuilderPageExportPayload = {
  pagesHtml: string[]
  widthPx: number
  heightPx: number
  pageCount: number
  wordCount: number
  /** Stylesheet hrefs for fonts used on pages (CDN + /fonts/). */
  fontStylesheetUrls?: string[]
}

export type BuilderHostConfig = {
  /** When set, draft load/save use per-book API paths instead of the global admin draft. */
  bookId?: string
  draftGetPath?: string
  draftPutPath?: string
  fetchInit?: RequestInit
  /**
   * When set (student portal), each manual Save also exports/overwrites the book PDF on the server.
   * Submit for review then uses that PDF from My Books.
   */
  exportPdfOnSave?: (payload: BuilderPageExportPayload) => Promise<void>
  backHref?: string
  /** Optional router state when navigating via `backHref`. */
  backState?: Record<string, unknown>
  /** Book builder page (return from character composer). Default `/builder`. */
  builderHref?: string
  /** Character composer page. Default `/builder/character`. */
  characterHref?: string
  /** API origin for images/uploads (e.g. `http://localhost:3030`). */
  assetOrigin?: string
}

const BuilderHostContext = createContext<BuilderHostConfig | null>(null)

export function BuilderHostProvider({
  value,
  children,
}: {
  value: BuilderHostConfig
  children: ReactNode
}) {
  useEffect(() => {
    setRuntimeAssetOrigin(value.assetOrigin ?? null)
    setRuntimeFetchInit(value.fetchInit ?? BUILDER_DEFAULT_FETCH_INIT)
    return () => {
      setRuntimeAssetOrigin(null)
      setRuntimeFetchInit(undefined)
    }
  }, [value.assetOrigin])

  return (
    <BuilderHostContext.Provider value={value}>
      {children}
    </BuilderHostContext.Provider>
  )
}

export function useBuilderHost(): BuilderHostConfig | null {
  return useContext(BuilderHostContext)
}
