import type { PageFill } from './background'
import type { TocPageData } from './bookToc'
import type { TocStyle } from './tocStyle'
import {
  normalizePageFrameSettings,
  type PageFrameSettings,
} from './pageFrame'

/** Elements on a content page that can be multi-selected / grouped. */
export type CanvasSelectableKind = 'character' | 'textBox' | 'thoughtBubble'

export const DEFAULT_CANVAS_ELEMENT_OPACITY = 1

/** 0–1 opacity for placed canvas elements (characters, shapes, thought bubbles). */
export function normalizeCanvasElementOpacity(raw: unknown): number {
  if (typeof raw === 'number' && Number.isFinite(raw)) {
    return Math.min(1, Math.max(0, raw))
  }
  return DEFAULT_CANVAS_ELEMENT_OPACITY
}

export type PlacedCharacter = {
  selection: Record<string, string | null>
  layerOrder?: string[]
  layerVisibility?: Record<string, boolean>
  x: number
  y: number
  /** Explicit box size on the page (CSS px). When omitted, UI uses paper-relative defaults. */
  widthPx?: number
  heightPx?: number
  rotationDeg?: number
  /** 0–1; omitted = fully opaque. */
  opacity?: number
  /** Same id on other page elements = they move together when dragged. */
  groupId?: string
}

/** Normalize legacy or partial character payloads from drafts / clipboard. */
export function normalizePlacedCharacter(
  raw: unknown,
  defaultSize: { w: number; h: number },
): PlacedCharacter | null {
  if (raw == null || raw === false) return null
  if (typeof raw !== 'object') return null
  const o = raw as Partial<PlacedCharacter>
  if (!o.selection || typeof o.selection !== 'object') return null
  const sel: Record<string, string | null> = {}
  for (const [key, val] of Object.entries(o.selection)) {
    sel[key] = typeof val === 'string' ? val : null
  }
  const layerOrder = Array.isArray(o.layerOrder)
    ? o.layerOrder.filter((id): id is string => typeof id === 'string')
    : undefined
  const layerVisibilityRaw =
    o.layerVisibility && typeof o.layerVisibility === 'object'
      ? o.layerVisibility
      : undefined
  const layerVisibility: Record<string, boolean> | undefined = layerVisibilityRaw
    ? Object.fromEntries(
        Object.entries(layerVisibilityRaw)
          .filter(([k]) => typeof k === 'string')
          .map(([k, v]) => [k, Boolean(v)]),
      )
    : undefined
  const clampN = (n: number, lo: number, hi: number) =>
    Math.min(hi, Math.max(lo, n))
  const w =
    typeof o.widthPx === 'number' && Number.isFinite(o.widthPx) && o.widthPx > 0
      ? clampN(Math.round(o.widthPx), 48, 900)
      : defaultSize.w
  const h =
    typeof o.heightPx === 'number' && Number.isFinite(o.heightPx) && o.heightPx > 0
      ? clampN(Math.round(o.heightPx), 48, 900)
      : defaultSize.h
  const rotationDeg =
    typeof o.rotationDeg === 'number' && Number.isFinite(o.rotationDeg)
      ? clampN(Math.round(o.rotationDeg), -180, 180)
      : 0
  const groupId =
    typeof o.groupId === 'string' && o.groupId.trim().length > 0
      ? o.groupId.trim()
      : undefined
  const x = typeof o.x === 'number' && Number.isFinite(o.x) ? o.x : 0
  const y = typeof o.y === 'number' && Number.isFinite(o.y) ? o.y : 0
  const opacity = normalizeCanvasElementOpacity(o.opacity)
  return {
    selection: sel,
    ...(layerOrder ? { layerOrder } : {}),
    ...(layerVisibility ? { layerVisibility } : {}),
    x,
    y,
    widthPx: w,
    heightPx: h,
    rotationDeg,
    ...(opacity < DEFAULT_CANVAS_ELEMENT_OPACITY ? { opacity } : {}),
    ...(groupId ? { groupId } : {}),
  }
}

/** Standalone thought-bubble image on a content page (not part of the text box). */
export type PlacedThoughtBubble = {
  imageUrl: string
  x: number
  y: number
  widthPx: number
  heightPx: number
  /** Solid fill for mask-based SVG tint (`#rrggbb`). Omit to show original colors. */
  tintColor?: string
  /** 0–1; omitted = fully opaque. */
  opacity?: number
  groupId?: string
}

export type ShapeKind =
  | 'rectangle'
  | 'ellipse'
  | 'triangle'
  | 'diamond'
  | 'pentagon'
  | 'hexagon'
  | 'octagon'
  | 'star'
  | 'heart'
  | 'chevronRight'
  | 'arrowRight'
  | 'parallelogram'
  | 'trapezoid'
  | 'image'

