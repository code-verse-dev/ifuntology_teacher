import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Search } from 'lucide-react'
import { apiUrl, assetUrl, builderFetch, readApiErrorMessage } from '../lib/api'
import { useBuilderPaths } from '../lib/builderPaths'

type ElementRow = {
  _id: string
  imagePath: string
  category: string
}

type CategoryRow = {
  _id: string
  name: string
  count: number
}

type GroupedResponse = {
  categories: CategoryRow[]
  activeCategory: string | null
  items: ElementRow[]
  pagination: {
    page: number
    pageSize: number
    total: number
    totalPages: number
  }
}

type WebClipartHit = {
  id: string
  source: 'pixabay' | 'openverse'
  previewUrl: string
  importUrl: string
  alt: string
  artist: string
  pageUrl: string
}

type WebSearchResponse = {
  items: WebClipartHit[]
  page: number
  hasMore: boolean
  sources: string[]
}

type Props = {
  open: boolean
  onClose: () => void
  onSelect: (imageUrl: string) => void
}

const PAGE_SIZE = 48
const SKELETON_INITIAL = 24
const SKELETON_LOAD_MORE = 8

const ElementLibraryTile = memo(function ElementLibraryTile({
  item,
  onPick,
}: {
  item: ElementRow
  onPick: (imagePath: string) => void
}) {
  const src = useMemo(() => assetUrl(item.imagePath), [item.imagePath])
  return (
    <button
      type="button"
      className="text-bubble-modal__tile"
      onClick={() => onPick(item.imagePath)}
    >
      <img src={src} alt="" loading="lazy" decoding="async" />
    </button>
  )
})

function ElementPickerSkeletonGrid({
  count,
  className = '',
}: {
  count: number
  className?: string
}) {
  return (
    <div
      className={`element-picker-skeleton-grid element-picker-modal__grid ${className}`.trim()}
      aria-hidden
    >
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="element-picker-skeleton-tile">
          <span className="element-picker-skeleton-tile__img" />
        </div>
      ))}
    </div>
  )
}

