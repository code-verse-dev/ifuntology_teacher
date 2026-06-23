export type PaperPresetMeta = {
  id: string
  label: string
  widthMm: number
  heightMm: number
}

/** Portrait trim sizes in millimeters. */
export const PAPER_PRESETS: PaperPresetMeta[] = [
  {
    id: 'letter',
    label: 'US Letter (8.5 × 11 in)',
    widthMm: 215.9,
    heightMm: 279.4,
  },
  {
    id: 'a4',
    label: 'A4 (210 × 297 mm)',
    widthMm: 210,
    heightMm: 297,
  },
  {
    id: 'a5',
    label: 'A5 (148 × 210 mm)',
    widthMm: 148,
    heightMm: 210,
  },
  {
    id: 'trade-6x9',
    label: 'Trade paperback (6 × 9 in)',
    widthMm: 152.4,
    heightMm: 228.6,
  },
  {
    id: 'digest-5.5x8.5',
    label: 'Digest (5.5 × 8.5 in)',
    widthMm: 139.7,
    heightMm: 215.9,
  },
  {
    id: 'royal',
    label: 'Royal (156 × 234 mm)',
    widthMm: 156,
    heightMm: 234,
  },
  {
    id: 'demi-4.25x7',
    label: 'Mass market (4.25 × 7 in)',
    widthMm: 107.95,
    heightMm: 177.8,
  },
]

export const DEFAULT_PAPER_PRESET_ID = 'letter'

export function findPaperPresetById(
  id: string,
): PaperPresetMeta | undefined {
  return PAPER_PRESETS.find((p) => p.id === id)
}