export type PlacedShape = {
  kind: ShapeKind
  imageUrl?: string
  x: number
  y: number
  widthPx: number
  heightPx: number
  rotationDeg: number
  fillColor: string
  borderColor: string
  borderWidth: number
  /** 0–1; omitted = fully opaque. */
  opacity?: number
  groupId?: string
}

export function createDefaultPlacedShape(
  kind: ShapeKind = 'rectangle',
  imageUrl?: string,
): PlacedShape {
  const size =
    kind === 'image'
      ? { widthPx: 180, heightPx: 120 }
      : { widthPx: 140, heightPx: 140 }
  return {
    kind,
    ...(imageUrl ? { imageUrl } : {}),
    x: 36,
    y: 92,
    widthPx: size.widthPx,
    heightPx: size.heightPx,
    rotationDeg: 0,
    fillColor: '#000000',
    borderColor: '#1f2937',
    borderWidth: 0,
  }
}

export function normalizePlacedShape(raw: unknown): PlacedShape | null {
  if (!raw || typeof raw !== 'object') return null
  const s = raw as Partial<PlacedShape>
  const allowed: ShapeKind[] = [
    'rectangle',
    'ellipse',
    'triangle',
    'diamond',
    'pentagon',
    'hexagon',
    'octagon',
    'star',
    'heart',
    'chevronRight',
    'arrowRight',
    'parallelogram',
    'trapezoid',
    'image',
  ]
  const kind: ShapeKind = allowed.includes(s.kind as ShapeKind)
    ? (s.kind as ShapeKind)
    : 'rectangle'
  const fillColor =
    typeof s.fillColor === 'string' && s.fillColor.trim()
      ? s.fillColor.trim()
      : '#000000'
  const borderColor =
    typeof s.borderColor === 'string' && s.borderColor.trim()
      ? s.borderColor.trim()
      : '#1f2937'
  const opacity = normalizeCanvasElementOpacity(s.opacity)
  return {
    kind,
    ...(typeof s.imageUrl === 'string' && s.imageUrl.trim()
      ? { imageUrl: s.imageUrl.trim() }
      : {}),
    x: num(s.x, 36),
    y: num(s.y, 92),
    widthPx: num(s.widthPx, 180, 12, 900),
    heightPx: num(s.heightPx, 120, 12, 900),
    rotationDeg: num(s.rotationDeg, 0, -180, 180),
    fillColor,
    borderColor,
    borderWidth: num(s.borderWidth, 0, 0, 16),
    ...(opacity < DEFAULT_CANVAS_ELEMENT_OPACITY ? { opacity } : {}),
    ...(typeof (s as PlacedShape & { groupId?: unknown }).groupId === 'string' &&
    ((s as PlacedShape & { groupId: string }).groupId ?? '').trim().length > 0
      ? { groupId: (s as PlacedShape & { groupId: string }).groupId.trim() }
      : {}),
  }
}

function num(
  v: unknown,
  fallback: number,
  min?: number,
  max?: number,
): number {
  let n = typeof v === 'number' && Number.isFinite(v) ? v : fallback
  if (min != null) n = Math.max(min, n)
  if (max != null) n = Math.min(max, n)
  return n
}

export function createPlacedThoughtBubble(imageUrl: string): PlacedThoughtBubble {
  const u = imageUrl.trim()
  return {
    imageUrl: u,
    x: 28,
    y: 76,
    widthPx: 200,
    heightPx: 132,
  }
}

/** Normalize `<input type="color">` / stored values to `#rrggbb` for tint + mask. */
export function sanitizeThoughtBubbleTintColor(
  raw: unknown,
): string | undefined {
  if (typeof raw !== 'string') return undefined
  const s = raw.trim()
  if (!s) return undefined
  const m3 = /^#([0-9a-fA-F]{3})$/i.exec(s)
  if (m3) {
    const [r, g, b] = m3[1].split('')
    return `#${r}${r}${g}${g}${b}${b}`.toLowerCase()
  }
  const m68 = /^#([0-9a-fA-F]{6})([0-9a-fA-F]{2})?$/i.exec(s)
  if (m68) {
    return `#${m68[1]}`.toLowerCase()
  }
  return undefined
}