export function ElementPickerModal({ open, onClose, onSelect }: Props) {
  const { fetchInit } = useBuilderPaths()
  const [categories, setCategories] = useState<CategoryRow[]>([])
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [items, setItems] = useState<ElementRow[]>([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [webItems, setWebItems] = useState<WebClipartHit[]>([])
  const [webPage, setWebPage] = useState(1)
  const [webHasMore, setWebHasMore] = useState(false)
  const [loading, setLoading] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [webLoading, setWebLoading] = useState(false)
  const [webLoadingMore, setWebLoadingMore] = useState(false)
  const [importingWebId, setImportingWebId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const sentinelRef = useRef<HTMLDivElement | null>(null)
  const listFetchGenRef = useRef(0)
  const pageRef = useRef(page)
  const totalPagesRef = useRef(totalPages)
  const webPageRef = useRef(webPage)
  const webHasMoreRef = useRef(webHasMore)
  const libLoadMoreInFlightRef = useRef(false)
  const webLoadMoreInFlightRef = useRef(false)

  pageRef.current = page
  totalPagesRef.current = totalPages
  webPageRef.current = webPage
  webHasMoreRef.current = webHasMore

  const isSearchMode = debouncedSearch.length > 0

  const handlePickLibrary = useCallback(
    (imagePath: string) => {
      onSelect(imagePath)
      onClose()
    },
    [onClose, onSelect],
  )

  useEffect(() => {
    if (!open) return
    setActiveCategory(null)
    setSearch('')
    setDebouncedSearch('')
    setItems([])
    setWebItems([])
    setPage(1)
    setWebPage(1)
    setTotalPages(1)
    setWebHasMore(false)
    setError(null)
  }, [open])

  useEffect(() => {
    if (!open) return
    const t = window.setTimeout(() => setDebouncedSearch(search.trim()), 350)
    return () => window.clearTimeout(t)
  }, [open, search])

  const fetchWeb = useCallback(
    async (q: string, pageNum: number, append: boolean) => {
      const params = new URLSearchParams({ q, page: String(pageNum) })
      const res = await builderFetch(
        apiUrl(`/api/builder/clipart/search?${params.toString()}`),
        fetchInit,
      )
      if (!res.ok) throw new Error(await readApiErrorMessage(res))
      const data = (await res.json()) as WebSearchResponse
      const next = Array.isArray(data.items) ? data.items : []
      setWebItems((prev) => (append ? [...prev, ...next] : next))
      setWebPage(data.page ?? pageNum)
      setWebHasMore(!!data.hasMore)
    },
    [fetchInit],
  )

  useEffect(() => {
    if (!open) return
    const gen = ++listFetchGenRef.current
    libLoadMoreInFlightRef.current = false
    webLoadMoreInFlightRef.current = false
    setLoading(true)
    setWebLoading(isSearchMode)
    setError(null)
    void (async () => {
      try {
        const params = new URLSearchParams()
        params.set('page', '1')
        params.set('pageSize', String(PAGE_SIZE))
        if (isSearchMode) {
          params.set('q', debouncedSearch)
        } else if (activeCategory) {
          params.set('category', activeCategory)
        }
        const libPromise = builderFetch(
          apiUrl(`/api/elements/grouped?${params.toString()}`),
          fetchInit,
        )
        const webPromise = isSearchMode
          ? fetchWeb(debouncedSearch, 1, false).catch((e) => {
              if (gen !== listFetchGenRef.current) return
              setError(
                (prev) =>
                  prev ??
                  (e instanceof Error ? e.message : 'Online search failed'),
              )
              setWebItems([])
              setWebHasMore(false)
            })
          : Promise.resolve()

        const res = await libPromise
        if (gen !== listFetchGenRef.current) return
        if (!res.ok) throw new Error(await res.text())
        const data = (await res.json()) as GroupedResponse
        setCategories(data.categories ?? [])
        setItems(Array.isArray(data.items) ? data.items : [])
        setPage(data.pagination?.page ?? 1)
        setTotalPages(data.pagination?.totalPages ?? 1)
        await webPromise
      } catch (e) {
        if (gen !== listFetchGenRef.current) return
        setError(e instanceof Error ? e.message : 'Could not load elements')
      } finally {
        if (gen === listFetchGenRef.current) {
          setLoading(false)
          setWebLoading(false)
        }
      }
    })()
  }, [activeCategory, debouncedSearch, fetchInit, fetchWeb, isSearchMode, open])

  const loadMoreLibrary = useCallback(async () => {
    if (libLoadMoreInFlightRef.current) return
    if (pageRef.current >= totalPagesRef.current) return
    libLoadMoreInFlightRef.current = true
    setLoadingMore(true)
    try {
      const params = new URLSearchParams()
      params.set('page', String(pageRef.current + 1))
      params.set('pageSize', String(PAGE_SIZE))
      if (isSearchMode) {
        params.set('q', debouncedSearch)
      } else if (activeCategory) {
        params.set('category', activeCategory)
      }
      const res = await builderFetch(
        apiUrl(`/api/elements/grouped?${params.toString()}`),
        fetchInit,
      )
      if (!res.ok) throw new Error(await res.text())
      const data = (await res.json()) as GroupedResponse
      const nextItems = Array.isArray(data.items) ? data.items : []
      setItems((prev) => {
        const seen = new Set(prev.map((x) => x._id))
        const merged = [...prev]
        for (const row of nextItems) {
          if (!seen.has(row._id)) {
            seen.add(row._id)
            merged.push(row)
          }
        }
        return merged
      })
      const nextPage = data.pagination?.page ?? pageRef.current + 1
      setPage(nextPage)
      pageRef.current = nextPage
      const nextTotal = data.pagination?.totalPages ?? totalPagesRef.current
      setTotalPages(nextTotal)
      totalPagesRef.current = nextTotal
    } catch {
      /* ignore */
    } finally {
      libLoadMoreInFlightRef.current = false
      setLoadingMore(false)
    }
  }, [activeCategory, debouncedSearch, fetchInit, isSearchMode])

  const loadMoreWeb = useCallback(async () => {
    if (webLoadMoreInFlightRef.current || !isSearchMode) return
    if (!webHasMoreRef.current) return
    webLoadMoreInFlightRef.current = true
    setWebLoadingMore(true)
    try {
      await fetchWeb(debouncedSearch, webPageRef.current + 1, true)
    } catch {
      /* ignore */
    } finally {
      webLoadMoreInFlightRef.current = false
      setWebLoadingMore(false)
    }
  }, [debouncedSearch, fetchWeb, isSearchMode])

  useEffect(() => {
    if (!open || loading) return
    const el = sentinelRef.current
    if (!el) return

    const io = new IntersectionObserver(
      (entries) => {
        if (!entries.some((x) => x.isIntersecting)) return
        if (pageRef.current < totalPagesRef.current) {
          void loadMoreLibrary()
        }
        if (isSearchMode && webHasMoreRef.current) {
          void loadMoreWeb()
        }
      },
      { rootMargin: '220px' },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [isSearchMode, loadMoreLibrary, loadMoreWeb, loading, open])

  const importWebClipart = async (hit: WebClipartHit) => {
    const key = `${hit.source}:${hit.id}`
    setImportingWebId(key)
    setError(null)
    try {
      const res = await builderFetch(apiUrl('/api/builder/clipart/import'), {
        ...fetchInit,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(fetchInit?.headers as Record<string, string> | undefined),
        },
        body: JSON.stringify({ url: hit.importUrl, source: hit.source }),
      })
      if (!res.ok) throw new Error(await readApiErrorMessage(res))
      const json = (await res.json()) as { imagePath?: string }
      const path = json.imagePath?.trim()
      if (!path) throw new Error('Import did not return imagePath')
      onSelect(path)
      onClose()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not add clipart')
    } finally {
      setImportingWebId(null)
    }
  }

  const showInitialSkeleton = loading || (isSearchMode && webLoading)
  const hasAnyResults = items.length > 0 || webItems.length > 0

  if (!open) return null
  const host = document.getElementById('portal-modal') ?? document.body
  return createPortal(
    <div
      className="builder-modal-overlay builder-modal-overlay--root-portal"
      onClick={onClose}
    >
      <div className="builder-modal paper-size-modal" onClick={(e) => e.stopPropagation()}>
        <div className="builder-modal__head">
          <div>
            <h2 className="builder-modal__title">Elements</h2>
            {/* <p className="builder-modal__sub">
              Search your library and free online clipart (PNG). Browse categories for
              preloaded sets only.
            </p> */}
          </div>
          <button type="button" className="builder-modal__close" onClick={onClose}>
            ×
          </button>
        </div>
        <div className="paper-size-modal__body element-picker-modal__body">
          {/* <label className="element-picker-search">
            <Search size={18} aria-hidden />
            <input
              type="search"
              className="element-picker-search__input"
              value={search}
              onChange={(e) => {
                const next = e.target.value
                setSearch(next)
                if (next.trim()) setActiveCategory(null)
              }}
              placeholder="Search elements"
            />
          </label> */}

          {!isSearchMode ? (
            <>
              <div className="paper-size-modal__quick-row element-picker-modal__categories">
                <button
                  type="button"
                  className={
                    'paper-size-modal__quick-btn' +
                    (!activeCategory ? ' paper-size-modal__quick-btn--active' : '')
                  }
                  onClick={() => setActiveCategory(null)}
                >
                  All
                </button>
                {categories.map((c) => (
                  <button
                    key={c._id}
                    type="button"
                    className={
                      'paper-size-modal__quick-btn' +
                      (activeCategory === c.name ? ' paper-size-modal__quick-btn--active' : '')
                    }
                    onClick={() => {
                      setSearch('')
                      setDebouncedSearch('')
                      setActiveCategory(c.name)
                    }}
                  >
                    {c.name} ({c.count})
                  </button>
                ))}
              </div>
            </>
          ) : null}

          {error ? <p className="book-text-flyout__warn">{error}</p> : null}

          {showInitialSkeleton ? (
            <ElementPickerSkeletonGrid count={SKELETON_INITIAL} />
          ) : !hasAnyResults ? (
            <p className="paper-size-modal__hint">
              {isSearchMode
                ? 'No matches in your library or online. Try another word.'
                : 'No elements in this category.'}
            </p>
          ) : (
            <>
              {items.length > 0 ? (
                <section className="element-picker-section">
                  {isSearchMode ? (
                    <h3 className="element-picker-section__title">Your library</h3>
                  ) : null}
                  <div className="text-bubble-modal__grid element-picker-modal__grid">
                    {items.map((it) => (
                      <ElementLibraryTile
                        key={it._id}
                        item={it}
                        onPick={handlePickLibrary}
                      />
                    ))}
                  </div>
                  {loadingMore ? (
                    <ElementPickerSkeletonGrid
                      count={SKELETON_LOAD_MORE}
                      className="element-picker-skeleton-grid--more"
                    />
                  ) : null}
                </section>
              ) : null}

              {isSearchMode && (webItems.length > 0 || webLoadingMore) ? (
                <section className="element-picker-section element-picker-section--web">
                  <h3 className="element-picker-section__title">Online clipart</h3>
                  <div className="text-bubble-modal__grid element-picker-modal__grid">
                    {webItems.map((hit) => {
                      const key = `${hit.source}:${hit.id}`
                      return (
                        <button
                          key={key}
                          type="button"
                          className="text-bubble-modal__tile element-picker-web-tile"
                          disabled={importingWebId != null}
                          title={`${hit.alt} — ${hit.artist}`}
                          onClick={() => void importWebClipart(hit)}
                        >
                          <img src={hit.previewUrl} alt={hit.alt} loading="lazy" />
                          <span className="element-picker-web-tile__badge">
                            {importingWebId === key ? 'Adding…' : hit.source}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                  {webLoadingMore ? (
                    <ElementPickerSkeletonGrid
                      count={SKELETON_LOAD_MORE}
                      className="element-picker-skeleton-grid--more"
                    />
                  ) : null}
                </section>
              ) : null}
            </>
          )}
          <div ref={sentinelRef} />
        </div>
      </div>
    </div>,
    host,
  )
}
