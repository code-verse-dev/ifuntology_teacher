import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'
import { areJsonSnapshotsEqual, safeStructuredClone } from '@/utils/safeClone'
import { isIOS } from '@/utils/isIOS'
import {
  readBuilderDraftCache,
  stringifyBuilderDraftBody,
  writeBuilderDraftCache,
} from '../lib/bookBuilderDraftCache'
import { collectFontStylesheetsForExport } from '../lib/collectFontStylesheetsForExport'
import { clonePageHtmlForExport } from '../lib/exportPageHtml'
import { parseBuilderDraftResponse } from '../lib/parseBuilderDraftResponse'
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { Link, useLocation } from 'react-router-dom'
import { BookTocEditorPanel } from '../components/BookTocEditorPanel'
import { CharacterComposite } from '../components/CharacterComposite'
import { PageBackgroundModal } from '../components/PageBackgroundModal'
import { PagePaperSizeModal } from '../components/PagePaperSizeModal'
import type { PageSettingsTab } from '../components/PagePaperSizeModal'
import { BookTextBoxPanel } from '../components/BookTextBoxPanel'
import { BookThoughtBubblePanel } from '../components/BookThoughtBubblePanel'
import { BookCharacterPanel } from '../components/BookCharacterPanel'
import { BookShapePanel } from '../components/BookShapePanel'
import { ElementPickerModal } from '../components/ElementPickerModal'
import { SavedCharactersModal } from '../components/SavedCharactersModal'
import { PublicRasterIcon } from '../components/PublicRasterIcon'
import { ShapePickerModal } from '../components/ShapePickerModal'
import { TextBubblePickerModal } from '../components/TextBubblePickerModal'
import { BOOK_TOC_PRESETS, DEFAULT_BOOK_TOC_PRESET } from '../data/bookTocPresets'
import {
  BOOK_SIDEBAR_ICON_BUBBLE,
  BOOK_SIDEBAR_ICON_CHARACTER,
  BOOK_SIDEBAR_ICON_ELEMENT,
  BOOK_SIDEBAR_ICON_LAYERS,
  BOOK_SIDEBAR_ICON_PAGE_BACKGROUND,
  BOOK_SIDEBAR_ICON_SETTINGS,
  BOOK_SIDEBAR_ICON_SHAPE,
  BOOK_SIDEBAR_ICON_TEXT_BOX,
  BOOK_SIDEBAR_ICON_TOC,
} from '../lib/bookSidebarIcons'
import { useBuilderHost } from '../context/BuilderHostContext'
import {
  apiUrl,
  builderApiPath,
  assetUrl,
  builderFetch,
  readApiErrorMessage,
} from '../lib/api'
import {
  approximateDrawableSizePx,
  defaultPaperSize,
  dimensionsForPaper,
  paperSurfaceAspectStyle,
  parseDraftPaperSize,
} from '../lib/paperSize'
import {
  applyCanvasStackOp,
  defaultCanvasLayerOrder,
  effectiveCanvasLayerOrder,
  normalizeCanvasLayerOrder,
  resolveCanvasStackKeyTarget,
} from '../lib/canvasLayerOrder'
import {
  canvasPickKey,
  clientPointInPickTarget,
  collectCanvasPickStack,
  resolveCanvasPickIndex,
  type CanvasPickTarget,
  type PickCycleState,
} from '../lib/canvasLayerPick'
import { takePendingCharacterInsert } from '../lib/pendingCharacterInsert'
import {
  applyGroupTranslate,
  captureGroupDragSnap,
  type GroupDragSnap,
} from '../lib/canvasGroupDrag'
import {
  clampCharacterXY,
  clampRectToPageFromSafeCoords,
  clampTextBoxRect,
  characterOuterSize,
  characterPlacementBounds,
  pageFrameBorderStyle,
  pageFrameOuterMarginStyle,
  pageFramePaddingStyle,
  pageSafeInsetStyle,
  readDrawableSizeFromPageSurface,
} from '../lib/pageContentBounds'
import { pageFillStyle } from '../lib/pageFillStyle'
import { resolveTextBoxLayout } from '../lib/textBoxPagePlacement'
import type { PageFill } from '../types/background'
import type { CatalogCategory } from '../types/character'
import {
  emptyTocPageData,
  flattenTocEntries,
  seedTocDataFromContentPages,
  splitTocFlatIntoPages,
} from '../lib/bookTocFlatten'
import {
  getTocBlockIndices,
  getTocBlockRange,
  reconcileTocContinuationPages,
} from '../lib/bookTocReconcile'
import {
  findMergedTocPreset,
  mergeBookTocPresetsWithDbFonts,
} from '../lib/mergeBookTocPresetsWithFonts'
import { textBoxCanvasStyles } from '../lib/textBoxStyles'
import {
  ensureTocStylesheetLoaded,
  tocExtraCssToReactStyle,
  tocLayoutStyleFromFont,
} from '../lib/tocFontLinks'
import type { TocPageData } from '../types/bookToc'
import {
  createDefaultPlacedTextBox,
  createDefaultPlacedShape,
  effectivePageFrame,
  migrateLegacyTextBoxBubble,
  getPageCharacters,
  getPageTextBoxes,
  normalizeCanvasElementOpacity,
  normalizeContentPageCharacters,
  normalizeContentPageTextBoxes,
  normalizePlacedCharacter,
  normalizePlacedShape,
  normalizePlacedTextBox,
  normalizePlacedThoughtBubble,
  sanitizeThoughtBubbleTintColor,
  type BookPageData,
  type CanvasSelectableKind,
  type PlacedCharacter,
  type PlacedTextBox,
  type PlacedThoughtBubble,
  type PlacedShape,
} from '../types/bookPage'
import type { GlobalFont } from '../types/globalFont'
import type { BookPaperSize } from '../types/paperSize'
import {
  defaultPageFrameSettings,
  normalizePageFrameSettings,
  type PageFrameSettings,
} from '../types/pageFrame'
import type { TocStyle } from '../types/tocStyle'
import './book-builder.css'

export type { BookPageData } from '../types/bookPage'

const BOOK_TOOL_SIDEBAR_ICON_IMG = 'book-tool-sidebar__icon-img'

const CANVAS_PICK_IGNORE_SELECTOR =
  '.book-page__shape__resize-handle, .book-page__shape__rotate-handle, .book-page__character__resize-handle, .book-page__character__rotate-handle, .book-page__text-box__resize-handle, .book-page__thought-bubble__resize-handle, .book-page__shape-group-resize-handle'

function BookSidebarRasterIcon({
  candidates,
  fallback,
}: {
  candidates: string[]
  fallback: ReactNode
}) {
  return (
    <PublicRasterIcon
      candidates={candidates}
      className={BOOK_TOOL_SIDEBAR_ICON_IMG}
      fallback={fallback}
    />
  )
}

function IconToolPageBackground() {
  return (
    <svg
      width={28}
      height={28}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.65"
      strokeLinecap="round"
      strokeLinejoin="round"
      preserveAspectRatio="xMidYMid meet"
      aria-hidden
    >
      <rect x="5" y="3" width="14" height="18" rx="1.75" />
      <path
        d="M7 16l2.5-2.5 2 2L14 11l3 5"
        fill="none"
      />
      <circle cx="9.5" cy="9" r="1.25" fill="currentColor" stroke="none" />
    </svg>
  )
}

function IconToolToc() {
  return (
    <svg
      width={28}
      height={28}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.65"
      strokeLinecap="round"
      aria-hidden
    >
      <path d="M8 7h11M8 12h11M8 17h11" />
      <path d="M5 7h.01M5 12h.01M5 17h.01" />
    </svg>
  )
}

function IconToolTextBox() {
  return (
    <svg
      width={28}
      height={28}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.65"
      strokeLinecap="round"
      strokeLinejoin="round"
      preserveAspectRatio="xMidYMid meet"
      aria-hidden
    >
      <rect x="4.5" y="4" width="15" height="16" rx="2" />
      <path d="M7 7.5h10M7 12h10M7 16.5h6" />
    </svg>
  )
}

function IconToolBubble() {
  return (
    <svg
      width={28}
      height={28}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.65"
      strokeLinecap="round"
      strokeLinejoin="round"
      preserveAspectRatio="xMidYMid meet"
      aria-hidden
    >
      <path d="M7 6h10a3 3 0 0 1 3 3v4a3 3 0 0 1-3 3h-6l-4 3v-3H7a3 3 0 0 1-3-3V9a3 3 0 0 1 3-3Z" />
    </svg>
  )
}

function IconToolShape() {
  return (
    <svg
      width={28}
      height={28}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.65"
      strokeLinecap="round"
      strokeLinejoin="round"
      preserveAspectRatio="xMidYMid meet"
      aria-hidden
    >
      <rect x="3.5" y="3.5" width="7.5" height="7.5" rx="1.25" />
      <circle cx="17.2" cy="7.2" r="3.6" />
      <path d="M12 20.5h8.5l-4.25-7-4.25 7Z" />
    </svg>
  )
}

function IconToolElement() {
  return (
    <svg
      width={28}
      height={28}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.65"
      strokeLinecap="round"
      strokeLinejoin="round"
      preserveAspectRatio="xMidYMid meet"
      aria-hidden
    >
      <rect x="3.5" y="4.5" width="17" height="15" rx="2" />
      <circle cx="8.5" cy="9" r="1.4" fill="currentColor" stroke="none" />
      <path d="M5.5 16.5 10 12l2.75 2.6 2.25-2 3.5 3.9" />
    </svg>
  )
}

function IconToolLayers() {
  return (
    <svg
      width={28}
      height={28}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.65"
      strokeLinecap="round"
      strokeLinejoin="round"
      preserveAspectRatio="xMidYMid meet"
      aria-hidden
    >
      <path d="M12 4 3.5 8.5 12 13l8.5-4.5L12 4Z" />
      <path d="M3.5 12 12 16.5 20.5 12" />
      <path d="M3.5 15.5 12 20l8.5-4.5" />
    </svg>
  )
}

function IconToolCharacter() {
  return (
    <svg
      width={28}
      height={28}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      preserveAspectRatio="xMidYMid meet"
      aria-hidden
    >
      <circle cx="12" cy="8" r="3.2" />
      <path d="M5 20a7 7 0 0 1 14 0" />
    </svg>
  )
}

function IconToolSettings() {
  return (
    <svg
      width={28}
      height={28}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.65"
      strokeLinecap="round"
      strokeLinejoin="round"
      preserveAspectRatio="xMidYMid meet"
      aria-hidden
    >
      <circle cx="12" cy="12" r="2.6" />
      <path d="M19.4 15a1 1 0 0 0 .2 1.1l.03.03a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.03-.03a1 1 0 0 0-1.1-.2 1 1 0 0 0-.6.92V20a2 2 0 0 1-4 0v-.05a1 1 0 0 0-.6-.92 1 1 0 0 0-1.1.2l-.03.03a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.03-.03a1 1 0 0 0 .2-1.1 1 1 0 0 0-.92-.6H4a2 2 0 0 1 0-4h.05a1 1 0 0 0 .92-.6 1 1 0 0 0-.2-1.1L4.74 8a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.03.03a1 1 0 0 0 1.1.2h.02a1 1 0 0 0 .58-.92V4a2 2 0 0 1 4 0v.05a1 1 0 0 0 .6.92 1 1 0 0 0 1.1-.2l.03-.03a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.03.03a1 1 0 0 0-.2 1.1v.02a1 1 0 0 0 .92.58H20a2 2 0 0 1 0 4h-.05a1 1 0 0 0-.55.72z" />
    </svg>
  )
}

function IconSaveDraft() {
  return (
    <svg
      width={20}
      height={20}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M4 6.5A2.5 2.5 0 0 1 6.5 4h9.2L20 8.3V17.5A2.5 2.5 0 0 1 17.5 20h-11A2.5 2.5 0 0 1 4 17.5Z" />
      <path d="M8 4.5v5h7v-5" />
      <rect x="7.5" y="13" width="9" height="6" rx="1.2" />
    </svg>
  )
}

function BookPageTextBoxLayer({
  textBox,
  fonts,
}: {
  textBox: PlacedTextBox
  fonts: GlobalFont[]
}) {
  const gf = fonts.find((x) => x.id === textBox.globalFontId)
  const { outer, inner } = textBoxCanvasStyles(textBox, gf)
  return (
    <div className="book-page__text-box" style={outer}>
      <div className="book-page__text-box__inner" style={inner}>
        {textBox.text}
      </div>
    </div>
  )
}

function BookPageThoughtBubbleVisual({
  bubble,
}: {
  bubble: PlacedThoughtBubble
}) {
  const url = assetUrl(bubble.imageUrl)
  const tint = sanitizeThoughtBubbleTintColor(bubble.tintColor)
  const opacity = normalizeCanvasElementOpacity(bubble.opacity)
  const opacityStyle = opacity < 1 ? { opacity } : undefined
  if (tint) {
    const mask = `url(${JSON.stringify(url)})`
    return (
      <div
        className="book-page__thought-bubble-img book-page__thought-bubble-img--tinted"
        style={{
          width: '100%',
          height: '100%',
          WebkitMaskImage: mask,
          maskImage: mask,
          WebkitMaskSize: '100% 100%',
          maskSize: '100% 100%',
          WebkitMaskRepeat: 'no-repeat',
          maskRepeat: 'no-repeat',
          WebkitMaskPosition: 'center',
          maskPosition: 'center',
          backgroundColor: tint,
          ...opacityStyle,
        }}
        aria-hidden
      />
    )
  }
  return (
    <img
      className="book-page__thought-bubble-img"
      src={url}
      alt=""
      draggable={false}
      style={opacityStyle}
    />
  )
}

function BookPageShapeVisual({ shape }: { shape: PlacedShape }) {
  if (shape.kind === 'image' && shape.imageUrl) {
    return (
      <img
        src={assetUrl(shape.imageUrl)}
        alt=""
        className="book-page__shape-image book-page__shape-image--element"
        draggable={false}
      />
    )
  }

  const strokeWidth = Math.max(0, shape.borderWidth)
  const half = Math.min(24, strokeWidth / 2)
  const common = {
    fill: shape.fillColor,
    stroke: shape.borderColor,
    strokeWidth,
    vectorEffect: 'non-scaling-stroke' as const,
  }

  return (
    <svg
      viewBox="0 0 100 100"
      width="100%"
      height="100%"
      preserveAspectRatio="none"
      aria-hidden
    >
      {shape.kind === 'rectangle' ? (
        <rect x={half} y={half} width={100 - half * 2} height={100 - half * 2} {...common} />
      ) : null}
      {shape.kind === 'ellipse' ? (
        <ellipse cx="50" cy="50" rx={50 - half} ry={50 - half} {...common} />
      ) : null}
      {shape.kind === 'triangle' ? (
        <polygon points="50,2 3,98 97,98" {...common} />
      ) : null}
      {shape.kind === 'diamond' ? (
        <polygon points="50,2 98,50 50,98 2,50" {...common} />
      ) : null}
      {shape.kind === 'pentagon' ? (
        <polygon points="50,2 97,38 79,98 21,98 3,38" {...common} />
      ) : null}
      {shape.kind === 'hexagon' ? (
        <polygon points="24,2 76,2 98,50 76,98 24,98 2,50" {...common} />
      ) : null}
      {shape.kind === 'octagon' ? (
        <polygon points="30,2 70,2 98,30 98,70 70,98 30,98 2,70 2,30" {...common} />
      ) : null}
      {shape.kind === 'star' ? (
        <polygon
          points="50,2 61,35 98,35 68,57 79,94 50,73 21,94 32,57 2,35 39,35"
          {...common}
        />
      ) : null}
      {shape.kind === 'heart' ? (
        <path
          d="M50,92 C45,86 3,63 3,35 C3,18 17,8 31,8 C41,8 47,13 50,20 C53,13 59,8 69,8 C83,8 97,18 97,35 C97,63 55,86 50,92 Z"
          {...common}
        />
      ) : null}
      {shape.kind === 'chevronRight' ? (
        <polygon points="20,2 80,50 20,98 2,82 42,50 2,18" {...common} />
      ) : null}
      {shape.kind === 'arrowRight' ? (
        <polygon points="2,20 68,20 68,2 98,50 68,98 68,80 2,80" {...common} />
      ) : null}
      {shape.kind === 'parallelogram' ? (
        <polygon points="18,2 98,2 82,98 2,98" {...common} />
      ) : null}
      {shape.kind === 'trapezoid' ? (
        <polygon points="16,2 84,2 98,98 2,98" {...common} />
      ) : null}
    </svg>
  )
}

