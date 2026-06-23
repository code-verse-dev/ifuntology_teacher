const STORAGE_KEY = 'ifuntology.savedCharacters.v1'

export type SavedCharacterDesign = {
  id: string
  name: string
  createdAt: number
  selection: Record<string, string | null>
  layerOrder: string[]
  layerVisibility: Record<string, boolean>
}

function readAll(): SavedCharacterDesign[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    return Array.isArray(parsed) ? (parsed as SavedCharacterDesign[]) : []
  } catch {
    return []
  }
}

function writeAll(entries: SavedCharacterDesign[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries))
}

export function listSavedCharacters(): SavedCharacterDesign[] {
  return readAll()
    .slice()
    .sort((a, b) => b.createdAt - a.createdAt)
}

export function getSavedCharacter(id: string): SavedCharacterDesign | null {
  return readAll().find((x) => x.id === id) ?? null
}

export function upsertSavedCharacter(entry: SavedCharacterDesign): void {
  const all = readAll().filter((x) => x.id !== entry.id)
  all.push(entry)
  writeAll(all)
}

export function deleteSavedCharacter(id: string): void {
  writeAll(readAll().filter((x) => x.id !== id))
}

export function newSavedCharacterId(): string {
  return typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`
}
