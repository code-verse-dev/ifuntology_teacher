import { publicAssetUrl } from './api'

const IMAGE_EXTS = ['.png', '.webp', '.svg', '.jpg', '.jpeg'] as const

/**
 * Resolve raster paths under `public/images/` for a token.
 * Tries: plain, `icon-`, `book-`, `sidebar-`, `tool-` (e.g. `hair.png`, `icon-hair.png`, `book-toc.webp`).
 */
export function buildBookSidebarIconCandidates(...tokens: string[]): string[] {
  const paths: string[] = []
  const push = (p: string) => {
    if (!paths.includes(p)) paths.push(p)
  }
  for (const token of tokens) {
    const t = token.trim()
    if (!t) continue
    for (const ext of IMAGE_EXTS) {
      push(publicAssetUrl(`images/${t}${ext}`))
      push(publicAssetUrl(`images/icon-${t}${ext}`))
      push(publicAssetUrl(`images/book-${t}${ext}`))
      push(publicAssetUrl(`images/sidebar-${t}${ext}`))
      push(publicAssetUrl(`images/tool-${t}${ext}`))
    }
  }
  return paths
}

export const BOOK_SIDEBAR_ICON_PAGE_BACKGROUND = buildBookSidebarIconCandidates(
  'background',
  'page-background',
  'wallpaper',
  'bg',
  'blank-page',
)

export const BOOK_SIDEBAR_ICON_TOC = buildBookSidebarIconCandidates(
  'files',
  'toc',
  'contents',
  'table-of-contents',
  'list',
  'chapters',
)

export const BOOK_SIDEBAR_ICON_TEXT_BOX = buildBookSidebarIconCandidates(
  'textbox',
  'text-box',
  'text',
  'type',
  'write',
)

export const BOOK_SIDEBAR_ICON_BUBBLE = buildBookSidebarIconCandidates(
  'thought',
  'thought-bubble',
  'bubble',
  'speech',
  'chat',
  'dialog',
)

export const BOOK_SIDEBAR_ICON_SHAPE = buildBookSidebarIconCandidates(
  'shape',
  'shapes',
  'draw',
  'geometry',
)

export const BOOK_SIDEBAR_ICON_ELEMENT = buildBookSidebarIconCandidates(
  'element',
  'elements',
  'sticker',
  'props',
  'clipart',
  'picture',
)

export const BOOK_SIDEBAR_ICON_CHARACTER = buildBookSidebarIconCandidates(
  'character',
  'character-builder',
  'builder-character',
  'person',
  'avatar',
  'mascot',
)

export const BOOK_SIDEBAR_ICON_SETTINGS = buildBookSidebarIconCandidates(
  'settings',
  'gear',
  'page-settings',
  'cog',
  'options',
)

export const BOOK_SIDEBAR_ICON_LAYERS = buildBookSidebarIconCandidates(
  'layers',
  'layer',
  'stack',
  'order',
  'arrange',
)
