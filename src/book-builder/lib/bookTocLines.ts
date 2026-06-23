import type { TocStyle } from '../types/tocStyle'

/** Mirrors backend numbering for flat content-page lists. */
type TocLevelFormat =
  | 'decimal'
  | 'lower_alpha'
  | 'upper_alpha'
  | 'lower_alpha_double'
  | 'lower_roman'
  | 'upper_roman'
  | 'none'

const ROMAN_LOWER = [
  '',
  'i',
  'ii',
  'iii',
  'iv',
  'v',
  'vi',
  'vii',
  'viii',
  'ix',
  'x',
  'xi',
  'xii',
]

function toRoman(n: number, upper: boolean): string {
  if (n < 1 || n >= ROMAN_LOWER.length) return String(n)
  const s = ROMAN_LOWER[n] ?? String(n)
  return upper ? s.toUpperCase() : s
}

function toAlpha(n: number, upper: boolean): string {
  if (n < 1) return '?'
  let x = n
  let out = ''
  while (x > 0) {
    const r = (x - 1) % 26
    out = String.fromCharCode((upper ? 65 : 97) + r) + out
    x = Math.floor((x - 1) / 26)
  }
  return out
}

function toDoubleLowerAlpha(n: number): string {
  if (n < 1 || n > 26) return toAlpha(n, false)
  const c = String.fromCharCode(96 + n)
  return c + c
}

function formatLevel(fmt: TocLevelFormat, index: number): string {
  switch (fmt) {
    case 'none':
      return ''
    case 'decimal':
      return String(index)
    case 'lower_alpha':
      return toAlpha(index, false)
    case 'upper_alpha':
      return toAlpha(index, true)
    case 'lower_alpha_double':
      return toDoubleLowerAlpha(index)
    case 'lower_roman':
      return toRoman(index, false)
    case 'upper_roman':
      return toRoman(index, true)
    default:
      return String(index)
  }
}

/**
 * Builds one line per content page using the template’s level-1 style and leader.
 * (Book pages are a flat list; multi-level patterns apply to preview samples in admin.)
 */
export function buildBookTocLines(
  contentLabels: string[],
  style: TocStyle,
): string[] {
  const fmt = style.level1Format as TocLevelFormat
  const sep = (style.separator ?? '.').trim() || '.'
  const dots = style.leader === 'dots'
  return contentLabels.map((label, idx) => {
    const num = formatLevel(fmt, idx + 1)
    const body = num ? `${num}${sep} ${label}` : label
    return dots ? `${body}\u00A0\u00A0· · ·` : body
  })
}
