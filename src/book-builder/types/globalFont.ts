export type GlobalFont = {
  id: string
  label: string
  stylesheetUrl: string
  fontFamily: string
  extraCss: string
  /** Table of contents body text (book builder). CSS length, e.g. 0.88rem */
  tocFontSize?: string
  tocLineHeight?: string
  tocLetterSpacing?: string
  /** Vertical space between TOC rows, e.g. 0.45rem */
  tocRowGap?: string
  /** “Contents” title size, e.g. 1.25rem */
  tocHeadingFontSize?: string
  createdAt?: string
}
