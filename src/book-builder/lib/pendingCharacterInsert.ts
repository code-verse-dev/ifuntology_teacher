/** One-shot handoff: character composer → book builder page placement. */

const STORAGE_KEY = 'ifuntology.pendingCharacterInsert.v1'

export type PendingCharacterInsert = {
  selection: Record<string, string | null>
  layerOrder: string[]
  layerVisibility: Record<string, boolean>
}

export function queuePendingCharacterInsert(
  payload: PendingCharacterInsert,
): void {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
  } catch {
    /* private mode / quota */
  }
}

export function takePendingCharacterInsert(): PendingCharacterInsert | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    sessionStorage.removeItem(STORAGE_KEY)
    const parsed = JSON.parse(raw) as PendingCharacterInsert
    if (!parsed || typeof parsed !== 'object' || !parsed.selection) return null
    return {
      selection: parsed.selection,
      layerOrder: Array.isArray(parsed.layerOrder) ? parsed.layerOrder : [],
      layerVisibility:
        parsed.layerVisibility && typeof parsed.layerVisibility === 'object'
          ? parsed.layerVisibility
          : {},
    }
  } catch {
    try {
      sessionStorage.removeItem(STORAGE_KEY)
    } catch {
      /* ignore */
    }
    return null
  }
}
