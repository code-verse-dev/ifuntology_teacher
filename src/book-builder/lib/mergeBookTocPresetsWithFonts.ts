import { BOOK_TOC_PRESETS } from '../data/bookTocPresets'
import { buildBookTocLines } from './bookTocLines'
import type { GlobalFont } from '../types/globalFont'
import type { TocStyle } from '../types/tocStyle'

const SAMPLE_LABELS = ['Chapter one', 'Chapter two', 'Chapter three']

/**
 * When a global font’s stylesheet URL matches a built-in preset, the DB row
 * (including TOC typography) replaces the preset’s embedded font in the builder.
 */
export function mergeBookTocPresetsWithDbFonts(
  dbFonts: GlobalFont[],
): TocStyle[] {
  return BOOK_TOC_PRESETS.map((preset) => {
    const match = dbFonts.find(
      (f) =>
        f.stylesheetUrl.trim().toLowerCase() ===
        preset.font.stylesheetUrl.trim().toLowerCase(),
    )
    if (!match) {
      return preset
    }
    const merged: TocStyle = {
      ...preset,
      globalFontId: match.id,
      font: { ...match },
      previewLines: [],
    }
    merged.previewLines = buildBookTocLines(SAMPLE_LABELS, merged)
    return merged
  })
}

export function findMergedTocPreset(
  presets: TocStyle[],
  id: string,
): TocStyle | undefined {
  return presets.find((p) => p.id === id)
}
