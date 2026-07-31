import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
  type MouseEvent,
} from 'react'
import { Search } from 'lucide-react'
import { BackgroundImageCropForm } from './BackgroundImageCropForm'
import { GradientLibraryForm } from './GradientLibraryForm'
import {
  apiUrl,
  assetUrl,
  builderFetch,
  readApiErrorMessage,
} from '../lib/api'
import { useBuilderPaths } from '../lib/builderPaths'
import { getOrCreateBuilderUserId } from '../lib/builderUserId'
import type { PageTrimMm } from '../lib/cropImage'
import type {
  BackgroundCatalogItem,
  BackgroundKind,
  PageFill,
} from '../types/background'

type ModalTab = BackgroundKind
type SubModalKind = 'image' | 'color' | 'gradient'

type WebBgHit = {
  id: string
  source: 'pixabay' | 'openverse'
  previewUrl: string
  importUrl: string
  alt: string
  artist: string
  pageUrl: string
}

type WebSearchResponse = {
  items: WebBgHit[]
  page: number
  hasMore: boolean
  sources: string[]
}

type Props = {
  open: boolean
  onClose: () => void
  onApply: (fill: PageFill) => void
  currentFill: PageFill
  trimMm: PageTrimMm
}

export function PageBackgroundModal({
  open,
  onClose,
  onApply,
  currentFill,
  trimMm,
}: Props) {
  const { fetchInit } = useBuilderPaths()
  const [items, setItems] = useState<BackgroundCatalogItem[]>([])
  const [loadErr, setLoadErr] = useState<string | null>(null)
  const [tab, setTab] = useState<ModalTab>('image')
  const [loading, setLoading] = useState(false)
  const [subModal, setSubModal] = useState<SubModalKind | null>(null)
  const [subErr, setSubErr] = useState<string | null>(null)
  const [savingSub, setSavingSub] = useState(false)
  const [libraryErr, setLibraryErr] = useState<string | null>(null)
  const [subFormKey, setSubFormKey] = useState(0)

  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [webItems, setWebItems] = useState<WebBgHit[]>([])
  const [webPage, setWebPage] = useState(1)
  const [webHasMore, setWebHasMore] = useState(false)
  const [webLoading, setWebLoading] = useState(false)
  const [webLoadingMore, setWebLoadingMore] = useState(false)
  const [importingWebId, setImportingWebId] = useState<string | null>(null)
  const [webErr, setWebErr] = useState<string | null>(null)
  const sentinelRef = useRef<HTMLDivElement | null>(null)
  const webPageRef = useRef(1)
  const webHasMoreRef = useRef(false)
  const webLoadMoreInFlightRef = useRef(false)
  const searchGenRef = useRef(0)

  const isImageTab = tab === 'image'
  const isSearchMode = isImageTab && debouncedSearch.length > 0

  const loadCatalog = useCallback(async () => {
    setLoading(true)
    try {
      const userId = getOrCreateBuilderUserId()
      const res = await builderFetch(
        apiUrl(
          `/api/background/catalog?userId=${encodeURIComponent(userId)}`,
        ),
        {
          headers: { Accept: 'application/json' },
          ...fetchInit,
        },
      )
      if (!res.ok) throw new Error(await res.text())
      const data = (await res.json()) as BackgroundCatalogItem[]
      setItems(data)
      setLoadErr(null)
      setTab((prev) => {
        if (data.some((d) => d.kind === prev)) return prev
        const order: ModalTab[] = ['image', 'color', 'gradient']
        return order.find((k) => data.some((d) => d.kind === k)) ?? 'image'
      })
    } catch (e) {
      setLoadErr(e instanceof Error ? e.message : 'Failed to load')
    } finally {
      setLoading(false)
    }
  }, [fetchInit])

  useEffect(() => {
    if (!open) return
    setSearch('')
    setDebouncedSearch('')
    setWebItems([])
    setWebPage(1)
    setWebHasMore(false)
    setWebErr(null)
    void loadCatalog()
  }, [open, loadCatalog])

  useEffect(() => {
    if (!open || !isImageTab) return
    const t = window.setTimeout(() => setDebouncedSearch(search.trim()), 350)
    return () => window.clearTimeout(t)
  }, [open, search, isImageTab])

  const fetchWeb = useCallback(
    async (q: string, pageNum: number, append: boolean) => {
      const params = new URLSearchParams({ q, page: String(pageNum) })
      const res = await builderFetch(
        apiUrl(`/api/builder/clipart/background-search?${params.toString()}`),
        fetchInit,
      )
      if (!res.ok) throw new Error(await readApiErrorMessage(res))
      const data = (await res.json()) as WebSearchResponse
      const next = Array.isArray(data.items) ? data.items : []
      setWebItems((prev) => (append ? [...prev, ...next] : next))
      const page = data.page ?? pageNum
      setWebPage(page)
      webPageRef.current = page
      const more = !!data.hasMore
      setWebHasMore(more)
      webHasMoreRef.current = more
    },
    [fetchInit],
  )

  useEffect(() => {
    if (!open || !isSearchMode) {
      setWebItems([])
      setWebHasMore(false)
      webHasMoreRef.current = false
      return
    }
    const gen = ++searchGenRef.current
    setWebLoading(true)
    setWebErr(null)
    webLoadMoreInFlightRef.current = false
    void fetchWeb(debouncedSearch, 1, false)
      .catch((e) => {
        if (gen !== searchGenRef.current) return
        setWebErr(e instanceof Error ? e.message : 'Online search failed')
        setWebItems([])
        setWebHasMore(false)
        webHasMoreRef.current = false
      })
      .finally(() => {
        if (gen === searchGenRef.current) setWebLoading(false)
      })
  }, [debouncedSearch, fetchWeb, isSearchMode, open])

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
    if (!open || !isSearchMode || webLoading) return
    const el = sentinelRef.current
    if (!el) return
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries.some((x) => x.isIntersecting)) return
        if (webHasMoreRef.current) void loadMoreWeb()
      },
      { rootMargin: '220px' },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [isSearchMode, loadMoreWeb, open, webLoading])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      if (subModal) {
        e.preventDefault()
        e.stopPropagation()
        if (!savingSub) setSubModal(null)
      }
    }
    document.addEventListener('keydown', onKey, true)
    return () => document.removeEventListener('keydown', onKey, true)
  }, [open, subModal, savingSub])

  const filtered = useMemo(() => {
    const q = debouncedSearch.toLowerCase()
    const rows = items
      .filter((x) => x.kind === tab)
      .filter((x) => {
        if (tab !== 'image' || !q) return true
        return x.label.toLowerCase().includes(q)
      })
      .slice()
      .sort((a, b) => {
        const sa = a.source === 'user' ? 1 : 0
        const sb = b.source === 'user' ? 1 : 0
        if (sa !== sb) return sa - sb
        return a.label.localeCompare(b.label)
      })
    return rows
  }, [debouncedSearch, items, tab])

  if (!open) return null

  const pick = (item: BackgroundCatalogItem) => {
    onApply({
      kind: item.kind,
      value: item.value,
      itemId: item.id,
    })
    onClose()
  }

  const pickWhite = () => {
    onApply(null)
    onClose()
  }

  const isSelected = (item: BackgroundCatalogItem) => {
    if (!currentFill || currentFill.kind !== item.kind) return false
    return currentFill.value === item.value
  }

  const openSubForTab = () => {
    setSubErr(null)
    setSubModal(tab as SubModalKind)
    setSubFormKey((k) => k + 1)
  }

  const deleteUserItem = async (item: BackgroundCatalogItem, ev: MouseEvent) => {
    ev.stopPropagation()
    ev.preventDefault()
    if (item.source !== 'user') return
    if (!confirm(`Remove “${item.label}” from your library?`)) return
    setLibraryErr(null)
    const userId = getOrCreateBuilderUserId()
    const res = await fetch(
      apiUrl(
        `/api/builder/backgrounds/${encodeURIComponent(item.id)}?userId=${encodeURIComponent(userId)}`,
      ),
      { method: 'DELETE' },
    )
    if (!res.ok) {
      setLibraryErr(await res.text())
      return
    }
    await loadCatalog()
  }

  const importWebBackground = async (hit: WebBgHit) => {
    const key = `${hit.source}:${hit.id}`
    setImportingWebId(key)
    setWebErr(null)
    try {
      const res = await builderFetch(apiUrl('/api/builder/clipart/import'), {
        ...fetchInit,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(fetchInit?.headers as Record<string, string> | undefined),
        },
        body: JSON.stringify({
          url: hit.importUrl,
          source: hit.source,
          alt: hit.alt,
          artist: hit.artist,
        }),
      })
      if (!res.ok) throw new Error(await readApiErrorMessage(res))
      const json = (await res.json()) as { imagePath?: string }
      const path = json.imagePath?.trim()
      if (!path) throw new Error('Import did not return imagePath')
      onApply({ kind: 'image', value: path })
      onClose()
    } catch (e) {
      setWebErr(e instanceof Error ? e.message : 'Could not add background')
    } finally {
      setImportingWebId(null)
    }
  }

  const uploadCroppedBackground = async (file: File, label: string) => {
    setSubErr(null)
    setSavingSub(true)
    try {
      const userId = getOrCreateBuilderUserId()
      const upload = new FormData()
      upload.append('file', file)
      upload.append('label', label)
      upload.append('userId', userId)
      const res = await fetch(apiUrl('/api/builder/backgrounds/upload'), {
        method: 'POST',
        body: upload,
      })
      if (!res.ok) {
        setSubErr(await res.text())
        return
      }
      setSubModal(null)
      await loadCatalog()
    } finally {
      setSavingSub(false)
    }
  }

  const onSubmitSubColor = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSubErr(null)
    const form = e.currentTarget
    const fd = new FormData(form)
    const label = String(fd.get('customLabel') ?? '').trim()
    const value = String(fd.get('customValue') ?? '').trim()
    if (!label) {
      setSubErr('Name is required')
      return
    }
    if (!value) {
      setSubErr('Hex color is required')
      return
    }
    setSavingSub(true)
    try {
      const userId = getOrCreateBuilderUserId()
      const res = await fetch(apiUrl('/api/builder/backgrounds/color'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, label, value }),
      })
      if (!res.ok) {
        setSubErr(await res.text())
        return
      }
      setSubModal(null)
      await loadCatalog()
    } finally {
      setSavingSub(false)
    }
  }

  const addGradientToLibrary = async (label: string, value: string) => {
    setSubErr(null)
    setSavingSub(true)
    try {
      const userId = getOrCreateBuilderUserId()
      const res = await fetch(apiUrl('/api/builder/backgrounds/gradient'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, label, value }),
      })
      if (!res.ok) {
        setSubErr(await res.text())
        return
      }
      setSubModal(null)
      await loadCatalog()
    } finally {
      setSavingSub(false)
    }
  }

  const subTitle =
    subModal === 'image'
      ? 'Upload custom image'
      : subModal === 'color'
        ? 'Add color'
        : 'Add gradient'

  return (
    <div
      className="bg-modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="bg-modal-title"
      onClick={onClose}
    >
      <div className="bg-modal" onClick={(e) => e.stopPropagation()}>
        <div className="bg-modal__head">
          <div>
            <h2 id="bg-modal-title" className="bg-modal__title">
              Page background
            </h2>
            <p className="bg-modal__sub">
              Pick a background or upload your own.
            </p>
          </div>
          <div className="bg-modal__head-actions">
            <button
              type="button"
              className="bg-modal__close"
              aria-label="Close"
              onClick={onClose}
            >
              ×
            </button>
          </div>
        </div>

        <div className="bg-modal__tabs-row">
          <div className="bg-modal__tabs" role="tablist">
            {(
              [
                ['image', 'Images'],
                ['color', 'Colors'],
                ['gradient', 'Gradients'],
              ] as const
            ).map(([k, label]) => (
              <button
                key={k}
                type="button"
                role="tab"
                aria-selected={tab === k}
                className={
                  'bg-modal__tab' + (tab === k ? ' bg-modal__tab--active' : '')
                }
                onClick={() => {
                  setTab(k)
                  setSubModal(null)
                  setLibraryErr(null)
                  setWebErr(null)
                  if (k !== 'image') {
                    setSearch('')
                    setDebouncedSearch('')
                  }
                }}
              >
                {label}
              </button>
            ))}
          </div>
          <button
            type="button"
            className="bg-modal__tab-action"
            onClick={openSubForTab}
          >
            {tab === 'image'
              ? 'Upload custom'
              : tab === 'color'
                ? 'Add color'
                : 'Add gradient'}
          </button>
        </div>

        {/* {isImageTab ? (
          <label className="element-picker-search bg-modal__search">
            <Search size={18} aria-hidden />
            <input
              type="search"
              className="element-picker-search__input"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search library & online photos"
            />
          </label>
        ) : null} */}

        {libraryErr ? (
          <p className="bg-modal__library-err">{libraryErr}</p>
        ) : null}
        {webErr ? <p className="bg-modal__library-err">{webErr}</p> : null}

        {loadErr && <p className="bg-modal__err">{loadErr}</p>}
        {loading && !items.length ? (
          <p className="bg-modal__loading">Loading…</p>
        ) : null}

        <div className="bg-modal__grid-wrap">
          {!isSearchMode ? (
            <div className="bg-modal__grid">
              <button
                type="button"
                className={
                  'bg-modal__tile bg-modal__tile--white' +
                  (!currentFill ? ' is-selected' : '')
                }
                onClick={pickWhite}
              >
                <span
                  className="bg-modal__tile-visual bg-modal__tile-visual--white"
                  aria-hidden
                />
                <span className="bg-modal__tile-label">Plain white</span>
              </button>
              {filtered.map((item) => (
                <div key={item.id} className="bg-modal__tile-outer">
                  <button
                    type="button"
                    className={
                      'bg-modal__tile' +
                      (isSelected(item) ? ' is-selected' : '')
                    }
                    onClick={() => pick(item)}
                    title={item.label}
                  >
                    <span className="bg-modal__tile-visual">
                      {item.kind === 'image' && (
                        <img
                          src={assetUrl(item.value)}
                          alt=""
                          className="bg-modal__thumb"
                          loading="lazy"
                          decoding="async"
                        />
                      )}
                      {item.kind === 'color' && (
                        <span
                          className="bg-modal__swatch"
                          style={{ background: item.value }}
                        />
                      )}
                      {item.kind === 'gradient' && (
                        <span
                          className="bg-modal__swatch"
                          style={{ background: item.value }}
                        />
                      )}
                    </span>
                    <span className="bg-modal__tile-label">{item.label}</span>
                  </button>
                  {item.source === 'user' ? (
                    <button
                      type="button"
                      className="bg-modal__tile-remove"
                      title="Remove from my library"
                      aria-label={`Remove ${item.label}`}
                      onClick={(ev) => deleteUserItem(item, ev)}
                    >
                      ×
                    </button>
                  ) : null}
                </div>
              ))}
            </div>
          ) : (
            <>
              {filtered.length > 0 ? (
                <section className="element-picker-section">
                  <h3 className="element-picker-section__title">Your library</h3>
                  <div className="bg-modal__grid">
                    {filtered.map((item) => (
                      <div key={item.id} className="bg-modal__tile-outer">
                        <button
                          type="button"
                          className={
                            'bg-modal__tile' +
                            (isSelected(item) ? ' is-selected' : '')
                          }
                          onClick={() => pick(item)}
                          title={item.label}
                        >
                          <span className="bg-modal__tile-visual">
                            <img
                              src={assetUrl(item.value)}
                              alt=""
                              className="bg-modal__thumb"
                              loading="lazy"
                              decoding="async"
                            />
                          </span>
                          <span className="bg-modal__tile-label">
                            {item.label}
                          </span>
                        </button>
                      </div>
                    ))}
                  </div>
                </section>
              ) : null}

              <section className="element-picker-section element-picker-section--web">
                <h3 className="element-picker-section__title">
                  Online photos
                </h3>
                {webLoading && !webItems.length ? (
                  <p className="bg-modal__loading">Searching…</p>
                ) : !webItems.length ? (
                  <p className="bg-modal__loading">
                    No online matches. Try another word.
                  </p>
                ) : (
                  <div className="bg-modal__grid">
                    {webItems.map((hit) => {
                      const key = `${hit.source}:${hit.id}`
                      return (
                        <button
                          key={key}
                          type="button"
                          className="bg-modal__tile element-picker-web-tile"
                          disabled={importingWebId != null}
                          title={`${hit.alt} — ${hit.artist}`}
                          onClick={() => void importWebBackground(hit)}
                        >
                          <span className="bg-modal__tile-visual">
                            <img
                              src={hit.previewUrl}
                              alt={hit.alt}
                              className="bg-modal__thumb"
                              loading="lazy"
                              decoding="async"
                            />
                          </span>
                          <span className="bg-modal__tile-label">
                            {importingWebId === key
                              ? 'Adding…'
                              : hit.alt}
                          </span>
                          <span className="element-picker-web-tile__badge">
                            {hit.source}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                )}
                {webLoadingMore ? (
                  <p className="bg-modal__loading">Loading more…</p>
                ) : null}
                <div ref={sentinelRef} />
              </section>
            </>
          )}
        </div>
      </div>

      {subModal ? (
        <div
          className="bg-modal-sub-overlay"
          role="presentation"
          onClick={(e) => {
            e.stopPropagation()
            if (!savingSub) setSubModal(null)
          }}
        >
          <div
            className={
              'bg-modal-sub' +
              (subModal === 'gradient' ? ' bg-modal-sub--wide' : '')
            }
            role="dialog"
            aria-modal="true"
            aria-labelledby="bg-modal-sub-title"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-modal-sub__head">
              <h3 id="bg-modal-sub-title" className="bg-modal-sub__title">
                {subTitle}
              </h3>
              <button
                type="button"
                className="bg-modal-sub__close"
                aria-label="Close"
                disabled={savingSub}
                onClick={() => setSubModal(null)}
              >
                ×
              </button>
            </div>
            {subErr ? <p className="bg-modal-sub__err">{subErr}</p> : null}
            {subModal === 'image' ? (
              <BackgroundImageCropForm
                key={`${subFormKey}-${trimMm.widthMm}-${trimMm.heightMm}`}
                disabled={savingSub}
                setFormError={setSubErr}
                onCancel={() => {
                  if (!savingSub) setSubModal(null)
                }}
                onCroppedUpload={uploadCroppedBackground}
                trimMm={trimMm}
              />
            ) : null}
            {subModal === 'color' ? (
              <form
                key={subFormKey}
                className="bg-modal-sub__form"
                onSubmit={onSubmitSubColor}
              >
                <label className="bg-modal-sub__label">
                  Name
                  <input
                    name="customLabel"
                    className="bg-modal-sub__input"
                    placeholder="e.g. Cream"
                    autoFocus
                    disabled={savingSub}
                  />
                </label>
                <label className="bg-modal-sub__label">
                  Hex
                  <input
                    name="customValue"
                    className="bg-modal-sub__input"
                    placeholder="#faf9e8"
                    disabled={savingSub}
                  />
                </label>
                <div className="bg-modal-sub__actions">
                  <button
                    type="button"
                    className="bg-modal-sub__btn bg-modal-sub__btn--ghost"
                    disabled={savingSub}
                    onClick={() => setSubModal(null)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-modal-sub__btn bg-modal-sub__btn--primary"
                    disabled={savingSub}
                  >
                    {savingSub ? 'Adding…' : 'Add to library'}
                  </button>
                </div>
              </form>
            ) : null}
            {subModal === 'gradient' ? (
              <GradientLibraryForm
                key={subFormKey}
                disabled={savingSub}
                onCancel={() => setSubModal(null)}
                onValidationError={setSubErr}
                onAdd={addGradientToLibrary}
              />
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  )
}