function BookTocSpreadView({
  page,
  pageIndex,
  pages,
}: {
  page: BookPageData
  pageIndex: number
  pages: BookPageData[]
}) {
  if (!page.tocStyle) return null
  const root = page.tocRootId
    ? pages.find((x) => x.id === page.tocRootId)
    : page
  const data = root?.tocData
  if (!data) return null
  const flat = flattenTocEntries(data.entries)
  const splits = splitTocFlatIntoPages(flat)
  const rootIdx = pages.findIndex((x) => x.id === root.id)
  if (rootIdx < 0) return null
  const block = getTocBlockIndices(pages, rootIdx)
  const idxInBlock = block.indexOf(pageIndex)
  if (idxInBlock < 0) return null
  const slice = splits[idxInBlock] ?? []
  const showHeading = idxInBlock === 0
  const dots = page.tocStyle.leader === 'dots'
  return (
    <div
      className="book-page__toc"
      style={{
        fontFamily: page.tocStyle.font.fontFamily,
        ...tocLayoutStyleFromFont(page.tocStyle.font),
        ...tocExtraCssToReactStyle(page.tocStyle.font.extraCss ?? ''),
        ...tocExtraCssToReactStyle(page.tocStyle.extraCss ?? ''),
      }}
    >
      {showHeading ? (
        <h2 className="book-page__toc-title">{data.heading}</h2>
      ) : null}
      <ul className="book-page__toc-list">
        {slice.map((row) => (
          <li
            key={row.id}
            className="book-page__toc-line"
            style={{ paddingLeft: `${row.depth * 1}rem` }}
          >
            <div
              className={
                'book-page__toc-line-inner' +
                (dots ? ' book-page__toc-line-inner--dots' : '')
              }
            >
              <span className="book-page__toc-line-title">{row.title}</span>
              {dots ? (
                <span className="book-page__toc-line-leader" aria-hidden />
              ) : null}
              <span className="book-page__toc-line-page">{row.pageNumber}</span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

function newPageId(): string {
  return typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`
}

/** First content page is always the cover; later content pages are Page 1, Page 2, … */
export const COVER_PAGE_LABEL = 'Cover page'

function defaultContentPageLabel(contentOrdinal: number): string {
  return contentOrdinal <= 0 ? COVER_PAGE_LABEL : `Page ${contentOrdinal}`
}

/** 0-based index among content pages only (TOC pages ignored). */
function contentOrdinalAt(pages: BookPageData[], pageIndex: number): number {
  let n = -1
  for (let i = 0; i <= pageIndex && i < pages.length; i++) {
    if (pages[i]?.kind === 'content') n++
  }
  return n
}

function createInitialPages(): BookPageData[] {
  return [
    {
      id: newPageId(),
      label: COVER_PAGE_LABEL,
      fill: null,
      characters: [],
      thoughtBubble: null,
      shapes: [],
      textBoxes: [],
      kind: 'content',
      tocStyle: null,
      tocData: null,
      tocRootId: null,
    },
  ]
}

function clonePagesSnapshot(pages: BookPageData[]): BookPageData[] {
  return safeStructuredClone(pages)
}

function arePagesSnapshotsEqual(a: BookPageData[], b: BookPageData[]): boolean {
  return areJsonSnapshotsEqual(a, b)
}

const TEXT_BOX_DRAG_PX = 5
const TEXT_BOX_MIN_W = 48
const TEXT_BOX_MIN_H = 36
const THOUGHT_BUBBLE_MIN_W = 40
const THOUGHT_BUBBLE_MIN_H = 36
const SHAPE_MIN_W = 12
const SHAPE_MIN_H = 12
const CHARACTER_MIN_W = 48
const CHARACTER_MIN_H = 48

function minScaleForGroupResize(opts: {
  shapes: Array<{ w: number; h: number }>
  textBoxes: Array<{ w: number; h: number }>
  thoughtBubble: { w: number; h: number } | null
  character: { w: number; h: number } | null
}): number {
  const { shapes, textBoxes, thoughtBubble, character } = opts
  const safe = (minDim: number, dim: number) => minDim / Math.max(1, dim)
  let m = 0
  for (const sh of shapes) {
    m = Math.max(m, safe(SHAPE_MIN_W, sh.w), safe(SHAPE_MIN_H, sh.h))
  }
  for (const tb of textBoxes) {
    m = Math.max(
      m,
      safe(TEXT_BOX_MIN_W, tb.w),
      safe(TEXT_BOX_MIN_H, tb.h),
    )
  }
  if (thoughtBubble) {
    m = Math.max(
      m,
      safe(THOUGHT_BUBBLE_MIN_W, thoughtBubble.w),
      safe(THOUGHT_BUBBLE_MIN_H, thoughtBubble.h),
    )
  }
  if (character) {
    m = Math.max(
      m,
      safe(CHARACTER_MIN_W, character.w),
      safe(CHARACTER_MIN_H, character.h),
    )
  }
  return m
}

const FALLBACK_GLOBAL_FONT: GlobalFont = {
  id: 'fallback-system-font',
  label: 'System Sans',
  stylesheetUrl: '',
  fontFamily: 'Inter, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
  extraCss: '',
}

export function BookBuilder() {
  const location = useLocation()
  const builderHost = useBuilderHost()
  const draftGetPath = builderHost?.draftGetPath ?? '/api/books/draft'
  const draftPutPath = builderHost?.draftPutPath ?? '/api/books/draft'
  const builderZoom = 1
  const [catalog, setCatalog] = useState<CatalogCategory[]>([])
  const [loadError, setLoadError] = useState<string | null>(null)
  const [bgModalOpen, setBgModalOpen] = useState(false)
  const [paperModalOpen, setPaperModalOpen] = useState(false)
  const [pageSettingsTab, setPageSettingsTab] = useState<PageSettingsTab>('size')
  const [pageSettingsScope, setPageSettingsScope] = useState<'global' | 'page'>('global')
  const [textBoxSelectedPageId, setTextBoxSelectedPageId] = useState<
    string | null
  >(null)
  const [textBoxSelectedIndex, setTextBoxSelectedIndex] = useState<
    number | null
  >(null)
  const [thoughtBubbleSelectedPageId, setThoughtBubbleSelectedPageId] =
    useState<string | null>(null)
  const [shapeSelectedPageId, setShapeSelectedPageId] = useState<string | null>(
    null,
  )
  const [characterSelectedPageId, setCharacterSelectedPageId] = useState<
    string | null
  >(null)
  const [characterSelectedIndex, setCharacterSelectedIndex] = useState<
    number | null
  >(null)
  const [shapeSelectedIndex, setShapeSelectedIndex] = useState<number | null>(null)
  const [shapeMultiSelection, setShapeMultiSelection] = useState<{
    pageId: string
    indices: number[]
  } | null>(null)
  const [shapePickerOpen, setShapePickerOpen] = useState(false)
  const [elementPickerOpen, setElementPickerOpen] = useState(false)
  const [savedCharactersModalOpen, setSavedCharactersModalOpen] = useState(false)
  const [layersOpen, setLayersOpen] = useState(false)
  const [layersDrag, setLayersDrag] = useState<{
    fromPos: number
  } | null>(null)
  const [layerGroupNames, setLayerGroupNames] = useState<Record<string, string>>({})
  const [layersGroupOpen, setLayersGroupOpen] = useState<Record<string, boolean>>({})
  const [layerItemNames, setLayerItemNames] = useState<Record<string, string>>({})
  const [editingLayerNameId, setEditingLayerNameId] = useState<string | null>(null)
  const [editingLayerNameDraft, setEditingLayerNameDraft] = useState('')
  const canvasClipboardRef = useRef<
    | { target: 'kind'; kind: CanvasSelectableKind; payload: unknown }
    | { target: 'shape'; payload: PlacedShape }
    | null
  >(null)
  const [layerOrderByPageId, setLayerOrderByPageId] = useState<
    Record<string, string[]>
  >({})
  const [textBubbleModalOpen, setTextBubbleModalOpen] = useState(false)
  const [tocEditorOpen, setTocEditorOpen] = useState(false)
  const [saveMessage, setSaveMessage] = useState<string | null>(null)
  const isSavingDraftRef = useRef(false)

  const [pages, setPages] = useState<BookPageData[]>(createInitialPages)
  const pagesHistoryPastRef = useRef<BookPageData[][]>([])
  const pagesHistoryFutureRef = useRef<BookPageData[][]>([])
  const pagesHistoryCurrentRef = useRef<BookPageData[] | null>(null)
  const isApplyingHistoryRef = useRef(false)
  const pagesHistoryBatchRef = useRef<{
    active: boolean
    start: BookPageData[] | null
  }>({
    active: false,
    start: null,
  })
  const didMigrateToc = useRef(false)
  const [activePageIndex, setActivePageIndex] = useState(0)
  const [renamingPageIndex, setRenamingPageIndex] = useState<number | null>(
    null,
  )
  const [renameDraft, setRenameDraft] = useState('')
  const renameInputRef = useRef<HTMLInputElement | null>(null)
  const skipNextRenameCommitRef = useRef(false)
  const [pageNoPosition, setPageNoPosition] = useState<
    'none' | 'bottom-center' | 'bottom-outside'
  >('bottom-center')
  const [paperSize, setPaperSize] = useState<BookPaperSize>(defaultPaperSize)
  const [pageFrameSettings, setPageFrameSettings] = useState<PageFrameSettings>(
    () => defaultPageFrameSettings(),
  )
  const [tocDbFonts, setTocDbFonts] = useState<GlobalFont[]>([])
  const availableFonts = useMemo(() => {
    if (tocDbFonts.length > 0) return tocDbFonts
    const presetFonts = BOOK_TOC_PRESETS.map((p) => p.font)
    return presetFonts.length > 0 ? presetFonts : [FALLBACK_GLOBAL_FONT]
  }, [tocDbFonts])

  const mergedTocPresets = useMemo(
    () => mergeBookTocPresetsWithDbFonts(tocDbFonts),
    [tocDbFonts],
  )

  const defaultMergedToc = useMemo(
    () => mergedTocPresets[0] ?? DEFAULT_BOOK_TOC_PRESET,
    [mergedTocPresets],
  )

  const pageIdsKey = useMemo(
    () => pages.map((p) => p.id).join('\0'),
    [pages],
  )
  const [, setLayoutRemeasure] = useState(0)
  const undoPages = useCallback(() => {
    const past = pagesHistoryPastRef.current
    const current = pagesHistoryCurrentRef.current
    if (!current || past.length === 0) return false
    const prev = past.pop()
    if (!prev) return false
    pagesHistoryFutureRef.current.unshift(clonePagesSnapshot(current))
    isApplyingHistoryRef.current = true
    setPages(clonePagesSnapshot(prev))
    return true
  }, [])
  const redoPages = useCallback(() => {
    const future = pagesHistoryFutureRef.current
    const current = pagesHistoryCurrentRef.current
    if (!current || future.length === 0) return false
    const next = future.shift()
    if (!next) return false
    pagesHistoryPastRef.current.push(clonePagesSnapshot(current))
    isApplyingHistoryRef.current = true
    setPages(clonePagesSnapshot(next))
    return true
  }, [])

  useEffect(() => {
    const currentSnapshot = clonePagesSnapshot(pages)
    const isHistoryBatchActive = pagesHistoryBatchRef.current.active
    if (!pagesHistoryCurrentRef.current) {
      pagesHistoryCurrentRef.current = currentSnapshot
      return
    }
    if (isApplyingHistoryRef.current) {
      isApplyingHistoryRef.current = false
      pagesHistoryCurrentRef.current = currentSnapshot
      return
    }
    if (isHistoryBatchActive) {
      pagesHistoryCurrentRef.current = currentSnapshot
      return
    }
    pagesHistoryPastRef.current.push(
      clonePagesSnapshot(pagesHistoryCurrentRef.current),
    )
    if (pagesHistoryPastRef.current.length > 100) {
      pagesHistoryPastRef.current.shift()
    }
    pagesHistoryFutureRef.current = []
    pagesHistoryCurrentRef.current = currentSnapshot
  }, [pages])

  const [drag, setDrag] = useState<{
    pageIndex: number
    target: 'character' | 'textBox' | 'thoughtBubble' | 'shape'
    shapeIndex?: number
    characterIndex?: number
    textBoxIndex?: number
    dx: number
    dy: number
    startX: number
    startY: number
    groupSnap?: GroupDragSnap | null
    shapeGroupSnap?: Array<{
      index: number
      x: number
      y: number
      widthPx: number
      heightPx: number
    }>
  } | null>(null)

  const [canvasMultiSelection, setCanvasMultiSelection] = useState<{
    pageId: string
    kinds: CanvasSelectableKind[]
  } | null>(null)

  const [canvasContextMenu, setCanvasContextMenu] = useState<
    | {
        clientX: number
        clientY: number
        pageIndex: number
        target: 'kind'
        anchorKind: CanvasSelectableKind
      }
    | {
        clientX: number
        clientY: number
        pageIndex: number
        target: 'shape'
        shapeIndex: number
      }
    | null
  >(null)

  const [textBoxResize, setTextBoxResize] = useState<{
    pageIndex: number
    textBoxIndex: number
    w0: number
    h0: number
    startX: number
    startY: number
  } | null>(null)

  const [thoughtBubbleResize, setThoughtBubbleResize] = useState<{
    pageIndex: number
    w0: number
    h0: number
    startX: number
    startY: number
  } | null>(null)
  const [shapeResize, setShapeResize] = useState<{
    pageIndex: number
    shapeIndex: number
    w0: number
    h0: number
    startX: number
    startY: number
  } | null>(null)
  const [shapeRotate, setShapeRotate] = useState<{
    pageIndex: number
    shapeIndex: number
    deg0: number
    startAngleDeg: number
    centerX: number
    centerY: number
  } | null>(null)
  const [characterResize, setCharacterResize] = useState<{
    pageIndex: number
    characterIndex: number
    w0: number
    h0: number
    startX: number
    startY: number
  } | null>(null)
  const [characterRotate, setCharacterRotate] = useState<{
    pageIndex: number
    characterIndex: number
    deg0: number
    startAngleDeg: number
    centerX: number
    centerY: number
  } | null>(null)
  const [groupResize, setGroupResize] = useState<{
    pageIndex: number
    bbox: { x: number; y: number; w: number; h: number }
    startClientX: number
    startClientY: number
    minScale: number
    shapes: Array<{ index: number; x: number; y: number; w: number; h: number }>
    textBoxes: Array<{ index: number; x: number; y: number; w: number; h: number }>
    thoughtBubble: { x: number; y: number; w: number; h: number } | null
    character: { x: number; y: number; w: number; h: number } | null
  } | null>(null)

  const isPointerTransformActive =
    !!drag ||
    !!textBoxResize ||
    !!thoughtBubbleResize ||
    !!shapeResize ||
    !!shapeRotate ||
    !!characterResize ||
    !!characterRotate ||
    !!groupResize

  useEffect(() => {
    const batch = pagesHistoryBatchRef.current
    const current = pagesHistoryCurrentRef.current
    if (!current) return

    if (isPointerTransformActive && !batch.active) {
      batch.active = true
      batch.start = clonePagesSnapshot(current)
      return
    }

    if (isPointerTransformActive || !batch.active) return

    const startSnapshot = batch.start
    batch.active = false
    batch.start = null
    if (!startSnapshot) return

    const latestCurrent = pagesHistoryCurrentRef.current
    if (!latestCurrent || arePagesSnapshotsEqual(startSnapshot, latestCurrent)) {
      return
    }
    pagesHistoryPastRef.current.push(startSnapshot)
    if (pagesHistoryPastRef.current.length > 100) {
      pagesHistoryPastRef.current.shift()
    }
    pagesHistoryFutureRef.current = []
  }, [isPointerTransformActive])

  const pageSurfaceRefs = useRef<Map<string, HTMLDivElement>>(new Map())
  const canvasPickCycleRef = useRef<PickCycleState | null>(null)
  const textBoxPointerRef = useRef<{
    pageIndex: number
    pageId: string
    textBoxIndex: number
    startX: number
    startY: number
    tb: PlacedTextBox
  } | null>(null)

  const activePage = pages[activePageIndex] ?? pages[0]
  const activeContentPage =
    activePage?.kind === 'content' ? activePage : null

  const characterBoundsOnPage = useCallback(
    (page: BookPageData, ch: PlacedCharacter): { w: number; h: number } => {
      if (page.kind !== 'content') {
        return characterPlacementBounds(
          ch,
          approximateDrawableSizePx(paperSize).cw,
        )
      }
      const surface = pageSurfaceRefs.current.get(page.id)
      const sz = readDrawableSizeFromPageSurface(
        surface,
        effectivePageFrame(page, pageFrameSettings),
      )
      return characterPlacementBounds(
        ch,
        sz?.cw ?? approximateDrawableSizePx(paperSize).cw,
      )
    },
    [paperSize, pageFrameSettings],
  )

  const collectGroupMemberRects = useCallback(
    (
      page: BookPageData,
      groupId: string,
    ): Array<{ x: number; y: number; w: number; h: number }> => {
      if (page.kind !== 'content') return []
      const rects: Array<{ x: number; y: number; w: number; h: number }> = []
      for (const ch of getPageCharacters(page)) {
        if (ch.groupId === groupId) {
          const { w, h } = characterBoundsOnPage(page, ch)
          rects.push({ x: ch.x, y: ch.y, w, h })
        }
      }
      for (const tb of getPageTextBoxes(page)) {
        if (tb.groupId === groupId) {
          rects.push({
            x: tb.x,
            y: tb.y,
            w: tb.widthPx,
            h: tb.heightPx,
          })
        }
      }
      if (page.thoughtBubble?.groupId === groupId && page.thoughtBubble) {
        rects.push({
          x: page.thoughtBubble.x,
          y: page.thoughtBubble.y,
          w: page.thoughtBubble.widthPx,
          h: page.thoughtBubble.heightPx,
        })
      }
      for (const s of page.shapes ?? []) {
        if (s.groupId === groupId) {
          rects.push({ x: s.x, y: s.y, w: s.widthPx, h: s.heightPx })
        }
      }
      return rects
    },
    [characterBoundsOnPage],
  )

  const firstContentPageIndex = useMemo(
    () => pages.findIndex((p) => p.kind === 'content'),
    [pages],
  )
  const hasAnyContentPage = firstContentPageIndex >= 0

  const placeSavedCharacterSelection = useCallback(
    (payload: {
      selection: Record<string, string | null>
      layerOrder: string[]
      layerVisibility: Record<string, boolean>
    }) => {
      const activeContent =
        pages[activePageIndex]?.kind === 'content' ? pages[activePageIndex] : null
      const fallbackContent =
        firstContentPageIndex >= 0 && pages[firstContentPageIndex]?.kind === 'content'
          ? pages[firstContentPageIndex]
          : null
      const targetPage = activeContent ?? fallbackContent
      if (!targetPage) return

      const { cw, ch } = approximateDrawableSizePx(paperSize)
      const defaults = characterOuterSize(cw)
      const { h } = defaults
      const pos = clampCharacterXY(24, ch - h - 32, cw, ch)

      let placedIndex = 0
      setPages((prev) =>
        prev.map((p) => {
          if (p.id !== targetPage.id || p.kind !== 'content') return p
          const existing = getPageCharacters(p)
          const stagger = existing.length
          const nextChar = normalizePlacedCharacter(
            {
              selection: { ...payload.selection },
              layerOrder: [...(payload.layerOrder ?? [])],
              layerVisibility: { ...(payload.layerVisibility ?? {}) },
              x: pos.x + stagger * 28,
              y: pos.y - stagger * 20,
            },
            defaults,
          )
          if (!nextChar) return p
          placedIndex = existing.length
          return { ...p, characters: [...existing, nextChar] }
        }),
      )
      setCharacterSelectedPageId(targetPage.id)
      setCharacterSelectedIndex(placedIndex)
      setCanvasMultiSelection(null)
      setShapeSelectedPageId(null)
      setShapeSelectedIndex(null)
    },
    [pages, activePageIndex, firstContentPageIndex, paperSize],
  )

  // Character composer can queue a one-shot insert (direct or save & insert).
  // Only consume when we're on the book builder route (composer stays mounted under the workspace).
  useEffect(() => {
    const path = location.pathname.replace(/\/$/, '')
    if (path.includes('/character')) return
    const pending = takePendingCharacterInsert()
    if (!pending) return
    placeSavedCharacterSelection(pending)
  }, [location.pathname, location.key, placeSavedCharacterSelection])

  const canvasKeyNavRef = useRef({
    pages,
    activePageIndex,
    textBoxSelectedPageId,
    thoughtBubbleSelectedPageId,
    shapeSelectedPageId,
    shapeSelectedIndex,
  })
  canvasKeyNavRef.current = {
    pages,
    activePageIndex,
    textBoxSelectedPageId,
    thoughtBubbleSelectedPageId,
    shapeSelectedPageId,
    shapeSelectedIndex,
  }

  const applyCanvasStack = useCallback(
    (
      pageId: string,
      kind: CanvasSelectableKind,
      op: 'front' | 'back' | 'forward' | 'backward',
    ) => {
      setPages((prev) =>
        prev.map((pg) => {
          if (pg.id !== pageId || pg.kind !== 'content') return pg
          return applyCanvasStackOp(pg, kind, op)
        }),
      )
    },
    [],
  )

  const applyShapeStack = useCallback(
    (
      pageId: string,
      shapeIndex: number,
      op: 'front' | 'back' | 'forward' | 'backward',
    ) => {
      setPages((prev) =>
        prev.map((pg) => {
          if (pg.id !== pageId || pg.kind !== 'content') return pg
          if (!pg.shapes?.[shapeIndex]) return pg
          const shapes = [...pg.shapes]
          const i = shapeIndex
          let j = i
          if (op === 'front') j = shapes.length - 1
          else if (op === 'back') j = 0
          else if (op === 'forward') j = Math.min(shapes.length - 1, i + 1)
          else if (op === 'backward') j = Math.max(0, i - 1)
          if (j === i) return pg
          const [picked] = shapes.splice(i, 1)
          if (!picked) return pg
          shapes.splice(j, 0, picked)
          return { ...pg, shapes }
        }),
      )
    },
    [],
  )

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!(e.ctrlKey || e.metaKey)) return
      if (e.code !== 'BracketLeft' && e.code !== 'BracketRight') return
      const el = e.target as HTMLElement | null
      if (el?.closest('input, textarea, select, [contenteditable="true"]')) {
        return
      }
      const {
        pages: pg,
        activePageIndex: api,
        textBoxSelectedPageId: tbs,
        thoughtBubbleSelectedPageId: ths,
        shapeSelectedPageId: sps,
        shapeSelectedIndex: spi,
      } = canvasKeyNavRef.current
      const active = pg[api]
      if (
        active?.kind === 'content' &&
        sps === active.id &&
        spi != null &&
        spi >= 0 &&
        spi < active.shapes.length
      ) {
        e.preventDefault()
        const op = e.code === 'BracketRight' ? 'forward' : 'backward'
        applyShapeStack(active.id, spi, op)
        setShapeSelectedPageId(active.id)
        setShapeSelectedIndex((prev) => {
          if (prev == null) return prev
          return op === 'forward'
            ? Math.min(active.shapes.length - 1, prev + 1)
            : Math.max(0, prev - 1)
        })
        return
      }
      const target = resolveCanvasStackKeyTarget(pg, api, tbs, ths)
      if (!target) return
      e.preventDefault()
      const op = e.code === 'BracketRight' ? 'forward' : 'backward'
      applyCanvasStack(target.pageId, target.kind, op)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [applyCanvasStack, applyShapeStack])

  const toggleCanvasKindSelection = useCallback(
    (pageId: string, kind: CanvasSelectableKind) => {
      setCanvasMultiSelection((prev) => {
        if (!prev || prev.pageId !== pageId) {
          return { pageId, kinds: [kind] }
        }
        const ix = prev.kinds.indexOf(kind)
        if (ix >= 0) {
          const next = prev.kinds.filter((_, i) => i !== ix)
          return next.length > 0 ? { pageId, kinds: next } : null
        }
        return { pageId, kinds: [...prev.kinds, kind] }
      })
    },
    [],
  )

  const toggleShapeSelection = useCallback((pageId: string, shapeIndex: number) => {
    setShapeMultiSelection((prev) => {
      if (!prev || prev.pageId !== pageId) {
        return { pageId, indices: [shapeIndex] }
      }
      const ix = prev.indices.indexOf(shapeIndex)
      if (ix >= 0) {
        const next = prev.indices.filter((_, i) => i !== ix)
        return next.length > 0 ? { pageId, indices: next } : null
      }
      return { pageId, indices: [...prev.indices, shapeIndex] }
    })
  }, [])

  const collectGroupedSelection = useCallback(
    (page: BookPageData, groupId?: string) => {
      if (page.kind !== 'content' || !groupId) return null
      const kinds: CanvasSelectableKind[] = []
      if (getPageCharacters(page).some((ch) => ch.groupId === groupId)) {
        kinds.push('character')
      }
      if (getPageTextBoxes(page).some((tb) => tb.groupId === groupId)) {
        kinds.push('textBox')
      }
      if (page.thoughtBubble?.groupId === groupId) kinds.push('thoughtBubble')
      const shapeIndices = page.shapes
        .map((s, i) => (s.groupId === groupId ? i : -1))
        .filter((i) => i >= 0)
      if (kinds.length === 0 && shapeIndices.length === 0) return null
      return { kinds, shapeIndices }
    },
    [],
  )

  const openCanvasContextMenu = useCallback(
    (
      e: React.MouseEvent,
      pageIndex: number,
      anchorKind: CanvasSelectableKind,
    ) => {
      e.preventDefault()
      e.stopPropagation()
      setCanvasContextMenu({
        clientX: e.clientX,
        clientY: e.clientY,
        pageIndex,
        target: 'kind',
        anchorKind,
      })
    },
    [],
  )

  const openShapeContextMenu = useCallback(
    (e: React.MouseEvent, pageIndex: number, shapeIndex: number) => {
      e.preventDefault()
      e.stopPropagation()
      setCanvasContextMenu({
        clientX: e.clientX,
        clientY: e.clientY,
        pageIndex,
        target: 'shape',
        shapeIndex,
      })
    },
    [],
  )

  const handleCanvasContextGroup = useCallback(() => {
    const cm = canvasContextMenu
    const selKinds = canvasMultiSelection
    const selShapes = shapeMultiSelection
    if (!cm) return
    const pageIndex = cm.pageIndex
    setPages((prev) => {
      const p = prev[pageIndex]
      if (!p || p.kind !== 'content') return prev
      const kinds = new Set<CanvasSelectableKind>()
      if (cm.target === 'kind') kinds.add(cm.anchorKind)
      if (selKinds?.pageId === p.id) {
        for (const k of selKinds.kinds) kinds.add(k)
      }
      if (
        textBoxSelectedPageId === p.id &&
        textBoxSelectedIndex != null &&
        getPageTextBoxes(p)[textBoxSelectedIndex]
      ) {
        kinds.add('textBox')
      }
      if (thoughtBubbleSelectedPageId === p.id && p.thoughtBubble) {
        kinds.add('thoughtBubble')
      }
      const shapeIndices =
        Array.from(
          new Set<number>([
            ...(cm.target === 'shape' ? [cm.shapeIndex] : []),
            ...(selShapes?.pageId === p.id ? selShapes.indices : []),
            ...(shapeSelectedPageId === p.id && shapeSelectedIndex != null
              ? [shapeSelectedIndex]
              : []),
          ]),
        ).filter((i) => i >= 0 && i < p.shapes.length)
      const selectedGroupIds = new Set<string>()
      const collectKindGroup = (kind: CanvasSelectableKind) => {
        if (kind === 'character' && characterSelectedPageId === p.id) {
          const ch = p.characters[characterSelectedIndex ?? -1]
          if (ch?.groupId) selectedGroupIds.add(ch.groupId)
        }
        if (kind === 'textBox' && textBoxSelectedPageId === p.id) {
          const tb = getPageTextBoxes(p)[textBoxSelectedIndex ?? -1]
          if (tb?.groupId) selectedGroupIds.add(tb.groupId)
        }
        if (kind === 'thoughtBubble' && p.thoughtBubble?.groupId) {
          selectedGroupIds.add(p.thoughtBubble.groupId)
        }
      }
      for (const k of kinds) collectKindGroup(k)
      for (const i of shapeIndices) {
        const sh = p.shapes[i]
        if (sh?.groupId) selectedGroupIds.add(sh.groupId)
      }
      if (selectedGroupIds.size > 0) {
        for (const gid of selectedGroupIds) {
          if (p.characters.some((c) => c.groupId === gid)) kinds.add('character')
          if (getPageTextBoxes(p).some((tb) => tb.groupId === gid)) {
            kinds.add('textBox')
          }
          if (p.thoughtBubble?.groupId === gid) kinds.add('thoughtBubble')
          p.shapes.forEach((s, i) => {
            if (s.groupId === gid) {
              shapeIndices.push(i)
            }
          })
        }
      }
      const dedupedShapeIndices = Array.from(
        new Set(shapeIndices.filter((i) => i >= 0 && i < p.shapes.length)),
      )
      if (kinds.size + dedupedShapeIndices.length < 2) return prev
      const gid = newPageId()
      let next = { ...p }
      if (
        kinds.has('character') &&
        characterSelectedPageId === p.id &&
        characterSelectedIndex != null
      ) {
        next = {
          ...next,
          characters: next.characters.map((ch, ci) =>
            ci === characterSelectedIndex ? { ...ch, groupId: gid } : ch,
          ),
        }
      }
      if (
        kinds.has('textBox') &&
        textBoxSelectedPageId === p.id &&
        textBoxSelectedIndex != null
      ) {
        next = {
          ...next,
          textBoxes: getPageTextBoxes(next).map((tb, ti) =>
            ti === textBoxSelectedIndex ? { ...tb, groupId: gid } : tb,
          ),
        }
      }
      if (kinds.has('thoughtBubble') && next.thoughtBubble) {
        next = {
          ...next,
          thoughtBubble: { ...next.thoughtBubble, groupId: gid },
        }
      }
      if (dedupedShapeIndices.length > 0) {
        next = {
          ...next,
          shapes: next.shapes.map((s, i) =>
            dedupedShapeIndices.includes(i) ? { ...s, groupId: gid } : s,
          ),
        }
      }
      return prev.map((pp, i) => (i === pageIndex ? next : pp))
    })
    setCanvasContextMenu(null)
  }, [
    canvasContextMenu,
    canvasMultiSelection,
    shapeMultiSelection,
    shapeSelectedIndex,
    shapeSelectedPageId,
    textBoxSelectedIndex,
    textBoxSelectedPageId,
    thoughtBubbleSelectedPageId,
    characterSelectedIndex,
    characterSelectedPageId,
  ])

  const handleCanvasContextUngroup = useCallback(() => {
    const cm = canvasContextMenu
    const selMulti = canvasMultiSelection
    const selShapes = shapeMultiSelection
    if (!cm) return
    const pageIndex = cm.pageIndex
    const anchorKind = cm.target === 'kind' ? cm.anchorKind : null

    setPages((prev) => {
      const p = prev[pageIndex]
      if (!p || p.kind !== 'content') return prev
      const groupIds = new Set<string>()
      const collect = (kind: CanvasSelectableKind) => {
        if (kind === 'character' && characterSelectedPageId === p.id) {
          const ch = p.characters[characterSelectedIndex ?? -1]
          if (ch?.groupId) groupIds.add(ch.groupId)
        }
        if (kind === 'textBox' && textBoxSelectedPageId === p.id) {
          const tb = getPageTextBoxes(p)[textBoxSelectedIndex ?? -1]
          if (tb?.groupId) groupIds.add(tb.groupId)
        }
        if (kind === 'thoughtBubble' && p.thoughtBubble?.groupId) {
          groupIds.add(p.thoughtBubble.groupId)
        }
      }
      if (anchorKind) collect(anchorKind)
      if (selMulti && selMulti.pageId === p.id) {
        for (const k of selMulti.kinds) collect(k)
      }
      if (selShapes?.pageId === p.id) {
        for (const i of selShapes.indices) {
          const sh = p.shapes[i]
          if (sh?.groupId) groupIds.add(sh.groupId)
        }
      }
      if (cm.target === 'shape') {
        const sh = p.shapes[cm.shapeIndex]
        if (sh?.groupId) groupIds.add(sh.groupId)
      }
      if (groupIds.size === 0) return prev

      let next: BookPageData = { ...p }
      next = {
        ...next,
        characters: next.characters.map((ch) => {
          if (ch.groupId && groupIds.has(ch.groupId)) {
            const { groupId: _g, ...rest } = ch
            return rest
          }
          return ch
        }),
      }
      next = {
        ...next,
        textBoxes: getPageTextBoxes(next).map((tb) => {
          if (tb.groupId && groupIds.has(tb.groupId)) {
            const { groupId: _gt, ...rest } = tb
            return rest
          }
          return tb
        }),
      }
      if (
        next.thoughtBubble?.groupId &&
        groupIds.has(next.thoughtBubble.groupId)
      ) {
        const { groupId: _gb, ...b } = next.thoughtBubble
        next = { ...next, thoughtBubble: b }
      }
      if (next.shapes.length > 0) {
        next = {
          ...next,
          shapes: next.shapes.map((s) => {
            if (!s.groupId || !groupIds.has(s.groupId)) return s
            const { groupId: _gs, ...rest } = s
            return rest
          }),
        }
      }
      return prev.map((pp, i) => (i === pageIndex ? next : pp))
    })
    setCanvasContextMenu(null)
  }, [
    canvasContextMenu,
    canvasMultiSelection,
    shapeMultiSelection,
    textBoxSelectedIndex,
    textBoxSelectedPageId,
    characterSelectedIndex,
    characterSelectedPageId,
  ])

  const handleCanvasContextAlign = useCallback((
    mode: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom',
    source?:
      | {
          pageIndex: number
          target: 'kind'
          anchorKind: CanvasSelectableKind
        }
      | {
          pageIndex: number
          target: 'shape'
          shapeIndex: number
        },
  ) => {
    const cm = source ?? canvasContextMenu
    const sel = canvasMultiSelection
    const selShapes = shapeMultiSelection
    if (!cm) return
    setPages((prev) => {
      const p = prev[cm.pageIndex]
      if (!p || p.kind !== 'content') return prev
      const kinds = new Set<CanvasSelectableKind>()
      if (cm.target === 'kind') kinds.add(cm.anchorKind)
      if (sel?.pageId === p.id) {
        for (const k of sel.kinds) kinds.add(k)
      }
      if (
        textBoxSelectedPageId === p.id &&
        textBoxSelectedIndex != null &&
        getPageTextBoxes(p)[textBoxSelectedIndex]
      ) {
        kinds.add('textBox')
      }
      if (thoughtBubbleSelectedPageId === p.id && p.thoughtBubble) {
        kinds.add('thoughtBubble')
      }
      const shapeIndices =
        Array.from(
          new Set<number>([
            ...(cm.target === 'shape' ? [cm.shapeIndex] : []),
            ...(selShapes?.pageId === p.id ? selShapes.indices : []),
            ...(shapeSelectedPageId === p.id && shapeSelectedIndex != null
              ? [shapeSelectedIndex]
              : []),
          ]),
        ).filter((i) => i >= 0 && i < p.shapes.length)
      const entries: Array<{
        kind: CanvasSelectableKind | 'shape'
        index?: number
        charIndex?: number
        textBoxIndex?: number
        cx: number
        cy: number
        x: number
        y: number
        w: number
        h: number
      }> = []
      const add = (kind: CanvasSelectableKind) => {
        if (kind === 'character') {
          getPageCharacters(p).forEach((ch, charIndex) => {
            const { w, h } = characterBoundsOnPage(p, ch)
            entries.push({
              kind,
              charIndex,
              cx: ch.x + w / 2,
              cy: ch.y + h / 2,
              x: ch.x,
              y: ch.y,
              w,
              h,
            })
          })
        } else if (kind === 'textBox') {
          const boxes = getPageTextBoxes(p)
          const idxs =
            textBoxSelectedPageId === p.id && textBoxSelectedIndex != null
              ? [textBoxSelectedIndex]
              : boxes.map((_, i) => i)
          for (const textBoxIndex of idxs) {
            const tb = boxes[textBoxIndex]
            if (!tb) continue
            entries.push({
              kind,
              textBoxIndex,
              cx: tb.x + tb.widthPx / 2,
              cy: tb.y + tb.heightPx / 2,
              x: tb.x,
              y: tb.y,
              w: tb.widthPx,
              h: tb.heightPx,
            })
          }
        } else if (kind === 'thoughtBubble' && p.thoughtBubble) {
          entries.push({
            kind,
            cx: p.thoughtBubble.x + p.thoughtBubble.widthPx / 2,
            cy: p.thoughtBubble.y + p.thoughtBubble.heightPx / 2,
            x: p.thoughtBubble.x,
            y: p.thoughtBubble.y,
            w: p.thoughtBubble.widthPx,
            h: p.thoughtBubble.heightPx,
          })
        }
      }
      for (const k of kinds) add(k)
      for (const i of shapeIndices) {
        const sh = p.shapes[i]
        if (!sh) continue
        entries.push({
          kind: 'shape',
          index: i,
          cx: sh.x + sh.widthPx / 2,
          cy: sh.y + sh.heightPx / 2,
          x: sh.x,
          y: sh.y,
          w: sh.widthPx,
          h: sh.heightPx,
        })
      }
      if (entries.length < 2) return prev
      const cx = entries.reduce((n, e) => n + e.cx, 0) / entries.length
      const cy = entries.reduce((n, e) => n + e.cy, 0) / entries.length
      const left = Math.min(...entries.map((e) => e.x))
      const right = Math.max(...entries.map((e) => e.x + e.w))
      const top = Math.min(...entries.map((e) => e.y))
      const bottom = Math.max(...entries.map((e) => e.y + e.h))
      let next: BookPageData = { ...p }
      for (const e of entries) {
        if (e.kind !== 'character' || e.charIndex == null) continue
        const nx =
          mode === 'left'
            ? Math.round(left)
            : mode === 'center'
              ? Math.round(cx - e.w / 2)
              : mode === 'right'
                ? Math.round(right - e.w)
                : e.x
        const ny =
          mode === 'top'
            ? Math.round(top)
            : mode === 'middle'
              ? Math.round(cy - e.h / 2)
              : mode === 'bottom'
                ? Math.round(bottom - e.h)
                : e.y
        next = {
          ...next,
          characters: next.characters.map((ch, ci) =>
            ci === e.charIndex ? { ...ch, x: nx, y: ny } : ch,
          ),
        }
      }
      for (const e of entries) {
        if (e.kind !== 'textBox' || e.textBoxIndex == null) continue
        const nx =
          mode === 'left'
            ? Math.round(left)
            : mode === 'center'
              ? Math.round(cx - e.w / 2)
              : mode === 'right'
                ? Math.round(right - e.w)
                : e.x
        const ny =
          mode === 'top'
            ? Math.round(top)
            : mode === 'middle'
              ? Math.round(cy - e.h / 2)
              : mode === 'bottom'
                ? Math.round(bottom - e.h)
                : e.y
        next = {
          ...next,
          textBoxes: getPageTextBoxes(next).map((tb, ti) =>
            ti === e.textBoxIndex ? { ...tb, x: nx, y: ny } : tb,
          ),
        }
      }
      if (kinds.has('thoughtBubble') && next.thoughtBubble) {
        const nx =
          mode === 'left'
            ? Math.round(left)
            : mode === 'center'
              ? Math.round(cx - next.thoughtBubble.widthPx / 2)
              : mode === 'right'
                ? Math.round(right - next.thoughtBubble.widthPx)
                : next.thoughtBubble.x
        const ny =
          mode === 'top'
            ? Math.round(top)
            : mode === 'middle'
              ? Math.round(cy - next.thoughtBubble.heightPx / 2)
              : mode === 'bottom'
                ? Math.round(bottom - next.thoughtBubble.heightPx)
                : next.thoughtBubble.y
        next = {
          ...next,
          thoughtBubble: {
            ...next.thoughtBubble,
            x: nx,
            y: ny,
          },
        }
      }
      if (shapeIndices.length > 0) {
        next = {
          ...next,
          shapes: next.shapes.map((s, i) => {
            if (!shapeIndices.includes(i)) return s
            const nx =
              mode === 'left'
                ? Math.round(left)
                : mode === 'center'
                  ? Math.round(cx - s.widthPx / 2)
                  : mode === 'right'
                    ? Math.round(right - s.widthPx)
                    : s.x
            const ny =
              mode === 'top'
                ? Math.round(top)
                : mode === 'middle'
                  ? Math.round(cy - s.heightPx / 2)
                  : mode === 'bottom'
                    ? Math.round(bottom - s.heightPx)
                    : s.y
            return { ...s, x: nx, y: ny }
          }),
        }
      }
      return prev.map((pp, i) => (i === cm.pageIndex ? next : pp))
    })
    if (!source) setCanvasContextMenu(null)
  }, [
    canvasContextMenu,
    canvasMultiSelection,
    shapeMultiSelection,
    shapeSelectedIndex,
    shapeSelectedPageId,
    textBoxSelectedIndex,
    textBoxSelectedPageId,
    thoughtBubbleSelectedPageId,
    characterBoundsOnPage,
  ])

  const buildMultiDragSnap = useCallback(
    (
      pg: BookPageData,
      anchorKind: CanvasSelectableKind,
      anchorCharacterIndex?: number,
      anchorTextBoxIndex?: number,
    ) => {
      if (pg.kind !== 'content') return null
      const sel = canvasMultiSelection
      if (
        !sel ||
        sel.pageId !== pg.id ||
        sel.kinds.length < 2 ||
        !sel.kinds.includes(anchorKind)
      ) {
        return null
      }
      const characterSnaps =
        sel.kinds.includes('character') && anchorCharacterIndex != null
          ? (() => {
              const ch = pg.characters[anchorCharacterIndex]
              if (!ch) return undefined
              return [
                {
                  index: anchorCharacterIndex,
                  x: ch.x,
                  y: ch.y,
                  widthPx: ch.widthPx,
                  heightPx: ch.heightPx,
                },
              ]
            })()
          : undefined
      const textBoxSnaps =
        sel.kinds.includes('textBox') && anchorTextBoxIndex != null
          ? (() => {
              const tb = getPageTextBoxes(pg)[anchorTextBoxIndex]
              if (!tb) return undefined
              return [
                {
                  index: anchorTextBoxIndex,
                  x: tb.x,
                  y: tb.y,
                  widthPx: tb.widthPx,
                  heightPx: tb.heightPx,
                },
              ]
            })()
          : sel.kinds.includes('textBox')
            ? getPageTextBoxes(pg).map((tb, index) => ({
                index,
                x: tb.x,
                y: tb.y,
                widthPx: tb.widthPx,
                heightPx: tb.heightPx,
              }))
            : undefined
      return {
        groupId: '__multi__',
        ...(characterSnaps?.length ? { characters: characterSnaps } : {}),
        ...(textBoxSnaps?.length ? { textBoxes: textBoxSnaps } : {}),
        ...(sel.kinds.includes('thoughtBubble') && pg.thoughtBubble
          ? {
              thoughtBubble: {
                x: pg.thoughtBubble.x,
                y: pg.thoughtBubble.y,
                widthPx: pg.thoughtBubble.widthPx,
                heightPx: pg.thoughtBubble.heightPx,
              },
            }
          : {}),
      }
    },
    [canvasMultiSelection],
  )

  const handleCanvasContextTidyUp = useCallback(() => {
    const cm = canvasContextMenu
    const sel = canvasMultiSelection
    if (!cm || cm.target !== 'kind') return
    setPages((prev) => {
      const p = prev[cm.pageIndex]
      if (!p || p.kind !== 'content') return prev
      const kinds = new Set<CanvasSelectableKind>([cm.anchorKind])
      if (sel?.pageId === p.id) {
        for (const k of sel.kinds) kinds.add(k)
      }
      type Item = {
        kind: CanvasSelectableKind
        x: number
        y: number
        w: number
        h: number
        charIndex?: number
        textBoxIndex?: number
      }
      const items: Item[] = []
      if (kinds.has('character')) {
        getPageCharacters(p).forEach((ch, charIndex) => {
          const { w, h } = characterBoundsOnPage(p, ch)
          items.push({ kind: 'character', x: ch.x, y: ch.y, w, h, charIndex })
        })
      }
      if (kinds.has('textBox')) {
        const boxes = getPageTextBoxes(p)
        const idxs =
          textBoxSelectedPageId === p.id && textBoxSelectedIndex != null
            ? [textBoxSelectedIndex]
            : boxes.map((_, i) => i)
        for (const textBoxIndex of idxs) {
          const tb = boxes[textBoxIndex]
          if (!tb) continue
          items.push({
            kind: 'textBox',
            x: tb.x,
            y: tb.y,
            w: tb.widthPx,
            h: tb.heightPx,
            textBoxIndex,
          })
        }
      }
      if (kinds.has('thoughtBubble') && p.thoughtBubble) {
        items.push({
          kind: 'thoughtBubble',
          x: p.thoughtBubble.x,
          y: p.thoughtBubble.y,
          w: p.thoughtBubble.widthPx,
          h: p.thoughtBubble.heightPx,
        })
      }
      if (items.length < 2) return prev
      items.sort((a, b) => a.x - b.x)
      const spacing = 22
      const startX = Math.min(...items.map((it) => it.x))
      const centerY =
        items.reduce((n, it) => n + it.y + it.h / 2, 0) / items.length
      let cursor = startX
      let next: BookPageData = { ...p }
      for (const it of items) {
        const nx = Math.round(cursor)
        const ny = Math.round(centerY - it.h / 2)
        if (it.kind === 'character' && it.charIndex != null) {
          next = {
            ...next,
            characters: next.characters.map((ch, ci) =>
              ci === it.charIndex ? { ...ch, x: nx, y: ny } : ch,
            ),
          }
        } else if (it.kind === 'textBox' && it.textBoxIndex != null) {
          next = {
            ...next,
            textBoxes: getPageTextBoxes(next).map((tb, ti) =>
              ti === it.textBoxIndex ? { ...tb, x: nx, y: ny } : tb,
            ),
          }
        } else if (it.kind === 'thoughtBubble' && next.thoughtBubble) {
          next = {
            ...next,
            thoughtBubble: { ...next.thoughtBubble, x: nx, y: ny },
          }
        }
        cursor += it.w + spacing
      }
      return prev.map((pp, i) => (i === cm.pageIndex ? next : pp))
    })
    setCanvasContextMenu(null)
  }, [
    canvasContextMenu,
    canvasMultiSelection,
    characterBoundsOnPage,
    textBoxSelectedIndex,
    textBoxSelectedPageId,
  ])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!(e.ctrlKey || e.metaKey) || !e.altKey) return
      const el = e.target as HTMLElement | null
      if (el?.closest('input, textarea, select, [contenteditable="true"]')) {
        return
      }
      const active = pages[activePageIndex]
      if (!active || active.kind !== 'content') return
      const cm =
        shapeSelectedPageId === active.id && shapeSelectedIndex != null
          ? {
              pageIndex: activePageIndex,
              target: 'shape' as const,
              shapeIndex: shapeSelectedIndex,
            }
          : thoughtBubbleSelectedPageId === active.id
            ? {
                pageIndex: activePageIndex,
                target: 'kind' as const,
                anchorKind: 'thoughtBubble' as const,
              }
            : textBoxSelectedPageId === active.id
              ? {
                  pageIndex: activePageIndex,
                  target: 'kind' as const,
                  anchorKind: 'textBox' as const,
                }
              : canvasMultiSelection?.pageId === active.id &&
                  canvasMultiSelection.kinds.length > 0
                ? {
                    pageIndex: activePageIndex,
                    target: 'kind' as const,
                    anchorKind: canvasMultiSelection.kinds[0],
                  }
                : shapeMultiSelection?.pageId === active.id &&
                    shapeMultiSelection.indices.length > 0
                  ? {
                      pageIndex: activePageIndex,
                      target: 'shape' as const,
                      shapeIndex: shapeMultiSelection.indices[0],
                    }
                  : canvasContextMenu
      if (!cm) return
      const p = pages[cm.pageIndex]
      if (!p || p.kind !== 'content') return
      const selectedKinds = new Set<CanvasSelectableKind>()
      if (cm.target === 'kind') selectedKinds.add(cm.anchorKind)
      if (canvasMultiSelection?.pageId === p.id) {
        for (const k of canvasMultiSelection.kinds) selectedKinds.add(k)
      }
      const selectedShapeIndices = Array.from(
        new Set<number>([
          ...(cm.target === 'shape' ? [cm.shapeIndex] : []),
          ...(shapeMultiSelection?.pageId === p.id ? shapeMultiSelection.indices : []),
        ]),
      ).filter((i) => i >= 0 && i < p.shapes.length)
      const selectedCount = selectedKinds.size + selectedShapeIndices.length
      if (selectedCount < 2) return
      let mode: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom' | null =
        null
      if (e.code === 'ArrowLeft') mode = 'left'
      else if (e.code === 'ArrowRight') mode = 'right'
      else if (e.code === 'ArrowUp') mode = 'top'
      else if (e.code === 'ArrowDown') mode = 'bottom'
      if (e.shiftKey && e.code === 'ArrowLeft') mode = 'center'
      else if (e.shiftKey && e.code === 'ArrowUp') mode = 'middle'
      if (!mode) return
      e.preventDefault()
      handleCanvasContextAlign(mode, cm)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [
    canvasContextMenu,
    canvasMultiSelection,
    activePageIndex,
    handleCanvasContextAlign,
    pages,
    shapeMultiSelection,
    shapeSelectedIndex,
    shapeSelectedPageId,
    textBoxSelectedPageId,
    thoughtBubbleSelectedPageId,
  ])

  const trimForModal = dimensionsForPaper(paperSize)

  useEffect(() => {
    for (const p of pages) {
      if (p.kind === 'toc') {
        const href = p.tocStyle?.font?.stylesheetUrl
        if (href) ensureTocStylesheetLoaded(href)
      } else if (p.kind === 'content') {
        for (const tb of getPageTextBoxes(p)) {
          const f = availableFonts.find((x) => x.id === tb.globalFontId)
          if (f?.stylesheetUrl) ensureTocStylesheetLoaded(f.stylesheetUrl)
        }
      }
    }
  }, [pages, availableFonts])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const draftUrl = builderApiPath(draftGetPath)
        const [draftRes, fontsRes] = await Promise.all([
          builderFetch(draftUrl),
          builderFetch(builderApiPath('/api/global-fonts')),
        ])
        if (cancelled) return
        let fonts: GlobalFont[] = []
        if (fontsRes.ok) {
          fonts = (await fontsRes.json()) as GlobalFont[]
          setTocDbFonts(fonts)
        }
        const merged = mergeBookTocPresetsWithDbFonts(fonts)
        if (!draftRes.ok) return
        const data = parseBuilderDraftResponse(await draftRes.json())
        const hostedId = builderHost?.bookId
        const cached =
          hostedId && !cancelled ? readBuilderDraftCache(hostedId) : null
        if (!data.pages?.length && !cached?.pages?.length) return
        if (cached?.pages?.length && !cancelled) {
          setPages(cached.pages)
          setPaperSize(cached.paperSize)
          setPageFrameSettings(cached.pageFrame)
        }
        if (!data.pages?.length || cancelled) {
          if (cached?.pages?.length) setActivePageIndex(0)
          return
        }
        if (data.pageFrame != null) {
          setPageFrameSettings(normalizePageFrameSettings(data.pageFrame))
        }
        const fallback = merged[0] ?? DEFAULT_BOOK_TOC_PRESET
        const draftPaper = parseDraftPaperSize(data.paperSize)
        const defaultCharacterPlacementSize = characterOuterSize(
          approximateDrawableSizePx(draftPaper).cw,
        )
        const normalized = data.pages.map((raw) => {
          const rawPf = (raw as BookPageData).pageFrame
          const rawTb = (raw as BookPageData).thoughtBubble
          const rawShape = (raw as BookPageData & { shape?: unknown }).shape
          const rawShapes = (raw as BookPageData & { shapes?: unknown }).shapes
          const normalizedShapes = Array.isArray(rawShapes)
            ? rawShapes
                .map((x) => normalizePlacedShape(x))
                .filter((x): x is PlacedShape => !!x)
            : (() => {
                const one = normalizePlacedShape(rawShape)
                return one ? [one] : []
              })()
          let p = normalizeContentPageTextBoxes(
            normalizeContentPageCharacters(
              migrateLegacyTextBoxBubble({
                ...raw,
                thoughtBubble: normalizePlacedThoughtBubble(rawTb),
                shapes: normalizedShapes,
                canvasLayerOrder: normalizeCanvasLayerOrder(
                  (raw as BookPageData).canvasLayerOrder,
                ),
                pageFrame:
                  rawPf != null
                    ? normalizePageFrameSettings(rawPf)
                    : undefined,
              } as BookPageData),
              defaultCharacterPlacementSize,
            ),
          )
          if (p.kind !== 'toc' || !p.tocStyle) return p
          const m =
            findMergedTocPreset(merged, p.tocStyle.id) ?? fallback
          return { ...p, tocStyle: m }
        })
        setPages((prev) => {
          const prevById = new Map(prev.map((pg) => [pg.id, pg]))
          const reconciled = reconcileTocContinuationPages(
            normalized,
            newPageId,
          )
          return reconciled.map((p) => {
            const oldP = prevById.get(p.id)
            if (!oldP || oldP.kind !== 'content' || p.kind !== 'content') {
              return p
            }
            let out: BookPageData = p
            if (oldP.thoughtBubble && !p.thoughtBubble) {
              out = { ...out, thoughtBubble: oldP.thoughtBubble }
            }
            if (oldP.shapes?.length && !p.shapes?.length) {
              out = { ...out, shapes: oldP.shapes }
            }
            if (
              getPageTextBoxes(oldP).length > 0 &&
              getPageTextBoxes(p).length === 0
            ) {
              out = { ...out, textBoxes: getPageTextBoxes(oldP) }
            }
            if (oldP.characters?.length && !p.characters?.length) {
              out = { ...out, characters: oldP.characters }
            }
            if (
              oldP.canvasLayerOrder?.length &&
              !out.canvasLayerOrder?.length
            ) {
              out = { ...out, canvasLayerOrder: oldP.canvasLayerOrder }
            }
            return out
          })
        })
        setPaperSize(parseDraftPaperSize(data.paperSize))
        setActivePageIndex(0)
        didMigrateToc.current = true
      } catch {
        /* keep local initial pages */
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    const onVis = () => {
      if (document.visibilityState !== 'visible') return
      void (async () => {
        try {
          const res = await builderFetch(builderApiPath('/api/global-fonts'))
          if (!res.ok) return
          setTocDbFonts((await res.json()) as GlobalFont[])
        } catch {
          /* ignore */
        }
      })()
    }
    document.addEventListener('visibilitychange', onVis)
    return () => document.removeEventListener('visibilitychange', onVis)
  }, [])

  useEffect(() => {
    if (mergedTocPresets.length === 0) return
    setPages((prev) => {
      let changed = false
      const next = prev.map((p) => {
        if (p.kind !== 'toc' || !p.tocStyle) return p
        const fresh = findMergedTocPreset(mergedTocPresets, p.tocStyle.id)
        if (!fresh) return p
        const f = p.tocStyle.font
        const g = fresh.font
        const same =
          p.tocStyle.id === fresh.id &&
          f.stylesheetUrl === g.stylesheetUrl &&
          f.extraCss === g.extraCss &&
          (f.tocFontSize ?? '') === (g.tocFontSize ?? '') &&
          (f.tocLineHeight ?? '') === (g.tocLineHeight ?? '') &&
          (f.tocLetterSpacing ?? '') === (g.tocLetterSpacing ?? '') &&
          (f.tocRowGap ?? '') === (g.tocRowGap ?? '') &&
          (f.tocHeadingFontSize ?? '') === (g.tocHeadingFontSize ?? '')
        if (same) return p
        changed = true
        return { ...p, tocStyle: fresh }
      })
      return changed ? next : prev
    })
  }, [mergedTocPresets])

  useEffect(() => {
    if (didMigrateToc.current) return
    setPages((prev) => {
      let changed = false
      const next = prev.map((p) => {
        if (
          p.kind === 'toc' &&
          p.tocStyle &&
          !p.tocData &&
          !p.tocRootId
        ) {
          changed = true
          const labels = prev
            .filter((x) => x.kind === 'content')
            .map((x) => x.label)
          return {
            ...p,
            tocData:
              labels.length > 0
                ? seedTocDataFromContentPages(labels)
                : emptyTocPageData(),
            tocRootId: null,
          }
        }
        return p
      })
      if (!changed) {
        didMigrateToc.current = true
        return prev
      }
      didMigrateToc.current = true
      return reconcileTocContinuationPages(next, newPageId)
    })
  }, [])

  const applyReconciledPages = useCallback(
    (updater: (prev: BookPageData[]) => BookPageData[]) => {
      setPages((prev) => reconcileTocContinuationPages(updater(prev), newPageId))
    },
    [],
  )

  const activeTocRootPage = useMemo(() => {
    const range = getTocBlockRange(pages, activePageIndex)
    if (!range) return null
    return pages[range.rootIndex] ?? null
  }, [pages, activePageIndex])

  const tocPreviewLabels = useMemo(
    () => pages.filter((p) => p.kind === 'content').map((p) => p.label),
    [pages],
  )

  const onTocEditorChange = useCallback(
    (data: TocPageData) => {
      const id = activeTocRootPage?.id
      if (!id) return
      applyReconciledPages((prev) =>
        prev.map((p) => (p.id === id ? { ...p, tocData: data } : p)),
      )
    },
    [activeTocRootPage?.id, applyReconciledPages],
  )

  const onTocPresetChange = useCallback(
    (style: TocStyle) => {
      const rootId = activeTocRootPage?.id
      if (!rootId) return
      applyReconciledPages((prev) =>
        prev.map((p) => {
          if (p.kind !== 'toc') return p
          if (p.id === rootId || p.tocRootId === rootId) {
            return { ...p, tocStyle: style }
          }
          return p
        }),
      )
    },
    [activeTocRootPage?.id, applyReconciledPages],
  )

  useEffect(() => {
    if (!activeTocRootPage) setTocEditorOpen(false)
  }, [activeTocRootPage])

  useEffect(() => {
    const ap = pages[activePageIndex]
    setTextBoxSelectedPageId((sel) => {
      if (!sel) return null
      if (!ap || ap.id !== sel) return null
      return sel
    })
  }, [activePageIndex, pages])

  useEffect(() => {
    if (!textBoxSelectedPageId) {
      setTextBoxSelectedIndex(null)
      return
    }
    const p = pages.find(
      (x) => x.id === textBoxSelectedPageId && x.kind === 'content',
    )
    if (!p) {
      setTextBoxSelectedIndex(null)
      return
    }
    const boxes = getPageTextBoxes(p)
    setTextBoxSelectedIndex((ix) =>
      ix != null && ix >= 0 && ix < boxes.length ? ix : null,
    )
  }, [pages, textBoxSelectedPageId])

  useEffect(() => {
    const ap = pages[activePageIndex]
    setThoughtBubbleSelectedPageId((sel) => {
      if (!sel) return null
      if (!ap || ap.id !== sel) return null
      return sel
    })
  }, [activePageIndex, pages])

  useEffect(() => {
    const ap = pages[activePageIndex]
    setShapeSelectedPageId((sel) => {
      if (!sel) return null
      if (!ap || ap.id !== sel) return null
      return sel
    })
  }, [activePageIndex, pages])

  useEffect(() => {
    if (!shapeSelectedPageId) {
      setShapeSelectedIndex(null)
      return
    }
    const p = pages.find((x) => x.id === shapeSelectedPageId && x.kind === 'content')
    if (!p) {
      setShapeSelectedIndex(null)
      return
    }
    setShapeSelectedIndex((ix) =>
      ix != null && ix >= 0 && ix < p.shapes.length ? ix : null,
    )
  }, [pages, shapeSelectedPageId])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null
      if (el?.closest('input, textarea, select, [contenteditable="true"]')) {
        return
      }
      if (e.key === 'Escape') {
        setTextBoxSelectedPageId(null)
        setTextBoxSelectedIndex(null)
        setThoughtBubbleSelectedPageId(null)
        setShapeSelectedPageId(null)
        setShapeSelectedIndex(null)
        setShapeMultiSelection(null)
        setCanvasContextMenu(null)
        setCanvasMultiSelection(null)
        setCharacterResize(null)
        setCharacterRotate(null)
        return
      }
      if (e.ctrlKey || e.metaKey) {
        const key = e.key.toLowerCase()
        if (key === 'z' && !e.shiftKey) {
          if (undoPages()) {
            e.preventDefault()
            return
          }
        }
        if (key === 'y' || (key === 'z' && e.shiftKey)) {
          if (redoPages()) {
            e.preventDefault()
            return
          }
        }
        if (key === 'c' || key === 'x') {
          let handled = false
          if (shapeSelectedPageId && shapeSelectedIndex != null) {
            const pg = pages.find(
              (p) => p.id === shapeSelectedPageId && p.kind === 'content',
            )
            const sh = pg?.shapes?.[shapeSelectedIndex]
            if (sh) {
              canvasClipboardRef.current = {
                target: 'shape',
                payload: { ...sh },
              }
              handled = true
              if (key === 'x') {
                setPages((prev) =>
                  prev.map((p) =>
                    p.id === shapeSelectedPageId && p.kind === 'content'
                      ? {
                          ...p,
                          shapes: p.shapes.filter((_, i) => i !== shapeSelectedIndex),
                        }
                      : p,
                  ),
                )
                setShapeSelectedPageId(null)
                setShapeSelectedIndex(null)
              }
            }
          } else if (
            canvasMultiSelection &&
            canvasMultiSelection.kinds.length === 1 &&
            canvasMultiSelection.kinds[0] === 'character'
          ) {
            const pg = pages.find(
              (p) =>
                p.id === canvasMultiSelection.pageId && p.kind === 'content',
            )
            if (!pg) return
            const clipChar =
              characterSelectedPageId === pg.id &&
              characterSelectedIndex != null
                ? getPageCharacters(pg)[characterSelectedIndex]
                : getPageCharacters(pg)[0]
            if (clipChar) {
              canvasClipboardRef.current = {
                target: 'kind',
                kind: 'character',
                payload: { ...clipChar },
              }
              handled = true
              if (key === 'x') {
                const pid = pg.id
                const rmIdx =
                  characterSelectedPageId === pid &&
                  characterSelectedIndex != null
                    ? characterSelectedIndex
                    : 0
                setPages((prev) =>
                  prev.map((p) =>
                    p.id === pid && p.kind === 'content'
                      ? {
                          ...p,
                          characters: p.characters.filter((_, ci) => ci !== rmIdx),
                        }
                      : p,
                  ),
                )
                setCharacterSelectedPageId(null)
                setCharacterSelectedIndex(null)
                setCanvasMultiSelection(null)
              }
            }
          } else if (thoughtBubbleSelectedPageId) {
            const pg = pages.find(
              (p) => p.id === thoughtBubbleSelectedPageId && p.kind === 'content',
            )
            if (pg?.thoughtBubble) {
              canvasClipboardRef.current = {
                target: 'kind',
                kind: 'thoughtBubble',
                payload: { ...pg.thoughtBubble },
              }
              handled = true
              if (key === 'x') {
                setPages((prev) =>
                  prev.map((p) =>
                    p.id === thoughtBubbleSelectedPageId && p.kind === 'content'
                      ? { ...p, thoughtBubble: null }
                      : p,
                  ),
                )
                setThoughtBubbleSelectedPageId(null)
              }
            }
          } else if (
            textBoxSelectedPageId &&
            textBoxSelectedIndex != null
          ) {
            const pg = pages.find(
              (p) => p.id === textBoxSelectedPageId && p.kind === 'content',
            )
            const tb = pg ? getPageTextBoxes(pg)[textBoxSelectedIndex] : null
            if (tb) {
              canvasClipboardRef.current = {
                target: 'kind',
                kind: 'textBox',
                payload: { ...tb },
              }
              handled = true
              if (key === 'x') {
                const rmIdx = textBoxSelectedIndex
                setPages((prev) =>
                  prev.map((p) =>
                    p.id === textBoxSelectedPageId && p.kind === 'content'
                      ? {
                          ...p,
                          textBoxes: getPageTextBoxes(p).filter(
                            (_, i) => i !== rmIdx,
                          ),
                        }
                      : p,
                  ),
                )
                setTextBoxSelectedPageId(null)
                setTextBoxSelectedIndex(null)
              }
            }
          }
          if (handled) {
            e.preventDefault()
            return
          }
        }
        if (key === 'v' && canvasClipboardRef.current) {
          const clip = canvasClipboardRef.current
          const activeContent =
            pages[activePageIndex]?.kind === 'content' ? pages[activePageIndex] : null
          const fallbackContent =
            firstContentPageIndex >= 0 && pages[firstContentPageIndex]?.kind === 'content'
              ? pages[firstContentPageIndex]
              : null
          const targetPage = activeContent ?? fallbackContent
          if (!targetPage) return
          e.preventDefault()
          if (clip.target === 'shape') {
            const src = clip.payload as PlacedShape
            const dup: PlacedShape = {
              ...src,
              x: src.x + 18,
              y: src.y + 18,
            }
            let nextShapeIx: number | null = null
            setPages((prev) =>
              prev.map((p) => {
                if (p.id !== targetPage.id || p.kind !== 'content') return p
                nextShapeIx = p.shapes.length
                return { ...p, shapes: [...p.shapes, dup] }
              }),
            )
            setShapeSelectedPageId(targetPage.id)
            setShapeSelectedIndex(nextShapeIx ?? null)
            setTextBoxSelectedPageId(null)
            setThoughtBubbleSelectedPageId(null)
            return
          }
          const payload = clip.payload as Record<string, unknown>
          if (clip.kind === 'textBox') {
            const src = payload as PlacedTextBox
            const { groupId: _gid, ...placedBase } = src
            const dup: PlacedTextBox = {
              ...placedBase,
              x: src.x + 18,
              y: src.y + 18,
              pagePlacement: 'free',
            }
            let nextTbIx: number | null = null
            setPages((prev) =>
              prev.map((p) => {
                if (p.id !== targetPage.id || p.kind !== 'content') return p
                const existing = getPageTextBoxes(p)
                nextTbIx = existing.length
                return { ...p, textBoxes: [...existing, dup] }
              }),
            )
            setTextBoxSelectedPageId(targetPage.id)
            setTextBoxSelectedIndex(nextTbIx)
            setThoughtBubbleSelectedPageId(null)
            setShapeSelectedPageId(null)
            setShapeSelectedIndex(null)
            return
          }
          if (clip.kind === 'thoughtBubble') {
            const src = payload as PlacedThoughtBubble
            setPages((prev) =>
              prev.map((p) =>
                p.id === targetPage.id && p.kind === 'content'
                  ? {
                      ...p,
                      thoughtBubble: { ...src, x: src.x + 18, y: src.y + 18 },
                    }
                  : p,
              ),
            )
            setThoughtBubbleSelectedPageId(targetPage.id)
            setTextBoxSelectedPageId(null)
            setTextBoxSelectedIndex(null)
            setShapeSelectedPageId(null)
            setShapeSelectedIndex(null)
            return
          }
          if (clip.target === 'kind' && clip.kind === 'character') {
            const src = clip.payload as PlacedCharacter
            const defSz = characterOuterSize(
              approximateDrawableSizePx(paperSize).cw,
            )
            const normalized = normalizePlacedCharacter(
              {
                ...src,
                x: src.x + 18,
                y: src.y + 18,
              },
              {
                w: src.widthPx ?? defSz.w,
                h: src.heightPx ?? defSz.h,
              },
            )
            if (!normalized) return
            const { groupId: _gid, ...placed } = normalized
            setPages((prev) =>
              prev.map((p) => {
                if (p.id !== targetPage.id || p.kind !== 'content') return p
                const newIndex = p.characters.length
                setCharacterSelectedPageId(targetPage.id)
                setCharacterSelectedIndex(newIndex)
                return { ...p, characters: [...p.characters, placed] }
              }),
            )
            setCanvasMultiSelection(null)
            setTextBoxSelectedPageId(null)
            setThoughtBubbleSelectedPageId(null)
            setShapeSelectedPageId(null)
            setShapeSelectedIndex(null)
            return
          }
        }
      }
      if (e.key !== 'Delete' && e.key !== 'Backspace') return
      if (characterSelectedPageId != null && characterSelectedIndex != null) {
        e.preventDefault()
        const pid = characterSelectedPageId
        const rmIdx = characterSelectedIndex
        setPages((prev) =>
          prev.map((p) =>
            p.id === pid && p.kind === 'content'
              ? {
                  ...p,
                  characters: p.characters.filter((_, ci) => ci !== rmIdx),
                }
              : p,
          ),
        )
        setCharacterSelectedPageId(null)
        setCharacterSelectedIndex(null)
        setCanvasMultiSelection(null)
        return
      }
      if (shapeSelectedPageId && shapeSelectedIndex != null) {
        e.preventDefault()
        const pid = shapeSelectedPageId
        const sidx = shapeSelectedIndex
        setPages((prev) =>
          prev.map((p) =>
            p.id === pid && p.kind === 'content' && p.shapes?.[sidx]
              ? { ...p, shapes: p.shapes.filter((_, i) => i !== sidx) }
              : p,
          ),
        )
        setShapeSelectedPageId(null)
        setShapeSelectedIndex(null)
        return
      }
      if (thoughtBubbleSelectedPageId) {
        e.preventDefault()
        const pid = thoughtBubbleSelectedPageId
        setPages((prev) =>
          prev.map((p) =>
            p.id === pid && p.kind === 'content'
              ? { ...p, thoughtBubble: null }
              : p,
          ),
        )
        setThoughtBubbleSelectedPageId(null)
        return
      }
      if (textBoxSelectedPageId != null && textBoxSelectedIndex != null) {
        e.preventDefault()
        const pid = textBoxSelectedPageId
        const rmIdx = textBoxSelectedIndex
        setPages((prev) =>
          prev.map((p) =>
            p.id === pid && p.kind === 'content'
              ? {
                  ...p,
                  textBoxes: getPageTextBoxes(p).filter((_, i) => i !== rmIdx),
                }
              : p,
          ),
        )
        setTextBoxSelectedPageId(null)
        setTextBoxSelectedIndex(null)
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [
    activePageIndex,
    firstContentPageIndex,
    pages,
    redoPages,
    shapeSelectedIndex,
    shapeSelectedPageId,
    textBoxSelectedPageId,
    textBoxSelectedIndex,
    thoughtBubbleSelectedPageId,
    undoPages,
    canvasMultiSelection,
    paperSize,
    characterSelectedPageId,
    characterSelectedIndex,
  ])

  useEffect(() => {
    if (!canvasContextMenu) return
    const close = () => setCanvasContextMenu(null)
    const onDown = (e: MouseEvent) => {
      const t = e.target as HTMLElement
      if (t.closest?.('.book-canvas-context-menu')) return
      close()
    }
    document.addEventListener('mousedown', onDown, true)
    return () => document.removeEventListener('mousedown', onDown, true)
  }, [canvasContextMenu])

  const collectPageExportPayload = useCallback(() => {
    let w = 0
    let h = 0
    const coverPage = pages[0]
    if (coverPage) {
      const el = pageSurfaceRefs.current.get(coverPage.id)
      if (el) {
        const rect = el.getBoundingClientRect()
        w = Math.round(rect.width) || el.offsetWidth || el.clientWidth
        h = Math.round(rect.height) || el.offsetHeight || el.clientHeight
      }
    }
    if (w <= 0 || h <= 0) {
      const approx = approximateDrawableSizePx(paperSize)
      w = approx.cw
      h = approx.ch
    }
    const pagesHtml: string[] = []
    for (const p of pages) {
      const el = pageSurfaceRefs.current.get(p.id)
      if (el) pagesHtml.push(clonePageHtmlForExport(el))
    }
    let wordCount = 0
    for (const p of pages) {
      for (const tb of getPageTextBoxes(p)) {
        const text = tb.text?.trim()
        if (text) wordCount += text.split(/\s+/).filter(Boolean).length
      }
    }
    return {
      pagesHtml,
      widthPx: w,
      heightPx: h,
      pageCount: pages.length,
      wordCount,
      fontStylesheetUrls: collectFontStylesheetsForExport(pages, availableFonts),
    }
  }, [pages, paperSize, availableFonts])

  const saveBookDraft = useCallback(async (opts?: { silent?: boolean }) => {
    if (isSavingDraftRef.current) return
    isSavingDraftRef.current = true
    if (!opts?.silent) setSaveMessage(null)
    const hostedId = builderHost?.bookId
    if (hostedId) {
      writeBuilderDraftCache(hostedId, {
        pages,
        paperSize,
        pageFrame: pageFrameSettings,
      })
    }
    try {
      const putUrl = builderApiPath(draftPutPath)
      const res = await builderFetch(putUrl, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: stringifyBuilderDraftBody({
          pages,
          paperSize,
          pageFrame: pageFrameSettings,
        }),
      })
      if (!res.ok) throw new Error(await res.text())

      if (!opts?.silent && builderHost?.exportPdfOnSave) {
        const payload = collectPageExportPayload()
        if (
          payload.widthPx &&
          payload.heightPx &&
          payload.pagesHtml.length
        ) {
          await builderHost.exportPdfOnSave(payload)
        }
      }

      if (!opts?.silent) {
        setSaveMessage(
          builderHost?.exportPdfOnSave ? 'Book saved' : 'Saved to database',
        )
        window.setTimeout(() => setSaveMessage(null), 2800)
      }
    } catch (e) {
      setSaveMessage(
        e instanceof Error ? e.message : 'Could not save book',
      )
    } finally {
      isSavingDraftRef.current = false
    }
  }, [
    pages,
    paperSize,
    pageFrameSettings,
    draftPutPath,
    builderHost?.exportPdfOnSave,
    builderHost?.bookId,
    collectPageExportPayload,
  ])

  useEffect(() => {
    if (!builderHost?.bookId) return
    const id = window.setTimeout(() => {
      void saveBookDraft({ silent: true })
    }, 4000)
    return () => window.clearTimeout(id)
  }, [pages, paperSize, pageFrameSettings, builderHost?.bookId, saveBookDraft])

  useEffect(() => {
    if (!builderHost?.bookId) return
    const onVis = () => {
      if (document.visibilityState === 'hidden') {
        void saveBookDraft({ silent: true })
      }
    }
    document.addEventListener('visibilitychange', onVis)
    return () => document.removeEventListener('visibilitychange', onVis)
  }, [builderHost?.bookId, saveBookDraft])

  useEffect(() => {
    const id = window.setInterval(() => {
      void saveBookDraft({ silent: true })
    }, 60000)
    return () => window.clearInterval(id)
  }, [saveBookDraft])

  useEffect(() => {
    if (renamingPageIndex === null) return
    const el = renameInputRef.current
    if (!el) return
    el.focus()
    el.select()
  }, [renamingPageIndex])

  const commitPageRename = useCallback(
    (pageIndex: number) => {
      setPages((prev) => {
        const pg = prev[pageIndex]
        const fallback =
          pg?.kind === 'toc'
            ? 'Table of contents'
            : defaultContentPageLabel(contentOrdinalAt(prev, pageIndex))
        const v = renameDraft.trim() || fallback
        return prev.map((p, idx) =>
          idx === pageIndex ? { ...p, label: v } : p,
        )
      })
      setRenamingPageIndex(null)
    },
    [renameDraft],
  )

  const cancelPageRename = useCallback(() => {
    skipNextRenameCommitRef.current = true
    setRenamingPageIndex(null)
  }, [])

  const registerPageSurface = (id: string, el: HTMLDivElement | null) => {
    if (el) pageSurfaceRefs.current.set(id, el)
    else pageSurfaceRefs.current.delete(id)
  }

  /** Re-render after surfaces mount so layout can read `clientWidth` (never bump from ref callbacks — loops with Strict Mode). */
  useLayoutEffect(() => {
    setLayoutRemeasure((n) => n + 1)
  }, [paperSize, pageFrameSettings, pageIdsKey])

  useLayoutEffect(() => {
    const id = requestAnimationFrame(() => {
      setPages((prev) => {
        const next = prev.map((p) => {
          const surface = pageSurfaceRefs.current.get(p.id)
          const frame = effectivePageFrame(p, pageFrameSettings)
          const sz = readDrawableSizeFromPageSurface(surface, frame)
          if (!sz) return p
          let np: BookPageData = p
          if (p.kind === 'content' && p.characters.length > 0) {
            let charsChanged = false
            const nextChars = p.characters.map((ch) => {
              const charSz = characterPlacementBounds(ch, sz.cw)
              const { x, y } = clampRectToPageFromSafeCoords(
                ch.x,
                ch.y,
                charSz.w,
                charSz.h,
                sz.cw,
                sz.ch,
                frame,
              )
              if (x !== ch.x || y !== ch.y) {
                charsChanged = true
                return { ...ch, x, y }
              }
              return ch
            })
            if (charsChanged) {
              np = { ...np, characters: nextChars }
            }
          }
          if (p.kind === 'content') {
            const boxes = getPageTextBoxes(np)
            if (boxes.length > 0) {
              let boxesChanged = false
              const nextBoxes = boxes.map((tb) => {
                if (tb.pagePlacement === 'free') {
                  const c = clampTextBoxRect(
                    tb.x,
                    tb.y,
                    tb.widthPx,
                    tb.heightPx,
                    sz.cw,
                    sz.ch,
                  )
                  if (
                    c.x !== tb.x ||
                    c.y !== tb.y ||
                    c.widthPx !== tb.widthPx ||
                    c.heightPx !== tb.heightPx
                  ) {
                    boxesChanged = true
                    return { ...tb, ...c }
                  }
                  return tb
                }
                if (tb.pagePlacement !== 'margin_fill') {
                  const w = Math.min(tb.widthPx, sz.cw)
                  const h = Math.min(tb.heightPx, sz.ch)
                  const w2 = Math.max(TEXT_BOX_MIN_W, w)
                  const h2 = Math.max(TEXT_BOX_MIN_H, h)
                  if (w2 !== tb.widthPx || h2 !== tb.heightPx) {
                    boxesChanged = true
                    return { ...tb, widthPx: w2, heightPx: h2 }
                  }
                }
                return tb
              })
              if (boxesChanged) {
                np = { ...np, textBoxes: nextBoxes }
              }
            }
          }
          if (p.thoughtBubble) {
            const tb = p.thoughtBubble
            const c = {
              ...clampTextBoxRect(
                tb.x,
                tb.y,
                tb.widthPx,
                tb.heightPx,
                sz.cw,
                sz.ch,
              ),
              ...clampRectToPageFromSafeCoords(
                tb.x,
                tb.y,
                tb.widthPx,
                tb.heightPx,
                sz.cw,
                sz.ch,
                frame,
              ),
            }
            if (
              c.x !== tb.x ||
              c.y !== tb.y ||
              c.widthPx !== tb.widthPx ||
              c.heightPx !== tb.heightPx
            ) {
              np = { ...np, thoughtBubble: { ...tb, ...c } }
            }
          }
          return np
        })
        const unchanged =
          next.length === prev.length && next.every((q, i) => q === prev[i])
        return unchanged ? prev : next
      })
    })
    return () => cancelAnimationFrame(id)
  }, [paperSize, pageFrameSettings, pageIdsKey])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await builderFetch(apiUrl('/api/character/catalog'))
        if (res.status === 404) {
          // Character catalog is optional in this setup; keep builder usable.
          if (!cancelled) {
            setCatalog([])
            setLoadError(null)
          }
          return
        }
        if (!res.ok) throw new Error(await readApiErrorMessage(res))
        const data = (await res.json()) as CatalogCategory[]
        if (cancelled) return
        setCatalog(data)
        setLoadError(null)
      } catch (e) {
        if (!cancelled) {
          console.error('Failed to load catalog', e)
          setLoadError(
            'Could not load catalog right now. Please try again shortly.',
          )
        }
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    document
      .getElementById(`page-frame-${activePageIndex}`)
      ?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }, [activePageIndex])

  const onMouseDownPlaced = (
    e: React.MouseEvent,
    pageIndex: number,
    characterIndex: number,
  ) => {
    if (e.button !== 0) return
    if (
      (e.target as HTMLElement).closest(
        '.book-page__character__resize-handle, .book-page__character__rotate-handle',
      )
    ) {
      return
    }
    const pg = pages[pageIndex]
    const ch = getPageCharacters(pg)[characterIndex]
    if (!ch || !pg || pg.kind !== 'content') return
    e.preventDefault()
    e.stopPropagation()
    setCanvasContextMenu(null)
    setCharacterSelectedPageId(pg.id)
    setCharacterSelectedIndex(characterIndex)
    setTextBoxSelectedPageId(null)
    setThoughtBubbleSelectedPageId(null)
    setShapeSelectedPageId(null)
    setShapeSelectedIndex(null)
    setCanvasMultiSelection(null)
    setShapeMultiSelection(null)
    setActivePageIndex(pageIndex)
    const groupSnap =
      buildMultiDragSnap(pg, 'character', characterIndex) ??
      captureGroupDragSnap(pg, ch.groupId)
    setDrag({
      pageIndex,
      target: 'character',
      characterIndex,
      dx: ch.x,
      dy: ch.y,
      startX: e.clientX,
      startY: e.clientY,
      groupSnap: groupSnap ?? undefined,
    })
  }

  const onMouseDownThoughtBubble = (e: React.MouseEvent, pageIndex: number) => {
    if (e.button !== 0) return
    if (
      (e.target as HTMLElement).closest(
        '.book-page__thought-bubble__resize-handle',
      )
    ) {
      return
    }
    const pg = pages[pageIndex]
    const b = pg?.thoughtBubble
    if (!b || !pg || pg.kind !== 'content') return
    e.preventDefault()
    e.stopPropagation()
    setCanvasContextMenu(null)
    if (e.ctrlKey || e.metaKey) {
      toggleCanvasKindSelection(pg.id, 'thoughtBubble')
      return
    }
    const groupedSel = collectGroupedSelection(pg, b.groupId)
    if (groupedSel) {
      setCanvasMultiSelection(
        groupedSel.kinds.length > 0
          ? { pageId: pg.id, kinds: groupedSel.kinds }
          : null,
      )
      setShapeMultiSelection(
        groupedSel.shapeIndices.length > 0
          ? { pageId: pg.id, indices: groupedSel.shapeIndices }
          : null,
      )
    }
    const keepMulti =
      canvasMultiSelection?.pageId === pg.id &&
      canvasMultiSelection.kinds.length >= 2 &&
      canvasMultiSelection.kinds.includes('thoughtBubble')
    if (!keepMulti && !groupedSel) setCanvasMultiSelection(null)
    setTextBoxSelectedPageId(null)
    setCharacterSelectedPageId(null)
    setCharacterSelectedIndex(null)
    setThoughtBubbleSelectedPageId(pg.id)
    setShapeSelectedPageId(null)
    setShapeSelectedIndex(null)
    setActivePageIndex(pageIndex)
    const groupSnap =
      buildMultiDragSnap(pg, 'thoughtBubble') ?? captureGroupDragSnap(pg, b.groupId)
    setDrag({
      pageIndex,
      target: 'thoughtBubble',
      dx: b.x,
      dy: b.y,
      startX: e.clientX,
      startY: e.clientY,
      groupSnap: groupSnap ?? undefined,
    })
  }

  const onThoughtBubbleResizeMouseDown = (
    e: React.MouseEvent,
    pageIndex: number,
  ) => {
    e.preventDefault()
    e.stopPropagation()
    const pg = pages[pageIndex]
    const b = pg?.thoughtBubble
    if (!b || !pg) return
    setActivePageIndex(pageIndex)
    setThoughtBubbleSelectedPageId(pg.id)
    setThoughtBubbleResize({
      pageIndex,
      w0: b.widthPx,
      h0: b.heightPx,
      startX: e.clientX,
      startY: e.clientY,
    })
  }

  const onTextBoxResizeMouseDown = (
    e: React.MouseEvent,
    pageIndex: number,
    textBoxIndex: number,
  ) => {
    e.preventDefault()
    e.stopPropagation()
    const pg = pages[pageIndex]
    const tb = pg ? getPageTextBoxes(pg)[textBoxIndex] : null
    if (!tb || !pg) return
    setActivePageIndex(pageIndex)
    setTextBoxSelectedPageId(pg.id)
    setTextBoxSelectedIndex(textBoxIndex)
    setTextBoxResize({
      pageIndex,
      textBoxIndex,
      w0: tb.widthPx,
      h0: tb.heightPx,
      startX: e.clientX,
      startY: e.clientY,
    })
  }

  const onShapeResizeMouseDown = (
    e: React.MouseEvent,
    pageIndex: number,
    shapeIndex: number,
  ) => {
    e.preventDefault()
    e.stopPropagation()
    const pg = pages[pageIndex]
    const sh = pg?.shapes?.[shapeIndex]
    if (!sh || !pg) return
    setActivePageIndex(pageIndex)
    setShapeSelectedPageId(pg.id)
    setShapeSelectedIndex(shapeIndex)
    setShapeResize({
      pageIndex,
      shapeIndex,
      w0: sh.widthPx,
      h0: sh.heightPx,
      startX: e.clientX,
      startY: e.clientY,
    })
  }

  const onShapeRotateMouseDown = (
    e: React.MouseEvent,
    pageIndex: number,
    shapeIndex: number,
  ) => {
    e.preventDefault()
    e.stopPropagation()
    const pg = pages[pageIndex]
    const sh = pg?.shapes?.[shapeIndex]
    if (!sh || !pg) return
    const wrap = (e.currentTarget as HTMLElement).closest('.book-page__shape-wrap')
    const rect = wrap?.getBoundingClientRect()
    if (!rect) return
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    const startAngleDeg =
      (Math.atan2(e.clientY - centerY, e.clientX - centerX) * 180) / Math.PI
    setActivePageIndex(pageIndex)
    setShapeSelectedPageId(pg.id)
    setShapeSelectedIndex(shapeIndex)
    setShapeRotate({
      pageIndex,
      shapeIndex,
      deg0: sh.rotationDeg,
      startAngleDeg,
      centerX,
      centerY,
    })
  }

  const onCharacterResizeMouseDown = (
    e: React.MouseEvent,
    pageIndex: number,
    characterIndex: number,
  ) => {
    e.preventDefault()
    e.stopPropagation()
    const pg = pages[pageIndex]
    const ch = getPageCharacters(pg)[characterIndex]
    if (!ch || !pg || pg.kind !== 'content') return
    const surface = pageSurfaceRefs.current.get(pg.id)
    const sz = readDrawableSizeFromPageSurface(
      surface,
      effectivePageFrame(pg, pageFrameSettings),
    )
    const cw = sz?.cw ?? approximateDrawableSizePx(paperSize).cw
    const dims = characterPlacementBounds(ch, cw)
    setActivePageIndex(pageIndex)
    setTextBoxSelectedPageId(null)
    setThoughtBubbleSelectedPageId(null)
    setShapeSelectedPageId(null)
    setShapeSelectedIndex(null)
    setCharacterSelectedPageId(pg.id)
    setCharacterSelectedIndex(characterIndex)
    setCanvasMultiSelection(null)
    setCharacterResize({
      pageIndex,
      characterIndex,
      w0: dims.w,
      h0: dims.h,
      startX: e.clientX,
      startY: e.clientY,
    })
  }

  const onCharacterRotateMouseDown = (
    e: React.MouseEvent,
    pageIndex: number,
    characterIndex: number,
  ) => {
    e.preventDefault()
    e.stopPropagation()
    const pg = pages[pageIndex]
    const ch = getPageCharacters(pg)[characterIndex]
    if (!ch || !pg || pg.kind !== 'content') return
    const wrap = (e.currentTarget as HTMLElement).closest('.book-page__character')
    const rect = wrap?.getBoundingClientRect()
    if (!rect) return
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    const startAngleDeg =
      (Math.atan2(e.clientY - centerY, e.clientX - centerX) * 180) / Math.PI
    setActivePageIndex(pageIndex)
    setTextBoxSelectedPageId(null)
    setThoughtBubbleSelectedPageId(null)
    setShapeSelectedPageId(null)
    setShapeSelectedIndex(null)
    setCanvasMultiSelection({ pageId: pg.id, kinds: ['character'] })
    setCharacterSelectedPageId(pg.id)
    setCharacterSelectedIndex(characterIndex)
    setCanvasMultiSelection(null)
    setCharacterRotate({
      pageIndex,
      characterIndex,
      deg0: ch.rotationDeg ?? 0,
      startAngleDeg,
      centerX,
      centerY,
    })
  }

  const onGroupResizeMouseDown = useCallback(
    (e: React.MouseEvent, pageIndex: number, groupId: string) => {
      e.preventDefault()
      e.stopPropagation()
      const pg = pages[pageIndex]
      if (!pg || pg.kind !== 'content' || !groupId.trim()) return
      const rects = collectGroupMemberRects(pg, groupId)
      if (rects.length < 2) return
      const left = Math.min(...rects.map((r) => r.x))
      const top = Math.min(...rects.map((r) => r.y))
      const right = Math.max(...rects.map((r) => r.x + r.w))
      const bottom = Math.max(...rects.map((r) => r.y + r.h))
      const bbox = {
        x: left,
        y: top,
        w: Math.max(1, right - left),
        h: Math.max(1, bottom - top),
      }

      const shapeSnaps: Array<{
        index: number
        x: number
        y: number
        w: number
        h: number
      }> = []
      pg.shapes?.forEach((sh, index) => {
        if (sh.groupId === groupId) {
          shapeSnaps.push({
            index,
            x: sh.x,
            y: sh.y,
            w: sh.widthPx,
            h: sh.heightPx,
          })
        }
      })

      const textBoxes: Array<{
        index: number
        x: number
        y: number
        w: number
        h: number
      }> = []
      getPageTextBoxes(pg).forEach((tb, index) => {
        if (tb.groupId === groupId) {
          textBoxes.push({
            index,
            x: tb.x,
            y: tb.y,
            w: tb.widthPx,
            h: tb.heightPx,
          })
        }
      })

      const thoughtBubble =
        pg.thoughtBubble?.groupId === groupId
          ? {
              x: pg.thoughtBubble.x,
              y: pg.thoughtBubble.y,
              w: pg.thoughtBubble.widthPx,
              h: pg.thoughtBubble.heightPx,
            }
          : null

      let character: {
        x: number
        y: number
        w: number
        h: number
      } | null = null
      const ch = getPageCharacters(pg).find((c) => c.groupId === groupId)
      if (ch) {
        const surface = pageSurfaceRefs.current.get(pg.id)
        const sz = readDrawableSizeFromPageSurface(
          surface,
          effectivePageFrame(pg, pageFrameSettings),
        )
        const cw = sz?.cw ?? approximateDrawableSizePx(paperSize).cw
        const dims = characterPlacementBounds(ch, cw)
        character = {
          x: ch.x,
          y: ch.y,
          w:
            typeof ch.widthPx === 'number' && ch.widthPx > 0 ? ch.widthPx : dims.w,
          h:
            typeof ch.heightPx === 'number' && ch.heightPx > 0 ? ch.heightPx : dims.h,
        }
      }

      const minScale = minScaleForGroupResize({
        shapes: shapeSnaps,
        textBoxes,
        thoughtBubble,
        character,
      })

      setActivePageIndex(pageIndex)
      setGroupResize({
        pageIndex,
        bbox,
        startClientX: e.clientX,
        startClientY: e.clientY,
        minScale,
        shapes: shapeSnaps,
        textBoxes,
        thoughtBubble,
        character,
      })
    },
    [
      pages,
      collectGroupMemberRects,
      pageFrameSettings,
      paperSize,
    ],
  )

  const onMouseDownShape = (
    e: React.MouseEvent,
    pageIndex: number,
    shapeIndex: number,
  ) => {
    if (e.button !== 0) return
    if (
      (e.target as HTMLElement).closest(
        '.book-page__shape__resize-handle, .book-page__shape__rotate-handle',
      )
    ) {
      return
    }
    const pg = pages[pageIndex]
    const sh = pg?.shapes?.[shapeIndex]
    if (!sh || !pg || pg.kind !== 'content') return
    e.preventDefault()
    e.stopPropagation()
    setCanvasContextMenu(null)
    if (e.ctrlKey || e.metaKey) {
      setTextBoxSelectedPageId(null)
      setThoughtBubbleSelectedPageId(null)
      setShapeSelectedPageId(pg.id)
      setShapeSelectedIndex(shapeIndex)
      setShapeMultiSelection((prev) => {
        const base =
          prev && prev.pageId === pg.id
            ? [...prev.indices]
            : shapeSelectedPageId === pg.id && shapeSelectedIndex != null
              ? [shapeSelectedIndex]
              : []
        const has = base.includes(shapeIndex)
        const next = has
          ? base.filter((i) => i !== shapeIndex)
          : [...base, shapeIndex]
        return next.length > 0 ? { pageId: pg.id, indices: next } : null
      })
      return
    }
    const groupedSel = collectGroupedSelection(pg, sh.groupId)
    if (groupedSel) {
      setCanvasMultiSelection(
        groupedSel.kinds.length > 0
          ? { pageId: pg.id, kinds: groupedSel.kinds }
          : null,
      )
      setShapeMultiSelection(
        groupedSel.shapeIndices.length > 0
          ? { pageId: pg.id, indices: groupedSel.shapeIndices }
          : null,
      )
    }
    const keepMulti =
      shapeMultiSelection?.pageId === pg.id &&
      shapeMultiSelection.indices.length >= 2 &&
      shapeMultiSelection.indices.includes(shapeIndex)
    if (!keepMulti && !groupedSel) setShapeMultiSelection(null)
    if (!groupedSel) setCanvasMultiSelection(null)
    setTextBoxSelectedPageId(null)
    setThoughtBubbleSelectedPageId(null)
    setCharacterSelectedPageId(null)
    setCharacterSelectedIndex(null)
    setShapeSelectedPageId(pg.id)
    setShapeSelectedIndex(shapeIndex)
    setActivePageIndex(pageIndex)
    const shapeGroupSnap =
      sh.groupId && pg.shapes
        ? pg.shapes
            .map((it, i2) =>
              it.groupId === sh.groupId
                ? {
                    index: i2,
                    x: it.x,
                    y: it.y,
                    widthPx: it.widthPx,
                    heightPx: it.heightPx,
                  }
                : null,
            )
            .filter(
              (x): x is { index: number; x: number; y: number; widthPx: number; heightPx: number } =>
                !!x,
            )
        : keepMulti && shapeMultiSelection?.pageId === pg.id
          ? pg.shapes
              .map((it, i2) =>
                shapeMultiSelection.indices.includes(i2)
                  ? {
                      index: i2,
                      x: it.x,
                      y: it.y,
                      widthPx: it.widthPx,
                      heightPx: it.heightPx,
                    }
                  : null,
              )
              .filter(
                (x): x is { index: number; x: number; y: number; widthPx: number; heightPx: number } =>
                  !!x,
              )
          : null
    const mixedGroupSnap = captureGroupDragSnap(pg, sh.groupId)
    setDrag({
      pageIndex,
      target: 'shape',
      shapeIndex,
      dx: sh.x,
      dy: sh.y,
      startX: e.clientX,
      startY: e.clientY,
      groupSnap: mixedGroupSnap ?? undefined,
      shapeGroupSnap:
        shapeGroupSnap && shapeGroupSnap.length >= 2 ? shapeGroupSnap : undefined,
    })
  }

  const onMouseDownTextBox = (
    e: React.MouseEvent,
    pageIndex: number,
    textBoxIndex: number,
  ) => {
    if (e.button !== 0) return
    if (
      (e.target as HTMLElement).closest('.book-page__text-box__resize-handle')
    ) {
      return
    }
    const pg = pages[pageIndex]
    const tb = pg ? getPageTextBoxes(pg)[textBoxIndex] : null
    if (!tb || !pg || pg.kind !== 'content') return
    e.preventDefault()
    e.stopPropagation()
    setCanvasContextMenu(null)
    if (e.ctrlKey || e.metaKey) {
      toggleCanvasKindSelection(pg.id, 'textBox')
      return
    }
    const groupedSel = collectGroupedSelection(pg, tb.groupId)
    if (groupedSel) {
      setCanvasMultiSelection(
        groupedSel.kinds.length > 0
          ? { pageId: pg.id, kinds: groupedSel.kinds }
          : null,
      )
      setShapeMultiSelection(
        groupedSel.shapeIndices.length > 0
          ? { pageId: pg.id, indices: groupedSel.shapeIndices }
          : null,
      )
    }
    const keepMulti =
      canvasMultiSelection?.pageId === pg.id &&
      canvasMultiSelection.kinds.length >= 2 &&
      canvasMultiSelection.kinds.includes('textBox')
    if (!keepMulti && !groupedSel) setCanvasMultiSelection(null)
    setThoughtBubbleSelectedPageId(null)
    setCharacterSelectedPageId(null)
    setCharacterSelectedIndex(null)
    setShapeSelectedPageId(null)
    setShapeSelectedIndex(null)
    setTextBoxSelectedPageId(pg.id)
    setTextBoxSelectedIndex(textBoxIndex)
    setActivePageIndex(pageIndex)

    textBoxPointerRef.current = {
      pageIndex,
      pageId: pg.id,
      textBoxIndex,
      startX: e.clientX,
      startY: e.clientY,
      tb: { ...tb },
    }

    const onMove = (ev: MouseEvent) => {
      const pr = textBoxPointerRef.current
      if (!pr) return
      const dx = ev.clientX - pr.startX
      const dy = ev.clientY - pr.startY
      if (Math.hypot(dx, dy) < TEXT_BOX_DRAG_PX) return
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
      textBoxPointerRef.current = null
      const pgAtMove = pages[pr.pageIndex]
      const tbLive = pgAtMove
        ? getPageTextBoxes(pgAtMove)[pr.textBoxIndex]
        : null
      if (!pgAtMove || !tbLive) return
      const surface = pageSurfaceRefs.current.get(pgAtMove.id)
      const sz = readDrawableSizeFromPageSurface(
        surface,
        effectivePageFrame(pgAtMove, pageFrameSettings),
      )
      const cur = sz
        ? resolveTextBoxLayout(tbLive, sz.cw, sz.ch)
        : {
            x: tbLive.x,
            y: tbLive.y,
            widthPx: tbLive.widthPx,
            heightPx: tbLive.heightPx,
          }
      setPages((prev) =>
        prev.map((pp, idx) => {
          if (idx !== pr.pageIndex || pp.kind !== 'content') return pp
          const boxes = getPageTextBoxes(pp)
          if (!boxes[pr.textBoxIndex]) return pp
          return {
            ...pp,
            textBoxes: boxes.map((box, bi) =>
              bi === pr.textBoxIndex
                ? {
                    ...box,
                    pagePlacement: 'free' as const,
                    x: cur.x,
                    y: cur.y,
                    widthPx: cur.widthPx,
                    heightPx: cur.heightPx,
                  }
                : box,
            ),
          }
        }),
      )
      const groupSnap =
        buildMultiDragSnap(pgAtMove, 'textBox', undefined, pr.textBoxIndex) ??
        captureGroupDragSnap(pgAtMove, tbLive.groupId)
      setDrag({
        pageIndex: pr.pageIndex,
        target: 'textBox',
        textBoxIndex: pr.textBoxIndex,
        dx: cur.x,
        dy: cur.y,
        startX: pr.startX,
        startY: pr.startY,
        groupSnap: groupSnap ?? undefined,
      })
    }

    const onUp = () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
      const pr = textBoxPointerRef.current
      textBoxPointerRef.current = null
      if (pr) {
        setTextBoxSelectedPageId(pr.pageId)
        setTextBoxSelectedIndex(pr.textBoxIndex)
      }
    }

    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }

  const getPreferredCanvasPick = useCallback(
    (pageId: string): CanvasPickTarget | null => {
      if (
        shapeSelectedPageId === pageId &&
        shapeSelectedIndex != null
      ) {
        return { kind: 'shape', shapeIndex: shapeSelectedIndex }
      }
      if (
        shapeMultiSelection?.pageId === pageId &&
        shapeMultiSelection.indices.length === 1
      ) {
        return {
          kind: 'shape',
          shapeIndex: shapeMultiSelection.indices[0]!,
        }
      }
      if (
        characterSelectedPageId === pageId &&
        characterSelectedIndex != null
      ) {
        return { kind: 'character', characterIndex: characterSelectedIndex }
      }
      if (
        textBoxSelectedPageId === pageId &&
        textBoxSelectedIndex != null
      ) {
        return { kind: 'textBox', textBoxIndex: textBoxSelectedIndex }
      }
      if (thoughtBubbleSelectedPageId === pageId) {
        return { kind: 'thoughtBubble' }
      }
      return null
    },
    [
      characterSelectedIndex,
      characterSelectedPageId,
      shapeMultiSelection,
      shapeSelectedIndex,
      shapeSelectedPageId,
      textBoxSelectedIndex,
      textBoxSelectedPageId,
      thoughtBubbleSelectedPageId,
    ],
  )

  const onCanvasSafeMouseDownCapture = (
    e: React.MouseEvent,
    pageIndex: number,
  ) => {
    if (e.button !== 0) return
    const pg = pages[pageIndex]
    if (!pg || pg.kind !== 'content') return
    const hit = e.target as HTMLElement
    if (hit.closest(CANVAS_PICK_IGNORE_SELECTOR)) return
    if (
      hit.closest(
        '.book-page__text-box__inner [contenteditable], .ProseMirror, .tiptap',
      )
    ) {
      return
    }

    const safe = e.currentTarget as HTMLElement
    const stack = collectCanvasPickStack(e.clientX, e.clientY, safe)

    if (stack.length === 0) {
      canvasPickCycleRef.current = null
      if (hit === safe) {
        setTextBoxSelectedPageId(null)
        setThoughtBubbleSelectedPageId(null)
        setShapeSelectedPageId(null)
        setShapeSelectedIndex(null)
        setShapeMultiSelection(null)
        setCanvasMultiSelection(null)
        setCanvasContextMenu(null)
      }
      return
    }

    e.preventDefault()
    e.stopPropagation()

    const preferRaw = getPreferredCanvasPick(pg.id)
    const prefer =
      preferRaw &&
      clientPointInPickTarget(safe, preferRaw, e.clientX, e.clientY)
        ? preferRaw
        : null

    const { index, nextCycle } = resolveCanvasPickIndex(
      pageIndex,
      e.clientX,
      e.clientY,
      stack,
      prefer,
      canvasPickCycleRef.current,
    )
    canvasPickCycleRef.current = nextCycle
    const picked = stack[index]
    if (!picked) return

    if (picked.kind === 'shape') {
      onMouseDownShape(e, pageIndex, picked.shapeIndex)
      return
    }
    if (picked.kind === 'character') {
      onMouseDownPlaced(e, pageIndex, picked.characterIndex)
      return
    }
    if (picked.kind === 'textBox') {
      onMouseDownTextBox(e, pageIndex, picked.textBoxIndex)
      return
    }
    onMouseDownThoughtBubble(e, pageIndex)
  }

  useEffect(() => {
    if (!drag) return
    const i = drag.pageIndex
    const gs = drag.groupSnap ?? null
    const move = (e: MouseEvent) => {
      setPages((prev) =>
        prev.map((p, idx) => {
          if (idx !== i) return p
          const surface = pageSurfaceRefs.current.get(p.id)
          const frame = effectivePageFrame(p, pageFrameSettings)
          const sz = readDrawableSizeFromPageSurface(surface, frame)
          if (gs && p.kind === 'content') {
            let ddx = 0
            let ddy = 0
            if (
              drag.target === 'character' &&
              drag.characterIndex != null &&
              gs.characters?.length
            ) {
              const anchor = gs.characters.find(
                (c) => c.index === drag.characterIndex,
              )
              const live = getPageCharacters(p)[drag.characterIndex]
              if (!anchor || !live) return p
              const nx = drag.dx + (e.clientX - drag.startX)
              const ny = drag.dy + (e.clientY - drag.startY)
              const { x, y } =
                sz == null
                  ? { x: nx, y: ny }
                  : (() => {
                      const cs = characterPlacementBounds(live, sz.cw)
                      return clampRectToPageFromSafeCoords(
                        nx,
                        ny,
                        cs.w,
                        cs.h,
                        sz.cw,
                        sz.ch,
                        frame,
                      )
                    })()
              ddx = x - anchor.x
              ddy = y - anchor.y
            } else if (
              drag.target === 'textBox' &&
              drag.textBoxIndex != null &&
              gs.textBoxes?.length
            ) {
              const anchor = gs.textBoxes.find(
                (t) => t.index === drag.textBoxIndex,
              )
              const live = getPageTextBoxes(p)[drag.textBoxIndex]
              if (!anchor || !live) return p
              const nx = drag.dx + (e.clientX - drag.startX)
              const ny = drag.dy + (e.clientY - drag.startY)
              const c = sz
                ? clampTextBoxRect(
                    nx,
                    ny,
                    live.widthPx,
                    live.heightPx,
                    sz.cw,
                    sz.ch,
                  )
                : {
                    x: nx,
                    y: ny,
                    widthPx: live.widthPx,
                    heightPx: live.heightPx,
                  }
              ddx = c.x - anchor.x
              ddy = c.y - anchor.y
            } else if (
              drag.target === 'thoughtBubble' &&
              p.thoughtBubble &&
              gs.thoughtBubble
            ) {
              const tb = p.thoughtBubble
              const nx = drag.dx + (e.clientX - drag.startX)
              const ny = drag.dy + (e.clientY - drag.startY)
              const c = sz
                ? {
                    ...clampTextBoxRect(
                      nx,
                      ny,
                      tb.widthPx,
                      tb.heightPx,
                      sz.cw,
                      sz.ch,
                    ),
                    ...clampRectToPageFromSafeCoords(
                      nx,
                      ny,
                      tb.widthPx,
                      tb.heightPx,
                      sz.cw,
                      sz.ch,
                      frame,
                    ),
                  }
                : {
                    x: nx,
                    y: ny,
                    widthPx: tb.widthPx,
                    heightPx: tb.heightPx,
                  }
              ddx = c.x - gs.thoughtBubble.x
              ddy = c.y - gs.thoughtBubble.y
            } else if (
              drag.target === 'shape' &&
              drag.shapeIndex != null &&
              gs.shapes?.length
            ) {
              const anchor = gs.shapes.find((s) => s.index === drag.shapeIndex)
              if (!anchor) return p
              const nx = drag.dx + (e.clientX - drag.startX)
              const ny = drag.dy + (e.clientY - drag.startY)
              const c = sz
                ? clampRectToPageFromSafeCoords(
                    nx,
                    ny,
                    anchor.widthPx,
                    anchor.heightPx,
                    sz.cw,
                    sz.ch,
                    frame,
                  )
                : { x: nx, y: ny }
              ddx = c.x - anchor.x
              ddy = c.y - anchor.y
            } else {
              return p
            }
            return applyGroupTranslate(
              p,
              gs,
              ddx,
              ddy,
              surface ?? null,
              pageFrameSettings,
            )
          }
          if (
            drag.target === 'character' &&
            drag.characterIndex != null &&
            p.kind === 'content'
          ) {
            const ch = getPageCharacters(p)[drag.characterIndex]
            if (!ch) return p
            const nx = drag.dx + (e.clientX - drag.startX)
            const ny = drag.dy + (e.clientY - drag.startY)
            const { x, y } =
              sz == null
                ? { x: nx, y: ny }
                : (() => {
                    const cs = characterPlacementBounds(ch, sz.cw)
                    return clampRectToPageFromSafeCoords(
                      nx,
                      ny,
                      cs.w,
                      cs.h,
                      sz.cw,
                      sz.ch,
                      frame,
                    )
                  })()
            return {
              ...p,
              characters: p.characters.map((c, ci) =>
                ci === drag.characterIndex ? { ...c, x, y } : c,
              ),
            }
          }
          if (
            drag.target === 'textBox' &&
            drag.textBoxIndex != null &&
            p.kind === 'content'
          ) {
            const tb = getPageTextBoxes(p)[drag.textBoxIndex]
            if (!tb) return p
            const nx = drag.dx + (e.clientX - drag.startX)
            const ny = drag.dy + (e.clientY - drag.startY)
            const c = sz
              ? clampTextBoxRect(
                  nx,
                  ny,
                  tb.widthPx,
                  tb.heightPx,
                  sz.cw,
                  sz.ch,
                )
              : {
                  x: nx,
                  y: ny,
                  widthPx: tb.widthPx,
                  heightPx: tb.heightPx,
                }
            return {
              ...p,
              textBoxes: getPageTextBoxes(p).map((box, bi) =>
                bi === drag.textBoxIndex
                  ? {
                      ...box,
                      pagePlacement: 'free' as const,
                      x: c.x,
                      y: c.y,
                      widthPx: c.widthPx,
                      heightPx: c.heightPx,
                    }
                  : box,
              ),
            }
          }
          if (drag.target === 'thoughtBubble' && p.thoughtBubble) {
            const tb = p.thoughtBubble
            const nx = drag.dx + (e.clientX - drag.startX)
            const ny = drag.dy + (e.clientY - drag.startY)
            const c = sz
              ? {
                  ...clampTextBoxRect(
                    nx,
                    ny,
                    tb.widthPx,
                    tb.heightPx,
                    sz.cw,
                    sz.ch,
                  ),
                  ...clampRectToPageFromSafeCoords(
                    nx,
                    ny,
                    tb.widthPx,
                    tb.heightPx,
                    sz.cw,
                    sz.ch,
                    frame,
                  ),
                }
              : {
                  x: nx,
                  y: ny,
                  widthPx: tb.widthPx,
                  heightPx: tb.heightPx,
                }
            return {
              ...p,
              thoughtBubble: {
                ...tb,
                x: c.x,
                y: c.y,
                widthPx: c.widthPx,
                heightPx: c.heightPx,
              },
            }
          }
          if (drag.target === 'shape' && drag.shapeIndex != null) {
            if (drag.shapeGroupSnap && drag.shapeGroupSnap.length >= 2) {
              const nextShapes = [...(p.shapes ?? [])]
              let tx = e.clientX - drag.startX
              let ty = e.clientY - drag.startY
              const allImagesInGroup = drag.shapeGroupSnap.every((snap) => {
                const cur = p.shapes?.[snap.index]
                return !!cur && cur.kind === 'image'
              })
              if (sz && !allImagesInGroup) {
                const left = Math.min(...drag.shapeGroupSnap.map((s) => s.x))
                const top = Math.min(...drag.shapeGroupSnap.map((s) => s.y))
                const right = Math.max(
                  ...drag.shapeGroupSnap.map((s) => s.x + s.widthPx),
                )
                const bottom = Math.max(
                  ...drag.shapeGroupSnap.map((s) => s.y + s.heightPx),
                )
                const clamped = clampRectToPageFromSafeCoords(
                  left + tx,
                  top + ty,
                  right - left,
                  bottom - top,
                  sz.cw,
                  sz.ch,
                  frame,
                )
                tx = clamped.x - left
                ty = clamped.y - top
              }
              for (const snap of drag.shapeGroupSnap) {
                const cur = nextShapes[snap.index]
                if (!cur) continue
                nextShapes[snap.index] = {
                  ...cur,
                  x: Math.round(snap.x + tx),
                  y: Math.round(snap.y + ty),
                }
              }
              return { ...p, shapes: nextShapes }
            }
            const sh = p.shapes?.[drag.shapeIndex]
            if (!sh) return p
            const nx = drag.dx + (e.clientX - drag.startX)
            const ny = drag.dy + (e.clientY - drag.startY)
            const c = sh.kind === 'image'
              ? {
                  x: nx,
                  y: ny,
                  widthPx: sh.widthPx,
                  heightPx: sh.heightPx,
                }
              : sz
              ? {
                  ...clampTextBoxRect(
                    nx,
                    ny,
                    sh.widthPx,
                    sh.heightPx,
                    sz.cw,
                    sz.ch,
                  ),
                  ...clampRectToPageFromSafeCoords(
                    nx,
                    ny,
                    sh.widthPx,
                    sh.heightPx,
                    sz.cw,
                    sz.ch,
                    frame,
                  ),
                }
              : {
                  x: nx,
                  y: ny,
                  widthPx: sh.widthPx,
                  heightPx: sh.heightPx,
                }
            const nextShapes = [...(p.shapes ?? [])]
            nextShapes[drag.shapeIndex] = {
              ...sh,
              x: c.x,
              y: c.y,
            }
            return { ...p, shapes: nextShapes }
          }
          return p
        }),
      )
    }
    const up = () => setDrag(null)
    window.addEventListener('mousemove', move)
    window.addEventListener('mouseup', up)
    return () => {
      window.removeEventListener('mousemove', move)
      window.removeEventListener('mouseup', up)
    }
  }, [drag, pageFrameSettings])

  useEffect(() => {
    if (!drag) return
    const body = document.body
    const prev = body.style.cursor
    body.style.cursor = 'grabbing'
    return () => {
      body.style.cursor = prev
    }
  }, [drag])

  useEffect(() => {
    if (!textBoxResize) return
    const { pageIndex, textBoxIndex, w0, h0, startX, startY } = textBoxResize
    const move = (e: MouseEvent) => {
      const w = Math.max(
        TEXT_BOX_MIN_W,
        Math.round(w0 + (e.clientX - startX)),
      )
      const h = Math.max(
        TEXT_BOX_MIN_H,
        Math.round(h0 + (e.clientY - startY)),
      )
      setPages((prev) =>
        prev.map((p, idx) => {
          if (idx !== pageIndex || p.kind !== 'content') return p
          const boxes = getPageTextBoxes(p)
          const tb = boxes[textBoxIndex]
          if (!tb) return p
          const surface = pageSurfaceRefs.current.get(p.id)
          const sz = readDrawableSizeFromPageSurface(
            surface,
            effectivePageFrame(p, pageFrameSettings),
          )
          if (!sz) {
            return {
              ...p,
              textBoxes: boxes.map((box, bi) =>
                bi === textBoxIndex
                  ? {
                      ...box,
                      pagePlacement: 'free' as const,
                      widthPx: w,
                      heightPx: h,
                    }
                  : box,
              ),
            }
          }
          const c = clampTextBoxRect(tb.x, tb.y, w, h, sz.cw, sz.ch)
          return {
            ...p,
            textBoxes: boxes.map((box, bi) =>
              bi === textBoxIndex
                ? {
                    ...box,
                    pagePlacement: 'free' as const,
                    x: c.x,
                    y: c.y,
                    widthPx: c.widthPx,
                    heightPx: c.heightPx,
                  }
                : box,
            ),
          }
        }),
      )
    }
    const up = () => setTextBoxResize(null)
    window.addEventListener('mousemove', move)
    window.addEventListener('mouseup', up)
    return () => {
      window.removeEventListener('mousemove', move)
      window.removeEventListener('mouseup', up)
    }
  }, [textBoxResize, pageFrameSettings, pages])

  useEffect(() => {
    if (!thoughtBubbleResize) return
    const { pageIndex, w0, h0, startX, startY } = thoughtBubbleResize
    const move = (e: MouseEvent) => {
      const w = Math.max(
        THOUGHT_BUBBLE_MIN_W,
        Math.round(w0 + (e.clientX - startX)),
      )
      const h = Math.max(
        THOUGHT_BUBBLE_MIN_H,
        Math.round(h0 + (e.clientY - startY)),
      )
      setPages((prev) =>
        prev.map((p, idx) => {
          if (idx !== pageIndex || !p.thoughtBubble) return p
          const surface = pageSurfaceRefs.current.get(p.id)
          const sz = readDrawableSizeFromPageSurface(
            surface,
            effectivePageFrame(p, pageFrameSettings),
          )
          if (!sz) {
            return {
              ...p,
              thoughtBubble: {
                ...p.thoughtBubble,
                widthPx: w,
                heightPx: h,
              },
            }
          }
          const c = clampTextBoxRect(
            p.thoughtBubble.x,
            p.thoughtBubble.y,
            w,
            h,
            sz.cw,
            sz.ch,
          )
          return {
            ...p,
            thoughtBubble: {
              ...p.thoughtBubble,
              x: c.x,
              y: c.y,
              widthPx: c.widthPx,
              heightPx: c.heightPx,
            },
          }
        }),
      )
    }
    const up = () => setThoughtBubbleResize(null)
    window.addEventListener('mousemove', move)
    window.addEventListener('mouseup', up)
    return () => {
      window.removeEventListener('mousemove', move)
      window.removeEventListener('mouseup', up)
    }
  }, [thoughtBubbleResize, pageFrameSettings, pages])

  useEffect(() => {
    if (!shapeResize) return
    const { pageIndex, shapeIndex, w0, h0, startX, startY } = shapeResize
    const move = (e: MouseEvent) => {
      setPages((prev) =>
        prev.map((p, idx) => {
          if (idx !== pageIndex || !p.shapes?.[shapeIndex]) return p
          const sh = p.shapes[shapeIndex]
          let w = Math.max(SHAPE_MIN_W, Math.round(w0 + (e.clientX - startX)))
          let h = Math.max(SHAPE_MIN_H, Math.round(h0 + (e.clientY - startY)))
          if (sh.kind === 'image') {
            const ratio = w0 / Math.max(1, h0)
            const dx = e.clientX - startX
            const dy = e.clientY - startY
            if (Math.abs(dx) >= Math.abs(dy)) {
              w = Math.max(SHAPE_MIN_W, Math.round(w0 + dx))
              h = Math.max(SHAPE_MIN_H, Math.round(w / ratio))
            } else {
              h = Math.max(SHAPE_MIN_H, Math.round(h0 + dy))
              w = Math.max(SHAPE_MIN_W, Math.round(h * ratio))
            }
          }
          const surface = pageSurfaceRefs.current.get(p.id)
          const sz = readDrawableSizeFromPageSurface(
            surface,
            effectivePageFrame(p, pageFrameSettings),
          )
          if (!sz || sh.kind === 'image') {
            return {
              ...p,
              shapes: p.shapes.map((it, i2) =>
                i2 === shapeIndex ? { ...it, widthPx: w, heightPx: h } : it,
              ),
            }
          }
          const c = clampTextBoxRect(sh.x, sh.y, w, h, sz.cw, sz.ch)
          return {
            ...p,
            shapes: p.shapes.map((it, i2) =>
              i2 === shapeIndex
                ? {
                    ...it,
                    x: c.x,
                    y: c.y,
                    widthPx: c.widthPx,
                    heightPx: c.heightPx,
                  }
                : it,
            ),
          }
        }),
      )
    }
    const up = () => setShapeResize(null)
    window.addEventListener('mousemove', move)
    window.addEventListener('mouseup', up)
    return () => {
      window.removeEventListener('mousemove', move)
      window.removeEventListener('mouseup', up)
    }
  }, [shapeResize, pageFrameSettings])

  useEffect(() => {
    if (!shapeRotate) return
    const { pageIndex, shapeIndex, deg0, startAngleDeg, centerX, centerY } =
      shapeRotate
    const move = (e: MouseEvent) => {
      const currentAngleDeg =
        (Math.atan2(e.clientY - centerY, e.clientX - centerX) * 180) / Math.PI
      let delta = currentAngleDeg - startAngleDeg
      if (delta > 180) delta -= 360
      if (delta < -180) delta += 360
      const deg = Math.max(-180, Math.min(180, Math.round(deg0 + delta)))
      setPages((prev) =>
        prev.map((p, idx) =>
          idx === pageIndex && p.shapes?.[shapeIndex]
            ? {
                ...p,
                shapes: p.shapes.map((it, i2) =>
                  i2 === shapeIndex ? { ...it, rotationDeg: deg } : it,
                ),
              }
            : p,
        ),
      )
    }
    const up = () => setShapeRotate(null)
    window.addEventListener('mousemove', move)
    window.addEventListener('mouseup', up)
    return () => {
      window.removeEventListener('mousemove', move)
      window.removeEventListener('mouseup', up)
    }
  }, [shapeRotate])

  useEffect(() => {
    if (!characterResize) return
    const { pageIndex, characterIndex, w0, h0, startX, startY } = characterResize
    const ratio = w0 / Math.max(1, h0)
    const move = (e: MouseEvent) => {
      setPages((prev) =>
        prev.map((p, idx) => {
          if (idx !== pageIndex || p.kind !== 'content') {
            return p
          }
          const ch = p.characters[characterIndex]
          if (!ch) return p
          const dx = e.clientX - startX
          const dy = e.clientY - startY
          let w: number
          let h: number
          if (Math.abs(dx) >= Math.abs(dy)) {
            w = Math.max(CHARACTER_MIN_W, Math.round(w0 + dx))
            h = Math.max(CHARACTER_MIN_H, Math.round(w / ratio))
          } else {
            h = Math.max(CHARACTER_MIN_H, Math.round(h0 + dy))
            w = Math.max(CHARACTER_MIN_W, Math.round(h * ratio))
          }
          const surface = pageSurfaceRefs.current.get(p.id)
          const frame = effectivePageFrame(p, pageFrameSettings)
          const sz = readDrawableSizeFromPageSurface(surface, frame)
          const patch = !sz
            ? { widthPx: w, heightPx: h }
            : (() => {
                const c = clampRectToPageFromSafeCoords(
                  ch.x,
                  ch.y,
                  w,
                  h,
                  sz.cw,
                  sz.ch,
                  frame,
                )
                return {
                  x: c.x,
                  y: c.y,
                  widthPx: w,
                  heightPx: h,
                }
              })()
          return {
            ...p,
            characters: p.characters.map((c, ci) =>
              ci === characterIndex ? { ...c, ...patch } : c,
            ),
          }
        }),
      )
    }
    const up = () => setCharacterResize(null)
    window.addEventListener('mousemove', move)
    window.addEventListener('mouseup', up)
    return () => {
      window.removeEventListener('mousemove', move)
      window.removeEventListener('mouseup', up)
    }
  }, [characterResize, pageFrameSettings])

  useEffect(() => {
    if (!groupResize) return
    const gr = groupResize
    const move = (e: MouseEvent) => {
      setPages((prev) => {
        const p = prev[gr.pageIndex]
        if (!p || p.kind !== 'content') return prev

        const dx = e.clientX - gr.startClientX
        const dy = e.clientY - gr.startClientY
        const bw = gr.bbox.w
        const bh = gr.bbox.h
        if (bw <= 0 || bh <= 0) return prev

        let s = Math.min((bw + dx) / bw, (bh + dy) / bh)
        if (!Number.isFinite(s) || s <= 0) s = gr.minScale
        s = Math.max(s, gr.minScale)

        const bx = gr.bbox.x
        const by = gr.bbox.y

        const surface = pageSurfaceRefs.current.get(p.id)
        const frame = effectivePageFrame(p, pageFrameSettings)
        const sz = readDrawableSizeFromPageSurface(surface, frame)

        let nextShapes = [...(p.shapes ?? [])]
        for (const snap of gr.shapes) {
          const orig = nextShapes[snap.index]
          if (!orig) continue
          const nx = Math.round(bx + (snap.x - bx) * s)
          const ny = Math.round(by + (snap.y - by) * s)
          const nw = Math.max(SHAPE_MIN_W, Math.round(snap.w * s))
          const nh = Math.max(SHAPE_MIN_H, Math.round(snap.h * s))
          let updated = { ...orig, x: nx, y: ny, widthPx: nw, heightPx: nh }
          if (sz) {
            const c = clampTextBoxRect(nx, ny, nw, nh, sz.cw, sz.ch)
            updated = {
              ...updated,
              x: c.x,
              y: c.y,
              widthPx: c.widthPx,
              heightPx: c.heightPx,
            }
          }
          nextShapes[snap.index] = updated
        }

        let nextPage: BookPageData = { ...p, shapes: nextShapes }

        if (gr.textBoxes?.length) {
          const boxes = [...getPageTextBoxes(nextPage)]
          for (const snap of gr.textBoxes) {
            const orig = boxes[snap.index]
            if (!orig) continue
            const nx = Math.round(bx + (snap.x - bx) * s)
            const ny = Math.round(by + (snap.y - by) * s)
            const nw = Math.max(TEXT_BOX_MIN_W, Math.round(snap.w * s))
            const nh = Math.max(TEXT_BOX_MIN_H, Math.round(snap.h * s))
            let updated = {
              ...orig,
              pagePlacement: 'free' as const,
              x: nx,
              y: ny,
              widthPx: nw,
              heightPx: nh,
            }
            if (sz) {
              const c = clampTextBoxRect(nx, ny, nw, nh, sz.cw, sz.ch)
              updated = {
                ...updated,
                x: c.x,
                y: c.y,
                widthPx: c.widthPx,
                heightPx: c.heightPx,
              }
            }
            boxes[snap.index] = updated
          }
          nextPage = { ...nextPage, textBoxes: boxes }
        }

        if (gr.thoughtBubble && nextPage.thoughtBubble) {
          const tb = gr.thoughtBubble
          const nx = Math.round(bx + (tb.x - bx) * s)
          const ny = Math.round(by + (tb.y - by) * s)
          const nw = Math.max(THOUGHT_BUBBLE_MIN_W, Math.round(tb.w * s))
          const nh = Math.max(THOUGHT_BUBBLE_MIN_H, Math.round(tb.h * s))
          let updated = {
            ...nextPage.thoughtBubble,
            x: nx,
            y: ny,
            widthPx: nw,
            heightPx: nh,
          }
          if (sz) {
            const c = clampTextBoxRect(nx, ny, nw, nh, sz.cw, sz.ch)
            updated = {
              ...updated,
              x: c.x,
              y: c.y,
              widthPx: c.widthPx,
              heightPx: c.heightPx,
            }
          }
          nextPage = { ...nextPage, thoughtBubble: updated }
        }

        if (gr.character) {
          const snap = gr.character
          const nx = Math.round(bx + (snap.x - bx) * s)
          const ny = Math.round(by + (snap.y - by) * s)
          const nw = Math.max(CHARACTER_MIN_W, Math.round(snap.w * s))
          const nh = Math.max(CHARACTER_MIN_H, Math.round(snap.h * s))
          nextPage = {
            ...nextPage,
            characters: nextPage.characters.map((ch) => {
              if (ch.x !== snap.x || ch.y !== snap.y) return ch
              let nextChar = { ...ch, x: nx, y: ny, widthPx: nw, heightPx: nh }
              if (sz) {
                const c = clampRectToPageFromSafeCoords(
                  nx,
                  ny,
                  nw,
                  nh,
                  sz.cw,
                  sz.ch,
                  frame,
                )
                nextChar = { ...nextChar, x: c.x, y: c.y }
              }
              return nextChar
            }),
          }
        }

        return prev.map((pg, i) => (i === gr.pageIndex ? nextPage : pg))
      })
    }
    const up = () => setGroupResize(null)
    window.addEventListener('mousemove', move)
    window.addEventListener('mouseup', up)
    return () => {
      window.removeEventListener('mousemove', move)
      window.removeEventListener('mouseup', up)
    }
  }, [groupResize, pageFrameSettings])

  useEffect(() => {
    if (!characterRotate) return
    const { pageIndex, characterIndex, deg0, startAngleDeg, centerX, centerY } =
      characterRotate
    const move = (e: MouseEvent) => {
      const currentAngleDeg =
        (Math.atan2(e.clientY - centerY, e.clientX - centerX) * 180) / Math.PI
      let delta = currentAngleDeg - startAngleDeg
      if (delta > 180) delta -= 360
      if (delta < -180) delta += 360
      const deg = Math.max(-180, Math.min(180, Math.round(deg0 + delta)))
      setPages((prev) =>
        prev.map((p, idx) =>
          idx === pageIndex && p.kind === 'content' && p.characters[characterIndex]
            ? {
                ...p,
                characters: p.characters.map((c, ci) =>
                  ci === characterIndex ? { ...c, rotationDeg: deg } : c,
                ),
              }
            : p,
        ),
      )
    }
    const up = () => setCharacterRotate(null)
    window.addEventListener('mousemove', move)
    window.addEventListener('mouseup', up)
    return () => {
      window.removeEventListener('mousemove', move)
      window.removeEventListener('mouseup', up)
    }
  }, [characterRotate])

  const addPage = () => {
    setPages((p) => {
      const contentCount = p.filter((x) => x.kind === 'content').length
      const next = [
        ...p,
        {
          id: newPageId(),
          label: defaultContentPageLabel(contentCount),
          fill: null,
          characters: [],
          thoughtBubble: null,
          shapes: [],
          textBoxes: [],
          kind: 'content' as const,
          tocStyle: null,
          tocData: null,
          tocRootId: null,
        },
      ]
      setActivePageIndex(next.length - 1)
      return next
    })
  }

  const addTocPage = (style: TocStyle) => {
    const insertAt = Math.min(activePageIndex + 1, pages.length)
    setPages((prev) => {
      const labels = prev
        .filter((pp) => pp.kind === 'content')
        .map((pp) => pp.label)
      const tocData =
        labels.length > 0
          ? seedTocDataFromContentPages(labels)
          : emptyTocPageData()
      const newPage: BookPageData = {
        id: newPageId(),
        label: 'Table of contents',
        fill: null,
        characters: [],
        thoughtBubble: null,
        shapes: [],
        textBoxes: [],
        kind: 'toc',
        tocStyle: style,
        tocData,
        tocRootId: null,
      }
      const merged = [
        ...prev.slice(0, insertAt),
        newPage,
        ...prev.slice(insertAt),
      ]
      return reconcileTocContinuationPages(merged, newPageId)
    })
    setActivePageIndex(insertAt)
    setTocEditorOpen(true)
  }

  const movePageUp = () => {
    const i = activePageIndex
    if (i <= 0) return
    const block = getTocBlockRange(pages, i)
    if (block) {
      const { start, end } = block
      if (start <= 0) return
      setPages((prev) => {
        const seg = prev.slice(start, end + 1)
        return [
          ...prev.slice(0, start - 1),
          ...seg,
          prev[start - 1],
          ...prev.slice(end + 1),
        ]
      })
      setActivePageIndex(start - 1)
      return
    }
    setPages((prev) => {
      const next = [...prev]
      ;[next[i - 1], next[i]] = [next[i], next[i - 1]]
      return next
    })
    setActivePageIndex(i - 1)
  }

  const movePageDown = () => {
    const i = activePageIndex
    if (i >= pages.length - 1) return
    const block = getTocBlockRange(pages, i)
    if (block) {
      const { start, end } = block
      const after = end + 1
      if (after >= pages.length) return
      setPages((prev) => {
        const seg = prev.slice(start, end + 1)
        return [
          ...prev.slice(0, start),
          prev[after],
          ...seg,
          ...prev.slice(after + 1),
        ]
      })
      setActivePageIndex(start + 1)
      return
    }
    setPages((prev) => {
      const next = [...prev]
      ;[next[i + 1], next[i]] = [next[i], next[i + 1]]
      return next
    })
    setActivePageIndex(i + 1)
  }

  const removePage = () => {
    if (pages.length <= 1) return
    const block = getTocBlockRange(pages, activePageIndex)
    if (block) {
      const { start, end } = block
      const next = [...pages.slice(0, start), ...pages.slice(end + 1)]
      if (next.length === 0) return
      setPages(next)
      setActivePageIndex(Math.min(start, next.length - 1))
      return
    }
    const rm = activePageIndex
    const next = pages.filter((_, idx) => idx !== rm)
    setPages(next)
    setActivePageIndex(Math.min(rm, next.length - 1))
  }

  const downloadPdf = async () => {
    let w = 0
    let h = 0
    for (const p of pages) {
      const el = pageSurfaceRefs.current.get(p.id)
      if (el) {
        w = el.clientWidth
        h = el.clientHeight
        break
      }
    }
    if (!w || !h) return

    const pdf = new jsPDF({
      orientation: h > w ? 'portrait' : 'landscape',
      unit: 'px',
      format: [w, h],
    })

    for (let i = 0; i < pages.length; i++) {
      const el = pageSurfaceRefs.current.get(pages[i].id)
      if (!el) continue
      const canvas = await html2canvas(el, {
        scale: isIOS() ? 1 : 2,
        useCORS: true,
      })
      if (i > 0) pdf.addPage([w, h])
      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, w, h)
    }
    pdf.save('book.pdf')
  }

  const openTocEditorForIndex = useCallback((index: number) => {
    const pg = pages[index]
    if (pg?.kind === 'toc' && pg.tocStyle) {
      setTocEditorOpen(true)
    }
  }, [pages])

  const onPageLabelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const idx = Number(e.target.value)
    if (!Number.isNaN(idx)) {
      setActivePageIndex(idx)
      openTocEditorForIndex(idx)
    }
  }

  const applyPageFill = (fill: PageFill) => {
    setPages((prev) =>
      prev.map((p, i) =>
        i === activePageIndex ? { ...p, fill } : p,
      ),
    )
  }

  const updateTextBoxForPageAtIndex = useCallback(
    (pageId: string, index: number, next: PlacedTextBox | null) => {
      setPages((prev) =>
        prev.map((p) => {
          if (p.id !== pageId || p.kind !== 'content') return p
          const boxes = getPageTextBoxes(p)
          if (!boxes[index]) return p
          if (next === null) {
            return {
              ...p,
              textBoxes: boxes.filter((_, i) => i !== index),
            }
          }
          const nb = normalizePlacedTextBox(next)
          return nb
            ? {
                ...p,
                textBoxes: boxes.map((tb, i) => (i === index ? nb : tb)),
              }
            : p
        }),
      )
      if (next === null) {
        setTextBoxSelectedPageId(null)
        setTextBoxSelectedIndex(null)
      }
    },
    [],
  )

  const updateThoughtBubbleForPage = useCallback(
    (pageId: string, next: PlacedThoughtBubble | null) => {
      setPages((prev) =>
        prev.map((p) => {
          if (p.id !== pageId || p.kind !== 'content') return p
          if (next === null) return { ...p, thoughtBubble: null }
          const nb = normalizePlacedThoughtBubble(next)
          return nb ? { ...p, thoughtBubble: nb } : p
        }),
      )
      if (next === null) setThoughtBubbleSelectedPageId(null)
    },
    [],
  )

  const updateShapeForPageAtIndex = useCallback(
    (pageId: string, shapeIndex: number, next: PlacedShape | null) => {
      setPages((prev) =>
        prev.map((p) => {
          if (p.id !== pageId || p.kind !== 'content') return p
          if (!p.shapes?.[shapeIndex]) return p
          if (next === null) {
            return {
              ...p,
              shapes: p.shapes.filter((_, i) => i !== shapeIndex),
            }
          }
          const ns = normalizePlacedShape(next)
          return ns
            ? {
                ...p,
                shapes: p.shapes.map((s, i) => (i === shapeIndex ? ns : s)),
              }
            : p
        }),
      )
      if (next === null) {
        setShapeSelectedPageId(null)
        setShapeSelectedIndex(null)
      }
    },
    [],
  )

  const updateCharacterForPageAtIndex = useCallback(
    (
      pageId: string,
      characterIndex: number,
      next: PlacedCharacter | null,
    ) => {
      const { cw } = approximateDrawableSizePx(paperSize)
      const defaults = characterOuterSize(cw)
      setPages((prev) =>
        prev.map((p) => {
          if (p.id !== pageId || p.kind !== 'content') return p
          if (!p.characters[characterIndex]) return p
          if (next === null) {
            return {
              ...p,
              characters: p.characters.filter((_, i) => i !== characterIndex),
            }
          }
          const nc = normalizePlacedCharacter(next, defaults)
          return nc
            ? {
                ...p,
                characters: p.characters.map((c, i) =>
                  i === characterIndex ? nc : c,
                ),
              }
            : p
        }),
      )
      if (next === null) {
        setCharacterSelectedPageId(null)
        setCharacterSelectedIndex(null)
      }
    },
    [paperSize],
  )

  const selectedTextEditPage = useMemo(
    () =>
      pages.find(
        (p) => p.id === textBoxSelectedPageId && p.kind === 'content',
      ) ?? null,
    [pages, textBoxSelectedPageId],
  )

  const selectedTextBox =
    selectedTextEditPage && textBoxSelectedIndex != null
      ? getPageTextBoxes(selectedTextEditPage)[textBoxSelectedIndex] ?? null
      : null

  const selectedThoughtBubblePage = useMemo(
    () =>
      pages.find(
        (p) => p.id === thoughtBubbleSelectedPageId && p.kind === 'content',
      ) ?? null,
    [pages, thoughtBubbleSelectedPageId],
  )

  const selectedShapePage = useMemo(
    () =>
      pages.find((p) => p.id === shapeSelectedPageId && p.kind === 'content') ??
      null,
    [pages, shapeSelectedPageId],
  )
  const selectedShape =
    selectedShapePage && shapeSelectedIndex != null
      ? selectedShapePage.shapes[shapeSelectedIndex] ?? null
      : null
  const selectedCharacterPage = useMemo(
    () =>
      pages.find(
        (p) => p.id === characterSelectedPageId && p.kind === 'content',
      ) ?? null,
    [pages, characterSelectedPageId],
  )
  const selectedCharacter =
    selectedCharacterPage && characterSelectedIndex != null
      ? selectedCharacterPage.characters[characterSelectedIndex] ?? null
      : null
  const selectedCharacterFocusPage = useMemo(() => {
    if (
      canvasMultiSelection?.pageId &&
      canvasMultiSelection.kinds.length === 1 &&
      canvasMultiSelection.kinds[0] === 'character'
    ) {
      return (
        pages.find(
          (p) => p.id === canvasMultiSelection.pageId && p.kind === 'content',
        ) ?? null
      )
    }
    return null
  }, [pages, canvasMultiSelection])
  const activeGroupPage =
    selectedShapePage ??
    selectedTextEditPage ??
    selectedThoughtBubblePage ??
    selectedCharacterFocusPage ??
    null
  const activeGroupId =
    selectedShape?.groupId ??
    selectedTextBox?.groupId ??
    selectedThoughtBubblePage?.thoughtBubble?.groupId ??
    (characterSelectedPageId === selectedCharacterFocusPage?.id
      ? selectedCharacterFocusPage?.characters[characterSelectedIndex ?? 0]
      : selectedCharacterFocusPage?.characters[0]
    )?.groupId ??
    null
  const activeGroupBounds = useMemo(() => {
    if (!activeGroupPage || !activeGroupId || activeGroupPage.kind !== 'content') {
      return null
    }
    const rects = collectGroupMemberRects(activeGroupPage, activeGroupId)
    if (rects.length < 2) return null
    const left = Math.min(...rects.map((r) => r.x))
    const top = Math.min(...rects.map((r) => r.y))
    const right = Math.max(...rects.map((r) => r.x + r.w))
    const bottom = Math.max(...rects.map((r) => r.y + r.h))
    return {
      x: left,
      y: top,
      width: Math.max(1, right - left),
      height: Math.max(1, bottom - top),
    }
  }, [activeGroupId, activeGroupPage, collectGroupMemberRects])
  const selectedShapeOnActivePage =
    selectedShape &&
    activeContentPage &&
    selectedShapePage?.id === activeContentPage.id
      ? selectedShape
      : null
  const shapeToolActive =
    shapePickerOpen ||
    (!!selectedShapeOnActivePage && selectedShapeOnActivePage.kind !== 'image')
  const elementToolActive =
    elementPickerOpen ||
    (!!selectedShapeOnActivePage && selectedShapeOnActivePage.kind === 'image')
  const pageLayerTokens = useCallback(
    (page: BookPageData): string[] => {
      if (page.kind !== 'content') return []
      const present = [
        ...effectiveCanvasLayerOrder(page).map((k) => `kind:${k}`),
        ...page.shapes.map((_, i) => `shape:${i}`),
      ]
      const raw = layerOrderByPageId[page.id]
      if (!raw || raw.length === 0) return present
      const seen = new Set<string>()
      const out: string[] = []
      for (const t of raw) {
        if (!present.includes(t) || seen.has(t)) continue
        out.push(t)
        seen.add(t)
      }
      for (const t of present) {
        if (!seen.has(t)) out.push(t)
      }
      return out
    },
    [layerOrderByPageId],
  )
  const reorderPageLayerTokens = useCallback(
    (pageId: string, fromPos: number, toPos: number) => {
      if (fromPos === toPos) return
      const pg = pages.find((p) => p.id === pageId)
      if (!pg || pg.kind !== 'content') return
      const cur = pageLayerTokens(pg)
      if (
        fromPos < 0 ||
        toPos < 0 ||
        fromPos >= cur.length ||
        toPos >= cur.length
      ) {
        return
      }
      const next = [...cur]
      const [picked] = next.splice(fromPos, 1)
      if (!picked) return
      next.splice(toPos, 0, picked)
      setLayerOrderByPageId((prev) => ({ ...prev, [pageId]: next }))
    },
    [pageLayerTokens, pages],
  )
  const applyLayerTokenStack = useCallback(
    (
      pageId: string,
      token: string,
      op: 'front' | 'back' | 'forward' | 'backward',
    ) => {
      const pg = pages.find((p) => p.id === pageId)
      if (!pg || pg.kind !== 'content') return
      const cur = pageLayerTokens(pg)
      const from = cur.indexOf(token)
      if (from < 0 || cur.length <= 1) return
      let to = from
      if (op === 'front') to = cur.length - 1
      else if (op === 'back') to = 0
      else if (op === 'forward') to = Math.min(cur.length - 1, from + 1)
      else if (op === 'backward') to = Math.max(0, from - 1)
      if (to === from) return
      reorderPageLayerTokens(pageId, from, to)
    },
    [pageLayerTokens, pages, reorderPageLayerTokens],
  )
  const activeCanvasKinds = useMemo(
    () => (activeContentPage ? effectiveCanvasLayerOrder(activeContentPage) : []),
    [activeContentPage],
  )

  const activeShapes = activeContentPage?.shapes ?? []
  type LayerRow =
    | {
        key: string
        pos: number
        section: 'canvas'
        kind: CanvasSelectableKind
      }
    | {
        key: string
        pos: number
        section: 'shape'
        index: number
        shape: PlacedShape
      }
  const activeLayerRows = useMemo(
    (): LayerRow[] => {
      if (!activeContentPage) return []
      const tokens = pageLayerTokens(activeContentPage)
      return tokens
        .map((token, pos) => {
          if (token.startsWith('kind:')) {
            const kind = token.slice(5) as CanvasSelectableKind
            if (!activeCanvasKinds.includes(kind)) return null
            return {
              key: token,
              pos,
              section: 'canvas' as const,
              kind,
            }
          }
          if (token.startsWith('shape:')) {
            const index = Number(token.slice(6))
            const shape = activeShapes[index]
            if (!Number.isFinite(index) || !shape) return null
            return {
              key: token,
              pos,
              section: 'shape' as const,
              index,
              shape,
            }
          }
          return null
        })
        .filter((r): r is LayerRow => !!r)
    },
    [activeCanvasKinds, activeContentPage, activeShapes, pageLayerTokens],
  )
  const groupedLayerRows = useMemo(() => {
    if (!activeContentPage) return []
    const out: Array<
      | { type: 'single'; row: LayerRow }
      | {
          type: 'group'
          groupId: string
          label: string
          rows: LayerRow[]
        }
    > = []
    const bucketByGroupId = new Map<string, { groupId: string; rows: LayerRow[] }>()
    const ordinalByGroupId = new Map<string, number>()
    let groupOrdinal = 0
    const resolveGroupId = (row: LayerRow) => {
      if (row.section === 'canvas') {
        if (row.kind === 'character') {
          const ch =
            characterSelectedPageId === activeContentPage.id
              ? activeContentPage.characters[characterSelectedIndex ?? 0]
              : activeContentPage.characters[0]
          return ch?.groupId ?? null
        }
        if (row.kind === 'textBox') {
          const boxes = getPageTextBoxes(activeContentPage)
          const tb =
            textBoxSelectedPageId === activeContentPage.id &&
            textBoxSelectedIndex != null
              ? boxes[textBoxSelectedIndex]
              : boxes[0]
          return tb?.groupId ?? null
        }
        return activeContentPage.thoughtBubble?.groupId ?? null
      }
      return row.shape.groupId ?? null
    }
    for (const row of activeLayerRows) {
      const gid = resolveGroupId(row)
      const groupedSel = gid ? collectGroupedSelection(activeContentPage, gid) : null
      const memberCount =
        (groupedSel?.kinds.length ?? 0) + (groupedSel?.shapeIndices.length ?? 0)
      if (!gid || memberCount < 2) {
        out.push({ type: 'single', row })
        continue
      }
      let bucket = bucketByGroupId.get(gid)
      if (!bucket) {
        bucket = { groupId: gid, rows: [] }
        bucketByGroupId.set(gid, bucket)
        out.push({
          type: 'group',
          groupId: gid,
          label: '',
          rows: bucket.rows,
        })
        groupOrdinal += 1
        ordinalByGroupId.set(gid, groupOrdinal)
      }
      bucket.rows.push(row)
    }
    return out.map((entry) => {
      if (entry.type !== 'group') return entry
      const fallback = `Group ${ordinalByGroupId.get(entry.groupId) ?? 1}`
      return {
        ...entry,
        label: layerGroupNames[entry.groupId] ?? fallback,
      }
    })
  }, [
    activeContentPage,
    activeLayerRows,
    collectGroupedSelection,
    layerGroupNames,
    characterSelectedIndex,
    characterSelectedPageId,
    textBoxSelectedIndex,
    textBoxSelectedPageId,
  ])
  const defaultLayerLabel = useCallback((row: LayerRow) => {
    if (row.section === 'canvas') {
      return row.kind === 'textBox'
        ? 'Text Box'
        : row.kind === 'thoughtBubble'
          ? 'Thought Bubble'
          : 'Character'
    }
    return `Shape ${row.index + 1} (${row.shape.kind})`
  }, [])
  const layerLabel = useCallback(
    (row: LayerRow) => layerItemNames[row.key] ?? defaultLayerLabel(row),
    [defaultLayerLabel, layerItemNames],
  )
  const startRenameLayerEntry = useCallback((id: string, current: string) => {
    setEditingLayerNameId(id)
    setEditingLayerNameDraft(current)
  }, [])
  const commitRenameLayerEntry = useCallback(() => {
    const id = editingLayerNameId
    if (!id) return
    const next = editingLayerNameDraft.trim()
    if (id.startsWith('group:')) {
      const gid = id.slice(6)
      setLayerGroupNames((prev) => ({ ...prev, [gid]: next || prev[gid] || 'Group' }))
    } else if (id.startsWith('item:')) {
      const key = id.slice(5)
      setLayerItemNames((prev) => ({ ...prev, [key]: next || prev[key] || 'Item' }))
    }
    setEditingLayerNameId(null)
  }, [editingLayerNameDraft, editingLayerNameId])

  useEffect(() => {
    if (!selectedTextEditPage || !selectedTextBox || availableFonts.length === 0)
      return
    if (
      availableFonts.some((f) => f.id === selectedTextBox.globalFontId)
    ) {
      return
    }
    updateTextBoxForPageAtIndex(selectedTextEditPage.id, textBoxSelectedIndex!, {
      ...selectedTextBox,
      globalFontId: availableFonts[0].id,
    })
  }, [
    selectedTextEditPage?.id,
    selectedTextBox?.globalFontId,
    availableFonts,
    updateTextBoxForPageAtIndex,
    selectedTextBox,
    textBoxSelectedIndex,
  ])

  const showShellTopBack = !builderHost?.backHref

  return (
    <div className="book-shell">
      {showShellTopBack ? (
        <div className="book-shell__top">
          <Link
            to={builderHost?.backHref ?? '/books'}
            state={builderHost?.backState}
            className="book-shell__back"
          >
            ← Back to Books
          </Link>
        </div>
      ) : null}

      <div className="book-shell__row">
        <aside className="book-tool-sidebar" aria-label="Tools">
          <div className="book-tool-sidebar__icons">
            <button
              type="button"
              className={
                'book-tool-sidebar__btn' +
                (bgModalOpen ? ' is-active' : '')
              }
              aria-label="Page background"
              onClick={() => setBgModalOpen(true)}
            >
              <span className="book-tool-sidebar__btn-visual" aria-hidden>
                <BookSidebarRasterIcon
                  candidates={BOOK_SIDEBAR_ICON_PAGE_BACKGROUND}
                  fallback={<IconToolPageBackground />}
                />
              </span>
              <span className="book-tool-sidebar__btn-label">Background</span>
            </button>
            <button
              type="button"
              className={
                'book-tool-sidebar__btn' +
                (tocEditorOpen || getTocBlockRange(pages, activePageIndex)
                  ? ' is-active'
                  : '')
              }
              aria-label={
                getTocBlockRange(pages, activePageIndex)
                  ? 'Edit table of contents'
                  : 'Add table of contents page'
              }
              onClick={() => {
                if (getTocBlockRange(pages, activePageIndex)) {
                  setTocEditorOpen(true)
                  return
                }
                addTocPage(defaultMergedToc)
              }}
            >
              <span className="book-tool-sidebar__btn-visual" aria-hidden>
                <BookSidebarRasterIcon
                  candidates={BOOK_SIDEBAR_ICON_TOC}
                  fallback={<IconToolToc />}
                />
              </span>
              <span className="book-tool-sidebar__btn-label">Contents</span>
            </button>
            <button
              type="button"
              className={
                'book-tool-sidebar__btn' +
                (textBoxSelectedPageId &&
                activeContentPage?.id === textBoxSelectedPageId
                  ? ' is-active'
                  : '')
              }
              aria-label="Text box"
              disabled={!activeContentPage}
              onClick={() => {
                if (!activeContentPage) return
                const pid = activeContentPage.id
                setThoughtBubbleSelectedPageId(null)
                setCharacterSelectedPageId(null)
                setCharacterSelectedIndex(null)
                setShapeSelectedPageId(null)
                setShapeSelectedIndex(null)
                const existing = getPageTextBoxes(activeContentPage)
                const stagger = existing.length
                const box = {
                  ...createDefaultPlacedTextBox(tocDbFonts[0]?.id ?? ''),
                  x: 24 + stagger * 28,
                  y: 72 + stagger * 20,
                }
                setPages((prev) =>
                  prev.map((p) =>
                    p.id === pid && p.kind === 'content'
                      ? { ...p, textBoxes: [...getPageTextBoxes(p), box] }
                      : p,
                  ),
                )
                setTextBoxSelectedPageId(pid)
                setTextBoxSelectedIndex(existing.length)
                setCanvasMultiSelection(null)
              }}
            >
              <span className="book-tool-sidebar__btn-visual" aria-hidden>
                <BookSidebarRasterIcon
                  candidates={BOOK_SIDEBAR_ICON_TEXT_BOX}
                  fallback={<IconToolTextBox />}
                />
              </span>
              <span className="book-tool-sidebar__btn-label">Text</span>
            </button>
            <button
              type="button"
              className={
                'book-tool-sidebar__btn' +
                (textBubbleModalOpen ||
                (thoughtBubbleSelectedPageId &&
                  activeContentPage?.id === thoughtBubbleSelectedPageId)
                  ? ' is-active'
                  : '')
              }
              aria-label="Thought bubble — placed art, not page background"
              disabled={!hasAnyContentPage}
              onClick={() => {
                if (!hasAnyContentPage) return
                if (!activeContentPage && firstContentPageIndex >= 0) {
                  setActivePageIndex(firstContentPageIndex)
                }
                setShapeSelectedPageId(null)
                setTextBubbleModalOpen(true)
              }}
            >
              <span className="book-tool-sidebar__btn-visual" aria-hidden>
                <BookSidebarRasterIcon
                  candidates={BOOK_SIDEBAR_ICON_BUBBLE}
                  fallback={<IconToolBubble />}
                />
              </span>
              <span className="book-tool-sidebar__btn-label">Bubble</span>
            </button>
            <button
              type="button"
              className={
                'book-tool-sidebar__btn' +
                (shapeToolActive ? ' is-active' : '')
              }
              aria-label="Shapes"
              disabled={!activeContentPage}
              onClick={() => {
                if (!hasAnyContentPage) return
                if (!activeContentPage && firstContentPageIndex >= 0) {
                  setActivePageIndex(firstContentPageIndex)
                }
                setShapePickerOpen(true)
              }}
            >
              <span className="book-tool-sidebar__btn-visual" aria-hidden>
                <BookSidebarRasterIcon
                  candidates={BOOK_SIDEBAR_ICON_SHAPE}
                  fallback={<IconToolShape />}
                />
              </span>
              <span className="book-tool-sidebar__btn-label">Shapes</span>
            </button>
            <button
              type="button"
              className={
                'book-tool-sidebar__btn' +
                (elementToolActive ? ' is-active' : '')
              }
              aria-label="Elements"
              disabled={!hasAnyContentPage}
              onClick={() => {
                if (!hasAnyContentPage) return
                if (!activeContentPage && firstContentPageIndex >= 0) {
                  setActivePageIndex(firstContentPageIndex)
                }
                setElementPickerOpen(true)
              }}
            >
              <span className="book-tool-sidebar__btn-visual" aria-hidden>
                <BookSidebarRasterIcon
                  candidates={BOOK_SIDEBAR_ICON_ELEMENT}
                  fallback={<IconToolElement />}
                />
              </span>
              <span className="book-tool-sidebar__btn-label">Elements</span>
            </button>
            <button
              type="button"
              className={
                'book-tool-sidebar__btn' +
                (savedCharactersModalOpen ? ' is-active' : '')
              }
              aria-label="Characters"
              disabled={!hasAnyContentPage}
              onClick={() => {
                if (!hasAnyContentPage) return
                if (!activeContentPage && firstContentPageIndex >= 0) {
                  setActivePageIndex(firstContentPageIndex)
                }
                setSavedCharactersModalOpen(true)
              }}
            >
              <span className="book-tool-sidebar__btn-visual" aria-hidden>
                <BookSidebarRasterIcon
                  candidates={BOOK_SIDEBAR_ICON_CHARACTER}
                  fallback={<IconToolCharacter />}
                />
              </span>
              <span className="book-tool-sidebar__btn-label">Characters</span>
            </button>
          </div>
          <div className="book-tool-sidebar__footer">
            <button
              type="button"
              className={
                'book-tool-sidebar__btn' +
                (paperModalOpen ? ' is-active' : '')
              }
              aria-label="Page settings"
              onClick={() => {
                setPageSettingsTab('border')
                setPageSettingsScope(activePage ? 'page' : 'global')
                setPaperModalOpen(true)
              }}
            >
              <span className="book-tool-sidebar__btn-visual" aria-hidden>
                <BookSidebarRasterIcon
                  candidates={BOOK_SIDEBAR_ICON_SETTINGS}
                  fallback={<IconToolSettings />}
                />
              </span>
              <span className="book-tool-sidebar__btn-label">Settings</span>
            </button>
          </div>
        </aside>

        <div className="book-stage">
          <header className="book-stage__toolbar">
            <div className="book-stage__toolbar-left">
              <select
                className="book-select book-select--orange"
                value={activePageIndex}
                onChange={onPageLabelChange}
                aria-label="Jump to page"
              >
                {pages.map((p, i) => (
                  <option key={p.id} value={i}>
                    {p.kind === 'toc' ? `TOC · ${p.label}` : p.label}
                  </option>
                ))}
              </select>
              <button
                type="button"
                className="book-icon-square book-icon-square--orange"
                title="Move page up"
                aria-label="Move page up"
                disabled={activePageIndex <= 0}
                onClick={movePageUp}
              >
                ↑
              </button>
              <button
                type="button"
                className="book-icon-square book-icon-square--orange"
                title="Move page down"
                aria-label="Move page down"
                disabled={activePageIndex >= pages.length - 1}
                onClick={movePageDown}
              >
                ↓
              </button>
              <select
                className="book-select book-select--orange"
                value={pageNoPosition}
                onChange={(e) =>
                  setPageNoPosition(
                    e.target.value as typeof pageNoPosition,
                  )
                }
                aria-label="Page number position"
              >
                <option value="none">Pg No. — Hide</option>
                <option value="bottom-center">Pg No. — Bottom center</option>
                <option value="bottom-outside">Pg No. — Below page</option>
              </select>
              {builderHost?.wurtleAssignmentsHref ? (
                <Link
                  to={builderHost.wurtleAssignmentsHref}
                  className="book-toolbar-assignment-btn"
                  title="Daily Wurtle Assignments"
                >
                  Daily Wurtle Assignments
                </Link>
              ) : null}
              {builderHost?.wtrAssignmentsHref ? (
                <Link
                  to={builderHost.wtrAssignmentsHref}
                  className="book-toolbar-assignment-btn"
                  title="Daily WTR Assignments"
                >
                  Daily WTR Assignments
                </Link>
              ) : null}
            </div>
            <div className="book-stage__toolbar-right">
              {builderHost?.backHref ? (
                <Link
                  to={builderHost.backHref}
                  state={builderHost.backState}
                  className="book-toolbar-back book-icon-square--orange"
                  title="Back to My Books"
                >
                  ← My Books
                </Link>
              ) : null}
              <button
                type="button"
                className={
                  'book-icon-square book-icon-square--orange' +
                  (layersOpen ? ' book-icon-square--active' : '')
                }
                title="Layers: show and reorder
Esc: clear selection
Delete/Backspace: remove selected element"
                aria-label="Layers"
                disabled={!activeContentPage}
                onClick={() => setLayersOpen((v) => !v)}
              >
                <PublicRasterIcon
                  candidates={BOOK_SIDEBAR_ICON_LAYERS}
                  className="book-toolbar-icon-img"
                  fallback={<IconToolLayers />}
                />
              </button>
              {saveMessage ? (
                <span
                  className={
                    'book-stage__save-msg' +
                    (saveMessage.startsWith('Saved') ||
                    saveMessage.startsWith('Book saved')
                      ? ''
                      : ' book-stage__save-msg--err')
                  }
                  role="status"
                >
                  {saveMessage}
                </span>
              ) : null}
              <button
                type="button"
                className="book-icon-square book-icon-square--orange"
                title={
                  builderHost?.exportPdfOnSave
                    ? 'Save book (draft + PDF for review)'
                    : 'Save book to database'
                }
                aria-label={
                  builderHost?.exportPdfOnSave
                    ? 'Save book'
                    : 'Save book to database'
                }
                onClick={() => void saveBookDraft()}
              >
                <IconSaveDraft />
              </button>
              {!builderHost?.exportPdfOnSave ? (
                <button
                  type="button"
                  className="book-btn-pdf"
                  onClick={() => void downloadPdf()}
                >
                  Download PDF
                </button>
              ) : null}
            </div>
          </header>

          {loadError && (
            <p className="book-banner book-banner--error book-stage__banner">
              <strong>Catalog:</strong> {loadError}
            </p>
          )}

          <div className="book-stage__canvas-area">
            <div className="book-stage__pages-scroll">
              <div className="book-pages-column" style={{ zoom: builderZoom }}>
                {pages.map((p, i) => {
                  const frame = effectivePageFrame(p, pageFrameSettings)
                  const surface = pageSurfaceRefs.current.get(p.id)
                  const drawable = readDrawableSizeFromPageSurface(
                    surface,
                    frame,
                  )
                  const pageTextBoxes =
                    p.kind === 'content' ? getPageTextBoxes(p) : []
                  const layersForPage =
                    p.kind === 'content' ? pageLayerTokens(p) : []
                  const hasGroupOutlineOnPage =
                    p.id === activeGroupPage?.id && !!activeGroupBounds && !!activeGroupId

                  return (
                  <div
                    key={p.id}
                    id={`page-frame-${i}`}
                    className={
                      'book-page-frame' +
                      (i === activePageIndex ? ' book-page-frame--active' : '') +
                      (p.kind === 'toc' ? ' book-page-frame--toc' : '')
                    }
                    role="group"
                    aria-label={
                      p.kind === 'toc'
                        ? `Table of contents ${i + 1}`
                        : `Spread ${i + 1}`
                    }
                    onClick={() => {
                      setActivePageIndex(i)
                      if (p.kind === 'toc' && p.tocStyle) {
                        setTocEditorOpen(true)
                      }
                    }}
                  >
                    {renamingPageIndex === i ? (
                      <input
                        ref={renameInputRef}
                        type="text"
                        className="book-page-frame__label-input"
                        aria-label={`Name for page ${i + 1}`}
                        value={renameDraft}
                        onChange={(e) => setRenameDraft(e.target.value)}
                        onFocus={() => setActivePageIndex(i)}
                        onClick={(e) => e.stopPropagation()}
                        onKeyDown={(e) => {
                          e.stopPropagation()
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            commitPageRename(i)
                          } else if (e.key === 'Escape') {
                            e.preventDefault()
                            cancelPageRename()
                          }
                        }}
                        onBlur={() => {
                          if (skipNextRenameCommitRef.current) {
                            skipNextRenameCommitRef.current = false
                            return
                          }
                          commitPageRename(i)
                        }}
                      />
                    ) : (
                      <span
                        role="button"
                        tabIndex={0}
                        className="book-page-frame__label-text"
                        title="Double-click to rename"
                        aria-label={`Page name: ${p.label}. Double-click to rename.`}
                        onKeyDown={(e) => {
                          e.stopPropagation()
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault()
                            setActivePageIndex(i)
                            setRenameDraft(p.label)
                            setRenamingPageIndex(i)
                          }
                        }}
                        onDoubleClick={(e) => {
                          e.stopPropagation()
                          setActivePageIndex(i)
                          setRenameDraft(p.label)
                          setRenamingPageIndex(i)
                        }}
                      >
                        {p.label}
                      </span>
                    )}
                    <div
                      className="book-page-frame__surface-wrap"
                      style={pageFrameOuterMarginStyle(frame)}
                    >
                      <div
                        ref={(el) => registerPageSurface(p.id, el)}
                        className="book-page"
                        style={{
                          ...pageFrameBorderStyle(frame),
                          ...pageFramePaddingStyle(frame),
                          ...paperSurfaceAspectStyle(paperSize),
                        }}
                        onMouseDown={(e) => {
                          if (e.target === e.currentTarget) {
                            setTextBoxSelectedPageId(null)
                            setTextBoxSelectedIndex(null)
                            setThoughtBubbleSelectedPageId(null)
                            setShapeSelectedPageId(null)
                            setShapeSelectedIndex(null)
                            setShapeMultiSelection(null)
                            setCanvasMultiSelection(null)
                            setCanvasContextMenu(null)
                          }
                        }}
                      >
                        <div
                          className="book-page__fill"
                          style={pageFillStyle(p.fill)}
                          aria-hidden
                        />
                        <div
                          className="book-page__safe"
                          style={pageSafeInsetStyle(frame)}
                          onMouseDownCapture={(e) =>
                            onCanvasSafeMouseDownCapture(e, i)
                          }
                        >
                          {p.kind === 'toc' && p.tocStyle ? (
                            <BookTocSpreadView
                              page={p}
                              pageIndex={i}
                              pages={pages}
                            />
                          ) : (
                            <>
                              {pageNoPosition === 'bottom-center' &&
                                p.kind === 'content' &&
                                contentOrdinalAt(pages, i) > 0 && (
                                <span className="book-page__num book-page__num--inside">
                                  {contentOrdinalAt(pages, i)}
                                </span>
                              )}
                              {(p.kind === 'content'
                                ? effectiveCanvasLayerOrder(p)
                                : defaultCanvasLayerOrder(p)
                              ).map((kind, layerIdx) => {
                                const z =
                                  p.kind === 'content'
                                    ? 20 + Math.max(0, layersForPage.indexOf(`kind:${kind}`))
                                    : 20 + layerIdx
                                if (kind === 'character') {
                                  const pageChars = getPageCharacters(p)
                                  if (!pageChars.length) return null
                                  return (
                                    <>
                                      {pageChars.map((ch, charIdx) => {
                                        const rot = ch.rotationDeg ?? 0
                                        const { w: charW, h: charH } =
                                          characterBoundsOnPage(p, ch)
                                        const characterSingleSelected =
                                          characterSelectedPageId === p.id &&
                                          characterSelectedIndex === charIdx
                                        const characterShowHandles =
                                          characterSingleSelected &&
                                          !(
                                            hasGroupOutlineOnPage &&
                                            ch.groupId &&
                                            ch.groupId === activeGroupId
                                          )
                                        return (
                                          <div
                                            key={`${p.id}-character-${charIdx}`}
                                            data-canvas-pick={canvasPickKey({
                                              kind: 'character',
                                              characterIndex: charIdx,
                                            })}
                                            className={
                                              'book-page__character' +
                                              (characterShowHandles
                                                ? ' book-page__character--selected'
                                                : '')
                                            }
                                            style={{
                                              zIndex: z,
                                              width: charW,
                                              height: charH,
                                              transform: `translate(${ch.x}px, ${ch.y}px) rotate(${rot}deg)`,
                                              transformOrigin: 'center center',
                                            }}
                                            onMouseDown={(e) =>
                                              onMouseDownPlaced(e, i, charIdx)
                                            }
                                            onContextMenu={(e) => {
                                              e.preventDefault()
                                              e.stopPropagation()
                                              setCharacterSelectedPageId(p.id)
                                              setCharacterSelectedIndex(charIdx)
                                              setActivePageIndex(i)
                                              openCanvasContextMenu(
                                                e,
                                                i,
                                                'character',
                                              )
                                            }}
                                            role="presentation"
                                          >
                                            <div className="book-page__character-inner">
                                              <CharacterComposite
                                                catalog={catalog}
                                                selection={ch.selection}
                                                layerOrder={ch.layerOrder}
                                                layerVisibility={
                                                  ch.layerVisibility
                                                }
                                                opacity={normalizeCanvasElementOpacity(
                                                  ch.opacity,
                                                )}
                                              />
                                              {characterShowHandles ? (
                                                <>
                                                  <button
                                                    type="button"
                                                    className="book-page__character__resize-handle"
                                                    aria-label="Resize character"
                                                    title="Drag to resize"
                                                    onMouseDown={(e) =>
                                                      onCharacterResizeMouseDown(
                                                        e,
                                                        i,
                                                        charIdx,
                                                      )
                                                    }
                                                  />
                                                  <button
                                                    type="button"
                                                    className="book-page__character__rotate-handle"
                                                    aria-label="Rotate character"
                                                    title="Drag to rotate"
                                                    onMouseDown={(e) =>
                                                      onCharacterRotateMouseDown(
                                                        e,
                                                        i,
                                                        charIdx,
                                                      )
                                                    }
                                                  >
                                                    <span aria-hidden>↻</span>
                                                  </button>
                                                </>
                                              ) : null}
                                            </div>
                                          </div>
                                        )
                                      })}
                                    </>
                                  )
                                }
                                if (kind === 'textBox' && pageTextBoxes.length) {
                                  return (
                                    <>
                                      {pageTextBoxes.map((tb, tbIdx) => {
                                        const textLay = drawable
                                          ? resolveTextBoxLayout(
                                              tb,
                                              drawable.cw,
                                              drawable.ch,
                                            )
                                          : {
                                              x: tb.x,
                                              y: tb.y,
                                              widthPx: tb.widthPx,
                                              heightPx: tb.heightPx,
                                            }
                                        const textBoxForCanvas = {
                                          ...tb,
                                          widthPx: textLay.widthPx,
                                          heightPx: textLay.heightPx,
                                        }
                                        const textBoxSingleSelected =
                                          textBoxSelectedPageId === p.id &&
                                          textBoxSelectedIndex === tbIdx
                                        const inActiveGroup =
                                          hasGroupOutlineOnPage &&
                                          tb.groupId === activeGroupId
                                        return (
                                          <div
                                            key={`${p.id}-textBox-${tbIdx}`}
                                            data-canvas-pick={canvasPickKey({
                                              kind: 'textBox',
                                              textBoxIndex: tbIdx,
                                            })}
                                            className={
                                              'book-page__text-box-wrap' +
                                              (textBoxSingleSelected &&
                                              !inActiveGroup
                                                ? ' book-page__text-box-wrap--selected'
                                                : '') +
                                              (!textBoxSingleSelected &&
                                              canvasMultiSelection?.pageId ===
                                                p.id &&
                                              !inActiveGroup &&
                                              canvasMultiSelection.kinds.includes(
                                                'textBox',
                                              )
                                                ? ' book-page__text-box-wrap--multi'
                                                : '')
                                            }
                                            style={{
                                              zIndex: z,
                                              transform: `translate(${textLay.x}px, ${textLay.y}px)`,
                                            }}
                                            onMouseDown={(e) =>
                                              onMouseDownTextBox(e, i, tbIdx)
                                            }
                                            onContextMenu={(e) => {
                                              setTextBoxSelectedPageId(p.id)
                                              setTextBoxSelectedIndex(tbIdx)
                                              openCanvasContextMenu(
                                                e,
                                                i,
                                                'textBox',
                                              )
                                            }}
                                            role="presentation"
                                          >
                                            <BookPageTextBoxLayer
                                              textBox={textBoxForCanvas}
                                              fonts={availableFonts}
                                            />
                                            {textBoxSingleSelected &&
                                            !inActiveGroup &&
                                            tb.pagePlacement !==
                                              'margin_fill' ? (
                                              <button
                                                type="button"
                                                className="book-page__text-box__resize-handle"
                                                aria-label="Resize text box"
                                                title="Drag to resize"
                                                onMouseDown={(e) =>
                                                  onTextBoxResizeMouseDown(
                                                    e,
                                                    i,
                                                    tbIdx,
                                                  )
                                                }
                                              />
                                            ) : null}
                                          </div>
                                        )
                                      })}
                                    </>
                                  )
                                }
                                if (kind === 'thoughtBubble' && p.thoughtBubble) {
                                  return (
                                    <div
                                      key={`${p.id}-thoughtBubble`}
                                      data-canvas-pick="thoughtBubble"
                                      className={
                                        'book-page__thought-bubble-wrap' +
                                        (thoughtBubbleSelectedPageId === p.id &&
                                        !(
                                          hasGroupOutlineOnPage &&
                                          p.thoughtBubble?.groupId === activeGroupId
                                        )
                                          ? ' book-page__thought-bubble-wrap--selected'
                                          : '') +
                                        (thoughtBubbleSelectedPageId !==
                                          p.id &&
                                        canvasMultiSelection?.pageId ===
                                          p.id &&
                                        !(
                                          hasGroupOutlineOnPage &&
                                          p.thoughtBubble?.groupId === activeGroupId
                                        ) &&
                                        canvasMultiSelection.kinds.includes(
                                          'thoughtBubble',
                                        )
                                          ? ' book-page__thought-bubble-wrap--multi'
                                          : '')
                                      }
                                      style={{
                                        zIndex: z,
                                        transform: `translate(${p.thoughtBubble.x}px, ${p.thoughtBubble.y}px)`,
                                        width: p.thoughtBubble.widthPx,
                                        height: p.thoughtBubble.heightPx,
                                      }}
                                      onMouseDown={(e) =>
                                        onMouseDownThoughtBubble(e, i)
                                      }
                                      onContextMenu={(e) =>
                                        openCanvasContextMenu(
                                          e,
                                          i,
                                          'thoughtBubble',
                                        )
                                      }
                                      role="presentation"
                                    >
                                      <div className="book-page__thought-bubble-inner">
                                        <BookPageThoughtBubbleVisual
                                          bubble={p.thoughtBubble}
                                        />
                                      </div>
                                      {thoughtBubbleSelectedPageId ===
                                      p.id ? (
                                        !(
                                          hasGroupOutlineOnPage &&
                                          p.thoughtBubble?.groupId === activeGroupId
                                        ) ? (
                                        <button
                                          type="button"
                                          className="book-page__thought-bubble__resize-handle"
                                          aria-label="Resize thought bubble"
                                          title="Drag to resize"
                                          onMouseDown={(e) =>
                                            onThoughtBubbleResizeMouseDown(
                                              e,
                                              i,
                                            )
                                          }
                                        />
                                        ) : null
                                      ) : null}
                                    </div>
                                  )
                                }
                                return null
                              })}
                              {p.kind === 'content' &&
                              p.shapes &&
                              p.shapes.length > 0
                                ? p.shapes.map((shape, shapeIndex) => (
                                <div
                                  key={`${p.id}-shape-${shapeIndex}`}
                                  data-canvas-pick={canvasPickKey({
                                    kind: 'shape',
                                    shapeIndex,
                                  })}
                                  className={
                                    'book-page__shape-wrap' +
                                    (shapeSelectedPageId === p.id &&
                                    shapeSelectedIndex === shapeIndex &&
                                    !(
                                      activeGroupBounds &&
                                      shape.groupId &&
                                      shape.groupId === activeGroupId
                                    )
                                      ? ' book-page__shape-wrap--selected'
                                      : '') +
                                    (shapeMultiSelection?.pageId === p.id &&
                                    !(
                                      hasGroupOutlineOnPage &&
                                      shape.groupId &&
                                      shape.groupId === activeGroupId
                                    ) &&
                                    shapeMultiSelection.indices.includes(shapeIndex)
                                      ? ' book-page__shape-wrap--multi'
                                      : '')
                                  }
                                  style={{
                                    zIndex:
                                      p.kind === 'content'
                                        ? 20 +
                                          Math.max(
                                            0,
                                            layersForPage.indexOf(`shape:${shapeIndex}`),
                                          )
                                        : 40 + shapeIndex,
                                    transform: `translate(${shape.x}px, ${shape.y}px) rotate(${shape.rotationDeg}deg)`,
                                    width: shape.widthPx,
                                    height: shape.heightPx,
                                  }}
                                  onMouseDown={(e) =>
                                    onMouseDownShape(e, i, shapeIndex)
                                  }
                                  onContextMenu={(e) =>
                                    openShapeContextMenu(e, i, shapeIndex)
                                  }
                                  role="presentation"
                                >
                                  <div
                                    className={
                                      'book-page__shape' +
                                      (shape.kind === 'image'
                                        ? ' book-page__shape--image-element'
                                        : '')
                                    }
                                    style={
                                      normalizeCanvasElementOpacity(shape.opacity) <
                                      1
                                        ? {
                                            opacity: normalizeCanvasElementOpacity(
                                              shape.opacity,
                                            ),
                                          }
                                        : undefined
                                    }
                                  >
                                    <BookPageShapeVisual shape={shape} />
                                  </div>
                                  {shapeSelectedPageId === p.id &&
                                  shapeSelectedIndex === shapeIndex &&
                                  !(
                                    activeGroupBounds &&
                                    shape.groupId &&
                                    shape.groupId === activeGroupId
                                  ) ? (
                                    <>
                                      <button
                                        type="button"
                                        className="book-page__shape__resize-handle"
                                        aria-label="Resize shape"
                                        title="Drag to resize"
                                        onMouseDown={(e) =>
                                          onShapeResizeMouseDown(e, i, shapeIndex)
                                        }
                                      />
                                      <button
                                        type="button"
                                        className="book-page__shape__rotate-handle"
                                        aria-label="Rotate shape"
                                        title="Drag to rotate"
                                        onMouseDown={(e) =>
                                          onShapeRotateMouseDown(e, i, shapeIndex)
                                        }
                                      >
                                        <span aria-hidden>↻</span>
                                      </button>
                                    </>
                                  ) : null}
                                </div>
                                  ))
                                : null}
                              {p.id === activeGroupPage?.id &&
                              activeGroupBounds &&
                              activeGroupId ? (
                                <div
                                  className="book-page__shape-group-outline-wrap"
                                  style={{
                                    transform: `translate(${activeGroupBounds.x}px, ${activeGroupBounds.y}px)`,
                                    width: activeGroupBounds.width,
                                    height: activeGroupBounds.height,
                                  }}
                                >
                                  <div
                                    className="book-page__shape-group-outline"
                                    aria-hidden
                                  />
                                  <button
                                    type="button"
                                    className="book-page__shape-group-resize-handle"
                                    aria-label="Resize group"
                                    title="Drag to resize group"
                                    onMouseDown={(e) =>
                                      onGroupResizeMouseDown(e, i, activeGroupId)
                                    }
                                  />
                                </div>
                              ) : null}
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    {pageNoPosition === 'bottom-outside' &&
                      p.kind === 'content' &&
                      contentOrdinalAt(pages, i) > 0 && (
                      <span className="book-page__num book-page__num--below">
                        {contentOrdinalAt(pages, i)}
                      </span>
                    )}
                  </div>
                  )
                })}
              </div>
            </div>

            <aside
              className="book-page-rail book-page-rail--side"
              aria-label="Add or remove pages"
            >
              <button
                type="button"
                className="book-rail-btn book-rail-btn--add"
                title="Add page"
                aria-label="Add page"
                onClick={(e) => {
                  e.stopPropagation()
                  addPage()
                }}
              >
                +
              </button>
              <button
                type="button"
                className="book-rail-btn book-rail-btn--remove"
                title="Remove selected page"
                aria-label="Remove selected page"
                disabled={pages.length <= 1}
                onClick={(e) => {
                  e.stopPropagation()
                  removePage()
                }}
              >
                −
              </button>
            </aside>
          </div>

          {tocEditorOpen &&
            activeTocRootPage?.tocData &&
            activeTocRootPage.tocStyle && (
              <BookTocEditorPanel
                tocData={activeTocRootPage.tocData}
                onChange={onTocEditorChange}
                contentPageLabels={tocPreviewLabels}
                onClose={() => setTocEditorOpen(false)}
                stylePresets={mergedTocPresets}
                availableFonts={tocDbFonts}
                selectedStyle={activeTocRootPage.tocStyle}
                selectedStyleId={activeTocRootPage.tocStyle.id}
                onSelectStyle={onTocPresetChange}
              />
            )}

          <PageBackgroundModal
            open={bgModalOpen}
            onClose={() => setBgModalOpen(false)}
            onApply={applyPageFill}
            currentFill={activePage?.fill ?? null}
            trimMm={trimForModal}
          />
          <PagePaperSizeModal
            open={paperModalOpen}
            onClose={() => setPaperModalOpen(false)}
            paperSize={paperSize}
            frameSettings={
              pageSettingsScope === 'page' && activePage
                ? effectivePageFrame(activePage, pageFrameSettings)
                : pageFrameSettings
            }
            scopeMode={pageSettingsScope}
            canEditPageScope={Boolean(activePage)}
            scopePageLabel={activePage?.label}
            onScopeModeChange={setPageSettingsScope}
            initialTab={pageSettingsTab}
            onApply={(nextSize, nextFrame) => {
              if (pageSettingsScope === 'page' && activePage) {
                setPages((prev) =>
                  prev.map((p) =>
                    p.id === activePage.id ? { ...p, pageFrame: nextFrame } : p,
                  ),
                )
                return
              }
              setPaperSize(nextSize)
              setPageFrameSettings(nextFrame)
            }}
          />
          {selectedTextBox &&
          selectedTextEditPage &&
          textBoxSelectedIndex != null ? (
            <BookTextBoxPanel
              fonts={availableFonts}
              textBox={selectedTextBox}
              onChange={(next) =>
                updateTextBoxForPageAtIndex(
                  selectedTextEditPage.id,
                  textBoxSelectedIndex,
                  next,
                )
              }
              onRemove={() =>
                updateTextBoxForPageAtIndex(
                  selectedTextEditPage.id,
                  textBoxSelectedIndex,
                  null,
                )
              }
              onClose={() => {
                setTextBoxSelectedPageId(null)
                setTextBoxSelectedIndex(null)
              }}
            />
          ) : null}
          {selectedThoughtBubblePage?.thoughtBubble ? (
            <BookThoughtBubblePanel
              bubble={selectedThoughtBubblePage.thoughtBubble}
              onChange={(next) =>
                updateThoughtBubbleForPage(selectedThoughtBubblePage.id, next)
              }
              onRemove={() =>
                updateThoughtBubbleForPage(
                  selectedThoughtBubblePage.id,
                  null,
                )
              }
              onClose={() => setThoughtBubbleSelectedPageId(null)}
            />
          ) : null}
          {selectedCharacterPage && selectedCharacter ? (
            <BookCharacterPanel
              character={selectedCharacter}
              onChange={(next) =>
                characterSelectedIndex != null
                  ? updateCharacterForPageAtIndex(
                      selectedCharacterPage.id,
                      characterSelectedIndex,
                      next,
                    )
                  : undefined
              }
              onRemove={() =>
                characterSelectedIndex != null
                  ? updateCharacterForPageAtIndex(
                      selectedCharacterPage.id,
                      characterSelectedIndex,
                      null,
                    )
                  : undefined
              }
              onClose={() => {
                setCharacterSelectedPageId(null)
                setCharacterSelectedIndex(null)
              }}
            />
          ) : null}
          {selectedShapePage && selectedShape ? (
            <BookShapePanel
              shape={selectedShape}
              onChange={(next) =>
                shapeSelectedIndex != null
                  ? updateShapeForPageAtIndex(
                      selectedShapePage.id,
                      shapeSelectedIndex,
                      next,
                    )
                  : null
              }
              onRemove={() =>
                shapeSelectedIndex != null
                  ? updateShapeForPageAtIndex(
                      selectedShapePage.id,
                      shapeSelectedIndex,
                      null,
                    )
                  : null
              }
              onClose={() => {
                setShapeSelectedPageId(null)
                setShapeSelectedIndex(null)
              }}
            />
          ) : null}
          {layersOpen && activeContentPage ? (
            <aside className="book-text-flyout book-layers-flyout" aria-label="Layers">
              <div className="book-text-flyout__head">
                <h2 className="book-text-flyout__title">Layers</h2>
                <button
                  type="button"
                  className="book-text-flyout__close"
                  onClick={() => setLayersOpen(false)}
                  aria-label="Close layers"
                >
                  ×
                </button>
              </div>
              <div className="book-text-flyout__scroll">
                {groupedLayerRows.length === 0 ? (
                  <div className="book-layers__empty">No layers on this page</div>
                ) : (
                  groupedLayerRows.map((entry, entryIndex) =>
                    entry.type === 'single' ? (
                    <button
                      key={`layer-${entry.row.key}`}
                      type="button"
                      className={
                        'book-layers__item' +
                        ((entry.row.section === 'canvas' &&
                          entry.row.kind === 'character' &&
                          canvasMultiSelection?.pageId === activeContentPage.id &&
                          canvasMultiSelection.kinds.includes('character')) ||
                        (entry.row.section === 'canvas' &&
                          entry.row.kind === 'textBox' &&
                          textBoxSelectedPageId === activeContentPage.id) ||
                        (entry.row.section === 'canvas' &&
                          entry.row.kind === 'thoughtBubble' &&
                          thoughtBubbleSelectedPageId === activeContentPage.id) ||
                        (entry.row.section === 'shape' &&
                          ((shapeSelectedPageId === activeContentPage.id &&
                            shapeSelectedIndex === entry.row.index) ||
                            (shapeMultiSelection?.pageId === activeContentPage.id &&
                              shapeMultiSelection.indices.includes(entry.row.index))))
                          ? ' book-layers__item--active'
                          : '')
                      }
                      draggable
                      onClick={(e) => {
                        if (entry.row.section === 'canvas') {
                          const itemGroupId =
                            entry.row.kind === 'character'
                              ? activeContentPage.characters[
                                  characterSelectedIndex ?? 0
                                ]?.groupId
                              : entry.row.kind === 'textBox'
                                ? (textBoxSelectedPageId ===
                                    activeContentPage.id &&
                                  textBoxSelectedIndex != null
                                    ? getPageTextBoxes(activeContentPage)[
                                        textBoxSelectedIndex
                                      ]
                                    : getPageTextBoxes(activeContentPage)[0]
                                  )?.groupId
                                : activeContentPage.thoughtBubble?.groupId
                          const groupedSel = collectGroupedSelection(
                            activeContentPage,
                            itemGroupId,
                          )
                          if (e.ctrlKey || e.metaKey) {
                            setShapeMultiSelection(null)
                            toggleCanvasKindSelection(activeContentPage.id, entry.row.kind)
                            return
                          }
                          if (groupedSel) {
                            setCanvasMultiSelection(
                              groupedSel.kinds.length > 0
                                ? { pageId: activeContentPage.id, kinds: groupedSel.kinds }
                                : null,
                            )
                            setShapeMultiSelection(
                              groupedSel.shapeIndices.length > 0
                                ? {
                                    pageId: activeContentPage.id,
                                    indices: groupedSel.shapeIndices,
                                  }
                                : null,
                            )
                          } else {
                            setCanvasMultiSelection(
                              entry.row.kind === 'character'
                                ? { pageId: activeContentPage.id, kinds: ['character'] }
                                : null,
                            )
                            setShapeMultiSelection(null)
                          }
                          setShapeSelectedPageId(null)
                          setShapeSelectedIndex(null)
                          if (entry.row.kind === 'textBox') {
                            setTextBoxSelectedPageId(activeContentPage.id)
                            setTextBoxSelectedIndex((prev) => {
                              const boxes = getPageTextBoxes(activeContentPage)
                              if (
                                prev != null &&
                                prev >= 0 &&
                                prev < boxes.length
                              ) {
                                return prev
                              }
                              return boxes.length > 0 ? 0 : null
                            })
                          } else {
                            setTextBoxSelectedPageId(null)
                            setTextBoxSelectedIndex(null)
                          }
                          setThoughtBubbleSelectedPageId(
                            entry.row.kind === 'thoughtBubble' ? activeContentPage.id : null,
                          )
                        } else {
                          const keepShapeMulti =
                            shapeMultiSelection?.pageId === activeContentPage.id &&
                            shapeMultiSelection.indices.length >= 2 &&
                            shapeMultiSelection.indices.includes(entry.row.index)
                          const shapeGroupId = activeContentPage.shapes[entry.row.index]?.groupId
                          const groupedSel = collectGroupedSelection(
                            activeContentPage,
                            shapeGroupId,
                          )
                          if (e.ctrlKey || e.metaKey) {
                            setCanvasMultiSelection(null)
                            setTextBoxSelectedPageId(null)
                            setThoughtBubbleSelectedPageId(null)
                            setShapeSelectedPageId(activeContentPage.id)
                            setShapeSelectedIndex(entry.row.index)
                            toggleShapeSelection(activeContentPage.id, entry.row.index)
                            return
                          }
                          setTextBoxSelectedPageId(null)
                          setThoughtBubbleSelectedPageId(null)
                          if (groupedSel) {
                            setCanvasMultiSelection(
                              groupedSel.kinds.length > 0
                                ? { pageId: activeContentPage.id, kinds: groupedSel.kinds }
                                : null,
                            )
                            setShapeMultiSelection(
                              groupedSel.shapeIndices.length > 0
                                ? {
                                    pageId: activeContentPage.id,
                                    indices: groupedSel.shapeIndices,
                                  }
                                : null,
                            )
                          } else {
                            if (!keepShapeMulti) {
                              setCanvasMultiSelection(null)
                              setShapeMultiSelection(null)
                            }
                          }
                          setShapeSelectedPageId(activeContentPage.id)
                          setShapeSelectedIndex(entry.row.index)
                        }
                      }}
                      onContextMenu={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        const pageIndex = pages.findIndex(
                          (pg) => pg.id === activeContentPage.id,
                        )
                        if (pageIndex < 0) return
                        if (entry.row.section === 'canvas') {
                          const itemGroupId =
                            entry.row.kind === 'character'
                              ? activeContentPage.characters[
                                  characterSelectedIndex ?? 0
                                ]?.groupId
                              : entry.row.kind === 'textBox'
                                ? (textBoxSelectedPageId ===
                                    activeContentPage.id &&
                                  textBoxSelectedIndex != null
                                    ? getPageTextBoxes(activeContentPage)[
                                        textBoxSelectedIndex
                                      ]
                                    : getPageTextBoxes(activeContentPage)[0]
                                  )?.groupId
                                : activeContentPage.thoughtBubble?.groupId
                          const groupedSel = collectGroupedSelection(
                            activeContentPage,
                            itemGroupId,
                          )
                          if (groupedSel) {
                            setCanvasMultiSelection(
                              groupedSel.kinds.length > 0
                                ? { pageId: activeContentPage.id, kinds: groupedSel.kinds }
                                : null,
                            )
                            setShapeMultiSelection(
                              groupedSel.shapeIndices.length > 0
                                ? {
                                    pageId: activeContentPage.id,
                                    indices: groupedSel.shapeIndices,
                                  }
                                : null,
                            )
                          } else {
                            setCanvasMultiSelection(
                              entry.row.kind === 'character'
                                ? { pageId: activeContentPage.id, kinds: ['character'] }
                                : null,
                            )
                            setShapeMultiSelection(null)
                          }
                          setShapeSelectedPageId(null)
                          setShapeSelectedIndex(null)
                          if (entry.row.kind === 'textBox') {
                            setTextBoxSelectedPageId(activeContentPage.id)
                            setTextBoxSelectedIndex((prev) => {
                              const boxes = getPageTextBoxes(activeContentPage)
                              if (
                                prev != null &&
                                prev >= 0 &&
                                prev < boxes.length
                              ) {
                                return prev
                              }
                              return boxes.length > 0 ? 0 : null
                            })
                          } else {
                            setTextBoxSelectedPageId(null)
                            setTextBoxSelectedIndex(null)
                          }
                          setThoughtBubbleSelectedPageId(
                            entry.row.kind === 'thoughtBubble' ? activeContentPage.id : null,
                          )
                          setCanvasContextMenu({
                            clientX: e.clientX,
                            clientY: e.clientY,
                            pageIndex,
                            target: 'kind',
                            anchorKind: entry.row.kind,
                          })
                        } else {
                          const shapeGroupId =
                            activeContentPage.shapes[entry.row.index]?.groupId
                          const groupedSel = collectGroupedSelection(
                            activeContentPage,
                            shapeGroupId,
                          )
                          setTextBoxSelectedPageId(null)
                          setThoughtBubbleSelectedPageId(null)
                          if (groupedSel) {
                            setCanvasMultiSelection(
                              groupedSel.kinds.length > 0
                                ? { pageId: activeContentPage.id, kinds: groupedSel.kinds }
                                : null,
                            )
                            setShapeMultiSelection(
                              groupedSel.shapeIndices.length > 0
                                ? {
                                    pageId: activeContentPage.id,
                                    indices: groupedSel.shapeIndices,
                                  }
                                : null,
                            )
                          } else {
                            setCanvasMultiSelection(null)
                            setShapeMultiSelection(null)
                          }
                          setShapeSelectedPageId(activeContentPage.id)
                          setShapeSelectedIndex(entry.row.index)
                          setCanvasContextMenu({
                            clientX: e.clientX,
                            clientY: e.clientY,
                            pageIndex,
                            target: 'shape',
                            shapeIndex: entry.row.index,
                          })
                        }
                      }}
                      onDragStart={(e) => {
                        setLayersDrag({ fromPos: entry.row.pos })
                        e.dataTransfer.effectAllowed = 'move'
                      }}
                      onDragEnd={() => setLayersDrag(null)}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => {
                        e.preventDefault()
                        if (!layersDrag) return
                        reorderPageLayerTokens(
                          activeContentPage.id,
                          layersDrag.fromPos,
                          entry.row.pos,
                        )
                        setLayersDrag(null)
                      }}
                    >
                      <span className="book-layers__item-main">
                        {entry.row.section === 'canvas' ? (
                          <>
                            <span
                              className={`book-layers__preview book-layers__preview--${entry.row.kind}`}
                            />
                            {editingLayerNameId === `item:${entry.row.key}` ? (
                              <input
                                className="book-layers__name-input"
                                value={editingLayerNameDraft}
                                onChange={(e) => setEditingLayerNameDraft(e.target.value)}
                                onBlur={commitRenameLayerEntry}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    e.preventDefault()
                                    commitRenameLayerEntry()
                                  }
                                  if (e.key === 'Escape') {
                                    e.preventDefault()
                                    setEditingLayerNameId(null)
                                  }
                                  e.stopPropagation()
                                }}
                                onClick={(e) => e.stopPropagation()}
                                autoFocus
                              />
                            ) : (
                              <span
                                onDoubleClick={(e) => {
                                  e.stopPropagation()
                                  startRenameLayerEntry(
                                    `item:${entry.row.key}`,
                                    layerLabel(entry.row),
                                  )
                                }}
                                title={layerLabel(entry.row)}
                              >
                                {layerLabel(entry.row)}
                              </span>
                            )}
                          </>
                        ) : (
                          <>
                            {entry.row.shape.kind === 'image' && entry.row.shape.imageUrl ? (
                              <img
                                src={assetUrl(entry.row.shape.imageUrl)}
                                alt=""
                                className="book-layers__preview-img"
                                draggable={false}
                              />
                            ) : (
                              <span
                                className={`book-layers__preview book-layers__preview--shape book-layers__preview--shape-${entry.row.shape.kind}`}
                                style={{
                                  background: entry.row.shape.fillColor,
                                  borderColor: entry.row.shape.borderColor,
                                  borderWidth: Math.min(
                                    2,
                                    Math.max(1, entry.row.shape.borderWidth),
                                  ),
                                }}
                              />
                            )}
                            {editingLayerNameId === `item:${entry.row.key}` ? (
                              <input
                                className="book-layers__name-input"
                                value={editingLayerNameDraft}
                                onChange={(e) => setEditingLayerNameDraft(e.target.value)}
                                onBlur={commitRenameLayerEntry}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    e.preventDefault()
                                    commitRenameLayerEntry()
                                  }
                                  if (e.key === 'Escape') {
                                    e.preventDefault()
                                    setEditingLayerNameId(null)
                                  }
                                  e.stopPropagation()
                                }}
                                onClick={(e) => e.stopPropagation()}
                                autoFocus
                              />
                            ) : (
                              <span
                                onDoubleClick={(e) => {
                                  e.stopPropagation()
                                  startRenameLayerEntry(
                                    `item:${entry.row.key}`,
                                    layerLabel(entry.row),
                                  )
                                }}
                                title={layerLabel(entry.row)}
                              >
                                {layerLabel(entry.row)}
                              </span>
                            )}
                          </>
                        )}
                      </span>
                      <span className="book-layers__drag-icon" aria-hidden>
                        ⋮⋮
                      </span>
                    </button>
                    ) : (
                      <div key={`layer-group-${entry.groupId}-${entryIndex}`} className="book-layers__group">
                        <div className="book-layers__group-head book-layers__item book-layers__item--group">
                          {editingLayerNameId === `group:${entry.groupId}` ? (
                            <input
                              className="book-layers__group-name-input"
                              value={editingLayerNameDraft}
                              onChange={(e) => setEditingLayerNameDraft(e.target.value)}
                              onBlur={commitRenameLayerEntry}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault()
                                  commitRenameLayerEntry()
                                }
                                if (e.key === 'Escape') {
                                  e.preventDefault()
                                  setEditingLayerNameId(null)
                                }
                              }}
                              autoFocus
                              aria-label="Group name"
                            />
                          ) : (
                            <span
                              className="book-layers__group-name"
                              onDoubleClick={() =>
                                startRenameLayerEntry(
                                  `group:${entry.groupId}`,
                                  entry.label,
                                )
                              }
                              title={entry.label}
                            >
                              {entry.label}
                            </span>
                          )}
                          <button
                            type="button"
                            className="book-layers__group-toggle"
                            onClick={() =>
                              setLayersGroupOpen((prev) => ({
                                ...prev,
                                [entry.groupId]: !(prev[entry.groupId] ?? true),
                              }))
                            }
                            aria-label="Toggle group"
                          >
                            <svg
                              width={14}
                              height={14}
                              viewBox="0 0 16 16"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              aria-hidden
                              style={{
                                transform:
                                  layersGroupOpen[entry.groupId] ?? true
                                    ? 'rotate(90deg)'
                                    : 'rotate(0deg)',
                                transition: 'transform 0.12s ease',
                              }}
                            >
                              <path d="M6 3l5 5-5 5" />
                            </svg>
                          </button>
                        </div>
                        {(layersGroupOpen[entry.groupId] ?? true) ? (
                          <div className="book-layers__group-children">
                            {entry.rows.map((row) => (
                              <button
                                key={`layer-child-${entry.groupId}-${row.key}`}
                                type="button"
                                className={
                                  'book-layers__item book-layers__item--child' +
                                  ((row.section === 'canvas' &&
                                    row.kind === 'character' &&
                                    canvasMultiSelection?.pageId === activeContentPage.id &&
                                    canvasMultiSelection.kinds.includes('character')) ||
                                  (row.section === 'canvas' &&
                                    row.kind === 'textBox' &&
                                    textBoxSelectedPageId === activeContentPage.id) ||
                                  (row.section === 'canvas' &&
                                    row.kind === 'thoughtBubble' &&
                                    thoughtBubbleSelectedPageId === activeContentPage.id) ||
                                  (row.section === 'shape' &&
                                    ((shapeSelectedPageId === activeContentPage.id &&
                                      shapeSelectedIndex === row.index) ||
                                      (shapeMultiSelection?.pageId === activeContentPage.id &&
                                        shapeMultiSelection.indices.includes(row.index))))
                                    ? ' book-layers__item--active'
                                    : '')
                                }
                                onClick={() => {
                                  if (row.section === 'canvas') {
                                    setShapeSelectedPageId(null)
                                    setShapeSelectedIndex(null)
                                    if (row.kind === 'textBox') {
                                      setTextBoxSelectedPageId(activeContentPage.id)
                                      setTextBoxSelectedIndex((prev) => {
                                        const boxes = getPageTextBoxes(activeContentPage)
                                        if (
                                          prev != null &&
                                          prev >= 0 &&
                                          prev < boxes.length
                                        ) {
                                          return prev
                                        }
                                        return boxes.length > 0 ? 0 : null
                                      })
                                    } else {
                                      setTextBoxSelectedPageId(null)
                                      setTextBoxSelectedIndex(null)
                                    }
                                    setThoughtBubbleSelectedPageId(
                                      row.kind === 'thoughtBubble'
                                        ? activeContentPage.id
                                        : null,
                                    )
                                    setCanvasMultiSelection({
                                      pageId: activeContentPage.id,
                                      kinds: [row.kind],
                                    })
                                  } else {
                                    setTextBoxSelectedPageId(null)
                                    setTextBoxSelectedIndex(null)
                                    setThoughtBubbleSelectedPageId(null)
                                    setCanvasMultiSelection(null)
                                    setShapeMultiSelection(null)
                                    setShapeSelectedPageId(activeContentPage.id)
                                    setShapeSelectedIndex(row.index)
                                  }
                                }}
                                onContextMenu={(e) => {
                                  e.preventDefault()
                                  e.stopPropagation()
                                  const pageIndex = pages.findIndex(
                                    (pg) => pg.id === activeContentPage.id,
                                  )
                                  if (pageIndex < 0) return
                                  if (row.section === 'canvas') {
                                    setCanvasMultiSelection({
                                      pageId: activeContentPage.id,
                                      kinds: [row.kind],
                                    })
                                    setShapeMultiSelection(null)
                                    setShapeSelectedPageId(null)
                                    setShapeSelectedIndex(null)
                                    if (row.kind === 'textBox') {
                                      setTextBoxSelectedPageId(activeContentPage.id)
                                      setTextBoxSelectedIndex((prev) => {
                                        const boxes = getPageTextBoxes(activeContentPage)
                                        if (
                                          prev != null &&
                                          prev >= 0 &&
                                          prev < boxes.length
                                        ) {
                                          return prev
                                        }
                                        return boxes.length > 0 ? 0 : null
                                      })
                                    } else {
                                      setTextBoxSelectedPageId(null)
                                      setTextBoxSelectedIndex(null)
                                    }
                                    setThoughtBubbleSelectedPageId(
                                      row.kind === 'thoughtBubble'
                                        ? activeContentPage.id
                                        : null,
                                    )
                                    setCanvasContextMenu({
                                      clientX: e.clientX,
                                      clientY: e.clientY,
                                      pageIndex,
                                      target: 'kind',
                                      anchorKind: row.kind,
                                    })
                                  } else {
                                    setTextBoxSelectedPageId(null)
                                    setThoughtBubbleSelectedPageId(null)
                                    setCanvasMultiSelection(null)
                                    setShapeMultiSelection(null)
                                    setShapeSelectedPageId(activeContentPage.id)
                                    setShapeSelectedIndex(row.index)
                                    setCanvasContextMenu({
                                      clientX: e.clientX,
                                      clientY: e.clientY,
                                      pageIndex,
                                      target: 'shape',
                                      shapeIndex: row.index,
                                    })
                                  }
                                }}
                              >
                                <span className="book-layers__item-main">
                                  {row.section === 'canvas' ? (
                                    <>
                                      <span
                                        className={`book-layers__preview book-layers__preview--${row.kind}`}
                                      />
                                      {editingLayerNameId === `item:${row.key}` ? (
                                        <input
                                          className="book-layers__name-input"
                                          value={editingLayerNameDraft}
                                          onChange={(e) =>
                                            setEditingLayerNameDraft(e.target.value)
                                          }
                                          onBlur={commitRenameLayerEntry}
                                          onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                              e.preventDefault()
                                              commitRenameLayerEntry()
                                            }
                                            if (e.key === 'Escape') {
                                              e.preventDefault()
                                              setEditingLayerNameId(null)
                                            }
                                            e.stopPropagation()
                                          }}
                                          onClick={(e) => e.stopPropagation()}
                                          autoFocus
                                        />
                                      ) : (
                                        <span
                                          onDoubleClick={(e) => {
                                            e.stopPropagation()
                                            startRenameLayerEntry(
                                              `item:${row.key}`,
                                              layerLabel(row),
                                            )
                                          }}
                                          title={layerLabel(row)}
                                        >
                                          {layerLabel(row)}
                                        </span>
                                      )}
                                    </>
                                  ) : (
                                    <>
                                      {row.shape.kind === 'image' && row.shape.imageUrl ? (
                                        <img
                                          src={assetUrl(row.shape.imageUrl)}
                                          alt=""
                                          className="book-layers__preview-img"
                                          draggable={false}
                                        />
                                      ) : (
                                        <span
                                          className={`book-layers__preview book-layers__preview--shape book-layers__preview--shape-${row.shape.kind}`}
                                          style={{
                                            background: row.shape.fillColor,
                                            borderColor: row.shape.borderColor,
                                            borderWidth: Math.min(
                                              2,
                                              Math.max(1, row.shape.borderWidth),
                                            ),
                                          }}
                                        />
                                      )}
                                      {editingLayerNameId === `item:${row.key}` ? (
                                        <input
                                          className="book-layers__name-input"
                                          value={editingLayerNameDraft}
                                          onChange={(e) =>
                                            setEditingLayerNameDraft(e.target.value)
                                          }
                                          onBlur={commitRenameLayerEntry}
                                          onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                              e.preventDefault()
                                              commitRenameLayerEntry()
                                            }
                                            if (e.key === 'Escape') {
                                              e.preventDefault()
                                              setEditingLayerNameId(null)
                                            }
                                            e.stopPropagation()
                                          }}
                                          onClick={(e) => e.stopPropagation()}
                                          autoFocus
                                        />
                                      ) : (
                                        <span
                                          onDoubleClick={(e) => {
                                            e.stopPropagation()
                                            startRenameLayerEntry(
                                              `item:${row.key}`,
                                              layerLabel(row),
                                            )
                                          }}
                                          title={layerLabel(row)}
                                        >
                                          {layerLabel(row)}
                                        </span>
                                      )}
                                    </>
                                  )}
                                </span>
                              </button>
                            ))}
                          </div>
                        ) : null}
                      </div>
                    ),
                  )
                )}
              </div>
            </aside>
          ) : null}
          <TextBubblePickerModal
            open={textBubbleModalOpen}
            onClose={() => setTextBubbleModalOpen(false)}
            onSelect={(imageUrl) => {
              const path = imageUrl.trim()
              if (!path) return
              setTextBoxSelectedPageId(null)
              setThoughtBubbleSelectedPageId(null)
              let selectShapePageId: string | null = null
              let selectShapeIndex: number | null = null
              setPages((prev) => {
                let idx = activePageIndex
                if (idx < 0 || idx >= prev.length) {
                  idx = prev.findIndex((p) => p.kind === 'content')
                } else if (prev[idx]?.kind !== 'content') {
                  idx = prev.findIndex((p) => p.kind === 'content')
                }
                if (idx < 0) return prev
                const pg = prev[idx]
                if (!pg || pg.kind !== 'content') return prev
                return prev.map((p, i) =>
                  i === idx && p.kind === 'content'
                    ? (() => {
                        const offsetStep = 18
                        const offset = Math.min(p.shapes.length, 8) * offsetStep
                        const nextShape = createDefaultPlacedShape('image', path)
                        nextShape.widthPx = 200
                        nextShape.heightPx = 132
                        nextShape.x += offset
                        nextShape.y += offset
                        selectShapePageId = p.id
                        selectShapeIndex = p.shapes.length
                        return { ...p, shapes: [...p.shapes, nextShape] }
                      })()
                    : p,
                )
              })
              if (selectShapePageId) {
                setShapeSelectedPageId(selectShapePageId)
                setShapeSelectedIndex(selectShapeIndex)
                return
              }
            }}
          />
          <ShapePickerModal
            open={shapePickerOpen}
            onClose={() => setShapePickerOpen(false)}
            onSelectBuiltIn={(kind) => {
              if (!activeContentPage) return
              setTextBoxSelectedPageId(null)
              setThoughtBubbleSelectedPageId(null)
              let nextShapeIndex: number | null = null
              setPages((prev) =>
                prev.map((p) => {
                  if (p.id !== activeContentPage.id || p.kind !== 'content') return p
                  const offsetStep = 18
                  const offset = Math.min(p.shapes.length, 8) * offsetStep
                  const nextShape = createDefaultPlacedShape(kind)
                  nextShape.x += offset
                  nextShape.y += offset
                  nextShapeIndex = p.shapes.length
                  return { ...p, shapes: [...p.shapes, nextShape] }
                }),
              )
              setShapeSelectedPageId(activeContentPage.id)
              setShapeSelectedIndex(nextShapeIndex ?? activeContentPage.shapes.length)
            }}
            onSelectUploaded={(imageUrl) => {
              if (!activeContentPage) return
              setTextBoxSelectedPageId(null)
              setThoughtBubbleSelectedPageId(null)
              let nextShapeIndex: number | null = null
              setPages((prev) =>
                prev.map((p) => {
                  if (p.id !== activeContentPage.id || p.kind !== 'content') return p
                  const offsetStep = 18
                  const offset = Math.min(p.shapes.length, 8) * offsetStep
                  const nextShape = createDefaultPlacedShape('image', imageUrl)
                  nextShape.x += offset
                  nextShape.y += offset
                  nextShapeIndex = p.shapes.length
                  return { ...p, shapes: [...p.shapes, nextShape] }
                }),
              )
              setShapeSelectedPageId(activeContentPage.id)
              setShapeSelectedIndex(nextShapeIndex ?? activeContentPage.shapes.length)
            }}
          />
          <ElementPickerModal
            open={elementPickerOpen}
            onClose={() => setElementPickerOpen(false)}
            onSelect={(imageUrl) => {
              if (!activeContentPage) return
              setTextBoxSelectedPageId(null)
              setThoughtBubbleSelectedPageId(null)
              let nextShapeIndex: number | null = null
              setPages((prev) =>
                prev.map((p) => {
                  if (p.id !== activeContentPage.id || p.kind !== 'content') return p
                  const offsetStep = 18
                  const offset = Math.min(p.shapes.length, 8) * offsetStep
                  const nextShape = createDefaultPlacedShape('image', imageUrl)
                  nextShape.x += offset
                  nextShape.y += offset
                  nextShapeIndex = p.shapes.length
                  return { ...p, shapes: [...p.shapes, nextShape] }
                }),
              )
              setShapeSelectedPageId(activeContentPage.id)
              setShapeSelectedIndex(nextShapeIndex ?? activeContentPage.shapes.length)
            }}
          />
          <SavedCharactersModal
            open={savedCharactersModalOpen}
            onClose={() => setSavedCharactersModalOpen(false)}
            catalog={catalog}
            onPlace={placeSavedCharacterSelection}
          />
          {canvasContextMenu
            ? (() => {
                const cm = canvasContextMenu
                const cmPg = pages[cm.pageIndex]
                const collectGroupIds = (
                  page: BookPageData,
                  kinds: CanvasSelectableKind[],
                ) => {
                  const gIds = new Set<string>()
                  const add = (kind: CanvasSelectableKind) => {
                    if (page.kind !== 'content') return
                    if (kind === 'character') {
                      for (const ch of getPageCharacters(page)) {
                        if (ch.groupId) gIds.add(ch.groupId)
                      }
                    }
                    if (kind === 'textBox') {
                      for (const tb of getPageTextBoxes(page)) {
                        if (tb.groupId) gIds.add(tb.groupId)
                      }
                    }
                    if (kind === 'thoughtBubble' && page.thoughtBubble?.groupId) {
                      gIds.add(page.thoughtBubble.groupId)
                    }
                  }
                  for (const k of kinds) add(k)
                  return gIds
                }
                const selectedKindsForActions: CanvasSelectableKind[] =
                  cmPg?.kind === 'content'
                    ? Array.from(
                        new Set<CanvasSelectableKind>([
                          ...(cm.target === 'kind' ? [cm.anchorKind] : []),
                          ...(canvasMultiSelection?.pageId === cmPg?.id
                            ? canvasMultiSelection.kinds
                            : []),
                          ...(textBoxSelectedPageId === cmPg?.id
                            ? (['textBox'] as CanvasSelectableKind[])
                            : []),
                          ...(thoughtBubbleSelectedPageId === cmPg?.id
                            ? (['thoughtBubble'] as CanvasSelectableKind[])
                            : []),
                        ]),
                      )
                    : []
                const anchor =
                  cm.target === 'kind' ? cm.anchorKind : null
                const layerTokens =
                  cm.target === 'kind' && cmPg?.kind === 'content'
                    ? pageLayerTokens(cmPg)
                    : []
                const anchorToken = anchor ? `kind:${anchor}` : null
                const stackIx = anchorToken ? layerTokens.indexOf(anchorToken) : -1
                const canBringFront =
                  cm.target === 'kind' &&
                  layerTokens.length > 1 &&
                  stackIx >= 0 &&
                  stackIx < layerTokens.length - 1
                const canSendBack =
                  cm.target === 'kind' && layerTokens.length > 1 && stackIx > 0
                const shapeIndex = cm.target === 'shape' ? cm.shapeIndex : -1
                const shapeCount =
                  cm.target === 'shape' && cmPg?.kind === 'content'
                    ? cmPg.shapes.length
                    : 0
                const canShapeBringFront =
                  cm.target === 'shape' &&
                  shapeCount > 1 &&
                  shapeIndex >= 0 &&
                  shapeIndex < shapeCount - 1
                const canShapeSendBack =
                  cm.target === 'shape' && shapeCount > 1 && shapeIndex > 0
                const selectedShapeIndices =
                  cm.target === 'shape'
                    ? Array.from(
                        new Set<number>([
                          shapeIndex,
                          ...(shapeMultiSelection?.pageId === cmPg?.id
                            ? shapeMultiSelection.indices
                            : []),
                          ...(shapeSelectedPageId === cmPg?.id &&
                          shapeSelectedIndex != null
                            ? [shapeSelectedIndex]
                            : []),
                        ]),
                      ).filter((i2) => i2 >= 0 && i2 < shapeCount)
                    : shapeMultiSelection?.pageId === cmPg?.id
                      ? Array.from(
                          new Set<number>([
                            ...shapeMultiSelection.indices,
                            ...(shapeSelectedPageId === cmPg?.id &&
                            shapeSelectedIndex != null
                              ? [shapeSelectedIndex]
                              : []),
                          ]),
                        ).filter((i2) => i2 >= 0 && i2 < shapeCount)
                      : []
                const selectedCountForActions =
                  selectedKindsForActions.length + selectedShapeIndices.length
                const canGroup = selectedCountForActions >= 2
                const canAlignOrTidy = selectedCountForActions >= 2
                const canUngroupMixed =
                  cmPg?.kind === 'content' &&
                  (collectGroupIds(cmPg, selectedKindsForActions).size > 0 ||
                    selectedShapeIndices.some((i2) => !!cmPg.shapes[i2]?.groupId))
                const canCutKind =
                  cm.target === 'kind' &&
                  cmPg?.kind === 'content' &&
                  ((anchor === 'character' &&
                    getPageCharacters(cmPg).length > 0) ||
                    (anchor === 'textBox' &&
                      getPageTextBoxes(cmPg).length > 0) ||
                    (anchor === 'thoughtBubble' && !!cmPg.thoughtBubble))
                return (
                  <div
                    className="book-canvas-context-menu"
                    style={{
                      left: cm.clientX,
                      top: cm.clientY,
                    }}
                    role="menu"
                    aria-label="Canvas element options"
                  >
                    {cm.target === 'kind' ? (
                      <>
                        <button
                          type="button"
                          role="menuitem"
                          disabled={!canBringFront}
                          onClick={() => {
                            if (
                              !canBringFront ||
                              !cmPg ||
                              cmPg.kind !== 'content' ||
                              !anchor
                            ) {
                              return
                            }
                            applyLayerTokenStack(cmPg.id, `kind:${anchor}`, 'front')
                            setCanvasContextMenu(null)
                          }}
                        >
                          <span>Bring to front</span>
                          <span className="book-canvas-context-menu__shortcut">
                            Ctrl+]
                          </span>
                        </button>
                        <button
                          type="button"
                          role="menuitem"
                          disabled={!canSendBack}
                          onClick={() => {
                            if (
                              !canSendBack ||
                              !cmPg ||
                              cmPg.kind !== 'content' ||
                              !anchor
                            ) {
                              return
                            }
                            applyLayerTokenStack(cmPg.id, `kind:${anchor}`, 'back')
                            setCanvasContextMenu(null)
                          }}
                        >
                          <span>Send to back</span>
                          <span className="book-canvas-context-menu__shortcut">
                            Ctrl+[
                          </span>
                        </button>
                        <button
                          type="button"
                          role="menuitem"
                          disabled={!canBringFront}
                          onClick={() => {
                            if (
                              !canBringFront ||
                              !cmPg ||
                              cmPg.kind !== 'content' ||
                              !anchor
                            ) {
                              return
                            }
                            applyLayerTokenStack(cmPg.id, `kind:${anchor}`, 'forward')
                            setCanvasContextMenu(null)
                          }}
                        >
                          <span>Move up</span>
                          <span className="book-canvas-context-menu__shortcut">
                            Ctrl+]
                          </span>
                        </button>
                        <button
                          type="button"
                          role="menuitem"
                          disabled={!canSendBack}
                          onClick={() => {
                            if (
                              !canSendBack ||
                              !cmPg ||
                              cmPg.kind !== 'content' ||
                              !anchor
                            ) {
                              return
                            }
                            applyLayerTokenStack(
                              cmPg.id,
                              `kind:${anchor}`,
                              'backward',
                            )
                            setCanvasContextMenu(null)
                          }}
                        >
                          <span>Move down</span>
                          <span className="book-canvas-context-menu__shortcut">
                            Ctrl+[
                          </span>
                        </button>
                        <button
                          type="button"
                          role="menuitem"
                          onClick={() => {
                            if (!cmPg || cmPg.kind !== 'content' || !anchor) return
                            if (anchor === 'textBox') {
                              setTextBoxSelectedPageId(cmPg.id)
                              setTextBoxSelectedIndex((prev) => {
                                const boxes = getPageTextBoxes(cmPg)
                                if (
                                  prev != null &&
                                  prev >= 0 &&
                                  prev < boxes.length
                                ) {
                                  return prev
                                }
                                return boxes.length > 0 ? 0 : null
                              })
                              setThoughtBubbleSelectedPageId(null)
                              setShapeSelectedPageId(null)
                              setShapeSelectedIndex(null)
                            } else if (anchor === 'thoughtBubble') {
                              setThoughtBubbleSelectedPageId(cmPg.id)
                              setTextBoxSelectedPageId(null)
                              setTextBoxSelectedIndex(null)
                              setShapeSelectedPageId(null)
                              setShapeSelectedIndex(null)
                            } else {
                              setTextBoxSelectedPageId(null)
                              setTextBoxSelectedIndex(null)
                              setThoughtBubbleSelectedPageId(null)
                              setShapeSelectedPageId(null)
                              setShapeSelectedIndex(null)
                            }
                            setLayersOpen(true)
                            setCanvasContextMenu(null)
                          }}
                        >
                          <span>Show layers panel</span>
                          <span className="book-canvas-context-menu__shortcut">L</span>
                        </button>
                        <hr className="book-canvas-context-menu__sep" />
                        <button
                          type="button"
                          role="menuitem"
                          disabled={!canCutKind}
                          onClick={() => {
                            if (!cmPg || cmPg.kind !== 'content' || !anchor) return
                            if (anchor === 'character') {
                              const ch =
                                cmPg.characters[characterSelectedIndex ?? 0]
                              if (!ch) return
                              canvasClipboardRef.current = {
                                target: 'kind',
                                kind: anchor,
                                payload: { ...ch },
                              }
                            } else if (anchor === 'textBox') {
                              const tb =
                                getPageTextBoxes(cmPg)[
                                  textBoxSelectedIndex ?? 0
                                ]
                              if (!tb) return
                              canvasClipboardRef.current = {
                                target: 'kind',
                                kind: anchor,
                                payload: { ...tb },
                              }
                            } else if (
                              anchor === 'thoughtBubble' &&
                              cmPg.thoughtBubble
                            ) {
                              canvasClipboardRef.current = {
                                target: 'kind',
                                kind: anchor,
                                payload: { ...cmPg.thoughtBubble },
                              }
                            }
                            setCanvasContextMenu(null)
                          }}
                        >
                          <span>Copy</span>
                          <span className="book-canvas-context-menu__shortcut">
                            Ctrl+C
                          </span>
                        </button>
                        <button
                          type="button"
                          role="menuitem"
                          disabled={!canCutKind}
                          onClick={() => {
                            if (!cmPg || cmPg.kind !== 'content' || !anchor) return
                            if (anchor === 'character') {
                              const rmIdx = characterSelectedIndex ?? 0
                              const ch = cmPg.characters[rmIdx]
                              if (!ch) return
                              canvasClipboardRef.current = {
                                target: 'kind',
                                kind: anchor,
                                payload: { ...ch },
                              }
                              setPages((prev) =>
                                prev.map((p) =>
                                  p.id === cmPg.id && p.kind === 'content'
                                    ? {
                                        ...p,
                                        characters: p.characters.filter(
                                          (_, ci) => ci !== rmIdx,
                                        ),
                                      }
                                    : p,
                                ),
                              )
                              setCharacterSelectedPageId(null)
                              setCharacterSelectedIndex(null)
                            } else if (anchor === 'textBox') {
                              const rmIdx = textBoxSelectedIndex ?? 0
                              const tb = getPageTextBoxes(cmPg)[rmIdx]
                              if (!tb) return
                              canvasClipboardRef.current = {
                                target: 'kind',
                                kind: anchor,
                                payload: { ...tb },
                              }
                              setPages((prev) =>
                                prev.map((p) =>
                                  p.id === cmPg.id && p.kind === 'content'
                                    ? {
                                        ...p,
                                        textBoxes: getPageTextBoxes(p).filter(
                                          (_, i) => i !== rmIdx,
                                        ),
                                      }
                                    : p,
                                ),
                              )
                              setTextBoxSelectedPageId(null)
                              setTextBoxSelectedIndex(null)
                            } else if (
                              anchor === 'thoughtBubble' &&
                              cmPg.thoughtBubble
                            ) {
                              canvasClipboardRef.current = {
                                target: 'kind',
                                kind: anchor,
                                payload: { ...cmPg.thoughtBubble },
                              }
                              setPages((prev) =>
                                prev.map((p) =>
                                  p.id === cmPg.id && p.kind === 'content'
                                    ? { ...p, thoughtBubble: null }
                                    : p,
                                ),
                              )
                              setThoughtBubbleSelectedPageId(null)
                            }
                            setCanvasContextMenu(null)
                          }}
                        >
                          <span>Cut</span>
                          <span className="book-canvas-context-menu__shortcut">
                            Ctrl+X
                          </span>
                        </button>
                        <hr className="book-canvas-context-menu__sep" />
                        <div
                          className={
                            'book-canvas-context-menu__submenu' +
                            (!canAlignOrTidy ? ' is-disabled' : '')
                          }
                        >
                          <button
                            type="button"
                            role="menuitem"
                            disabled={!canAlignOrTidy}
                          >
                            <span>Alignment</span>
                            <span className="book-canvas-context-menu__shortcut">
                              ▸
                            </span>
                          </button>
                          <div className="book-canvas-context-menu__submenu-panel">
                            <button
                              type="button"
                              role="menuitem"
                              onClick={() => handleCanvasContextAlign('left')}
                            >
                              <span>Align left</span>
                              <span className="book-canvas-context-menu__shortcut">
                                Ctrl+Alt+Left
                              </span>
                            </button>
                            <button
                              type="button"
                              role="menuitem"
                              onClick={() => handleCanvasContextAlign('center')}
                            >
                              <span>Align center</span>
                              <span className="book-canvas-context-menu__shortcut">
                                Ctrl+Alt+Shift+Left
                              </span>
                            </button>
                            <button
                              type="button"
                              role="menuitem"
                              onClick={() => handleCanvasContextAlign('right')}
                            >
                              <span>Align right</span>
                              <span className="book-canvas-context-menu__shortcut">
                                Ctrl+Alt+Right
                              </span>
                            </button>
                            <button
                              type="button"
                              role="menuitem"
                              onClick={() => handleCanvasContextAlign('top')}
                            >
                              <span>Align top</span>
                              <span className="book-canvas-context-menu__shortcut">
                                Ctrl+Alt+Up
                              </span>
                            </button>
                            <button
                              type="button"
                              role="menuitem"
                              onClick={() => handleCanvasContextAlign('middle')}
                            >
                              <span>Align middle</span>
                              <span className="book-canvas-context-menu__shortcut">
                                Ctrl+Alt+Shift+Up
                              </span>
                            </button>
                            <button
                              type="button"
                              role="menuitem"
                              onClick={() => handleCanvasContextAlign('bottom')}
                            >
                              <span>Align bottom</span>
                              <span className="book-canvas-context-menu__shortcut">
                                Ctrl+Alt+Down
                              </span>
                            </button>
                          </div>
                        </div>
                        <button
                          type="button"
                          role="menuitem"
                          disabled={!canAlignOrTidy}
                          onClick={() => {
                            if (!canAlignOrTidy) return
                            handleCanvasContextTidyUp()
                          }}
                        >
                          <span>Tidy up</span>
                          <span className="book-canvas-context-menu__shortcut">
                            Tidy
                          </span>
                        </button>
                        <hr className="book-canvas-context-menu__sep" />
                        <button
                          type="button"
                          role="menuitem"
                          disabled={!canGroup}
                          onClick={() => {
                            if (!canGroup) return
                            handleCanvasContextGroup()
                          }}
                        >
                          Group
                        </button>
                        <button
                          type="button"
                          role="menuitem"
                          disabled={!canUngroupMixed}
                          onClick={() => {
                            if (!canUngroupMixed) return
                            handleCanvasContextUngroup()
                          }}
                        >
                          Ungroup
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          type="button"
                          role="menuitem"
                          disabled={!canShapeBringFront}
                          onClick={() => {
                            if (!cmPg || cmPg.kind !== 'content') return
                            applyShapeStack(cmPg.id, shapeIndex, 'front')
                            setShapeSelectedPageId(cmPg.id)
                            setShapeSelectedIndex(shapeCount - 1)
                            setCanvasContextMenu(null)
                          }}
                        >
                          <span>Bring to front</span>
                          <span className="book-canvas-context-menu__shortcut">
                            Ctrl+]
                          </span>
                        </button>
                        <button
                          type="button"
                          role="menuitem"
                          disabled={!canShapeSendBack}
                          onClick={() => {
                            if (!cmPg || cmPg.kind !== 'content') return
                            applyShapeStack(cmPg.id, shapeIndex, 'back')
                            setShapeSelectedPageId(cmPg.id)
                            setShapeSelectedIndex(0)
                            setCanvasContextMenu(null)
                          }}
                        >
                          <span>Send to back</span>
                          <span className="book-canvas-context-menu__shortcut">
                            Ctrl+[
                          </span>
                        </button>
                        <button
                          type="button"
                          role="menuitem"
                          disabled={!canShapeBringFront}
                          onClick={() => {
                            if (!cmPg || cmPg.kind !== 'content') return
                            applyShapeStack(cmPg.id, shapeIndex, 'forward')
                            setShapeSelectedPageId(cmPg.id)
                            setShapeSelectedIndex(
                              Math.min(shapeCount - 1, shapeIndex + 1),
                            )
                            setCanvasContextMenu(null)
                          }}
                        >
                          <span>Move up</span>
                          <span className="book-canvas-context-menu__shortcut">
                            Ctrl+]
                          </span>
                        </button>
                        <button
                          type="button"
                          role="menuitem"
                          disabled={!canShapeSendBack}
                          onClick={() => {
                            if (!cmPg || cmPg.kind !== 'content') return
                            applyShapeStack(cmPg.id, shapeIndex, 'backward')
                            setShapeSelectedPageId(cmPg.id)
                            setShapeSelectedIndex(Math.max(0, shapeIndex - 1))
                            setCanvasContextMenu(null)
                          }}
                        >
                          <span>Move down</span>
                          <span className="book-canvas-context-menu__shortcut">
                            Ctrl+[
                          </span>
                        </button>
                        <div
                          className={
                            'book-canvas-context-menu__submenu' +
                            (!canAlignOrTidy ? ' is-disabled' : '')
                          }
                        >
                          <button
                            type="button"
                            role="menuitem"
                            disabled={!canAlignOrTidy}
                          >
                            <span>Alignment</span>
                            <span className="book-canvas-context-menu__shortcut">
                              ▸
                            </span>
                          </button>
                          <div className="book-canvas-context-menu__submenu-panel">
                            <button
                              type="button"
                              role="menuitem"
                              onClick={() => handleCanvasContextAlign('left')}
                            >
                              <span>Align left</span>
                              <span className="book-canvas-context-menu__shortcut">
                                Ctrl+Alt+Left
                              </span>
                            </button>
                            <button
                              type="button"
                              role="menuitem"
                              onClick={() => handleCanvasContextAlign('center')}
                            >
                              <span>Align center</span>
                              <span className="book-canvas-context-menu__shortcut">
                                Ctrl+Alt+Shift+Left
                              </span>
                            </button>
                            <button
                              type="button"
                              role="menuitem"
                              onClick={() => handleCanvasContextAlign('right')}
                            >
                              <span>Align right</span>
                              <span className="book-canvas-context-menu__shortcut">
                                Ctrl+Alt+Right
                              </span>
                            </button>
                            <button
                              type="button"
                              role="menuitem"
                              onClick={() => handleCanvasContextAlign('top')}
                            >
                              <span>Align top</span>
                              <span className="book-canvas-context-menu__shortcut">
                                Ctrl+Alt+Up
                              </span>
                            </button>
                            <button
                              type="button"
                              role="menuitem"
                              onClick={() => handleCanvasContextAlign('middle')}
                            >
                              <span>Align middle</span>
                              <span className="book-canvas-context-menu__shortcut">
                                Ctrl+Alt+Shift+Up
                              </span>
                            </button>
                            <button
                              type="button"
                              role="menuitem"
                              onClick={() => handleCanvasContextAlign('bottom')}
                            >
                              <span>Align bottom</span>
                              <span className="book-canvas-context-menu__shortcut">
                                Ctrl+Alt+Down
                              </span>
                            </button>
                          </div>
                        </div>
                        <button
                          type="button"
                          role="menuitem"
                          disabled={!canAlignOrTidy}
                          onClick={() => {
                            if (!canAlignOrTidy) return
                            handleCanvasContextTidyUp()
                          }}
                        >
                          <span>Tidy up</span>
                          <span className="book-canvas-context-menu__shortcut">
                            Tidy
                          </span>
                        </button>
                        <button
                          type="button"
                          role="menuitem"
                          disabled={!canGroup}
                          onClick={() => {
                            if (!canGroup) return
                            handleCanvasContextGroup()
                          }}
                        >
                          <span>Group</span>
                        </button>
                        <button
                          type="button"
                          role="menuitem"
                          disabled={!canUngroupMixed}
                          onClick={() => {
                            if (!canUngroupMixed) return
                            handleCanvasContextUngroup()
                          }}
                        >
                          <span>Ungroup</span>
                        </button>
                        <button
                          type="button"
                          role="menuitem"
                          onClick={() => {
                            if (!cmPg || cmPg.kind !== 'content') return
                            setShapeSelectedPageId(cmPg.id)
                            setShapeSelectedIndex(shapeIndex)
                            setTextBoxSelectedPageId(null)
                            setThoughtBubbleSelectedPageId(null)
                            setLayersOpen(true)
                            setCanvasContextMenu(null)
                          }}
                        >
                          <span>Show layers panel</span>
                          <span className="book-canvas-context-menu__shortcut">L</span>
                        </button>
                        <hr className="book-canvas-context-menu__sep" />
                        <button
                          type="button"
                          role="menuitem"
                          onClick={() => {
                            if (!cmPg || cmPg.kind !== 'content') return
                            const src = cmPg.shapes[shapeIndex]
                            if (!src) return
                            canvasClipboardRef.current = {
                              target: 'shape',
                              payload: { ...src },
                            }
                            setCanvasContextMenu(null)
                          }}
                        >
                          <span>Copy</span>
                          <span className="book-canvas-context-menu__shortcut">
                            Ctrl+C
                          </span>
                        </button>
                        <button
                          type="button"
                          role="menuitem"
                          onClick={() => {
                            if (!cmPg || cmPg.kind !== 'content') return
                            const src = cmPg.shapes[shapeIndex]
                            if (!src) return
                            const dup: PlacedShape = {
                              ...src,
                              x: src.x + 18,
                              y: src.y + 18,
                            }
                            setPages((prev) =>
                              prev.map((p) =>
                                p.id === cmPg.id && p.kind === 'content'
                                  ? { ...p, shapes: [...p.shapes, dup] }
                                  : p,
                              ),
                            )
                            setShapeSelectedPageId(cmPg.id)
                            setShapeSelectedIndex(shapeCount)
                            setCanvasContextMenu(null)
                          }}
                        >
                          <span>Duplicate</span>
                          <span className="book-canvas-context-menu__shortcut">
                            Ctrl+D
                          </span>
                        </button>
                        <button
                          type="button"
                          role="menuitem"
                          onClick={() => {
                            if (!cmPg || cmPg.kind !== 'content') return
                            const src = cmPg.shapes[shapeIndex]
                            if (!src) return
                            canvasClipboardRef.current = {
                              target: 'shape',
                              payload: { ...src },
                            }
                            updateShapeForPageAtIndex(cmPg.id, shapeIndex, null)
                            setShapeSelectedPageId(null)
                            setShapeSelectedIndex(null)
                            setCanvasContextMenu(null)
                          }}
                        >
                          <span>Cut</span>
                          <span className="book-canvas-context-menu__shortcut">
                            Ctrl+X
                          </span>
                        </button>
                        <hr className="book-canvas-context-menu__sep" />
                        <button
                          type="button"
                          role="menuitem"
                          onClick={() => {
                            if (!cmPg || cmPg.kind !== 'content') return
                            updateShapeForPageAtIndex(cmPg.id, shapeIndex, null)
                            setShapeSelectedPageId(null)
                            setShapeSelectedIndex(null)
                            setCanvasContextMenu(null)
                          }}
                        >
                          <span>Delete shape</span>
                          <span className="book-canvas-context-menu__shortcut">
                            Del
                          </span>
                        </button>
                      </>
                    )}
                  </div>
                )
              })()
            : null}
        </div>
      </div>
    </div>
  )
}

export default BookBuilder
