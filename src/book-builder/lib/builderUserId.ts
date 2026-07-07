const STORAGE_KEY = 'ifuntology-student-builder-user-id'
const LEGACY_STORAGE_KEY = 'ifuntology-builder-user-id'

/** Stable anonymous id so custom backgrounds persist for this browser. */
export function getOrCreateBuilderUserId(): string {
  try {
    let existing = localStorage.getItem(STORAGE_KEY)?.trim()
    if (!existing) {
      const legacy = localStorage.getItem(LEGACY_STORAGE_KEY)?.trim()
      if (legacy) {
        localStorage.setItem(STORAGE_KEY, legacy)
        existing = legacy
      }
    }
    if (existing) return existing
    const id =
      typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2)}`
    localStorage.setItem(STORAGE_KEY, id)
    return id
  } catch {
    return `session-${Date.now()}`
  }
}