export function normalizePlacedThoughtBubble(
  raw: unknown,
): PlacedThoughtBubble | null {
  if (!raw || typeof raw !== 'object') return null
  const t = raw as Partial<PlacedThoughtBubble>
  const imageUrl =
    typeof t.imageUrl === 'string' && t.imageUrl.trim()
      ? t.imageUrl.trim()
      : ''
  if (!imageUrl) return null
  const tintColor = sanitizeThoughtBubbleTintColor(t.tintColor)
  const groupId =
    typeof (t as PlacedThoughtBubble & { groupId?: unknown }).groupId ===
      'string' &&
    (t as PlacedThoughtBubble & { groupId: string }).groupId.trim().length > 0
      ? (t as PlacedThoughtBubble & { groupId: string }).groupId.trim()
      : undefined
  const opacity = normalizeCanvasElementOpacity(t.opacity)
  return {
    imageUrl,
    x: num(t.x, 28),
    y: num(t.y, 76),
    widthPx: num(t.widthPx, 200, 48, 640),
    heightPx: num(t.heightPx, 132, 36, 480),
    ...(tintColor ? { tintColor } : {}),
    ...(opacity < DEFAULT_CANVAS_ELEMENT_OPACITY ? { opacity } : {}),
    ...(groupId ? { groupId } : {}),
  }
}

export const DEFAULT_TEXT_BOX_TEXT =
  'Your text here — edit in the panel or drag to move.'

export const DEFAULT_TEXT_BOX_WIDTH_PX = 220
export const DEFAULT_TEXT_BOX_HEIGHT_PX = 96

export const DEFAULT_TEXT_BOX_FONT_SIZE_PX = 13
export const DEFAULT_TEXT_BOX_FONT_WEIGHT = 400
export const DEFAULT_TEXT_BOX_COLOR = '#1e293b'
export const DEFAULT_TEXT_BOX_LINE_HEIGHT = 1.45
export const DEFAULT_TEXT_BOX_LETTER_SPACING_PX = 0
export const DEFAULT_TEXT_BOX_OPACITY = 1

export type TextBoxTextAlign = 'left' | 'center' | 'right' | 'justify'
export type TextBoxVerticalAlign = 'top' | 'middle' | 'bottom'
export type TextBoxFontStyle = 'normal' | 'italic'
export type TextBoxTextDecoration = 'none' | 'underline'
export type TextBoxTextTransform = 'none' | 'uppercase' | 'capitalize'

/** Position of the text box relative to the margin-safe area of the page. */
export type TextBoxPagePlacement =
  | 'free'
  | 'margin_top_left'
  | 'margin_top_center'
  | 'margin_top_right'
  | 'margin_center'
  | 'margin_bottom_left'
  | 'margin_bottom_center'
  | 'margin_bottom_right'
  | 'margin_fill'

const PAGE_PLACEMENTS: TextBoxPagePlacement[] = [
  'free',
  'margin_top_left',
  'margin_top_center',
  'margin_top_right',
  'margin_center',
  'margin_bottom_left',
  'margin_bottom_center',
  'margin_bottom_right',
  'margin_fill',
]

export type PlacedTextBox = {
  text: string
  globalFontId: string
  /** Optional speech bubble image (uploaded/admin library). */
  bubbleImageUrl?: string
  x: number
  y: number
  /** Box width in CSS pixels inside the page surface. */
  widthPx: number
  /** Box height in CSS pixels (scrolls if content overflows). */
  heightPx: number
  /** Local typography; overrides conflicting keys from global font extra CSS. */
  fontSizePx: number
  fontWeight: number
  color: string
  textAlign: TextBoxTextAlign
  verticalAlign: TextBoxVerticalAlign
  lineHeight: number
  letterSpacingPx: number
  fontStyle: TextBoxFontStyle
  textDecoration: TextBoxTextDecoration
  textTransform: TextBoxTextTransform
  /** 0.25–1 */
  opacity: number
  /** Lay out inside page margins; `free` uses x/y from drag. */
  pagePlacement: TextBoxPagePlacement
  groupId?: string
}

const ALIGNS: TextBoxTextAlign[] = ['left', 'center', 'right', 'justify']
const VALIGNS: TextBoxVerticalAlign[] = ['top', 'middle', 'bottom']

function clamp(n: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, n))
}

