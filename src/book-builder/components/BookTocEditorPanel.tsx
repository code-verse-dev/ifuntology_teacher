import { useMemo, useState } from 'react'
import type { TocEntry, TocPageData } from '../types/bookToc'
import type { GlobalFont } from '../types/globalFont'
import type { TocStyle } from '../types/tocStyle'
import { createBlankEntry } from '../lib/tocEntryTree'

type Props = {
  tocData: TocPageData
  onChange: (next: TocPageData) => void
  contentPageLabels: string[]
  onClose: () => void
  stylePresets: TocStyle[]
  availableFonts: GlobalFont[]
  selectedStyle: TocStyle
  selectedStyleId: string
  onSelectStyle: (style: TocStyle) => void
}

type FlatRow = { entry: TocEntry; depth: number }
const MAX_DEPTH = 2
const DRAG_INDENT_PX = 28

function flattenEntries(entries: TocEntry[], depth = 0): FlatRow[] {
  const out: FlatRow[] = []
  for (const entry of entries) {
    out.push({ entry, depth })
    out.push(...flattenEntries(entry.children, depth + 1))
  }
  return out
}

function buildEntriesFromFlat(rows: FlatRow[]): TocEntry[] {
  const roots: TocEntry[] = []
  const stack: TocEntry[] = []
  for (const row of rows) {
    const node: TocEntry = { ...row.entry, children: [] }
    if (row.depth === 0) {
      roots.push(node)
      stack.length = 1
      stack[0] = node
      continue
    }
    const parent = stack[row.depth - 1]
    if (!parent) {
      roots.push(node)
      stack.length = 1
      stack[0] = node
      continue
    }
    parent.children.push(node)
    stack[row.depth] = node
    stack.length = row.depth + 1
  }
  return roots
}

function mapEntriesById(
  entries: TocEntry[],
  id: string,
  map: (entry: TocEntry) => TocEntry,
): TocEntry[] {
  return entries.map((entry) => {
    if (entry.id === id) return map(entry)
    if (entry.children.length === 0) return entry
    return { ...entry, children: mapEntriesById(entry.children, id, map) }
  })
}

function removeEntryById(entries: TocEntry[], id: string): TocEntry[] {
  return entries
    .filter((entry) => entry.id !== id)
    .map((entry) =>
      entry.children.length === 0
        ? entry
        : { ...entry, children: removeEntryById(entry.children, id) },
    )
}

