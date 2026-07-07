import type { GlobalFont } from './globalFont'

export type TocLevelFormat =
  | 'decimal'
  | 'lower_alpha'
  | 'upper_alpha'
  | 'lower_alpha_double'
  | 'lower_roman'
  | 'upper_roman'
  | 'none'

export type TocStyle = {
  id: string
  label: string
  globalFontId: string
  font: GlobalFont
  depth: 1 | 2 | 3
  leader: 'none' | 'dots'
  level1Format: string
  level2Format: string
  level3Format: string
  separator: string
  extraCss: string
  previewLines: string[]
  createdAt?: string
}

export const TOC_LEVEL_OPTIONS: { value: TocLevelFormat; label: string }[] = [
  { value: 'decimal', label: '1, 2, 3' },
  { value: 'lower_alpha', label: 'a, b, c' },
  { value: 'upper_alpha', label: 'A, B, C' },
  { value: 'lower_alpha_double', label: 'aa, bb, cc' },
  { value: 'lower_roman', label: 'i, ii, iii' },
  { value: 'upper_roman', label: 'I, II, III' },
  { value: 'none', label: '— (no number)' },
]