/** Fill in fields for older drafts or partial JSON. */
export function normalizePlacedTextBox(tb: PlacedTextBox): PlacedTextBox {
  const t = tb as PlacedTextBox & {
    widthPx?: number
    heightPx?: number
    fontSizePx?: number
    fontWeight?: number
    color?: string
    textAlign?: string
    verticalAlign?: string
    lineHeight?: number
    letterSpacingPx?: number
    fontStyle?: string
    textDecoration?: string
    textTransform?: string
    opacity?: number
  }
  const w =
    typeof t.widthPx === 'number' && Number.isFinite(t.widthPx) && t.widthPx > 0
      ? t.widthPx
      : DEFAULT_TEXT_BOX_WIDTH_PX
  const h =
    typeof t.heightPx === 'number' &&
    Number.isFinite(t.heightPx) &&
    t.heightPx > 0
      ? t.heightPx
      : DEFAULT_TEXT_BOX_HEIGHT_PX
  const fontSizePx =
    typeof t.fontSizePx === 'number' &&
    Number.isFinite(t.fontSizePx) &&
    t.fontSizePx > 0
      ? clamp(Math.round(t.fontSizePx), 8, 200)
      : DEFAULT_TEXT_BOX_FONT_SIZE_PX
  const fontWeight =
    typeof t.fontWeight === 'number' && Number.isFinite(t.fontWeight)
      ? clamp(Math.round(t.fontWeight / 100) * 100, 100, 900)
      : DEFAULT_TEXT_BOX_FONT_WEIGHT
  const color =
    typeof t.color === 'string' && t.color.trim().length > 0
      ? t.color.trim()
      : DEFAULT_TEXT_BOX_COLOR
  const textAlign = ALIGNS.includes(t.textAlign as TextBoxTextAlign)
    ? (t.textAlign as TextBoxTextAlign)
    : 'left'
  const verticalAlign = VALIGNS.includes(
    t.verticalAlign as TextBoxVerticalAlign,
  )
    ? (t.verticalAlign as TextBoxVerticalAlign)
    : 'top'
  const lineHeight =
    typeof t.lineHeight === 'number' &&
    Number.isFinite(t.lineHeight) &&
    t.lineHeight > 0
      ? clamp(t.lineHeight, 1, 3)
      : DEFAULT_TEXT_BOX_LINE_HEIGHT
  const letterSpacingPx =
    typeof t.letterSpacingPx === 'number' && Number.isFinite(t.letterSpacingPx)
      ? clamp(t.letterSpacingPx, -2, 12)
      : DEFAULT_TEXT_BOX_LETTER_SPACING_PX
  const fontStyle: TextBoxFontStyle =
    t.fontStyle === 'italic' ? 'italic' : 'normal'
  const textDecoration: TextBoxTextDecoration =
    t.textDecoration === 'underline' ? 'underline' : 'none'
  const textTransform: TextBoxTextTransform =
    t.textTransform === 'uppercase' || t.textTransform === 'capitalize'
      ? t.textTransform
      : 'none'
  const opacity =
    typeof t.opacity === 'number' && Number.isFinite(t.opacity)
      ? clamp(t.opacity, 0.25, 1)
      : DEFAULT_TEXT_BOX_OPACITY
  const pagePlacement = PAGE_PLACEMENTS.includes(
    t.pagePlacement as TextBoxPagePlacement,
  )
    ? (t.pagePlacement as TextBoxPagePlacement)
    : 'free'

  const groupId =
    typeof (t as PlacedTextBox & { groupId?: unknown }).groupId === 'string' &&
    (t as PlacedTextBox & { groupId: string }).groupId.trim().length > 0
      ? (t as PlacedTextBox & { groupId: string }).groupId.trim()
      : undefined

  return {
    ...tb,
    widthPx: w,
    heightPx: h,
    text: tb.text ?? '',
    fontSizePx,
    fontWeight,
    color,
    textAlign,
    verticalAlign,
    lineHeight,
    letterSpacingPx,
    fontStyle,
    textDecoration,
    textTransform,
    opacity,
    pagePlacement,
    bubbleImageUrl:
      typeof t.bubbleImageUrl === 'string' && t.bubbleImageUrl.trim().length > 0
        ? t.bubbleImageUrl.trim()
        : undefined,
    ...(groupId ? { groupId } : {}),
  }
}

/** New text box with defaults (positions on page are set by caller if needed). */
export function createDefaultPlacedTextBox(globalFontId: string): PlacedTextBox {
  return normalizePlacedTextBox({
    text: DEFAULT_TEXT_BOX_TEXT,
    globalFontId,
    bubbleImageUrl: undefined,
    x: 24,
    y: 72,
    widthPx: DEFAULT_TEXT_BOX_WIDTH_PX,
    heightPx: DEFAULT_TEXT_BOX_HEIGHT_PX,
    fontSizePx: DEFAULT_TEXT_BOX_FONT_SIZE_PX,
    fontWeight: DEFAULT_TEXT_BOX_FONT_WEIGHT,
    color: DEFAULT_TEXT_BOX_COLOR,
    textAlign: 'left',
    verticalAlign: 'top',
    lineHeight: DEFAULT_TEXT_BOX_LINE_HEIGHT,
    letterSpacingPx: DEFAULT_TEXT_BOX_LETTER_SPACING_PX,
    fontStyle: 'normal',
    textDecoration: 'none',
    textTransform: 'none',
    opacity: DEFAULT_TEXT_BOX_OPACITY,
    pagePlacement: 'free',
  })
}

