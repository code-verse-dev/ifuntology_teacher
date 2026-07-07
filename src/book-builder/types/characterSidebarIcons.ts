/**
 * `public/character-sidebar-icons.json` — maps character catalog category slugs to sidebar icons.
 * Edit that file to set image path (under `public/`) and optional tooltip.
 */
export type CharacterSidebarIconItem = {
  /** Must match the category `slug` from the API (after normalization). */
  slug: string
  /** Path under `public/`, e.g. `images/body.png` (no leading slash). */
  image: string
  /** Shown as the button `title` / tooltip; defaults to the category name from the API. */
  tooltip?: string
}

export type CharacterSidebarIconsManifest = {
  items: CharacterSidebarIconItem[]
}
