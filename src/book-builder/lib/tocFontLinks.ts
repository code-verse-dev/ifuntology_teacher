import type { CSSProperties } from 'react'
import type { GlobalFont } from '../types/globalFont'

const LINK_PREFIX = 'toc-cdn-font-'

function linkIdForHref(href: string): string {
  let h = 0
  for (let i = 0; i < href.length; i += 1) {
    h = (h * 31 + href.charCodeAt(i)) | 0
  }
  return `${LINK_PREFIX}${(h >>> 0).toString(36)}`
}

/** Injects a single &lt;link rel="stylesheet"&gt; for a CDN Fonts (or other) stylesheet. Idempotent. */
export function ensureTocStylesheetLoaded(href: string): void {
  const trimmed = href.trim()
  if (!trimmed) return
  if (trimmed.toLowerCase().startsWith('javascript:')) return
  const id = linkIdForHref(trimmed)
  if (document.getElementById(id)) return
  const link = document.createElement('link')
  link.id = id
  link.rel = 'stylesheet'
  link.href = trimmed
  document.head.appendChild(link)
}

/** Turns `color: #333; letter-spacing: 0.05em` into a React style object (limited). */
export function tocExtraCssToReactStyle(
  extraCss: string,
): Record<string, string> {
  const out: Record<string, string> = {}
  for (const part of extraCss.split(';')) {
    const idx = part.indexOf(':')
    if (idx === -1) continue
    const key = part.slice(0, idx).trim()
    const val = part.slice(idx + 1).trim()
    if (!key || !val) continue
    const camel = key.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase())
    out[camel] = val
  }
  return out
}

/** Inline styles + CSS variables for admin-controlled TOC typography. */
export function tocLayoutStyleFromFont(font: GlobalFont): CSSProperties {
  const s: CSSProperties = {}
  if (font.tocFontSize) s.fontSize = font.tocFontSize
  if (font.tocLineHeight) s.lineHeight = font.tocLineHeight
  if (font.tocLetterSpacing) s.letterSpacing = font.tocLetterSpacing
  const v = s as Record<string, string | undefined>
  if (font.tocHeadingFontSize)
    v['--toc-heading-font-size'] = font.tocHeadingFontSize
  if (font.tocRowGap) v['--toc-row-gap'] = font.tocRowGap
  return s
}
