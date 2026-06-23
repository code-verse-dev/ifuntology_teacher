import { mediaUrl } from './api'
import type { CatalogCategory } from '../types/character'
import type {
  CharacterSidebarIconItem,
  CharacterSidebarIconsManifest,
} from '../types/characterSidebarIcons'

export function normalizeSidebarSlug(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

export function parseCharacterSidebarIconsManifest(
  data: unknown,
): CharacterSidebarIconsManifest {
  if (!data || typeof data !== 'object') return { items: [] }
  const items = (data as { items?: unknown }).items
  if (!Array.isArray(items)) return { items: [] }
  const out: CharacterSidebarIconItem[] = []
  for (const row of items) {
    if (!row || typeof row !== 'object') continue
    const slug = typeof (row as { slug?: unknown }).slug === 'string'
      ? (row as { slug: string }).slug
      : ''
    const image = typeof (row as { image?: unknown }).image === 'string'
      ? (row as { image: string }).image
      : ''
    const tooltip =
      typeof (row as { tooltip?: unknown }).tooltip === 'string'
        ? (row as { tooltip: string }).tooltip
        : undefined
    const key = normalizeSidebarSlug(slug)
    if (!key || !image.trim()) continue
    out.push({ slug: key, image: image.trim(), tooltip })
  }
  return { items: out }
}

/** First entry wins per normalized slug. */
export function indexSidebarIconItems(
  items: CharacterSidebarIconItem[],
): Map<string, CharacterSidebarIconItem> {
  const map = new Map<string, CharacterSidebarIconItem>()
  for (const item of items) {
    const key = normalizeSidebarSlug(item.slug)
    if (!key) continue
    if (!map.has(key)) map.set(key, item)
  }
  return map
}

export type ResolvedCharacterSidebarIcon = {
  imageUrl: string
  tooltip: string
}

export function resolveCharacterSidebarIcon(
  cat: CatalogCategory,
  bySlug: Map<string, CharacterSidebarIconItem>,
): ResolvedCharacterSidebarIcon | null {
  if (cat.iconPath?.trim()) {
    return {
      imageUrl: mediaUrl(cat.iconPath.trim()),
      tooltip: cat.iconTooltip?.trim() || cat.name,
    }
  }

  const keys = [
    normalizeSidebarSlug(cat.slug),
    normalizeSidebarSlug(cat.name),
  ].filter(Boolean)

  for (const k of keys) {
    const item = bySlug.get(k)
    if (!item?.image?.trim()) continue
    return {
      imageUrl: mediaUrl(item.image.trim()),
      tooltip: item.tooltip?.trim() || cat.name,
    }
  }
  return null
}
