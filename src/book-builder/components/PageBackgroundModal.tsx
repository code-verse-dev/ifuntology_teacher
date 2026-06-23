import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type FormEvent,
  type MouseEvent,
} from 'react'
import { BackgroundImageCropForm } from './BackgroundImageCropForm'
import { GradientLibraryForm } from './GradientLibraryForm'
import { apiUrl, assetUrl, builderFetch } from '../lib/api'
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
    void loadCatalog()
  }, [open, loadCatalog])

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
    const rows = items
      .filter((x) => x.kind === tab)
      .slice()
      .sort((a, b) => {
        const sa = a.source === 'user' ? 1 : 0
        const sb = b.source === 'user' ? 1 : 0
        if (sa !== sb) return sa - sb
        return a.label.localeCompare(b.label)
      })
    return rows
  }, [items, tab])

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
              Pick a background or add your own — new items are saved to your
              library on this device automatically.
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

        {libraryErr ? (
          <p className="bg-modal__library-err">{libraryErr}</p>
        ) : null}

        {loadErr && <p className="bg-modal__err">{loadErr}</p>}
        {loading && !items.length ? (
          <p className="bg-modal__loading">Loading…</p>
        ) : null}

        <div className="bg-modal__grid-wrap">
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
