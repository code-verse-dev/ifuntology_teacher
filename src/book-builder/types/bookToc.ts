/** One row in the table of contents (optional nested sub-items). */
export type TocEntry = {
  id: string
  title: string
  /** Display page number(s), e.g. "1", "12", "iii". */
  pageNumber: string
  children: TocEntry[]
}

/** Editable TOC content stored on the root TOC page only. */
export type TocPageData = {
  heading: string
  entries: TocEntry[]
}
