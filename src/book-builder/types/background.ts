export type BackgroundKind = 'image' | 'color' | 'gradient'

export type BackgroundCatalogItem = {
  id: string
  kind: BackgroundKind
  label: string
  value: string
  /** Present when merged catalog includes per-user uploads from the API. */
  source?: 'global' | 'user'
}

/** Applied to a book page canvas */
export type PageFill =
  | null
  | { kind: 'image'; value: string; itemId?: string }
  | { kind: 'color'; value: string; itemId?: string }
  | { kind: 'gradient'; value: string; itemId?: string }
