import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type DragEvent as ReactDragEvent,
  type MouseEvent as ReactMouseEvent,
  type WheelEvent as ReactWheelEvent,
} from 'react'
import { createPortal } from 'react-dom'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { PublicRasterIcon } from '../components/PublicRasterIcon'
import { Tooltip } from '../components/Tooltip'
import {
  indexSidebarIconItems,
  parseCharacterSidebarIconsManifest,
  resolveCharacterSidebarIcon,
  type ResolvedCharacterSidebarIcon,
} from '../lib/characterSidebarIcons'
import {
  BOOK_SIDEBAR_ICON_CHARACTER,
  BOOK_SIDEBAR_ICON_LAYERS,
} from '../lib/bookSidebarIcons'
import { useBuilderHost } from '../context/BuilderHostContext'
import { useBuilderPaths } from '../lib/builderPaths'
import { apiUrl, assetUrl, builderFetch, publicAssetUrl } from '../lib/api'
import {
  getSavedCharacter,
  newSavedCharacterId,
  upsertSavedCharacter,
} from '../lib/savedCharacters'
import type { CatalogCategory } from '../types/character'
import type { CatalogVariation } from '../types/character'
import type { CharacterSidebarIconItem } from '../types/characterSidebarIcons'
import './book-builder.css'

type SelectionMap = Record<string, string | null>

function cloneSelectionMap(src: SelectionMap): SelectionMap {
  return JSON.parse(JSON.stringify(src)) as SelectionMap
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

function CharacterCategoryIconButton({
  cat,
  isActive,
  onSelect,
  resolvedIcon,
}: {
  cat: CatalogCategory
  isActive: boolean
  onSelect: () => void
  resolvedIcon: ResolvedCharacterSidebarIcon | null
}) {
  const candidates = useMemo(
    () => (resolvedIcon ? [resolvedIcon.imageUrl] : []),
    [resolvedIcon?.imageUrl],
  )

  const tip = resolvedIcon?.tooltip ?? cat.name

  return (
    <Tooltip content={tip} fill>
      <button
        type="button"
        className={'char-panel__cat-icon' + (isActive ? ' is-active' : '')}
        onClick={onSelect}
      >
        <PublicRasterIcon
          candidates={candidates}
          className="char-composer__cat-icon-img"
          draggable={false}
          fallback={
            <span className="char-panel__cat-initial">
              {cat.name.slice(0, 1).toUpperCase()}
            </span>
          }
        />
      </button>
    </Tooltip>
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
      <path d="M12 3 3.5 7.5 12 12l8.5-4.5L12 3Z" />
      <path d="m3.5 11.5 8.5 4.5 8.5-4.5" />
      <path d="m3.5 15.5 8.5 4.5 8.5-4.5" />
    </svg>
  )
}

function IconToolSave() {
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
      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
      <path d="M17 21v-8H7v8" />
      <path d="M7 3v5h8" />
    </svg>
  )
}