export function BookTocEditorPanel({
  tocData,
  onChange,
  contentPageLabels: _contentPageLabels,
  onClose,
  stylePresets,
  availableFonts,
  selectedStyle,
  selectedStyleId,
  onSelectStyle,
}: Props) {
  const [dragId, setDragId] = useState<string | null>(null)
  const [dragOverId, setDragOverId] = useState<string | null>(null)
  const [dragStartX, setDragStartX] = useState(0)
  const [dragCurrentX, setDragCurrentX] = useState(0)
  const flatRows = useMemo(() => flattenEntries(tocData.entries), [tocData.entries])
  const fontOptions = useMemo(() => {
    const byId = new Map<string, GlobalFont>()
    for (const style of stylePresets) byId.set(style.font.id, style.font)
    for (const font of availableFonts) byId.set(font.id, font)
    return Array.from(byId.values()).sort((a, b) => a.label.localeCompare(b.label))
  }, [availableFonts, stylePresets])

  const addItem = () => {
    onChange({ ...tocData, entries: [...tocData.entries, createBlankEntry()] })
  }

  const reorderByDrag = (sourceId: string, targetId: string, deltaX: number) => {
    const sourceIndex = flatRows.findIndex((row) => row.entry.id === sourceId)
    const targetIndex = flatRows.findIndex((row) => row.entry.id === targetId)
    if (sourceIndex < 0 || targetIndex < 0) return
    const sourceDepth = flatRows[sourceIndex].depth
    let sourceEnd = sourceIndex + 1
    while (sourceEnd < flatRows.length && flatRows[sourceEnd].depth > sourceDepth) {
      sourceEnd += 1
    }
    const baseDepth = flatRows[sourceIndex].depth
    const block = flatRows.slice(sourceIndex, sourceEnd)
    const maxRelativeDepth = block.reduce(
      (m, row) => Math.max(m, row.depth - baseDepth),
      0,
    )
    const depthShift = Math.round(deltaX / DRAG_INDENT_PX)

    // Allow level-only changes when dropping on the same row/subtree.
    if (targetIndex >= sourceIndex && targetIndex < sourceEnd) {
      const previousDepth = sourceIndex > 0 ? flatRows[sourceIndex - 1].depth : -1
      const maxDepthForRoot = Math.min(
        previousDepth + 1,
        MAX_DEPTH - maxRelativeDepth,
      )
      const desiredRootDepth = Math.max(
        0,
        Math.min(baseDepth + depthShift, maxDepthForRoot),
      )
      if (desiredRootDepth === baseDepth) return
      const adjustedInPlace = [...flatRows]
      for (let i = sourceIndex; i < sourceEnd; i += 1) {
        adjustedInPlace[i] = {
          ...adjustedInPlace[i],
          depth: adjustedInPlace[i].depth + (desiredRootDepth - baseDepth),
        }
      }
      onChange({ ...tocData, entries: buildEntriesFromFlat(adjustedInPlace) })
      return
    }
    const remainder = [...flatRows.slice(0, sourceIndex), ...flatRows.slice(sourceEnd)]
    const targetInRemainder = remainder.findIndex((row) => row.entry.id === targetId)
    if (targetInRemainder < 0) return
    const insertAt = targetInRemainder
    const previousDepth = insertAt > 0 ? remainder[insertAt - 1].depth : -1
    const maxDepthForRoot = Math.min(previousDepth + 1, MAX_DEPTH - maxRelativeDepth)
    const desiredRootDepth = Math.max(0, Math.min(baseDepth + depthShift, maxDepthForRoot))
    const adjustedBlock = block.map((row) => ({
      ...row,
      depth: row.depth + (desiredRootDepth - baseDepth),
    }))
    const merged = [
      ...remainder.slice(0, insertAt),
      ...adjustedBlock,
      ...remainder.slice(insertAt),
    ]
    onChange({ ...tocData, entries: buildEntriesFromFlat(merged) })
  }

  return (
    <aside className="book-toc-flyout" aria-label="Table of contents editor">
      <div className="book-toc-flyout__head">
        <h2 className="book-toc-flyout__title">Table of contents</h2>
        <button
          type="button"
          className="book-toc-flyout__close"
          onClick={onClose}
          aria-label="Close TOC editor"
        >
          ×
        </button>
      </div>
      <p className="book-toc-flyout__hint">
        Edit titles and pages directly. Drag rows left/right to change nesting
        (up to level 3).
      </p>
      <label className="book-toc-editor__style-label">
        <span>Style preset</span>
        <select
          className="book-toc-editor__style-select"
          value={selectedStyleId}
          onChange={(e) => {
            const id = e.target.value
            const s = stylePresets.find((p) => p.id === id)
            if (s) onSelectStyle(s)
          }}
        >
          {stylePresets.map((p) => (
            <option key={p.id} value={p.id}>
              {p.label}
            </option>
          ))}
        </select>
      </label>
      <label className="book-toc-editor__style-label">
        <span>Font</span>
        <select
          className="book-toc-editor__style-select"
          value={selectedStyle.font.id}
          onChange={(e) => {
            const font = fontOptions.find((f) => f.id === e.target.value)
            if (!font) return
            onSelectStyle({
              ...selectedStyle,
              globalFontId: font.id,
              font,
            })
          }}
        >
          {fontOptions.map((f) => (
            <option key={f.id} value={f.id}>
              {f.label}
            </option>
          ))}
        </select>
      </label>
      <label className="book-toc-editor__heading-label">
        <span>Heading</span>
        <input
          type="text"
          value={tocData.heading}
          onChange={(e) =>
            onChange({ ...tocData, heading: e.target.value })
          }
          placeholder="Contents"
        />
      </label>
      <div className="book-toc-editor__list">
        {flatRows.map((row) => {
          const patch = (partial: Partial<TocEntry>) => {
            onChange({
              ...tocData,
              entries: mapEntriesById(tocData.entries, row.entry.id, (entry) => ({
                ...entry,
                ...partial,
              })),
            })
          }
          const remove = () => {
            if (flatRows.length <= 1) return
            onChange({
              ...tocData,
              entries: removeEntryById(tocData.entries, row.entry.id),
            })
          }
          return (
            <div key={row.entry.id} className="book-toc-editor__row-block">
              <div
                className={
                  'book-toc-editor__row' +
                  (dragOverId === row.entry.id ? ' book-toc-editor__row--drag-over' : '')
                }
                style={{ marginLeft: `${row.depth * 0.65}rem` }}
                draggable
                onDragStart={(e) => {
                  setDragId(row.entry.id)
                  setDragOverId(row.entry.id)
                  setDragStartX(e.clientX)
                  setDragCurrentX(e.clientX)
                  e.dataTransfer.effectAllowed = 'move'
                }}
                onDragOver={(e) => {
                  e.preventDefault()
                  if (!dragId) return
                  setDragOverId(row.entry.id)
                  setDragCurrentX(e.clientX)
                  e.dataTransfer.dropEffect = 'move'
                }}
                onDrop={(e) => {
                  e.preventDefault()
                  if (!dragId) return
                  reorderByDrag(dragId, row.entry.id, dragCurrentX - dragStartX)
                  setDragId(null)
                  setDragOverId(null)
                }}
                onDragEnd={() => {
                  setDragId(null)
                  setDragOverId(null)
                }}
              >
                <div className="book-toc-editor__row-meta">
                  <button
                    type="button"
                    className="book-toc-editor__drag-handle"
                    title="Drag to reorder and change nesting"
                    aria-label="Drag row"
                  >
                    ⋮⋮
                  </button>
                </div>
                <label className="book-toc-editor__field book-toc-editor__field--title">
                  <input
                    type="text"
                    value={row.entry.title}
                    onChange={(e) => patch({ title: e.target.value })}
                    placeholder="Title"
                    aria-label="TOC title"
                  />
                </label>
                <label className="book-toc-editor__field book-toc-editor__field--page">
                  <input
                    type="text"
                    value={row.entry.pageNumber}
                    onChange={(e) => patch({ pageNumber: e.target.value })}
                    placeholder="Page"
                    aria-label={`Page number for ${row.entry.title || 'item'}`}
                  />
                </label>
                <div className="book-toc-editor__row-actions">
                  <button
                    type="button"
                    className="book-toc-editor__icon-btn book-toc-editor__icon-btn--danger book-toc-editor__icon-btn--symbol"
                    title="Remove"
                    onClick={remove}
                    disabled={flatRows.length <= 1}
                  >
                    ×
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>
      <div className="book-toc-editor__footer">
        <button
          type="button"
          className="book-toc-editor__toolbar-btn"
          onClick={addItem}
        >
          Add item
        </button>
      </div>
    </aside>
  )
}
