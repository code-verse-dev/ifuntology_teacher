import { buildBookTocLines } from '../lib/bookTocLines'
import type { GlobalFont } from '../types/globalFont'
import type { TocStyle } from '../types/tocStyle'

const SAMPLE_LABELS = ['Chapter one', 'Chapter two', 'Chapter three']

function embedFont(p: {
  id: string
  label: string
  stylesheetUrl: string
  fontFamily: string
  extraCss?: string
}): GlobalFont {
  return {
    id: p.id,
    label: p.label,
    stylesheetUrl: p.stylesheetUrl,
    fontFamily: p.fontFamily,
    extraCss: p.extraCss ?? '',
  }
}

function makePreset(
  id: string,
  label: string,
  font: GlobalFont,
  opts: {
    leader: 'none' | 'dots'
    level1Format: string
    extraCss?: string
  },
): TocStyle {
  const style: TocStyle = {
    id,
    label,
    globalFontId: font.id,
    font,
    depth: 1,
    leader: opts.leader,
    level1Format: opts.level1Format,
    level2Format: 'none',
    level3Format: 'none',
    separator: '.',
    extraCss: opts.extraCss ?? '',
    previewLines: [],
  }
  style.previewLines = buildBookTocLines(SAMPLE_LABELS, style)
  return style
}

/** Built-in TOC looks for the book builder (no admin / DB templates). */
export const BOOK_TOC_PRESETS: TocStyle[] = [
  makePreset(
    'preset-classic-dots',
    'Classic — numbers & dot leaders',
    embedFont({
      id: 'embed-roboto',
      label: 'Roboto',
      stylesheetUrl: 'https://fonts.cdnfonts.com/css/roboto',
      fontFamily: "'Roboto', sans-serif",
    }),
    { leader: 'dots', level1Format: 'decimal' },
  ),
  makePreset(
    'preset-minimal',
    'Minimal — plain numbers',
    embedFont({
      id: 'embed-open-sans',
      label: 'Open Sans',
      stylesheetUrl: 'https://fonts.cdnfonts.com/css/open-sans',
      fontFamily: "'Open Sans', sans-serif",
    }),
    { leader: 'none', level1Format: 'decimal' },
  ),
  makePreset(
    'preset-serif-roman',
    'Formal — roman numerals',
    embedFont({
      id: 'embed-times',
      label: 'Times New Roman',
      stylesheetUrl: 'https://fonts.cdnfonts.com/css/times-new-roman',
      fontFamily: "'Times New Roman', serif",
    }),
    { leader: 'dots', level1Format: 'lower_roman', extraCss: 'letter-spacing: 0.02em;' },
  ),
  makePreset(
    'preset-display-alpha',
    'Display — ABC style',
    embedFont({
      id: 'embed-bebas',
      label: 'Bebas Neue',
      stylesheetUrl: 'https://fonts.cdnfonts.com/css/bebas-neue',
      fontFamily: "'Bebas Neue', sans-serif",
    }),
    { leader: 'none', level1Format: 'upper_alpha' },
  ),
  makePreset(
    'preset-local-graduate-dots',
    'Graduate Local — dotted',
    embedFont({
      id: 'embed-local-graduate',
      label: 'Graduate Regular (Local)',
      stylesheetUrl: '/fonts/style.css',
      fontFamily: "'Graduate Regular', serif",
    }),
    { leader: 'dots', level1Format: 'decimal', extraCss: 'letter-spacing: 0.01em;' },
  ),
  makePreset(
    'preset-clean-roman',
    'Clean Serif — roman',
    embedFont({
      id: 'embed-roboto-slab',
      label: 'Roboto Slab',
      stylesheetUrl: 'https://fonts.cdnfonts.com/css/roboto-slab-2?styles=170885,15350,15351,30177,15349,15348',
      fontFamily: "'Roboto Slab', serif",
    }),
    { leader: 'dots', level1Format: 'upper_roman' },
  ),
  makePreset(
    'preset-modern-condensed',
    'Modern Condensed — plain',
    embedFont({
      id: 'embed-roboto-condensed',
      label: 'Roboto Condensed',
      stylesheetUrl: 'https://fonts.cdnfonts.com/css/roboto-condensed',
      fontFamily: "'Roboto Condensed', sans-serif",
    }),
    { leader: 'none', level1Format: 'decimal' },
  ),
  makePreset(
    'preset-playful-lower-alpha',
    'Playful — lowercase letters',
    embedFont({
      id: 'embed-baloo',
      label: 'Baloo',
      stylesheetUrl: 'https://fonts.cdnfonts.com/css/baloo',
      fontFamily: "'Baloo', sans-serif",
    }),
    { leader: 'dots', level1Format: 'lower_alpha' },
  ),
]

export const DEFAULT_BOOK_TOC_PRESET = BOOK_TOC_PRESETS[0]

export function findTocPresetById(id: string): TocStyle | undefined {
  return BOOK_TOC_PRESETS.find((p) => p.id === id)
}
