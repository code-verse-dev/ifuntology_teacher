import type { TocEntry } from '../types/bookToc'
import { newTocEntryId } from './bookTocFlatten'

export function mapEntryAtPath(
  entries: TocEntry[],
  path: number[],
  map: (e: TocEntry) => TocEntry,
): TocEntry[] {
  if (path.length === 0) return entries
  const [h, ...t] = path
  if (t.length === 0) {
    return entries.map((e, i) => (i === h ? map(e) : e))
  }
  return entries.map((e, i) =>
    i === h ? { ...e, children: mapEntryAtPath(e.children, t, map) } : e,
  )
}

export function removeEntryAtPath(entries: TocEntry[], path: number[]): TocEntry[] {
  if (path.length === 0) return entries
  const [h, ...t] = path
  if (t.length === 0) return entries.filter((_, i) => i !== h)
  return entries.map((e, i) =>
    i === h ? { ...e, children: removeEntryAtPath(e.children, t) } : e,
  )
}

export function insertSiblingAfter(
  entries: TocEntry[],
  path: number[],
  newEntry: TocEntry,
): TocEntry[] {
  if (path.length === 0) return [...entries, newEntry]
  const [h, ...t] = path
  if (t.length === 0) {
    const copy = [...entries]
    copy.splice(h + 1, 0, newEntry)
    return copy
  }
  return entries.map((e, i) =>
    i === h
      ? { ...e, children: insertSiblingAfter(e.children, t, newEntry) }
      : e,
  )
}

export function appendChildEntry(
  entries: TocEntry[],
  path: number[],
  newEntry: TocEntry,
): TocEntry[] {
  if (path.length === 0) return entries
  const [h, ...t] = path
  if (t.length === 0) {
    return entries.map((e, i) =>
      i === h ? { ...e, children: [...e.children, newEntry] } : e,
    )
  }
  return entries.map((e, i) =>
    i === h
      ? { ...e, children: appendChildEntry(e.children, t, newEntry) }
      : e,
  )
}

export function createBlankEntry(): TocEntry {
  return {
    id: newTocEntryId(),
    title: 'New item',
    pageNumber: '',
    children: [],
  }
}