/** Characters placed on a content page (multiple allowed). */
export function getPageCharacters(page: BookPageData): PlacedCharacter[] {
  if (page.kind !== 'content') return []
  if (page.characters?.length) return page.characters
  const legacy = (page as BookPageData & { character?: PlacedCharacter | null })
    .character
  return legacy ? [legacy] : []
}

export function normalizeContentPageCharacters(
  page: BookPageData,
  defaultSize: { w: number; h: number },
): BookPageData {
  if (page.kind !== 'content') return page
  const raw = page as BookPageData & {
    character?: unknown
    characters?: unknown
  }
  const list = Array.isArray(raw.characters)
    ? raw.characters
    : raw.character != null
      ? [raw.character]
      : []
  const characters = list
    .map((c) => normalizePlacedCharacter(c, defaultSize))
    .filter((c): c is PlacedCharacter => !!c)
  const { character: _legacy, ...rest } = raw
  return { ...rest, characters }
}

/** Text boxes on a content page (multiple allowed). */
export function getPageTextBoxes(page: BookPageData): PlacedTextBox[] {
  if (page.kind !== 'content') return []
  if (page.textBoxes?.length) return page.textBoxes
  const legacy = (page as BookPageData & { textBox?: PlacedTextBox | null })
    .textBox
  return legacy ? [legacy] : []
}

export function normalizeContentPageTextBoxes(page: BookPageData): BookPageData {
  if (page.kind !== 'content') return page
  const raw = page as BookPageData & {
    textBox?: unknown
    textBoxes?: unknown
  }
  const list = Array.isArray(raw.textBoxes)
    ? raw.textBoxes
    : raw.textBox != null
      ? [raw.textBox]
      : []
  const textBoxes = list
    .map((tb) => normalizePlacedTextBox(tb as PlacedTextBox))
    .filter((tb): tb is PlacedTextBox => !!tb)
  const { textBox: _legacy, ...rest } = raw
  return { ...rest, textBoxes }
}

export type BookPageData = {
  id: string
  label: string
  fill: PageFill
  /** Per-page frame; omitted or undefined uses book-level default. */
  pageFrame?: PageFrameSettings
  /** Placed character composites on content pages (multiple per page). */
  characters: PlacedCharacter[]
  /** SVG thought bubble on content pages; independent of `textBox`. */
  thoughtBubble: PlacedThoughtBubble | null
  /** Stretch/rotate custom shapes on content pages. */
  shapes: PlacedShape[]
  /** Free text boxes on content pages (multiple allowed); uses global fonts from admin. */
  textBoxes: PlacedTextBox[]
  kind: 'content' | 'toc'
  tocStyle: TocStyle | null
  /** Full TOC structure — only on the root TOC page of a block. */
  tocData: TocPageData | null
  /** Continuation sheets reference the root TOC page id. */
  tocRootId: string | null
  /**
   * Back-to-front paint order for character / textBox / thoughtBubble on content pages.
   * Omitted = character, then text box, then thought bubble (when each exists).
   */
  canvasLayerOrder?: CanvasSelectableKind[]
}

/** Older drafts stored bubble on `textBox.bubbleImageUrl`; move to `thoughtBubble`. */
export function migrateLegacyTextBoxBubble(page: BookPageData): BookPageData {
  if (page.kind !== 'content') return page
  const boxes = getPageTextBoxes(page)
  const idx = boxes.findIndex((tb) => tb.bubbleImageUrl?.trim())
  if (idx < 0 || page.thoughtBubble) return page
  const tb = boxes[idx]!
  const bubbleUrl = tb.bubbleImageUrl!.trim()
  const nb = normalizePlacedThoughtBubble({
    imageUrl: bubbleUrl,
    x: tb.x,
    y: tb.y,
    widthPx: tb.widthPx,
    heightPx: tb.heightPx,
  })
  if (!nb) return page
  const textBoxes = boxes.map((box, i) =>
    i === idx
      ? normalizePlacedTextBox({ ...box, bubbleImageUrl: undefined })
      : box,
  )
  return {
    ...page,
    thoughtBubble: nb,
    textBoxes,
  }
}

/** Resolved frame for a page (override or book default). */
export function effectivePageFrame(
  page: BookPageData,
  global: PageFrameSettings,
): PageFrameSettings {
  return normalizePageFrameSettings(page.pageFrame ?? global)
}