export function CharacterComposerPage() {
  const builderHost = useBuilderHost()
  const { builderHref, characterHref, characterComposerUrl, fetchInit } =
    useBuilderPaths()
  const showShellTopBack = !builderHost?.bookId
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const editId = searchParams.get('edit')
  const loadedSavedForEditRef = useRef<string | null>(null)

  const [catalog, setCatalog] = useState<CatalogCategory[]>([])
  const [sidebarIconsBySlug, setSidebarIconsBySlug] = useState<
    Map<string, CharacterSidebarIconItem>
  >(() => new Map())
  const [loadError, setLoadError] = useState<string | null>(null)
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null)
  const [selection, setSelection] = useState<SelectionMap>({})
  const [selectionPast, setSelectionPast] = useState<SelectionMap[]>([])
  const [selectionFuture, setSelectionFuture] = useState<SelectionMap[]>([])
  const [layerOrder, setLayerOrder] = useState<string[]>([])
  const [layerVisibility, setLayerVisibility] = useState<Record<string, boolean>>({})
  const [layersOpen, setLayersOpen] = useState(false)
  const [layersDrag, setLayersDrag] = useState<{ fromCatId: string } | null>(null)
  const [saveDialogOpen, setSaveDialogOpen] = useState(false)
  const [saveNameInput, setSaveNameInput] = useState('')
  const [previewZoom, setPreviewZoom] = useState(1)
  const [previewPan, setPreviewPan] = useState({ x: 0, y: 0 })
  const [isPreviewPanning, setIsPreviewPanning] = useState(false)
  const [variationsByCategoryId, setVariationsByCategoryId] = useState<
    Record<string, CatalogVariation[]>
  >({})
  const [variationsPageByCategoryId, setVariationsPageByCategoryId] = useState<
    Record<string, number>
  >({})
  const [variationsHasMoreByCategoryId, setVariationsHasMoreByCategoryId] = useState<
    Record<string, boolean>
  >({})
  const [loadingVariationsByCategoryId, setLoadingVariationsByCategoryId] = useState<
    Record<string, boolean>
  >({})
  const [loadingMoreVariationsByCategoryId, setLoadingMoreVariationsByCategoryId] = useState<
    Record<string, boolean>
  >({})
  const [variationsTotalByCategoryId, setVariationsTotalByCategoryId] = useState<
    Record<string, number>
  >({})
  const [initialVariationsLoadedByCategoryId, setInitialVariationsLoadedByCategoryId] =
    useState<Record<string, boolean>>({})
  const scrollRootRef = useRef<HTMLElement | null>(null)
  const loadMoreSentinelRef = useRef<HTMLDivElement | null>(null)
  const loadingMoreGuardRef = useRef(false)
  const previewPanDragRef = useRef<{
    pointerStartX: number
    pointerStartY: number
    panStartX: number
    panStartY: number
  } | null>(null)

  const handlePreviewWheelZoom = (e: ReactWheelEvent<HTMLElement>) => {
    if (e.deltaY === 0) return
    e.preventDefault()
    setPreviewZoom((prev) => {
      const next = prev - e.deltaY * 0.0015
      return Math.min(2.5, Math.max(0.5, next))
    })
  }

  const handlePreviewPanStart = (e: ReactMouseEvent<HTMLElement>) => {
    if (previewZoom <= 1) return
    e.preventDefault()
    previewPanDragRef.current = {
      pointerStartX: e.clientX,
      pointerStartY: e.clientY,
      panStartX: previewPan.x,
      panStartY: previewPan.y,
    }
    setIsPreviewPanning(true)
  }

  const handlePreviewPanMove = (e: ReactMouseEvent<HTMLElement>) => {
    const drag = previewPanDragRef.current
    if (!drag) return
    e.preventDefault()
    const dx = e.clientX - drag.pointerStartX
    const dy = e.clientY - drag.pointerStartY
    setPreviewPan({
      x: drag.panStartX + dx,
      y: drag.panStartY + dy,
    })
  }

  const stopPreviewPan = () => {
    previewPanDragRef.current = null
    setIsPreviewPanning(false)
  }

  useEffect(() => {
    ;(async () => {
      try {
        const res = await builderFetch(
          apiUrl('/api/character/catalog?includeVariations=false'),
        )
        if (!res.ok) {
          setLoadError('Failed to load character catalog')
          return
        }
        const data = (await res.json()) as CatalogCategory[]
        setCatalog(data)
      } catch {
        setLoadError('Failed to load character catalog')
      }
    })()
  }, [])

  const loadCategoryVariations = useCallback(
    async (categoryId: string, page: number) => {
      const isLoadMore = page > 1
      if (isLoadMore) {
        setLoadingMoreVariationsByCategoryId((prev) => ({ ...prev, [categoryId]: true }))
      } else {
        setLoadingVariationsByCategoryId((prev) => ({ ...prev, [categoryId]: true }))
      }
      try {
        const params = new URLSearchParams()
        params.set('categoryId', categoryId)
        params.set('page', String(page))
        params.set('pageSize', '24')
        const res = await builderFetch(
          apiUrl(`/api/character/variations?${params.toString()}`),
          fetchInit,
        )
        if (!res.ok) {
          setLoadError('Failed to load category items')
          return
        }
        const payload = (await res.json()) as {
          items: CatalogVariation[]
          pagination?: { page?: number; hasMore?: boolean; total?: number }
        }
        const items = Array.isArray(payload.items) ? payload.items : []
        setVariationsByCategoryId((prev) => ({
          ...prev,
          [categoryId]:
            page > 1 ? [...(prev[categoryId] ?? []), ...items] : [...items],
        }))
        setVariationsPageByCategoryId((prev) => ({ ...prev, [categoryId]: page }))
        if (typeof payload.pagination?.total === 'number') {
          setVariationsTotalByCategoryId((prev) => ({
            ...prev,
            [categoryId]: payload.pagination!.total!,
          }))
        }
        setVariationsHasMoreByCategoryId((prev) => ({
          ...prev,
          [categoryId]: Boolean(payload.pagination?.hasMore),
        }))
        if (page === 1) {
          setInitialVariationsLoadedByCategoryId((prev) => ({
            ...prev,
            [categoryId]: true,
          }))
        }
        setSelection((prev) => {
          if (prev[categoryId] !== undefined) return prev
          const defaultVariation = items.find((v) => v.isDefault)
          if (!defaultVariation) return prev
          return { ...prev, [categoryId]: defaultVariation.id }
        })
      } catch {
        if (!isLoadMore) {
          setLoadError('Failed to load category items')
        }
      } finally {
        if (isLoadMore) {
          setLoadingMoreVariationsByCategoryId((prev) => ({ ...prev, [categoryId]: false }))
        } else {
          setLoadingVariationsByCategoryId((prev) => ({ ...prev, [categoryId]: false }))
        }
      }
    },
    [fetchInit],
  )

  useEffect(() => {
    void (async () => {
      try {
        const res = await fetch(publicAssetUrl('character-sidebar-icons.json'))
        if (!res.ok) return
        const parsed = parseCharacterSidebarIconsManifest(await res.json())
        setSidebarIconsBySlug(indexSidebarIconItems(parsed.items))
      } catch {
        /* optional manifest */
      }
    })()
  }, [])

  useEffect(() => {
    if (catalog.length === 0) {
      setActiveCategoryId(null)
      setLayerOrder([])
      setLayerVisibility({})
      return
    }
    const ordered = catalog.slice().sort((a, b) => a.layerOrder - b.layerOrder)
    if (!activeCategoryId || !ordered.some((c) => c.id === activeCategoryId)) {
      setActiveCategoryId(ordered[0].id)
    }
    setLayerOrder((prev) => {
      const next = ordered.map((c) => c.id)
      if (prev.length === next.length && prev.every((id, idx) => id === next[idx])) {
        return prev
      }
      return next
    })
    setLayerVisibility((prev) => {
      const next: Record<string, boolean> = {}
      for (const cat of ordered) {
        next[cat.id] = prev[cat.id] ?? true
      }
      return next
    })
  }, [catalog, activeCategoryId])

  useEffect(() => {
    if (!activeCategoryId) return
    if (initialVariationsLoadedByCategoryId[activeCategoryId]) return
    if (loadingVariationsByCategoryId[activeCategoryId]) return
    void loadCategoryVariations(activeCategoryId, 1)
  }, [
    activeCategoryId,
    initialVariationsLoadedByCategoryId,
    loadingVariationsByCategoryId,
    loadCategoryVariations,
  ])

  useEffect(() => {
    if (!editId) {
      loadedSavedForEditRef.current = null
      return
    }
    if (catalog.length === 0) return
    if (loadedSavedForEditRef.current === editId) return
    const saved = getSavedCharacter(editId)
    if (!saved) return
    loadedSavedForEditRef.current = editId
    setSelection(cloneSelectionMap(saved.selection))
    const catIds = new Set(catalog.map((c) => c.id))
    const lo = (saved.layerOrder ?? []).filter((id) => catIds.has(id))
    if (lo.length > 0) setLayerOrder(lo)
    setLayerVisibility((prev) => {
      const next: Record<string, boolean> = {}
      for (const c of catalog) {
        next[c.id] = saved.layerVisibility?.[c.id] ?? prev[c.id] ?? true
      }
      return next
    })
    setSelectionPast([])
    setSelectionFuture([])
  }, [editId, catalog])

  const activeCategory = useMemo(
    () => catalog.find((c) => c.id === activeCategoryId) ?? null,
    [catalog, activeCategoryId],
  )

  const setSelectionWithHistory = (next: SelectionMap) => {
    const prev = cloneSelectionMap(selection)
    setSelectionPast((p) => [...p, prev].slice(-100))
    setSelection(next)
    setSelectionFuture([])
  }

  const undoSelection = () => {
    if (selectionPast.length === 0) return
    const prev = selectionPast[selectionPast.length - 1]
    setSelectionPast((p) => p.slice(0, -1))
    setSelectionFuture((f) => [cloneSelectionMap(selection), ...f])
    setSelection(cloneSelectionMap(prev))
  }

  const redoSelection = () => {
    if (selectionFuture.length === 0) return
    const next = selectionFuture[0]
    setSelectionFuture((f) => f.slice(1))
    setSelectionPast((p) => [...p, cloneSelectionMap(selection)].slice(-100))
    setSelection(cloneSelectionMap(next))
  }

  const previewLayers = useMemo(() => {
    const byId = new Map(catalog.map((c) => [c.id, c]))
    const ids = layerOrder.length > 0 ? layerOrder : catalog.map((c) => c.id)
    const out: Array<{ id: string; label: string; src: string }> = []
    for (const catId of ids) {
      if (!layerVisibility[catId]) continue
      const cat = byId.get(catId)
      if (!cat) continue
      const selectedVariationId = selection[catId]
      if (!selectedVariationId) continue
      const pool = variationsByCategoryId[catId] ?? []
      const variation = pool.find((v) => v.id === selectedVariationId)
      if (!variation) continue
      out.push({
        id: catId,
        label: cat.name,
        src: assetUrl(variation.imagePath),
      })
    }
    return out
  }, [catalog, layerOrder, layerVisibility, selection, variationsByCategoryId])

  const placedLayerOrder = useMemo(() => {
    return layerOrder.filter((catId) => {
      const selectedVariationId = selection[catId]
      return !!selectedVariationId
    })
  }, [layerOrder, selection])

  const activeCategoryVariations = useMemo(() => {
    if (!activeCategory) return []
    return variationsByCategoryId[activeCategory.id] ?? []
  }, [activeCategory, variationsByCategoryId])
  const isActiveCategoryLoading = activeCategoryId
    ? Boolean(loadingVariationsByCategoryId[activeCategoryId])
    : false
  const isActiveCategoryLoadingMore = activeCategoryId
    ? Boolean(loadingMoreVariationsByCategoryId[activeCategoryId])
    : false
  const activeCategoryHasMore = activeCategoryId
    ? Boolean(variationsHasMoreByCategoryId[activeCategoryId])
    : false

  useEffect(() => {
    if (!activeCategoryId || !activeCategoryHasMore) return
    if (isActiveCategoryLoading || isActiveCategoryLoadingMore) return
    const root = scrollRootRef.current
    const sentinel = loadMoreSentinelRef.current
    if (!root || !sentinel) return
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return
        if (loadingMoreGuardRef.current) return
        if (!variationsHasMoreByCategoryId[activeCategoryId]) return
        if (
          loadingVariationsByCategoryId[activeCategoryId] ||
          loadingMoreVariationsByCategoryId[activeCategoryId]
        ) {
          return
        }
        loadingMoreGuardRef.current = true
        const nextPage = (variationsPageByCategoryId[activeCategoryId] ?? 1) + 1
        void loadCategoryVariations(activeCategoryId, nextPage).finally(() => {
          loadingMoreGuardRef.current = false
        })
      },
      { root, rootMargin: '160px', threshold: 0 },
    )
    io.observe(sentinel)
    return () => io.disconnect()
  }, [
    activeCategoryId,
    activeCategoryHasMore,
    isActiveCategoryLoading,
    isActiveCategoryLoadingMore,
    loadCategoryVariations,
    loadingMoreVariationsByCategoryId,
    loadingVariationsByCategoryId,
    variationsHasMoreByCategoryId,
    variationsPageByCategoryId,
  ])

  const reorderPlacedLayer = (fromCatId: string, toCatId: string) => {
    if (fromCatId === toCatId) return
    setLayerOrder((prev) => {
      const selectedSet = new Set(Object.keys(selection).filter((catId) => Boolean(selection[catId])))
      const placed = prev.filter((catId) => selectedSet.has(catId))
      const fromIdx = placed.indexOf(fromCatId)
      const toIdx = placed.indexOf(toCatId)
      if (fromIdx < 0 || toIdx < 0) return prev
      const nextPlaced = [...placed]
      const [moved] = nextPlaced.splice(fromIdx, 1)
      if (!moved) return prev
      nextPlaced.splice(toIdx, 0, moved)

      let placedCursor = 0
      return prev.map((catId) => {
        if (!selectedSet.has(catId)) return catId
        const nextId = nextPlaced[placedCursor]
        placedCursor += 1
        return nextId ?? catId
      })
    })
  }

  const openSaveDialog = () => {
    const existing = editId ? getSavedCharacter(editId) : null
    setSaveNameInput(existing?.name?.trim() ? existing.name : 'My character')
    setSaveDialogOpen(true)
  }

  const commitSave = () => {
    const name = saveNameInput.trim()
    if (!name) return
    const id =
      editId && getSavedCharacter(editId) ? editId : newSavedCharacterId()
    const prev = getSavedCharacter(id)
    upsertSavedCharacter({
      id,
      name,
      createdAt: prev?.createdAt ?? Date.now(),
      selection: cloneSelectionMap(selection),
      layerOrder: [...layerOrder],
      layerVisibility: { ...layerVisibility },
    })
    setSaveDialogOpen(false)
    if (!editId || editId !== id) {
      navigate(characterComposerUrl(id), { replace: true })
    }
  }

  const saveDialogPortal =
    saveDialogOpen &&
    createPortal(
      <div
        className="char-save-overlay"
        role="presentation"
        onClick={() => setSaveDialogOpen(false)}
      >
        <form
          className="char-save-dialog"
          role="dialog"
          aria-modal="true"
          aria-labelledby="char-save-title"
          onClick={(e) => e.stopPropagation()}
          onSubmit={(e) => {
            e.preventDefault()
            commitSave()
          }}
        >
          <h3 id="char-save-title">Save character</h3>
          <p>This character is stored in your browser on this device.</p>
          <label htmlFor="char-save-name" className="visually-hidden">
            Name
          </label>
          <input
            id="char-save-name"
            type="text"
            autoComplete="off"
            placeholder="Character name"
            value={saveNameInput}
            onChange={(e) => setSaveNameInput(e.target.value)}
          />
          <div className="char-save-dialog__actions">
            <button type="button" onClick={() => setSaveDialogOpen(false)}>
              Cancel
            </button>
            <button type="submit">Save</button>
          </div>
        </form>
      </div>,
      document.getElementById('portal-modal') ?? document.body,
    )

  return (
    <div className="book-shell book-shell--character">
      {showShellTopBack ? (
        <div className="book-shell__top">
          <Link to={builderHref} className="book-shell__back">
            ← Back to Builder
          </Link>
        </div>
      ) : null}

      <div className="book-shell__row">
        <aside className="book-tool-sidebar" aria-label="Tools">
          <div className="book-tool-sidebar__icons">
            <Tooltip content="Character builder" fill>
              <Link
                to={characterHref}
                className="book-tool-sidebar__btn is-active book-tool-sidebar__btn--link"
                aria-label="Character builder"
              >
                <PublicRasterIcon
                  candidates={BOOK_SIDEBAR_ICON_CHARACTER}
                  className="book-tool-sidebar__icon-img"
                  fallback={<IconToolCharacter />}
                />
              </Link>
            </Tooltip>
            <div className="char-composer__sidebar-actions">
              <Tooltip content="Undo last change">
                <button
                  type="button"
                  className="book-tool-sidebar__btn"
                  onClick={undoSelection}
                  disabled={selectionPast.length === 0}
                  aria-label="Undo"
                >
                  ↶
                </button>
              </Tooltip>
              <Tooltip content="Redo">
                <button
                  type="button"
                  className="book-tool-sidebar__btn"
                  onClick={redoSelection}
                  disabled={selectionFuture.length === 0}
                  aria-label="Redo"
                >
                  ↷
                </button>
              </Tooltip>
            </div>
            <nav className="char-composer__sidebar-cats" aria-label="Character categories">
              {catalog
                .slice()
                .sort((a, b) => a.layerOrder - b.layerOrder)
                .map((cat) => (
                  <CharacterCategoryIconButton
                    key={cat.id}
                    cat={cat}
                    isActive={activeCategoryId === cat.id}
                    onSelect={() => setActiveCategoryId(cat.id)}
                    resolvedIcon={resolveCharacterSidebarIcon(
                      cat,
                      sidebarIconsBySlug,
                    )}
                  />
                ))}
            </nav>
          </div>
        </aside>

        <div className="book-stage">
          <header className="book-stage__toolbar">
            <div className="book-stage__toolbar-left">
              <span className="book-select book-select--orange">Character Builder</span>
            </div>
            <div className="book-stage__toolbar-right">
              {builderHost?.bookId ? (
                <Link
                  to={builderHref}
                  className="book-toolbar-back book-icon-square--orange"
                  title="Back to book builder"
                >
                  ← Builder
                </Link>
              ) : null}
              <Tooltip content="Layers — order & visibility" placement="bottom">
                <button
                  type="button"
                  className={
                    'book-icon-square book-icon-square--orange' +
                    (layersOpen ? ' book-icon-square--active' : '')
                  }
                  onClick={() => setLayersOpen((v) => !v)}
                  aria-label="Layers"
                >
                  <PublicRasterIcon
                    candidates={BOOK_SIDEBAR_ICON_LAYERS}
                    className="book-toolbar-icon-img"
                    fallback={<IconToolLayers />}
                  />
                </button>
              </Tooltip>
              <Tooltip content="Undo last change" placement="bottom">
                <button
                  type="button"
                  className="book-icon-square book-icon-square--orange"
                  onClick={undoSelection}
                  disabled={selectionPast.length === 0}
                  aria-label="Undo"
                >
                  ↶
                </button>
              </Tooltip>
              <Tooltip content="Redo" placement="bottom">
                <button
                  type="button"
                  className="book-icon-square book-icon-square--orange"
                  onClick={redoSelection}
                  disabled={selectionFuture.length === 0}
                  aria-label="Redo"
                >
                  ↷
                </button>
              </Tooltip>
              <Tooltip content="Save to your device" placement="bottom">
                <button
                  type="button"
                  className="book-icon-square book-icon-square--orange"
                  onClick={openSaveDialog}
                  disabled={catalog.length === 0 || !!loadError}
                  aria-label="Save character"
                >
                  <IconToolSave />
                </button>
              </Tooltip>
            </div>
          </header>

          <div className="book-stage__canvas-area">
            <div className="char-composer__body">
              <aside
                ref={scrollRootRef}
                className="char-composer__main-selection"
                aria-label="Category items"
              >
                {activeCategory ? (
                  <>
                    <h3 className="char-panel__grid-title">{activeCategory.name}</h3>
                    <div className="char-panel__grid">
                      <button
                        type="button"
                        className={
                          'char-panel__tile' +
                          (!selection[activeCategory.id] ? ' is-selected' : '')
                        }
                        onClick={() =>
                          setSelectionWithHistory({
                            ...selection,
                            [activeCategory.id]: null,
                          })
                        }
                      >
                        <span className="char-panel__none">∅</span>
                        <span className="char-panel__tile-label">None</span>
                      </button>
                      {activeCategoryVariations.map((v) => (
                        <button
                          key={v.id}
                          type="button"
                          className={
                            'char-panel__tile' +
                            (selection[activeCategory.id] === v.id ? ' is-selected' : '')
                          }
                          onClick={() =>
                            setSelectionWithHistory({
                              ...selection,
                              [activeCategory.id]: v.id,
                            })
                          }
                        >
                          <img
                            src={assetUrl(v.imagePath)}
                            alt={v.label}
                            className="char-panel__thumb"
                          />
                          <span className="char-panel__tile-label">{v.label}</span>
                        </button>
                      ))}
                      {isActiveCategoryLoading && activeCategoryVariations.length === 0
                        ? Array.from({ length: 6 }).map((_, idx) => (
                            <div
                              key={`char-skeleton-${idx}`}
                              className="char-panel__tile char-panel__tile--skeleton"
                              aria-hidden
                            >
                              <span className="char-panel__thumb char-panel__thumb--skeleton" />
                              <span className="char-panel__tile-label char-panel__tile-label--skeleton" />
                            </div>
                          ))
                        : null}
                    </div>
                    <div
                      ref={loadMoreSentinelRef}
                      className="char-panel__scroll-sentinel"
                      aria-hidden
                    />
                    {isActiveCategoryLoadingMore ? (
                      <div className="char-panel__scroll-status" role="status">
                        <span className="char-panel__scroll-spinner" aria-hidden />
                        Loading more…
                      </div>
                    ) : null}
                    {!activeCategoryHasMore &&
                    activeCategoryVariations.length > 0 &&
                    !isActiveCategoryLoading ? (
                      <p className="char-panel__scroll-end">
                        {variationsTotalByCategoryId[activeCategory.id] != null
                          ? `All ${variationsTotalByCategoryId[activeCategory.id]} items`
                          : 'All items loaded'}
                      </p>
                    ) : null}
                  </>
                ) : (
                  <p className="char-composer__empty">No category selected.</p>
                )}
              </aside>

              <section
                className="char-composer__preview"
                aria-label="Character preview"
                onWheel={handlePreviewWheelZoom}
                onMouseDown={handlePreviewPanStart}
                onMouseMove={handlePreviewPanMove}
                onMouseUp={stopPreviewPan}
                onMouseLeave={stopPreviewPan}
              >
                <div className="char-composer__preview-stage">
                  <div
                    className={
                      'char-composer__preview-zoom' + (isPreviewPanning ? ' is-panning' : '')
                    }
                    style={{
                      transform: `translate(${previewPan.x}px, ${previewPan.y}px) scale(${previewZoom})`,
                    }}
                  >
                    {previewLayers.map((layer) => (
                      <img
                        key={layer.id}
                        src={layer.src}
                        alt={layer.label}
                        className="char-composer__preview-layer"
                        draggable={false}
                      />
                    ))}
                  </div>
                </div>
                {loadError ? (
                  <p className="book-banner book-banner--error char-composer__error">
                    {loadError}
                  </p>
                ) : null}
              </section>
            </div>
            {layersOpen ? (
              <aside
                className="book-text-flyout book-layers-flyout book-text-flyout--char-mobile"
                aria-label="Layers"
              >
                <header className="book-text-flyout__head">
                  <h2 className="book-text-flyout__title">Layers</h2>
                  <button
                    type="button"
                    className="book-text-flyout__close"
                    onClick={() => setLayersOpen(false)}
                    aria-label="Close layers"
                  >
                    ×
                  </button>
                </header>
                <p className="char-composer__layers-hint">Drag rows to reorder layers</p>
                <div className="char-composer__layers-list">
                  {placedLayerOrder.length === 0 ? (
                    <p className="char-composer__empty">No layers placed yet.</p>
                  ) : null}
                  {placedLayerOrder.map((catId, idx) => {
                    const cat = catalog.find((c) => c.id === catId)
                    if (!cat) return null
                    const selectedId = selection[catId]
                    const selectedVariation = (variationsByCategoryId[catId] ?? []).find(
                      (v) => v.id === selectedId,
                    )
                    return (
                      <div
                        key={catId}
                        className="book-layers__item"
                        draggable
                        onDragStart={(e: ReactDragEvent<HTMLDivElement>) => {
                          e.dataTransfer.effectAllowed = 'move'
                          e.dataTransfer.setData('text/plain', catId)
                          setLayersDrag({ fromCatId: catId })
                        }}
                        onDragEnd={() => setLayersDrag(null)}
                        onDragOver={(e) => {
                          e.preventDefault()
                          e.dataTransfer.dropEffect = 'move'
                        }}
                        onDrop={(e) => {
                          e.preventDefault()
                          const fromCatId =
                            e.dataTransfer.getData('text/plain') || layersDrag?.fromCatId
                          if (!fromCatId) return
                          reorderPlacedLayer(fromCatId, catId)
                          setLayersDrag(null)
                        }}
                      >
                        <span className="book-layers__item-main">
                          <Tooltip
                            content={
                              layerVisibility[catId]
                                ? 'Hide this layer'
                                : 'Show this layer'
                            }
                          >
                            <button
                              type="button"
                              className={
                                'char-composer__eye' +
                                (layerVisibility[catId] ? '' : ' is-off')
                              }
                              onClick={() =>
                                setLayerVisibility((prev) => ({
                                  ...prev,
                                  [catId]: !prev[catId],
                                }))
                              }
                            >
                              {layerVisibility[catId] ? '👁' : '🚫'}
                            </button>
                          </Tooltip>
                          {selectedVariation ? (
                            <img
                                src={assetUrl(selectedVariation.imagePath)}
                              alt=""
                              className="book-layers__preview-img"
                              draggable={false}
                            />
                          ) : (
                            <span className="book-layers__preview book-layers__preview--character" />
                          )}
                          <div className="char-composer__layer-text">
                            <strong>{cat.name}</strong>
                          </div>
                        </span>
                        <span className="book-layers__drag-icon" aria-hidden>
                          ⋮⋮
                        </span>
                      </div>
                    )
                  })}
                </div>
              </aside>
            ) : null}
          </div>
        </div>
      </div>
      {saveDialogPortal}
    </div>
  )
}
