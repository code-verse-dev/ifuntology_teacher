import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
  type ReactElement,
} from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { GradientLibraryForm } from '../components/GradientLibraryForm'
import { apiUrl, assetUrl } from '../lib/api'
import type { BackgroundKind } from '../types/background'
import type { CatalogCategory, CategoryDoc } from '../types/character'
import './book-builder.css'
import './admin-character.css'

type AdminTab =
  | 'backgrounds'
  | 'thoughtBubbles'
  | 'elements'
  | 'elementCategories'
  | 'shapes'
  | 'character'
  | 'categories'
  | 'layers'
type BgSubTab = 'images' | 'colors' | 'gradients'
type AdminCharacterProps = {
  forcedTab?:
    | 'backgrounds'
    | 'thoughtBubbles'
    | 'elements'
    | 'elementCategories'
    | 'shapes'
    | 'character'
}

function IconBackgrounds() {
  return (
    <svg
      width={20}
      height={20}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      aria-hidden
    >
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M3 17l5-5 4 4 3-3 6 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function IconThoughtBubbles() {
  return (
    <svg
      width={20}
      height={20}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      aria-hidden
    >
      <path d="M7 6h10a4 4 0 0 1 4 4v2a4 4 0 0 1-4 4h-4l-3 2v-2H7a4 4 0 0 1-4-4v-2a4 4 0 0 1 4-4z" />
      <circle cx="7" cy="19" r="1.2" fill="currentColor" stroke="none" />
      <circle cx="10" cy="21" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  )
}

function isSvgPath(v: string): boolean {
  return /\.svg($|\?)/i.test(v)
}

function IconCategories() {
  return (
    <svg
      width={20}
      height={20}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      aria-hidden
    >
      <path d="M4 6h7v7H4V6zm9 0h7v4h-7V6zm0 6h7v7h-7v-7zM4 15h7v4H4v-4z" />
    </svg>
  )
}

function IconElements() {
  return (
    <svg
      width={20}
      height={20}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      aria-hidden
    >
      <rect x="3.5" y="3.5" width="7" height="7" rx="1" />
      <rect x="13.5" y="3.5" width="7" height="7" rx="1" />
      <rect x="3.5" y="13.5" width="7" height="7" rx="1" />
      <rect x="13.5" y="13.5" width="7" height="7" rx="1" />
    </svg>
  )
}

function IconLayers() {
  return (
    <svg
      width={20}
      height={20}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      aria-hidden
    >
      <path d="M12 3l9 5-9 5-9-5 9-5z" strokeLinejoin="round" />
      <path d="M3 12l9 5 9-5M3 17l9 5 9-5" strokeLinejoin="round" />
    </svg>
  )
}

function IconCharacter() {
  return (
    <svg
      width={20}
      height={20}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      aria-hidden
    >
      <circle cx="12" cy="7.5" r="3.5" />
      <path d="M5 20a7 7 0 0 1 14 0" strokeLinecap="round" />
    </svg>
  )
}

function IconBook() {
  return (
    <svg
      width={20}
      height={20}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      aria-hidden
    >
      <path d="M4 5a2 2 0 012-2h12v16H6a2 2 0 00-2 2V5z" />
      <path d="M6 3h12v16H6a2 2 0 01-2-2V5a2 2 0 012-2z" opacity=".5" />
    </svg>
  )
}

function IconBell() {
  return (
    <svg
      width={22}
      height={22}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      aria-hidden
    >
      <path d="M18 8a6 6 0 10-12 0c0 7-3 7-3 7h18s-3 0-3-7M13.73 21a2 2 0 01-3.46 0" />
    </svg>
  )
}

function IconLogout() {
  return (
    <svg
      width={18}
      height={18}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      aria-hidden
    >
      <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />
    </svg>
  )
}

function IconPlus() {
  return (
    <svg
      width={18}
      height={18}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden
    >
      <path d="M12 5v14M5 12h14" strokeLinecap="round" />
    </svg>
  )
}

function IconTrash() {
  return (
    <svg
      width={16}
      height={16}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      aria-hidden
    >
      <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14zM10 11v6M14 11v6" />
    </svg>
  )
}

function IconPencil() {
  return (
    <svg
      width={16}
      height={16}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      aria-hidden
    >
      <path d="M12 20h9M16.5 3.5a2.12 2.12 0 013 3L7 19l-4 1 1-4L16.5 3.5z" />
    </svg>
  )
}

function IconEmptyBackgrounds({ kind }: { kind: BgSubTab }) {
  if (kind === 'images') {
    return (
      <svg
        className="admin-media-empty-card__icon-svg"
        width={48}
        height={48}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        aria-hidden
      >
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="M3 17l4.5-4.5 3 3L14 12l7 7" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="8.5" cy="9.5" r="1.5" fill="currentColor" stroke="none" />
      </svg>
    )
  }
  if (kind === 'gradients') {
    return (
      <svg
        className="admin-media-empty-card__icon-svg"
        width={48}
        height={48}
        viewBox="0 0 24 24"
        aria-hidden
      >
        <defs>
          <linearGradient
            id="admin-empty-grad"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <stop offset="0%" stopColor="#94a3b8" />
            <stop offset="100%" stopColor="#e2e8f0" />
          </linearGradient>
        </defs>
        <rect
          x="3"
          y="5"
          width="18"
          height="14"
          rx="2"
          fill="url(#admin-empty-grad)"
          stroke="currentColor"
          strokeWidth="1.25"
        />
      </svg>
    )
  }
  return (
    <svg
      className="admin-media-empty-card__icon-svg"
      width={48}
      height={48}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden
    >
      <rect x="4" y="5" width="16" height="4.5" rx="1.25" />
      <rect x="4" y="11.25" width="16" height="4.5" rx="1.25" />
      <rect x="4" y="17.5" width="16" height="4.5" rx="1.25" />
    </svg>
  )
}

type BgRow = {
  _id: string
  kind: BackgroundKind
  label: string
  value: string
  createdAt?: string
}

type ThoughtBubbleRow = {
  _id: string
  label: string
  imagePath: string
  createdAt?: string
}

type PropRow = {
  _id: string
  label: string
  category: string
  imagePath: string
  createdAt?: string
}

type ShapeRow = {
  _id: string
  label: string
  imagePath: string
  createdAt?: string
}

type ElementCategoryRow = {
  _id: string
  name: string
}
type ElementCategoryCountRow = ElementCategoryRow & { count: number }
type ElementGroupedResponse = {
  categories: ElementCategoryCountRow[]
  activeCategory: string | null
  items: Array<Record<string, unknown>>
  pagination: {
    page: number
    pageSize: number
    total: number
    totalPages: number
  }
}

const BUILT_IN_SHAPES: Array<{ id: string; label: string }> = [
  { id: 'rectangle', label: 'Rectangle' },
  { id: 'ellipse', label: 'Ellipse' },
  { id: 'triangle', label: 'Triangle' },
  { id: 'diamond', label: 'Diamond' },
  { id: 'pentagon', label: 'Pentagon' },
  { id: 'hexagon', label: 'Hexagon' },
  { id: 'octagon', label: 'Octagon' },
  { id: 'star', label: 'Star' },
  { id: 'heart', label: 'Heart' },
  { id: 'chevronRight', label: 'Chevron' },
  { id: 'arrowRight', label: 'Arrow' },
  { id: 'parallelogram', label: 'Parallelogram' },
  { id: 'trapezoid', label: 'Trapezoid' },
]

const DEFAULT_CHARACTER_CATEGORIES: Array<{ name: string; layerOrder: number }> = [
  { name: 'body', layerOrder: 0 },
  { name: 'hair', layerOrder: 1 },
  { name: 'face', layerOrder: 2 },
  { name: 'shirt', layerOrder: 3 },
  { name: 'pant', layerOrder: 4 },
  { name: 'shoes', layerOrder: 5 },
  { name: 'jackets', layerOrder: 6 },
]

export function AdminCharacter({ forcedTab }: AdminCharacterProps = {}) {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<AdminTab>(forcedTab ?? 'backgrounds')
  const [categories, setCategories] = useState<CategoryDoc[]>([])
  const [catalog, setCatalog] = useState<CatalogCategory[]>([])
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const [newName, setNewName] = useState('')
  const [newLayer, setNewLayer] = useState(100)
  const [bgRows, setBgRows] = useState<BgRow[]>([])
  const [thoughtBubbleRows, setThoughtBubbleRows] = useState<
    ThoughtBubbleRow[]
  >([])

  const [bgSubTab, setBgSubTab] = useState<BgSubTab>('images')
  const [activeCharacterCategoryId, setActiveCharacterCategoryId] = useState<
    string | null
  >(null)
  const [characterModalOpen, setCharacterModalOpen] = useState(false)
  const [characterFiles, setCharacterFiles] = useState<File[]>([])
  const [characterLabel, setCharacterLabel] = useState('')
  const [characterUploadBusy, setCharacterUploadBusy] = useState(false)
  const [characterUploadIndex, setCharacterUploadIndex] = useState<number | null>(null)
  const [characterUploadDone, setCharacterUploadDone] = useState<number[]>([])
  const [characterUploadFailed, setCharacterUploadFailed] = useState<number[]>([])
  const [characterCategoryModalOpen, setCharacterCategoryModalOpen] = useState(false)
  const [newCharacterCategoryIcon, setNewCharacterCategoryIcon] = useState<File | null>(null)
  const [newCharacterCategoryIconTooltip, setNewCharacterCategoryIconTooltip] =
    useState('')
  const [editCharacterCategoryModalOpen, setEditCharacterCategoryModalOpen] =
    useState(false)
  const [editCharacterCategoryId, setEditCharacterCategoryId] = useState<string | null>(
    null,
  )
  const [editCharacterCategoryName, setEditCharacterCategoryName] = useState('')
  const [editCharacterCategoryLayer, setEditCharacterCategoryLayer] = useState(100)
  const [editCharacterCategoryIcon, setEditCharacterCategoryIcon] = useState<File | null>(
    null,
  )
  const [editCharacterCategoryIconTooltip, setEditCharacterCategoryIconTooltip] =
    useState('')
  const [editCharacterCategoryIconPath, setEditCharacterCategoryIconPath] = useState('')
  const [editCharacterCategoryRemoveIcon, setEditCharacterCategoryRemoveIcon] =
    useState(false)
  const [characterPage, setCharacterPage] = useState(1)
  const [characterPageSize] = useState(12)
  const [imageModalOpen, setImageModalOpen] = useState(false)
  const [bubbleModalOpen, setBubbleModalOpen] = useState(false)
  const [colorModalOpen, setColorModalOpen] = useState(false)
  const [gradientModalOpen, setGradientModalOpen] = useState(false)
  const [savingGradient, setSavingGradient] = useState(false)
  const [gradientFormKey, setGradientFormKey] = useState(0)
  const [thoughtBubbleFiles, setThoughtBubbleFiles] = useState<File[]>([])
  const [propRows, setPropRows] = useState<PropRow[]>([])
  const [elementCategories, setElementCategories] = useState<ElementCategoryRow[]>(
    [],
  )
  const [propModalOpen, setPropModalOpen] = useState(false)
  const [propCategory, setPropCategory] = useState('cars')
  const [newElementCategory, setNewElementCategory] = useState('')
  const [elementCategoryQuery, setElementCategoryQuery] = useState('')
  const [activeElementCategory, setActiveElementCategory] = useState<string | null>(null)
  const [elementCategoryCounts, setElementCategoryCounts] = useState<
    ElementCategoryCountRow[]
  >([])
  const [elementsPage, setElementsPage] = useState(1)
  const [elementsPageSize] = useState(48)
  const [elementsTotal, setElementsTotal] = useState(0)
  const [elementsTotalPages, setElementsTotalPages] = useState(1)
  const [propFile, setPropFile] = useState<File | null>(null)
  const [shapeRows, setShapeRows] = useState<ShapeRow[]>([])
  const [shapeModalOpen, setShapeModalOpen] = useState(false)
  const [shapeFiles, setShapeFiles] = useState<File[]>([])
  const [editBg, setEditBg] = useState<BgRow | null>(null)
  const [editThoughtBubble, setEditThoughtBubble] = useState<{
    _id: string
    label: string
  } | null>(null)
  const [editVariation, setEditVariation] = useState<{
    id: string
    label: string
    sortOrder: number
    imagePath: string
  } | null>(null)
  const [editVariationImageFile, setEditVariationImageFile] = useState<File | null>(null)
  const [editVariationImagePreviewUrl, setEditVariationImagePreviewUrl] = useState<string | null>(
    null,
  )
  const seedingCharacterCategoriesRef = useRef(false)

  const refresh = useCallback(async () => {
    const groupedParams = new URLSearchParams()
    groupedParams.set('page', String(elementsPage))
    groupedParams.set('pageSize', String(elementsPageSize))
    if (activeElementCategory) groupedParams.set('category', activeElementCategory)
    const [raw, cat, bg, tb, pr, ec, sh] = await Promise.all([
      fetch(apiUrl('/api/admin/character/categories')),
      fetch(apiUrl('/api/character/catalog')),
      fetch(apiUrl('/api/admin/background/items')),
      fetch(apiUrl('/api/admin/thought-bubbles')),
      fetch(apiUrl(`/api/admin/elements/grouped?${groupedParams.toString()}`)),
      fetch(apiUrl('/api/admin/elements/categories')),
      fetch(apiUrl('/api/admin/shapes')),
    ])
    if (raw.ok) {
      const list = (await raw.json()) as Record<string, unknown>[]
      setCategories(
        list.map((c) => ({
          _id: String(c._id),
          name: String(c.name),
          slug: String(c.slug),
          layerOrder: Number(c.layerOrder),
          iconPath:
            typeof c.iconPath === 'string' && c.iconPath.trim().length > 0
              ? c.iconPath
              : undefined,
          iconTooltip:
            typeof c.iconTooltip === 'string' && c.iconTooltip.trim().length > 0
              ? c.iconTooltip
              : undefined,
        })),
      )
    }
    if (cat.ok) {
      setCatalog((await cat.json()) as CatalogCategory[])
    }
    if (bg.ok) {
      const list = (await bg.json()) as Record<string, unknown>[]
      setBgRows(
        list.map((b) => ({
          _id: String(b._id),
          kind: b.kind as BackgroundKind,
          label: String(b.label),
          value: String(b.value),
          createdAt:
            b.createdAt != null ? String(b.createdAt as string | Date) : undefined,
        })),
      )
    }
    if (tb.ok) {
      const list = (await tb.json()) as Record<string, unknown>[]
      setThoughtBubbleRows(
        list.map((row) => ({
          _id: String(row._id),
          label: String(row.label),
          imagePath: String(row.imagePath),
          createdAt:
            row.createdAt != null
              ? String(row.createdAt as string | Date)
              : undefined,
        })),
      )
    }
    if (pr.ok) {
      const payload = (await pr.json()) as ElementGroupedResponse
      const list = Array.isArray(payload.items) ? payload.items : []
      setPropRows(
        list.map((row) => ({
          _id: String(row._id),
          label: String(row.label),
          category: String(row.category ?? 'things'),
          imagePath: String(row.imagePath),
          createdAt:
            row.createdAt != null
              ? String(row.createdAt as string | Date)
              : undefined,
        })),
      )
      const categoryRows = Array.isArray(payload.categories) ? payload.categories : []
      setElementCategoryCounts(
        categoryRows.map((row) => ({
          _id: String(row._id),
          name: String(row.name),
          count: Number(row.count) || 0,
        })),
      )
      setActiveElementCategory(payload.activeCategory ?? null)
      if (payload.pagination) {
        setElementsPage(Math.max(1, Number(payload.pagination.page) || 1))
        setElementsTotal(Math.max(0, Number(payload.pagination.total) || 0))
        setElementsTotalPages(
          Math.max(1, Number(payload.pagination.totalPages) || 1),
        )
      }
    }
    if (ec.ok) {
      const list = (await ec.json()) as Record<string, unknown>[]
      const cats = list.map((row) => ({
        _id: String(row._id),
        name: String(row.name),
      }))
      setElementCategories(cats)
      if (cats.length > 0 && !cats.some((c) => c.name === propCategory)) {
        setPropCategory(cats[0].name)
      }
    }
    if (sh.ok) {
      const list = (await sh.json()) as Record<string, unknown>[]
      setShapeRows(
        list.map((row) => ({
          _id: String(row._id),
          label: String(row.label ?? ''),
          imagePath: String(row.imagePath),
          createdAt:
            row.createdAt != null
              ? String(row.createdAt as string | Date)
              : undefined,
        })),
      )
    }
  }, [activeElementCategory, elementsPage, elementsPageSize])

  useEffect(() => {
    refresh().catch(() => setError('Failed to load admin data'))
  }, [refresh])

  useEffect(() => {
    if (!forcedTab) return
    setActiveTab(forcedTab)
  }, [forcedTab])

  useEffect(() => {
    if (categories.length > 0) return
    if (seedingCharacterCategoriesRef.current) return
    seedingCharacterCategoriesRef.current = true
    setError(null)

    ;(async () => {
      try {
        await Promise.all(
          DEFAULT_CHARACTER_CATEGORIES.map(({ name, layerOrder }) => {
            const fd = new FormData()
            fd.append('name', name)
            fd.append('layerOrder', String(layerOrder))
            return fetch(apiUrl('/api/admin/character/categories'), {
              method: 'POST',
              body: fd,
            })
          }),
        )
        await refresh()
      } catch {
        setError('Failed to seed default character categories')
      } finally {
        seedingCharacterCategoriesRef.current = false
      }
    })()
  }, [categories.length, refresh])

  useEffect(() => {
    if (categories.length === 0) {
      setActiveCharacterCategoryId(null)
      return
    }
    if (activeCharacterCategoryId == null) {
      setActiveCharacterCategoryId(categories[0]._id)
      return
    }
    const exists = categories.some((c) => c._id === activeCharacterCategoryId)
    if (!exists) setActiveCharacterCategoryId(categories[0]._id)
  }, [categories, activeCharacterCategoryId])

  useEffect(() => {
    if (
      !imageModalOpen &&
      !bubbleModalOpen &&
      !colorModalOpen &&
      !gradientModalOpen &&
      !characterModalOpen &&
      !characterCategoryModalOpen &&
      !editCharacterCategoryModalOpen &&
      !editVariation &&
      !editBg &&
      !editThoughtBubble
    )
      return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setImageModalOpen(false)
        setBubbleModalOpen(false)
        setColorModalOpen(false)
        setGradientModalOpen(false)
        setCharacterModalOpen(false)
        setCharacterCategoryModalOpen(false)
        setEditCharacterCategoryModalOpen(false)
        setEditVariation(null)
        setEditVariationImageFile(null)
        setEditVariationImagePreviewUrl(null)
        setEditBg(null)
        setEditThoughtBubble(null)
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [
    imageModalOpen,
    bubbleModalOpen,
    colorModalOpen,
    gradientModalOpen,
    characterModalOpen,
    characterCategoryModalOpen,
    editCharacterCategoryModalOpen,
    editVariation,
    editBg,
    editThoughtBubble,
  ])

  useEffect(() => {
    return () => {
      if (editVariationImagePreviewUrl?.startsWith('blob:')) {
        URL.revokeObjectURL(editVariationImagePreviewUrl)
      }
    }
  }, [editVariationImagePreviewUrl])

  const showMsg = (m: string) => {
    setMessage(m)
    setTimeout(() => setMessage(null), 4000)
  }

  const addCategory = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    const res = await fetch(apiUrl('/api/admin/character/categories'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: newName.trim(),
        layerOrder: Number(newLayer),
      }),
    })
    if (!res.ok) {
      setError(await res.text())
      return
    }
    setNewName('')
    showMsg('Category created')
    await refresh()
  }

  const updateLayer = async (id: string, layerOrder: number) => {
    setError(null)
    const res = await fetch(apiUrl(`/api/admin/character/categories/${id}`), {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ layerOrder }),
    })
    if (!res.ok) {
      setError(await res.text())
      return
    }
    await refresh()
  }

  const openEditCategoryModal = (category: CategoryDoc) => {
    setEditCharacterCategoryId(category._id)
    setEditCharacterCategoryName(category.name)
    setEditCharacterCategoryLayer(category.layerOrder)
    setEditCharacterCategoryIconTooltip(category.iconTooltip ?? '')
    setEditCharacterCategoryIconPath(category.iconPath ?? '')
    setEditCharacterCategoryIcon(null)
    setEditCharacterCategoryRemoveIcon(false)
    setEditCharacterCategoryModalOpen(true)
  }

  const closeEditCategoryModal = () => {
    setEditCharacterCategoryModalOpen(false)
    setEditCharacterCategoryId(null)
    setEditCharacterCategoryName('')
    setEditCharacterCategoryLayer(100)
    setEditCharacterCategoryIconTooltip('')
    setEditCharacterCategoryIconPath('')
    setEditCharacterCategoryIcon(null)
    setEditCharacterCategoryRemoveIcon(false)
  }

  const submitEditCategory = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!editCharacterCategoryId) return
    const nextName = editCharacterCategoryName.trim()
    if (!nextName) {
      setError('Category name is required')
      return
    }
    setError(null)
    const fd = new FormData()
    fd.append('name', nextName)
    fd.append('layerOrder', String(Number(editCharacterCategoryLayer)))
    fd.append('iconTooltip', editCharacterCategoryIconTooltip.trim())
    if (editCharacterCategoryRemoveIcon) fd.append('removeIcon', 'true')
    if (editCharacterCategoryIcon) fd.append('icon', editCharacterCategoryIcon)
    const res = await fetch(
      apiUrl(`/api/admin/character/categories/${editCharacterCategoryId}`),
      {
        method: 'PATCH',
        body: fd,
      },
    )
    if (!res.ok) {
      setError(await res.text())
      return
    }
    closeEditCategoryModal()
    showMsg('Category updated')
    await refresh()
  }

  const deleteCategory = async (id: string) => {
    if (!confirm('Delete this category and all its variations?')) return
    setError(null)
    const res = await fetch(apiUrl(`/api/admin/character/categories/${id}`), {
      method: 'DELETE',
    })
    if (!res.ok) {
      setError(await res.text())
      return
    }
    await refresh()
  }

  const uploadVariation = async (
    e: FormEvent<HTMLFormElement>,
    categoryId: string,
  ) => {
    e.preventDefault()
    const form = e.currentTarget
    const fd = new FormData(form)
    const file = fd.get('file')
    if (!(file instanceof File) || file.size === 0) {
      setError('Choose an image file')
      return
    }
    const label = String(fd.get('label') ?? '').trim()
    if (!label) {
      setError('Label is required')
      return
    }
    setError(null)
    const upload = new FormData()
    upload.append('file', file)
    upload.append('categoryId', categoryId)
    upload.append('label', label)
    const sort = fd.get('sortOrder')
    if (sort) upload.append('sortOrder', String(sort))
    const res = await fetch(apiUrl('/api/admin/character/variations'), {
      method: 'POST',
      body: upload,
    })
    if (!res.ok) {
      setError(await res.text())
      return
    }
    form.reset()
    showMsg('Variation uploaded')
    await refresh()
  }

  const deleteVariation = async (id: string) => {
    if (!confirm('Delete this variation?')) return
    setError(null)
    const res = await fetch(apiUrl(`/api/admin/character/variations/${id}`), {
      method: 'DELETE',
    })
    if (!res.ok) {
      setError(await res.text())
      return
    }
    await refresh()
  }

  const setDefaultVariation = async (id: string) => {
    setError(null)
    const res = await fetch(apiUrl(`/api/admin/character/variations/${id}`), {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isDefault: true }),
    })
    if (!res.ok) {
      setError(await res.text())
      return
    }
    showMsg('Default variation updated')
    await refresh()
  }

  const openEditVariation = (item: {
    id: string
    label: string
    sortOrder: number
    imagePath: string
  }) => {
    setEditVariationImageFile(null)
    setEditVariationImagePreviewUrl(null)
    setEditVariation({
      id: item.id,
      label: item.label,
      sortOrder: item.sortOrder,
      imagePath: item.imagePath,
    })
  }

  const closeEditVariation = () => {
    setEditVariationImageFile(null)
    setEditVariationImagePreviewUrl(null)
    setEditVariation(null)
  }

  const saveVariationMeta = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!editVariation) return
    const nextLabel = editVariation.label.trim()
    if (!nextLabel) {
      setError('Label is required')
      return
    }
    setError(null)
    const body = new FormData()
    body.append('label', nextLabel)
    body.append('sortOrder', String(Number(editVariation.sortOrder)))
    if (editVariationImageFile) body.append('file', editVariationImageFile)
    const res = await fetch(apiUrl(`/api/admin/character/variations/${editVariation.id}`), {
      method: 'PATCH',
      body,
    })
    if (!res.ok) {
      setError(await res.text())
      return
    }
    await refresh()
    showMsg('Variation updated')
    closeEditVariation()
  }

  const uploadBackgroundImage = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const fd = new FormData(form)
    const file = fd.get('file')
    if (!(file instanceof File) || file.size === 0) {
      setError('Choose an image file')
      return
    }
    const label = String(fd.get('label') ?? '').trim()
    if (!label) {
      setError('Label is required')
      return
    }
    setError(null)
    const upload = new FormData()
    upload.append('file', file)
    upload.append('label', label)
    const res = await fetch(apiUrl('/api/admin/background/upload'), {
      method: 'POST',
      body: upload,
    })
    if (!res.ok) {
      setError(await res.text())
      return
    }
    form.reset()
    setImageModalOpen(false)
    showMsg('Background image uploaded')
    await refresh()
  }

  const uploadThoughtBubble = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (thoughtBubbleFiles.length === 0) {
      setError('Choose one or more image files')
      return
    }
    setError(null)
    for (const file of thoughtBubbleFiles) {
      const upload = new FormData()
      upload.append('file', file)
      const res = await fetch(apiUrl('/api/admin/thought-bubbles/upload'), {
        method: 'POST',
        body: upload,
      })
      if (!res.ok) {
        setError(await res.text())
        return
      }
    }
    setThoughtBubbleFiles([])
    setBubbleModalOpen(false)
    showMsg(
      thoughtBubbleFiles.length === 1
        ? 'Thought bubble uploaded'
        : `${thoughtBubbleFiles.length} thought bubbles uploaded`,
    )
    await refresh()
  }

  const uploadProp = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!propFile) {
      setError('Choose an image file')
      return
    }
    if (!propCategory.trim()) {
      setError('Choose a category')
      return
    }
    setError(null)
    const upload = new FormData()
    upload.append('file', propFile)
    upload.append('category', propCategory.trim().toLowerCase())
    const res = await fetch(apiUrl('/api/admin/elements/upload'), {
      method: 'POST',
      body: upload,
    })
    if (!res.ok) {
      setError(await res.text())
      return
    }
    setPropFile(null)
    setPropModalOpen(false)
    showMsg('Prop uploaded')
    await refresh()
  }

  const deleteProp = async (id: string) => {
    if (!confirm('Delete this prop image?')) return
    setError(null)
    const res = await fetch(apiUrl(`/api/admin/elements/${id}`), {
      method: 'DELETE',
    })
    if (!res.ok) {
      setError(await res.text())
      return
    }
    await refresh()
  }

  const addElementCategory = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const name = newElementCategory.trim().toLowerCase()
    if (!name) return
    setError(null)
    const res = await fetch(apiUrl('/api/admin/elements/categories'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    })
    if (!res.ok) {
      setError(await res.text())
      return
    }
    setNewElementCategory('')
    await refresh()
  }

  const deleteElementCategory = async (id: string) => {
    if (!confirm('Delete this element category and its elements?')) return
    setError(null)
    const res = await fetch(apiUrl(`/api/admin/elements/categories/${id}`), {
      method: 'DELETE',
    })
    if (!res.ok) {
      setError(await res.text())
      return
    }
    await refresh()
  }

  const editElementCategory = async (id: string, currentName: string) => {
    const nextName = prompt('Edit element category', currentName)?.trim().toLowerCase()
    if (!nextName || nextName === currentName) return
    setError(null)
    const res = await fetch(apiUrl(`/api/admin/elements/categories/${id}`), {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: nextName }),
    })
    if (!res.ok) {
      setError(await res.text())
      return
    }
    showMsg('Element category updated')
    await refresh()
  }

  const openAddElementForCategory = (category: string) => {
    setPropCategory(category)
    setPropFile(null)
    setPropModalOpen(true)
  }

  const uploadShapes = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (shapeFiles.length === 0) {
      setError('Choose one or more shape images')
      return
    }
    setError(null)
    for (const file of shapeFiles) {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch(apiUrl('/api/admin/shapes/upload'), {
        method: 'POST',
        body: fd,
      })
      if (!res.ok) {
        setError(await res.text())
        return
      }
    }
    setShapeFiles([])
    setShapeModalOpen(false)
    showMsg(
      shapeFiles.length === 1
        ? 'Shape uploaded'
        : `${shapeFiles.length} shapes uploaded`,
    )
    await refresh()
  }

  const deleteShape = async (id: string) => {
    if (!confirm('Delete this shape image?')) return
    setError(null)
    const res = await fetch(apiUrl(`/api/admin/shapes/${id}`), {
      method: 'DELETE',
    })
    if (!res.ok) {
      setError(await res.text())
      return
    }
    await refresh()
  }

  const addBgColor = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const fd = new FormData(form)
    const label = String(fd.get('label') ?? '').trim()
    const value = String(fd.get('value') ?? '').trim()
    if (!label) {
      setError('Label is required')
      return
    }
    if (!value) {
      setError('Color value is required')
      return
    }
    setError(null)
    const res = await fetch(apiUrl('/api/admin/background/items'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        kind: 'color',
        label,
        value,
      }),
    })
    if (!res.ok) {
      setError(await res.text())
      return
    }
    form.reset()
    setColorModalOpen(false)
    showMsg('Color added')
    await refresh()
  }

  const saveEditBackground = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!editBg) return
    const form = e.currentTarget
    const fd = new FormData(form)
    const label = String(fd.get('label') ?? '').trim()
    if (!label) {
      setError('Label is required')
      return
    }
    setError(null)

    if (editBg.kind === 'image') {
      const fileField = fd.get('file')
      const hasNewFile =
        fileField instanceof File && fileField.size > 0
      if (hasNewFile) {
        const uploadFd = new FormData()
        uploadFd.append('file', fileField)
        uploadFd.append('label', label)
        const res = await fetch(
          apiUrl(`/api/admin/background/items/${editBg._id}/image`),
          { method: 'PATCH', body: uploadFd },
        )
        if (!res.ok) {
          setError(await res.text())
          return
        }
        setEditBg(null)
        showMsg('Background updated')
        await refresh()
        return
      }
    }

    const body: { label: string; value?: string } = { label }
    if (editBg.kind === 'color') {
      const value = String(fd.get('value') ?? '').trim()
      if (!value) {
        setError('Color value is required')
        return
      }
      body.value = value
    }
    if (editBg.kind === 'gradient') {
      const value = String(fd.get('value') ?? '').trim()
      if (!value) {
        setError('Gradient CSS is required')
        return
      }
      body.value = value
    }
    const res = await fetch(apiUrl(`/api/admin/background/items/${editBg._id}`), {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    if (!res.ok) {
      setError(await res.text())
      return
    }
    setEditBg(null)
    showMsg('Background updated')
    await refresh()
  }

  const deleteBackground = async (id: string) => {
    if (!confirm('Delete this background?')) return
    setError(null)
    const res = await fetch(apiUrl(`/api/admin/background/items/${id}`), {
      method: 'DELETE',
    })
    if (!res.ok) {
      setError(await res.text())
      return
    }
    await refresh()
  }

  const deleteThoughtBubble = async (id: string) => {
    if (!confirm('Delete this thought bubble?')) return
    setError(null)
    const res = await fetch(apiUrl(`/api/admin/thought-bubbles/${id}`), {
      method: 'DELETE',
    })
    if (!res.ok) {
      setError(await res.text())
      return
    }
    await refresh()
  }

  const saveEditThoughtBubble = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!editThoughtBubble) return
    const form = e.currentTarget
    const fd = new FormData(form)
    const label = String(fd.get('label') ?? '').trim()
    if (!label) {
      setError('Label is required')
      return
    }
    setError(null)
    const res = await fetch(
      apiUrl(`/api/admin/thought-bubbles/${editThoughtBubble._id}`),
      {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ label }),
      },
    )
    if (!res.ok) {
      setError(await res.text())
      return
    }
    setEditThoughtBubble(null)
    showMsg('Thought bubble updated')
    await refresh()
  }

  const addAdminGradient = async (label: string, value: string) => {
    setError(null)
    setSavingGradient(true)
    try {
      const res = await fetch(apiUrl('/api/admin/background/items'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          kind: 'gradient',
          label,
          value,
        }),
      })
      if (!res.ok) {
        setError(await res.text())
        return
      }
      setGradientModalOpen(false)
      setGradientFormKey((k) => k + 1)
      showMsg('Gradient added')
      await refresh()
    } finally {
      setSavingGradient(false)
    }
  }

  const sortedCharacterCategories = useMemo(
    () => categories.slice().sort((a, b) => a.layerOrder - b.layerOrder),
    [categories],
  )

  const activeCharacterCategory = useMemo(
    () =>
      sortedCharacterCategories.find((c) => c._id === activeCharacterCategoryId) ?? null,
    [sortedCharacterCategories, activeCharacterCategoryId],
  )

  const activeCharacterVariations = useMemo(() => {
    if (!activeCharacterCategory) return []
    const cat = catalog.find((c) => c.id === activeCharacterCategory._id)
    return cat?.variations ?? []
  }, [catalog, activeCharacterCategory])

  const characterTotalPages = useMemo(
    () => Math.max(1, Math.ceil(activeCharacterVariations.length / characterPageSize)),
    [activeCharacterVariations.length, characterPageSize],
  )

  const pagedCharacterVariations = useMemo(() => {
    const start = (characterPage - 1) * characterPageSize
    return activeCharacterVariations.slice(start, start + characterPageSize)
  }, [activeCharacterVariations, characterPage, characterPageSize])

  useEffect(() => {
    setCharacterPage(1)
  }, [activeCharacterCategoryId])

  useEffect(() => {
    if (characterPage > characterTotalPages) {
      setCharacterPage(characterTotalPages)
    }
  }, [characterPage, characterTotalPages])

  const openCharacterVariationModal = () => {
    if (!activeCharacterCategory) {
      setError('Create or select a character category first')
      return
    }
    const nextIndex = activeCharacterVariations.length + 1
    setCharacterLabel(`${activeCharacterCategory.name.toLowerCase()} ${nextIndex}`)
    setCharacterFiles([])
    setCharacterUploadBusy(false)
    setCharacterUploadIndex(null)
    setCharacterUploadDone([])
    setCharacterUploadFailed([])
    setError(null)
    setCharacterModalOpen(true)
  }

  const uploadCharacterVariation = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!activeCharacterCategory) {
      setError('Choose a character category')
      return
    }
    if (characterFiles.length === 0) {
      setError('Choose at least one image file')
      return
    }
    const label = characterLabel.trim()
    setError(null)
    setCharacterUploadBusy(true)
    setCharacterUploadIndex(null)
    setCharacterUploadDone([])
    setCharacterUploadFailed([])

    for (const [index, file] of characterFiles.entries()) {
      setCharacterUploadIndex(index)
      const generatedLabel =
        label ||
        file.name.replace(/\.[^/.]+$/, '') ||
        `${activeCharacterCategory.name.toLowerCase()} ${activeCharacterVariations.length + index + 1}`
      const variationLabel =
        characterFiles.length > 1 && label ? `${label} ${index + 1}` : generatedLabel
      const fd = new FormData()
      fd.append('file', file)
      fd.append('categoryId', activeCharacterCategory._id)
      fd.append('label', variationLabel)
      fd.append('sortOrder', String(activeCharacterVariations.length + index + 1))
      const res = await fetch(apiUrl('/api/admin/character/variations'), {
        method: 'POST',
        body: fd,
      })
      if (!res.ok) {
        setCharacterUploadFailed((prev) => [...prev, index])
        setCharacterUploadBusy(false)
        setCharacterUploadIndex(null)
        setError(`${file.name}: ${await res.text()}`)
        return
      }
      setCharacterUploadDone((prev) => [...prev, index])
    }
    setCharacterUploadBusy(false)
    setCharacterUploadIndex(null)
    setCharacterModalOpen(false)
    setCharacterFiles([])
    setCharacterLabel('')
    setCharacterUploadDone([])
    setCharacterUploadFailed([])
    showMsg(
      characterFiles.length === 1
        ? 'Character element added'
        : `${characterFiles.length} character elements added`,
    )
    await refresh()
  }

  const addCharacterCategory = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const name = newName.trim()
    if (!name) {
      setError('Category name is required')
      return
    }
    setError(null)
    const fd = new FormData()
    fd.append('name', name)
    fd.append('layerOrder', String(Number(newLayer)))
    if (newCharacterCategoryIconTooltip.trim()) {
      fd.append('iconTooltip', newCharacterCategoryIconTooltip.trim())
    }
    if (newCharacterCategoryIcon) {
      fd.append('icon', newCharacterCategoryIcon)
    }
    const res = await fetch(apiUrl('/api/admin/character/categories'), {
      method: 'POST',
      body: fd,
    })
    if (!res.ok) {
      setError(await res.text())
      return
    }
    setCharacterCategoryModalOpen(false)
    setNewName('')
    setNewLayer(100)
    setNewCharacterCategoryIcon(null)
    setNewCharacterCategoryIconTooltip('')
    showMsg('Character category added')
    await refresh()
  }

  const mediaList = useMemo(() => {
    const kind: BackgroundKind =
      bgSubTab === 'images'
        ? 'image'
        : bgSubTab === 'colors'
          ? 'color'
          : 'gradient'
    return bgRows
      .filter((r) => {
        if (r.kind !== kind) return false
        if (bgSubTab === 'images') return !isSvgPath(r.value)
        return true
      })
      .slice()
      .sort((a, b) => {
        const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0
        const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0
        if (ta !== tb) return ta - tb
        return a.label.localeCompare(b.label)
      })
  }, [bgRows, bgSubTab])

  const sortedThoughtBubbles = useMemo(
    () =>
      thoughtBubbleRows.slice().sort((a, b) => {
        const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0
        const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0
        if (ta !== tb) return ta - tb
        return a.label.localeCompare(b.label)
      }),
    [thoughtBubbleRows],
  )

  const elementCategoryRows = useMemo(() => {
    const counts = new Map(
      elementCategoryCounts.map((x) => [x.name.trim().toLowerCase(), x.count]),
    )
    const q = elementCategoryQuery.trim().toLowerCase()
    const rows = elementCategories.map((c) => ({
      ...c,
      elementCount: counts.get(c.name.trim().toLowerCase()) ?? 0,
    }))
    const filtered = q
      ? rows.filter((c) => c.name.toLowerCase().includes(q))
      : rows
    return filtered.sort((a, b) => {
      if (b.elementCount !== a.elementCount) return b.elementCount - a.elementCount
      return a.name.localeCompare(b.name)
    })
  }, [elementCategories, elementCategoryCounts, elementCategoryQuery])

  const variationCount = useMemo(
    () => catalog.reduce((n, c) => n + c.variations.length, 0),
    [catalog],
  )

  const tabs: {
    id: AdminTab
    label: string
    Icon: () => ReactElement
  }[] = [
    {
      id: 'backgrounds',
      label: 'Backgrounds',
      Icon: IconBackgrounds,
    },
    {
      id: 'thoughtBubbles',
      label: 'Thought bubbles',
      Icon: IconThoughtBubbles,
    },
    {
      id: 'elements',
      label: 'Elements',
      Icon: IconElements,
    },
    {
      id: 'elementCategories',
      label: 'Element categories',
      Icon: IconCategories,
    },
    {
      id: 'shapes',
      label: 'Shapes',
      Icon: IconLayers,
    },
    {
      id: 'character',
      label: 'Character',
      Icon: IconCharacter,
    },
    {
      id: 'categories',
      label: 'Categories',
      Icon: IconCategories,
    },
    {
      id: 'layers',
      label: 'Layer images',
      Icon: IconLayers,
    },
  ]
  const isForcedAdminPage = Boolean(forcedTab)

  const pageCopy: Record<
    AdminTab,
    { title: string; lede: string; cta: string; ctaHash: string }
  > = {
    backgrounds: {
      title: 'Backgrounds',
      lede: 'Background images, solid colors, and gradients for the book builder Page background picker.',
      cta: 'Add',
      ctaHash: '#',
    },
    thoughtBubbles: {
      title: 'Thought bubbles',
      lede: 'Image library for the book builder thought-bubble tool (separate from page backgrounds).',
      cta: 'Add thought bubble',
      ctaHash: '#',
    },
    elements: {
      title: 'Elements',
      lede: 'Image elements library grouped by category (cars, nature, things, and more).',
      cta: 'Add element',
      ctaHash: '#',
    },
    elementCategories: {
      title: 'Element categories',
      lede: 'Create and manage categories used by the elements library.',
      cta: 'New category',
      ctaHash: '#admin-new-element-category',
    },
    shapes: {
      title: 'Shapes',
      lede: 'Basic shapes plus custom shape image library.',
      cta: 'Add shape',
      ctaHash: '#',
    },
    character: {
      title: 'Character',
      lede: 'Manage character asset groups for body parts and clothing layers.',
      cta: 'Manage character',
      ctaHash: '#',
    },
    categories: {
      title: 'Categories',
      lede: 'Define character parts and stack order. Lower numbers render behind.',
      cta: 'New category',
      ctaHash: '#admin-new-category',
    },
    layers: {
      title: 'Layer images',
      lede: 'Upload transparent PNGs or SVGs for each category.',
      cta: 'Jump to uploads',
      ctaHash: '#admin-layer-uploads',
    },
  }

  const copy = pageCopy[activeTab]

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar" aria-label="Admin navigation">
        <div className="admin-sidebar__brand">
          <span className="admin-sidebar__logo">iFuntology</span>
          <span className="admin-sidebar__subtitle">Admin portal</span>
        </div>

        <p className="admin-sidebar__section-label">Book pages</p>
        <nav
          className="admin-sidebar__nav"
          role="tablist"
          aria-orientation="vertical"
        >
          {tabs
            .filter(
              (t) =>
                t.id === 'backgrounds' ||
                t.id === 'thoughtBubbles' ||
                t.id === 'elements' ||
                t.id === 'elementCategories' ||
                t.id === 'shapes' ||
                t.id === 'character',
            )
            .map((t) => {
              const Icon = t.Icon
              return (
                <button
                  key={t.id}
                  type="button"
                  role="tab"
                  id={`admin-tab-${t.id}`}
                  aria-selected={activeTab === t.id}
                  aria-controls={`admin-panel-${t.id}`}
                  className={
                    'admin-sidebar__tab' +
                    (activeTab === t.id ? ' admin-sidebar__tab--active' : '')
                  }
                  onClick={() => {
                    if (!isForcedAdminPage) {
                      setActiveTab(t.id)
                      return
                    }
                    if (t.id === 'backgrounds') {
                      navigate('/admin/backgrounds')
                      return
                    }
                    if (t.id === 'thoughtBubbles') {
                      navigate('/admin/thought-bubbles')
                      return
                    }
                    if (t.id === 'elements') {
                      navigate('/admin/elements')
                      return
                    }
                    if (t.id === 'elementCategories') {
                      navigate('/admin/element-categories')
                      return
                    }
                    if (t.id === 'shapes') {
                      navigate('/admin/shapes')
                      return
                    }
                    if (t.id === 'character') {
                      navigate('/admin/character')
                    }
                  }}
                >
                  <span className="admin-sidebar__tab-icon">
                    <Icon />
                  </span>
                  <span className="admin-sidebar__tab-label">{t.label}</span>
                </button>
              )
            })}
        </nav>

        {!isForcedAdminPage ? (
          <>
            <p className="admin-sidebar__section-label">Character</p>
            <nav
              className="admin-sidebar__nav"
              role="tablist"
              aria-orientation="vertical"
            >
              {tabs
                .filter((t) => t.id !== 'backgrounds' && t.id !== 'thoughtBubbles')
                .map((t) => {
                  const Icon = t.Icon
                  return (
                    <button
                      key={t.id}
                      type="button"
                      role="tab"
                      id={`admin-tab-${t.id}`}
                      aria-selected={activeTab === t.id}
                      aria-controls={`admin-panel-${t.id}`}
                      className={
                        'admin-sidebar__tab' +
                        (activeTab === t.id ? ' admin-sidebar__tab--active' : '')
                      }
                      onClick={() => setActiveTab(t.id)}
                    >
                      <span className="admin-sidebar__tab-icon">
                        <Icon />
                      </span>
                      <span className="admin-sidebar__tab-label">{t.label}</span>
                    </button>
                  )
                })}
            </nav>
          </>
        ) : null}

        <div className="admin-sidebar__footer">
          <Link to="/builder" className="admin-sidebar__builder">
            <span className="admin-sidebar__tab-icon">
              <IconBook />
            </span>
            <span>Write to read</span>
          </Link>
        </div>
      </aside>

      <div className="admin-workspace">
        <header className="admin-topbar">
          <div className="admin-topbar__spacer" aria-hidden />
          <div className="admin-topbar__right">
            <button
              type="button"
              className="admin-topbar__icon-btn"
              aria-label="Notifications"
            >
              <IconBell />
              <span className="admin-topbar__notify-dot" aria-hidden />
            </button>
            <div className="admin-topbar__user">
              <span className="admin-topbar__avatar" aria-hidden>
                A
              </span>
              <div className="admin-topbar__user-text">
                <span className="admin-topbar__greeting">Hi, Admin</span>
                <span className="admin-topbar__role">Admin</span>
              </div>
            </div>
            <Link to="/" className="admin-topbar__logout">
              <IconLogout />
              Logout
            </Link>
          </div>
        </header>

        <main
          className={
            'admin-main' +
            (activeTab === 'backgrounds' ||
            activeTab === 'thoughtBubbles' ||
            activeTab === 'shapes'
              ? ' admin-main--wide'
              : '')
          }
        >
          <div className="admin-page-head">
            <div className="admin-page-head__text">
              <h1 className="admin-main__title">{copy.title}</h1>
              <p className="admin-main__lede">{copy.lede}</p>
            </div>
            {activeTab === 'backgrounds' ||
            activeTab === 'thoughtBubbles' ||
            activeTab === 'elements' ||
            activeTab === 'shapes' ||
            activeTab === 'character' ? (
              <button
                type="button"
                className="admin-btn-primary admin-btn-primary--blue"
                onClick={() => {
                  if (activeTab === 'thoughtBubbles') {
                    setThoughtBubbleFiles([])
                    setBubbleModalOpen(true)
                  } else if (activeTab === 'elements') {
                    setPropFile(null)
                    setPropModalOpen(true)
                  } else if (activeTab === 'shapes') {
                    setShapeFiles([])
                    setShapeModalOpen(true)
                  } else if (activeTab === 'character') {
                    openCharacterVariationModal()
                  } else if (bgSubTab === 'images') setImageModalOpen(true)
                  else if (bgSubTab === 'colors') setColorModalOpen(true)
                  else {
                    setError(null)
                    setGradientFormKey((k) => k + 1)
                    setGradientModalOpen(true)
                  }
                }}
              >
                <IconPlus />
                {activeTab === 'thoughtBubbles'
                  ? 'Add thought bubble'
                  : activeTab === 'elements'
                    ? 'Add element image'
                    : activeTab === 'shapes'
                      ? 'Add shape image'
                    : activeTab === 'character'
                      ? activeCharacterCategory
                        ? `Add ${activeCharacterCategory.name.toLowerCase()}`
                        : 'Add character element'
                  : bgSubTab === 'images'
                  ? 'Add image'
                  : bgSubTab === 'colors'
                    ? 'Add color'
                    : 'Add gradient'}
              </button>
            ) : (
              <a href={copy.ctaHash} className="admin-btn-primary">
                <IconPlus />
                {copy.cta}
              </a>
            )}
          </div>

          {message && <p className="admin-flash admin-flash--ok">{message}</p>}
          {error && <p className="admin-flash admin-flash--err">{error}</p>}

        <div
          id="admin-panel-backgrounds"
          role="tabpanel"
          aria-labelledby="admin-tab-backgrounds"
          hidden={activeTab !== 'backgrounds'}
          className="admin-panel"
        >
          {activeTab === 'backgrounds' && (
            <>
              <div className="admin-content-card admin-content-card--media">
                <div
                  className="admin-media-subtabs"
                  role="tablist"
                  aria-label="Background type"
                >
                  <button
                    type="button"
                    role="tab"
                    aria-selected={bgSubTab === 'images'}
                    className={
                      'admin-media-subtab' +
                      (bgSubTab === 'images'
                        ? ' admin-media-subtab--active'
                        : '')
                    }
                    onClick={() => setBgSubTab('images')}
                  >
                    Images
                  </button>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={bgSubTab === 'colors'}
                    className={
                      'admin-media-subtab' +
                      (bgSubTab === 'colors'
                        ? ' admin-media-subtab--active'
                        : '')
                    }
                    onClick={() => setBgSubTab('colors')}
                  >
                    Colors
                  </button>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={bgSubTab === 'gradients'}
                    className={
                      'admin-media-subtab' +
                      (bgSubTab === 'gradients'
                        ? ' admin-media-subtab--active'
                        : '')
                    }
                    onClick={() => setBgSubTab('gradients')}
                  >
                    Gradients
                  </button>
                </div>

                {mediaList.length === 0 ? (
                  <div
                    className="admin-media-empty-card"
                    role="status"
                    aria-live="polite"
                  >
                    <div className="admin-media-empty-card__icon" aria-hidden>
                      <IconEmptyBackgrounds kind={bgSubTab} />
                    </div>
                    <p className="admin-media-empty-card__title">
                      {bgSubTab === 'images'
                        ? 'No backgrounds yet'
                        : bgSubTab === 'colors'
                          ? 'No colors yet'
                          : 'No gradients yet'}
                    </p>
                    <p className="admin-media-empty-card__text">
                      {bgSubTab === 'images'
                        ? 'Uploads show up in the book builder when you open Page background.'
                        : bgSubTab === 'colors'
                          ? 'Hex swatches show up there too, under the Colors tab.'
                          : 'Gradients appear in the builder under the Gradients tab.'}
                    </p>
                    <p className="admin-media-empty-card__hint">
                      {bgSubTab === 'images'
                        ? 'Add image above to upload your first file.'
                        : bgSubTab === 'colors'
                          ? 'Add color above to save your first swatch.'
                          : 'Add gradient above to create your first preset.'}
                    </p>
                  </div>
                ) : (
                  <ul
                    className="admin-media-grid"
                    role="list"
                    aria-label={
                      bgSubTab === 'images'
                        ? 'Images'
                        : bgSubTab === 'colors'
                          ? 'Colors'
                          : 'Gradients'
                    }
                  >
                    {mediaList.map((b) => (
                      <li key={b._id} className="admin-media-tile">
                        <div className="admin-media-tile__frame admin-media-tile__frame--portrait">
                          {b.kind === 'image' && (
                            <img
                              src={assetUrl(b.value)}
                              alt=""
                              className="admin-media-tile__img"
                              loading="lazy"
                            />
                          )}
                          {b.kind === 'color' && (
                            <div
                              className="admin-media-tile__img admin-media-tile__img--color"
                              style={{ background: b.value }}
                            />
                          )}
                          {b.kind === 'gradient' && (
                            <div
                              className="admin-media-tile__img admin-media-tile__img--color"
                              style={{ background: b.value }}
                            />
                          )}
                          <div className="admin-media-tile__overlay">
                            <div className="admin-media-tile__overlay-actions">
                              <button
                                type="button"
                                className="admin-media-tile__edit"
                                onClick={() => setEditBg(b)}
                                title="Edit name"
                                aria-label={`Edit ${b.label}`}
                              >
                                <IconPencil />
                              </button>
                              <button
                                type="button"
                                className="admin-media-tile__delete"
                                onClick={() => deleteBackground(b._id)}
                                title="Delete"
                                aria-label={`Delete ${b.label}`}
                              >
                                <IconTrash />
                              </button>
                            </div>
                          </div>
                        </div>
                        <p className="admin-media-tile__caption">{b.label}</p>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {imageModalOpen && (
                <div className="admin-modal-root" role="presentation">
                  <button
                    type="button"
                    className="admin-modal-backdrop"
                    aria-label="Close dialog"
                    onClick={() => setImageModalOpen(false)}
                  />
                  <div
                    className="admin-modal"
                    role="dialog"
                    aria-modal
                    aria-labelledby="admin-image-modal-title"
                  >
                    <div className="admin-modal__head">
                      <h2 id="admin-image-modal-title" className="admin-modal__title">
                        Add image
                      </h2>
                      <button
                        type="button"
                        className="admin-modal__close"
                        aria-label="Close"
                        onClick={() => setImageModalOpen(false)}
                      >
                        ×
                      </button>
                    </div>
                    <form
                      className="admin-modal__form"
                      onSubmit={uploadBackgroundImage}
                    >
                      <label className="admin-modal__label">
                        Label
                        <input
                          name="label"
                          placeholder="e.g. Sky & clouds"
                          required
                          autoFocus
                        />
                      </label>
                      <label className="admin-modal__label">
                        File
                        <input
                          name="file"
                          type="file"
                          accept="image/*"
                          required
                        />
                      </label>
                      <div className="admin-modal__actions">
                        <button
                          type="button"
                          className="admin-modal__btn admin-modal__btn--ghost"
                          onClick={() => setImageModalOpen(false)}
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="admin-modal__btn admin-modal__btn--primary"
                        >
                          Upload
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {colorModalOpen && (
                <div className="admin-modal-root" role="presentation">
                  <button
                    type="button"
                    className="admin-modal-backdrop"
                    aria-label="Close dialog"
                    onClick={() => setColorModalOpen(false)}
                  />
                  <div
                    className="admin-modal"
                    role="dialog"
                    aria-modal
                    aria-labelledby="admin-color-modal-title"
                  >
                    <div className="admin-modal__head">
                      <h2 id="admin-color-modal-title" className="admin-modal__title">
                        Add color
                      </h2>
                      <button
                        type="button"
                        className="admin-modal__close"
                        aria-label="Close"
                        onClick={() => setColorModalOpen(false)}
                      >
                        ×
                      </button>
                    </div>
                    <form
                      className="admin-modal__form"
                      onSubmit={addBgColor}
                    >
                      <label className="admin-modal__label">
                        Label
                        <input
                          name="label"
                          placeholder="e.g. Cream"
                          required
                          autoFocus
                        />
                      </label>
                      <label className="admin-modal__label">
                        Hex / CSS color
                        <input
                          name="value"
                          type="text"
                          placeholder="#faf9e8"
                          defaultValue="#faf9e8"
                          required
                        />
                      </label>
                      <div className="admin-modal__actions">
                        <button
                          type="button"
                          className="admin-modal__btn admin-modal__btn--ghost"
                          onClick={() => setColorModalOpen(false)}
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="admin-modal__btn admin-modal__btn--primary"
                        >
                          Save
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {gradientModalOpen && (
                <div className="admin-modal-root" role="presentation">
                  <button
                    type="button"
                    className="admin-modal-backdrop"
                    aria-label="Close dialog"
                    onClick={() => {
                      if (!savingGradient) setGradientModalOpen(false)
                    }}
                  />
                  <div
                    className="admin-modal admin-modal--wide"
                    role="dialog"
                    aria-modal
                    aria-labelledby="admin-gradient-modal-title"
                  >
                    <div className="admin-modal__head">
                      <h2
                        id="admin-gradient-modal-title"
                        className="admin-modal__title"
                      >
                        Add gradient
                      </h2>
                      <button
                        type="button"
                        className="admin-modal__close"
                        aria-label="Close"
                        disabled={savingGradient}
                        onClick={() => setGradientModalOpen(false)}
                      >
                        ×
                      </button>
                    </div>
                    <GradientLibraryForm
                      key={gradientFormKey}
                      disabled={savingGradient}
                      submitLabel="Save"
                      savingLabel="Saving…"
                      onCancel={() => {
                        if (!savingGradient) setGradientModalOpen(false)
                      }}
                      onValidationError={setError}
                      onAdd={addAdminGradient}
                    />
                  </div>
                </div>
              )}

              {editBg && (
                <div className="admin-modal-root" role="presentation">
                  <button
                    type="button"
                    className="admin-modal-backdrop"
                    aria-label="Close dialog"
                    onClick={() => setEditBg(null)}
                  />
                  <div
                    className={
                      'admin-modal' +
                      (editBg.kind === 'gradient' ? ' admin-modal--wide' : '')
                    }
                    role="dialog"
                    aria-modal
                    aria-labelledby="admin-edit-bg-title"
                  >
                    <div className="admin-modal__head">
                      <h2 id="admin-edit-bg-title" className="admin-modal__title">
                        {editBg.kind === 'color'
                          ? 'Edit color'
                          : editBg.kind === 'gradient'
                            ? 'Edit gradient'
                            : 'Edit background'}
                      </h2>
                      <button
                        type="button"
                        className="admin-modal__close"
                        aria-label="Close"
                        onClick={() => setEditBg(null)}
                      >
                        ×
                      </button>
                    </div>
                    <form
                      key={editBg._id}
                      className="admin-modal__form"
                      onSubmit={saveEditBackground}
                    >
                      <label className="admin-modal__label">
                        Name
                        <input
                          name="label"
                          defaultValue={editBg.label}
                          placeholder="e.g. Sky & clouds"
                          required
                          autoFocus
                        />
                      </label>
                      {editBg.kind === 'image' ? (
                        <label className="admin-modal__label">
                          Replace image
                          <input
                            name="file"
                            type="file"
                            accept="image/*"
                          />
                          <span className="admin-modal__hint">
                            Optional — leave empty to keep the current file.
                          </span>
                        </label>
                      ) : null}
                      {editBg.kind === 'color' ? (
                        <label className="admin-modal__label">
                          Hex / CSS color
                          <input
                            name="value"
                            type="text"
                            defaultValue={editBg.value}
                            placeholder="#faf9e8"
                            required
                          />
                        </label>
                      ) : null}
                      {editBg.kind === 'gradient' ? (
                        <label className="admin-modal__label">
                          CSS gradient
                          <textarea
                            name="value"
                            className="admin-modal__textarea"
                            defaultValue={editBg.value}
                            placeholder="linear-gradient(180deg, #e0f2fe 0%, #ffffff 100%)"
                            rows={4}
                            required
                          />
                        </label>
                      ) : null}
                      <div className="admin-modal__actions">
                        <button
                          type="button"
                          className="admin-modal__btn admin-modal__btn--ghost"
                          onClick={() => setEditBg(null)}
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="admin-modal__btn admin-modal__btn--primary"
                        >
                          Save
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {!isForcedAdminPage ? (
        <div
          id="admin-panel-categories"
          role="tabpanel"
          aria-labelledby="admin-tab-categories"
          hidden={activeTab !== 'categories'}
          className="admin-panel"
        >
          {activeTab === 'categories' && (
            <>
              <div className="admin-metrics" aria-label="Category summary">
                <div className="admin-metric-card">
                  <span className="admin-metric-card__label">Categories</span>
                  <span className="admin-metric-card__value">
                    {categories.length}
                  </span>
                </div>
                <div className="admin-metric-card">
                  <span className="admin-metric-card__label">Variations</span>
                  <span className="admin-metric-card__value">
                    {variationCount}
                  </span>
                </div>
              </div>

              <div className="admin-content-card">
                <div id="admin-new-category" className="admin-add-block">
                  <h2 className="admin-section__title">New category</h2>
                  <form
                    className="admin-form admin-form--light"
                    onSubmit={addCategory}
                  >
                    <label>
                      Name
                      <input
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        required
                      />
                    </label>
                    <label>
                      Layer order
                      <input
                        type="number"
                        value={newLayer}
                        onChange={(e) => setNewLayer(Number(e.target.value))}
                        required
                      />
                    </label>
                    <button type="submit">Add category</button>
                  </form>
                </div>

                <div className="admin-library-block">
                  <h2 className="admin-section__title">All categories</h2>
                  <div className="admin-table-wrap admin-table-wrap--light">
                    <table className="admin-table admin-table--light">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Slug</th>
                        <th>Layer order</th>
                        <th>Images</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {categories
                        .slice()
                        .sort((a, b) => a.layerOrder - b.layerOrder)
                        .map((c) => {
                          const n =
                            catalog.find((x) => x.id === c._id)?.variations
                              .length ?? 0
                          return (
                            <tr key={c._id}>
                              <td>
                                <strong>{c.name}</strong>
                              </td>
                              <td>
                                <code className="admin-mono">{c.slug}</code>
                              </td>
                              <td>
                                <input
                                  type="number"
                                  className="admin-table__num"
                                  defaultValue={c.layerOrder}
                                  onBlur={(e) =>
                                    updateLayer(c._id, Number(e.target.value))
                                  }
                                  aria-label={`Layer order for ${c.name}`}
                                />
                              </td>
                              <td>{n}</td>
                              <td>
                                <button
                                  type="button"
                                  className="admin-btn-muted"
                                  onClick={() => openEditCategoryModal(c)}
                                  style={{ marginRight: '0.4rem' }}
                                >
                                  Edit
                                </button>
                                <button
                                  type="button"
                                  className="admin-danger"
                                  onClick={() => deleteCategory(c._id)}
                                >
                                  Delete
                                </button>
                              </td>
                            </tr>
                          )
                        })}
                    </tbody>
                  </table>
                </div>
                  {categories.length === 0 && (
                    <p className="admin-empty">
                      No categories yet. Add one above.
                    </p>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
        ) : null}

        <div
          id="admin-panel-character"
          role="tabpanel"
          aria-labelledby="admin-tab-character"
          hidden={activeTab !== 'character'}
          className="admin-panel"
        >
          {activeTab === 'character' && (
            <div className="admin-content-card admin-content-card--media">
              <div
                className="admin-media-subtabs"
                role="tablist"
                aria-label="Character parts"
              >
                {sortedCharacterCategories.map((cat) => (
                  <button
                    key={cat._id}
                    type="button"
                    role="tab"
                    aria-selected={activeCharacterCategoryId === cat._id}
                    className={
                      'admin-media-subtab' +
                      (activeCharacterCategoryId === cat._id
                        ? ' admin-media-subtab--active'
                        : '')
                    }
                    onClick={() => setActiveCharacterCategoryId(cat._id)}
                  >
                    {cat.name}
                  </button>
                ))}
                <button
                  type="button"
                  className="admin-media-subtab"
                  onClick={() => {
                    setNewName('')
                    setNewLayer(100)
                    setNewCharacterCategoryIcon(null)
                    setNewCharacterCategoryIconTooltip('')
                    setCharacterCategoryModalOpen(true)
                  }}
                >
                  + Add category
                </button>
                {activeCharacterCategory ? (
                  <div className="admin-character-cat-actions admin-character-cat-actions--inline">
                    <button
                      type="button"
                      className="admin-media-tile__edit"
                      onClick={() => openEditCategoryModal(activeCharacterCategory)}
                      title={`Edit ${activeCharacterCategory.name}`}
                      aria-label={`Edit ${activeCharacterCategory.name}`}
                    >
                      <IconPencil />
                    </button>
                    <button
                      type="button"
                      className="admin-media-tile__delete"
                      onClick={() => deleteCategory(activeCharacterCategory._id)}
                      title={`Delete ${activeCharacterCategory.name}`}
                      aria-label={`Delete ${activeCharacterCategory.name}`}
                    >
                      <IconTrash />
                    </button>
                  </div>
                ) : null}
              </div>

              {!activeCharacterCategory ? (
                <div className="admin-media-empty-card" role="status" aria-live="polite">
                  <div className="admin-media-empty-card__icon" aria-hidden>
                    <IconCharacter />
                  </div>
                  <p className="admin-media-empty-card__title">
                    No character categories yet
                  </p>
                  <p className="admin-media-empty-card__text">
                    Start with Body, Hair, Face, Shirt, Pant, Shoes, then add more.
                  </p>
                </div>
              ) : activeCharacterVariations.length === 0 ? (
                <div className="admin-media-empty-card" role="status" aria-live="polite">
                  <div className="admin-media-empty-card__icon" aria-hidden>
                    <IconCharacter />
                  </div>
                  <p className="admin-media-empty-card__title">
                    {activeCharacterCategory.name} assets
                  </p>
                  <p className="admin-media-empty-card__text">
                    Click add to create your first {activeCharacterCategory.name.toLowerCase()} item.
                  </p>
                </div>
              ) : (
                <ul
                  className="admin-media-grid"
                  role="list"
                  aria-label={`${activeCharacterCategory.name} items`}
                >
                  {pagedCharacterVariations.map((item) => (
                    <li key={item.id} className="admin-media-tile">
                      <div className="admin-media-tile__frame admin-media-tile__frame--portrait">
                        <img
                          src={assetUrl(item.imagePath)}
                          alt={item.label}
                          className="admin-media-tile__img"
                          loading="lazy"
                        />
                        <div className="admin-media-tile__overlay">
                          <div className="admin-media-tile__overlay-actions">
                            <button
                              type="button"
                              className="admin-media-tile__edit"
                              onClick={() => openEditVariation(item)}
                              title="Edit item"
                              aria-label={`Edit ${item.label}`}
                            >
                              <IconPencil />
                            </button>
                            <button
                              type="button"
                              className={
                                'admin-media-tile__default' +
                                (item.isDefault ? ' is-active' : '')
                              }
                              onClick={() => setDefaultVariation(item.id)}
                              title={
                                item.isDefault
                                  ? 'Default variation'
                                  : 'Set as default variation'
                              }
                              aria-label={
                                item.isDefault
                                  ? `${item.label} is default`
                                  : `Set ${item.label} as default`
                              }
                            >
                              <span aria-hidden />
                            </button>
                            <button
                              type="button"
                              className="admin-media-tile__delete"
                              onClick={() => deleteVariation(item.id)}
                              title="Delete image"
                              aria-label={`Delete ${item.label}`}
                            >
                              <IconTrash />
                            </button>
                          </div>
                        </div>
                      </div>
                      <p className="admin-media-tile__caption">{item.label}</p>
                    </li>
                  ))}
                </ul>
              )}
              {activeCharacterCategory && activeCharacterVariations.length > 0 ? (
                <div
                  className="admin-library-block__toolbar"
                  style={{ marginTop: '0.9rem' }}
                >
                  <span className="admin-library-block__meta">
                    {activeCharacterVariations.length} total
                  </span>
                  <div className="admin-vars__actions">
                    <button
                      type="button"
                      className="admin-btn-muted"
                      disabled={characterPage <= 1}
                      onClick={() => setCharacterPage((p) => Math.max(1, p - 1))}
                    >
                      Previous
                    </button>
                    <span className="admin-library-block__meta">
                      Page {characterPage} / {characterTotalPages}
                    </span>
                    <button
                      type="button"
                      className="admin-btn-muted"
                      disabled={characterPage >= characterTotalPages}
                      onClick={() =>
                        setCharacterPage((p) => Math.min(characterTotalPages, p + 1))
                      }
                    >
                      Next
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          )}
        </div>

        <div
          id="admin-panel-elements"
          role="tabpanel"
          aria-labelledby="admin-tab-elements"
          hidden={activeTab !== 'elements'}
          className="admin-panel"
        >
          {activeTab === 'elements' && (
            <div className="admin-content-card admin-content-card--media">
              <div className="admin-library-block" style={{ marginBottom: '1rem' }}>
                <h2 className="admin-section__title">Categories</h2>
                <div className="admin-vars">
                  {elementCategoryCounts.map((c) => (
                    <button
                      key={c._id}
                      type="button"
                      className={
                        'admin-media-subtab' +
                        (activeElementCategory === c.name
                          ? ' admin-media-subtab--active'
                          : '')
                      }
                      onClick={() => {
                        setActiveElementCategory(c.name)
                        setElementsPage(1)
                      }}
                      style={{ marginRight: '0.4rem', marginBottom: '0.4rem' }}
                    >
                      {c.name} ({c.count})
                    </button>
                  ))}
                </div>
              </div>
              {propRows.length === 0 ? (
                <div className="admin-media-empty-card" role="status" aria-live="polite">
                  <div className="admin-media-empty-card__icon" aria-hidden>
                    <IconEmptyBackgrounds kind="images" />
                  </div>
                  <p className="admin-media-empty-card__title">No elements yet</p>
                  <p className="admin-media-empty-card__text">
                    Add elements in categories like cars, nature, and things.
                  </p>
                </div>
              ) : (
                <ul className="admin-media-grid" role="list" aria-label="Elements">
                  {propRows.map((p) => (
                    <li key={p._id} className="admin-media-tile">
                      <div className="admin-media-tile__frame admin-media-tile__frame--portrait">
                        <img
                          src={assetUrl(p.imagePath)}
                          alt=""
                          className="admin-media-tile__img"
                          loading="lazy"
                        />
                        <div className="admin-media-tile__overlay">
                          <div className="admin-media-tile__overlay-actions">
                            <button
                              type="button"
                              className="admin-media-tile__delete"
                              onClick={() => deleteProp(p._id)}
                              title="Delete image"
                              aria-label="Delete element image"
                            >
                              <IconTrash />
                            </button>
                          </div>
                        </div>
                      </div>
                      {null}
                    </li>
                  ))}
                </ul>
              )}
              <div
                className="admin-library-block__toolbar"
                style={{ marginTop: '0.9rem' }}
              >
                <span className="admin-library-block__meta">
                  {elementsTotal} total
                </span>
                <div className="admin-vars__actions">
                  <button
                    type="button"
                    className="admin-btn-muted"
                    disabled={elementsPage <= 1}
                    onClick={() => setElementsPage((p) => Math.max(1, p - 1))}
                  >
                    Previous
                  </button>
                  <span className="admin-library-block__meta">
                    Page {elementsPage} / {elementsTotalPages}
                  </span>
                  <button
                    type="button"
                    className="admin-btn-muted"
                    disabled={elementsPage >= elementsTotalPages}
                    onClick={() =>
                      setElementsPage((p) => Math.min(elementsTotalPages, p + 1))
                    }
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        <div
          id="admin-panel-elementCategories"
          role="tabpanel"
          aria-labelledby="admin-tab-elementCategories"
          hidden={activeTab !== 'elementCategories'}
          className="admin-panel"
        >
          {activeTab === 'elementCategories' && (
            <div className="admin-content-card admin-content-card--media">
              <div className="admin-library-block" style={{ marginBottom: '1rem' }}>
                <h2 className="admin-section__title">Element categories</h2>
                <form
                  id="admin-new-element-category"
                  className="admin-form admin-form--light"
                  onSubmit={addElementCategory}
                >
                  <label>
                    New category
                    <input
                      value={newElementCategory}
                      onChange={(e) => setNewElementCategory(e.target.value)}
                      placeholder="e.g. vehicles-2d"
                    />
                  </label>
                  <button type="submit">Add category</button>
                </form>
                <div className="admin-library-block__toolbar">
                  <input
                    value={elementCategoryQuery}
                    onChange={(e) => setElementCategoryQuery(e.target.value)}
                    placeholder="Search categories"
                    aria-label="Search element categories"
                  />
                  <span className="admin-library-block__meta">
                    {elementCategoryRows.length} shown / {elementCategories.length} total
                  </span>
                </div>
                <div className="admin-table-wrap admin-table-wrap--light admin-table-wrap--compact">
                  <table className="admin-table admin-table--light">
                    <thead>
                      <tr>
                        <th>Category</th>
                        <th className="admin-table__num">Elements</th>
                        <th>Status</th>
                        <th className="admin-table__actions">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {elementCategoryRows.map((c) => (
                        <tr key={c._id}>
                          <td>
                            <strong>{c.name}</strong>
                          </td>
                          <td className="admin-table__num">{c.elementCount}</td>
                          <td>
                            <span
                              className={
                                'admin-pill ' +
                                (c.elementCount > 0
                                  ? 'admin-pill--ok'
                                  : 'admin-pill--muted')
                              }
                            >
                              {c.elementCount > 0 ? 'Ready' : 'Empty'}
                            </span>
                          </td>
                          <td className="admin-table__actions">
                            <div className="admin-vars__actions">
                              <button
                                type="button"
                                className="admin-btn-muted"
                                onClick={() => openAddElementForCategory(c.name)}
                              >
                                Add element
                              </button>
                              <button
                                type="button"
                                className="admin-btn-muted"
                                onClick={() => editElementCategory(c._id, c.name)}
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                className="admin-danger"
                                onClick={() => deleteElementCategory(c._id)}
                              >
                                Remove
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {elementCategoryRows.length === 0 ? (
                  <p className="admin-empty">No matching categories.</p>
                ) : null}
              </div>
            </div>
          )}
        </div>

        <div
          id="admin-panel-shapes"
          role="tabpanel"
          aria-labelledby="admin-tab-shapes"
          hidden={activeTab !== 'shapes'}
          className="admin-panel"
        >
          {activeTab === 'shapes' && (
            <div className="admin-content-card admin-content-card--media">
              <p className="admin-section-hint">
                Basic shapes available in builder:
              </p>
              <ul className="admin-media-grid" role="list" aria-label="Basic shapes">
                {BUILT_IN_SHAPES.map((shape) => (
                  <li key={shape.id} className="admin-media-tile">
                    <div className="admin-media-tile__frame admin-media-tile__frame--portrait">
                      <div
                        className={`book-page__shape book-page__shape--${shape.id}`}
                        style={{
                          width: '84%',
                          height: '78%',
                          margin: 'auto',
                          background: '#000000',
                          borderColor: '#1f2937',
                          borderWidth: 2,
                        }}
                      />
                    </div>
                    <p className="admin-media-tile__caption">{shape.label}</p>
                  </li>
                ))}
              </ul>

              <p className="admin-section-hint" style={{ marginTop: '1rem' }}>
                Custom shapes:
              </p>
              {shapeRows.length === 0 ? (
                <div className="admin-media-empty-card" role="status" aria-live="polite">
                  <div className="admin-media-empty-card__icon" aria-hidden>
                    <IconEmptyBackgrounds kind="images" />
                  </div>
                  <p className="admin-media-empty-card__title">No shapes yet</p>
                  <p className="admin-media-empty-card__text">
                    Upload shape images to show them in the builder shape picker.
                  </p>
                </div>
              ) : (
                <ul className="admin-media-grid" role="list" aria-label="Shapes">
                  {shapeRows.map((s) => (
                    <li key={s._id} className="admin-media-tile">
                      <div className="admin-media-tile__frame admin-media-tile__frame--portrait">
                        <img
                          src={assetUrl(s.imagePath)}
                          alt=""
                          className="admin-media-tile__img"
                          loading="lazy"
                        />
                        <div className="admin-media-tile__overlay">
                          <div className="admin-media-tile__overlay-actions">
                            <button
                              type="button"
                              className="admin-media-tile__delete"
                              onClick={() => deleteShape(s._id)}
                              title="Delete shape"
                              aria-label="Delete shape image"
                            >
                              <IconTrash />
                            </button>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>

        <div
          id="admin-panel-thoughtBubbles"
          role="tabpanel"
          aria-labelledby="admin-tab-thoughtBubbles"
          hidden={activeTab !== 'thoughtBubbles'}
          className="admin-panel"
        >
          {activeTab === 'thoughtBubbles' && (
            <div className="admin-content-card admin-content-card--media">
              {sortedThoughtBubbles.length === 0 ? (
                <div
                  className="admin-media-empty-card"
                  role="status"
                  aria-live="polite"
                >
                  <div className="admin-media-empty-card__icon" aria-hidden>
                    <IconEmptyBackgrounds kind="images" />
                  </div>
                  <p className="admin-media-empty-card__title">
                    No thought bubbles yet
                  </p>
                  <p className="admin-media-empty-card__text">
                    Thought bubbles appear in the book builder bubble picker.
                  </p>
                  <p className="admin-media-empty-card__hint">
                    Add thought bubble above to upload your first image.
                  </p>
                </div>
              ) : (
                <ul
                  className="admin-media-grid"
                  role="list"
                  aria-label="Thought bubbles"
                >
                  {sortedThoughtBubbles.map((b) => (
                    <li key={b._id} className="admin-media-tile">
                      <div className="admin-media-tile__frame admin-media-tile__frame--portrait">
                        <img
                          src={assetUrl(b.imagePath)}
                          alt=""
                          className="admin-media-tile__img"
                          loading="lazy"
                        />
                        <div className="admin-media-tile__overlay">
                          <div className="admin-media-tile__overlay-actions">
                            <button
                              type="button"
                              className="admin-media-tile__delete"
                              onClick={() => deleteThoughtBubble(b._id)}
                              title="Delete image"
                              aria-label="Delete thought bubble image"
                            >
                              <IconTrash />
                            </button>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>

        {!isForcedAdminPage ? (
        <div
          id="admin-panel-layers"
          role="tabpanel"
          aria-labelledby="admin-tab-layers"
          hidden={activeTab !== 'layers'}
          className="admin-panel"
        >
          {activeTab === 'layers' && (
            <>
              <div className="admin-metrics" aria-label="Layers summary">
                <div className="admin-metric-card">
                  <span className="admin-metric-card__label">Categories</span>
                  <span className="admin-metric-card__value">
                    {categories.length}
                  </span>
                </div>
                <div className="admin-metric-card">
                  <span className="admin-metric-card__label">Variations</span>
                  <span className="admin-metric-card__value">
                    {variationCount}
                  </span>
                </div>
              </div>

              <div
                id="admin-layer-uploads"
                className="admin-content-card admin-content-card--flush"
              >
                <h2 className="admin-section__title visually-hidden">
                  Uploads by category
                </h2>
                {categories.length === 0 ? (
                  <p className="admin-empty">
                    Add categories in the Categories tab first.
                  </p>
                ) : (
                  <div className="admin-cat-list">
                  {categories
                    .slice()
                    .sort((a, b) => a.layerOrder - b.layerOrder)
                    .map((c) => {
                      const rich = catalog.find((x) => x.id === c._id)
                      return (
                        <article key={c._id} className="admin-cat">
                          <div className="admin-cat__head admin-cat__head--compact">
                            <div>
                              <strong>{c.name}</strong>
                              <span className="admin-cat__slug">
                                {' '}
                                · layer {c.layerOrder} · {c.slug}
                              </span>
                            </div>
                          </div>

                          <form
                            className="admin-upload"
                            onSubmit={(ev) => uploadVariation(ev, c._id)}
                          >
                            <span>Add variation (PNG / WebP / SVG)</span>
                            <input name="label" placeholder="Label" required />
                            <input
                              name="sortOrder"
                              type="number"
                              placeholder="Sort"
                            />
                            <input
                              name="file"
                              type="file"
                              accept="image/*"
                              required
                            />
                            <button type="submit">Upload</button>
                          </form>

                          <ul className="admin-vars">
                            {rich?.variations.map((v) => (
                              <li key={v.id}>
                                <span>{v.label}</span>
                                <button
                                  type="button"
                                  className="admin-danger"
                                  onClick={() => deleteVariation(v.id)}
                                >
                                  Remove
                                </button>
                              </li>
                            ))}
                          </ul>
                        </article>
                      )
                    })}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
        ) : null}

        {bubbleModalOpen && (
          <div className="admin-modal-root" role="presentation">
            <button
              type="button"
              className="admin-modal-backdrop"
              aria-label="Close dialog"
              onClick={() => setBubbleModalOpen(false)}
            />
            <div
              className="admin-modal"
              role="dialog"
              aria-modal
              aria-labelledby="admin-bubble-modal-title"
            >
              <div className="admin-modal__head">
                <h2 id="admin-bubble-modal-title" className="admin-modal__title">
                  Add thought bubble
                </h2>
                <button
                  type="button"
                  className="admin-modal__close"
                  aria-label="Close"
                  onClick={() => setBubbleModalOpen(false)}
                >
                  ×
                </button>
              </div>
              <form
                className="admin-modal__form"
                onSubmit={uploadThoughtBubble}
              >
                <div className="admin-upload-dropzone">
                  <input
                    id="thought-bubble-file-input"
                    type="file"
                    accept="image/*"
                    multiple
                    className="admin-upload-dropzone__input"
                    onChange={(e) =>
                      setThoughtBubbleFiles(Array.from(e.target.files ?? []))
                    }
                  />
                  <label
                    htmlFor="thought-bubble-file-input"
                    className="admin-upload-dropzone__label"
                  >
                    <strong>
                      {thoughtBubbleFiles.length === 0
                        ? 'Drop images here or click to browse'
                        : thoughtBubbleFiles.length === 1
                          ? thoughtBubbleFiles[0].name
                          : `${thoughtBubbleFiles.length} files selected`}
                    </strong>
                    <span className="admin-modal__hint">
                      Name is auto-generated. PNG, JPG, WEBP, SVG are all supported. You can select multiple files.
                    </span>
                  </label>
                </div>
                <div className="admin-modal__actions">
                  <button
                    type="button"
                    className="admin-modal__btn admin-modal__btn--ghost"
                    onClick={() => {
                      setBubbleModalOpen(false)
                      setThoughtBubbleFiles([])
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="admin-modal__btn admin-modal__btn--primary"
                    disabled={thoughtBubbleFiles.length === 0}
                  >
                    Upload
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {propModalOpen && (
          <div className="admin-modal-root" role="presentation">
            <button
              type="button"
              className="admin-modal-backdrop"
              aria-label="Close dialog"
              onClick={() => setPropModalOpen(false)}
            />
            <div
              className="admin-modal"
              role="dialog"
              aria-modal
              aria-labelledby="admin-prop-modal-title"
            >
              <div className="admin-modal__head">
                <h2 id="admin-prop-modal-title" className="admin-modal__title">
                  Add prop
                </h2>
                <button
                  type="button"
                  className="admin-modal__close"
                  aria-label="Close"
                  onClick={() => setPropModalOpen(false)}
                >
                  ×
                </button>
              </div>
              <form className="admin-modal__form" onSubmit={uploadProp}>
                <label className="admin-modal__label">
                  Category
                  <select
                    value={propCategory}
                    onChange={(e) => setPropCategory(e.target.value)}
                  >
                    {elementCategories.map((c) => (
                      <option key={c._id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </label>
                <div className="admin-upload-dropzone">
                  <input
                    id="prop-file-input"
                    type="file"
                    accept="image/*"
                    className="admin-upload-dropzone__input"
                    onChange={(e) => setPropFile(e.target.files?.[0] ?? null)}
                  />
                  <label htmlFor="prop-file-input" className="admin-upload-dropzone__label">
                    <strong>{propFile ? propFile.name : 'Drop image here or click to browse'}</strong>
                    <span className="admin-modal__hint">
                      Elements can be any image format.
                    </span>
                  </label>
                </div>
                <div className="admin-modal__actions">
                  <button
                    type="button"
                    className="admin-modal__btn admin-modal__btn--ghost"
                    onClick={() => setPropModalOpen(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="admin-modal__btn admin-modal__btn--primary"
                    disabled={!propFile}
                  >
                    Upload
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {characterModalOpen && (
          <div className="admin-modal-root" role="presentation">
            <button
              type="button"
              className="admin-modal-backdrop"
              aria-label="Close dialog"
              onClick={() => {
                if (characterUploadBusy) return
                setCharacterModalOpen(false)
              }}
            />
            <div
              className="admin-modal"
              role="dialog"
              aria-modal
              aria-labelledby="admin-character-modal-title"
            >
              <div className="admin-modal__head">
                <h2 id="admin-character-modal-title" className="admin-modal__title">
                  Add character element
                </h2>
                <button
                  type="button"
                  className="admin-modal__close"
                  aria-label="Close"
                  onClick={() => setCharacterModalOpen(false)}
                >
                  ×
                </button>
              </div>
              <form className="admin-modal__form" onSubmit={uploadCharacterVariation}>
                <label className="admin-modal__label">
                  Category
                  <input
                    value={activeCharacterCategory?.name ?? ''}
                    disabled
                    aria-label="Selected character category"
                  />
                </label>
                <label className="admin-modal__label">
                  Label prefix (optional)
                  <input
                    value={characterLabel}
                    onChange={(e) => setCharacterLabel(e.target.value)}
                    placeholder="e.g. body 1"
                  />
                </label>
                <div className="admin-upload-dropzone">
                  <input
                    id="character-file-input"
                    type="file"
                    multiple
                    accept="image/*"
                    className="admin-upload-dropzone__input"
                    disabled={characterUploadBusy}
                    onChange={(e) => {
                      setCharacterFiles(Array.from(e.target.files ?? []))
                      setCharacterUploadIndex(null)
                      setCharacterUploadDone([])
                      setCharacterUploadFailed([])
                    }}
                  />
                  <label
                    htmlFor="character-file-input"
                    className="admin-upload-dropzone__label"
                  >
                    <strong>
                      {characterFiles.length === 0
                        ? 'Drop image(s) here or click to browse'
                        : characterFiles.length === 1
                          ? characterFiles[0].name
                          : `${characterFiles.length} files selected`}
                    </strong>
                    <span className="admin-modal__hint">
                      Character element(s) are saved in DB and available in builder.
                    </span>
                  </label>
                </div>
                {characterFiles.length > 0 ? (
                  <ul className="admin-upload-progress-list" aria-live="polite">
                    {characterFiles.map((file, index) => {
                      const isUploading = characterUploadIndex === index
                      const isDone = characterUploadDone.includes(index)
                      const isFailed = characterUploadFailed.includes(index)
                      const status = isFailed
                        ? 'Failed'
                        : isDone
                          ? 'Uploaded'
                          : isUploading
                            ? 'Uploading...'
                            : 'Pending'
                      return (
                        <li key={`${file.name}-${index}`} className="admin-upload-progress-list__item">
                          <span className="admin-upload-progress-list__name">{file.name}</span>
                          <span
                            className={
                              'admin-upload-progress-list__status' +
                              (isFailed
                                ? ' is-failed'
                                : isDone
                                  ? ' is-done'
                                  : isUploading
                                    ? ' is-uploading'
                                    : '')
                            }
                          >
                            {status}
                          </span>
                        </li>
                      )
                    })}
                  </ul>
                ) : null}
                <div className="admin-modal__actions">
                  <button
                    type="button"
                    className="admin-modal__btn admin-modal__btn--ghost"
                    onClick={() => {
                      if (characterUploadBusy) return
                      setCharacterModalOpen(false)
                    }}
                    disabled={characterUploadBusy}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="admin-modal__btn admin-modal__btn--primary"
                    disabled={
                      characterFiles.length === 0 ||
                      !activeCharacterCategory ||
                      characterUploadBusy
                    }
                  >
                    {characterUploadBusy
                      ? `Uploading ${Math.max(
                          1,
                          (characterUploadIndex ?? 0) + 1,
                        )}/${characterFiles.length}`
                      : 'Save'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {characterCategoryModalOpen && (
          <div className="admin-modal-root" role="presentation">
            <button
              type="button"
              className="admin-modal-backdrop"
              aria-label="Close dialog"
              onClick={() => setCharacterCategoryModalOpen(false)}
            />
            <div
              className="admin-modal admin-modal--wide admin-modal--character-category"
              role="dialog"
              aria-modal
              aria-labelledby="admin-character-category-modal-title"
            >
              <div className="admin-modal__head">
                <h2
                  id="admin-character-category-modal-title"
                  className="admin-modal__title"
                >
                  Add character category
                </h2>
                <button
                  type="button"
                  className="admin-modal__close"
                  aria-label="Close"
                  onClick={() => setCharacterCategoryModalOpen(false)}
                >
                  ×
                </button>
              </div>
              <form
                className="admin-modal__form admin-modal__form--character-category"
                onSubmit={addCharacterCategory}
              >
                <p className="admin-modal__intro">
                  Create a new category and optionally attach a sidebar icon used in
                  Character Builder.
                </p>
                <div className="admin-modal__grid-2">
                  <label className="admin-modal__label">
                    Name
                    <input
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      placeholder="e.g. body, hair, shoes"
                      required
                    />
                  </label>
                  <label className="admin-modal__label">
                    Layer order
                    <input
                      type="number"
                      value={newLayer}
                      onChange={(e) => setNewLayer(Number(e.target.value))}
                      required
                    />
                  </label>
                </div>
                <div className="admin-upload-dropzone">
                  <input
                    id="character-category-icon-input"
                    type="file"
                    accept="image/*"
                    className="admin-upload-dropzone__input"
                    onChange={(e) =>
                      setNewCharacterCategoryIcon(e.target.files?.[0] ?? null)
                    }
                  />
                  <label
                    htmlFor="character-category-icon-input"
                    className="admin-upload-dropzone__label"
                  >
                    <strong>
                      {newCharacterCategoryIcon
                        ? newCharacterCategoryIcon.name
                        : 'Choose category icon (optional)'}
                    </strong>
                    <span className="admin-modal__hint">
                      This icon is used in Character Builder sidebar.
                    </span>
                  </label>
                </div>
                {newCharacterCategoryIcon ? (
                  <p className="admin-modal__file-chip" role="status">
                    Selected icon: {newCharacterCategoryIcon.name}
                  </p>
                ) : null}
                <label className="admin-modal__label">
                  Icon tooltip (optional)
                  <input
                    value={newCharacterCategoryIconTooltip}
                    onChange={(e) => setNewCharacterCategoryIconTooltip(e.target.value)}
                    placeholder="e.g. Body"
                  />
                </label>
                <div className="admin-modal__actions">
                  <button
                    type="button"
                    className="admin-modal__btn admin-modal__btn--ghost"
                    onClick={() => {
                      setCharacterCategoryModalOpen(false)
                      setNewCharacterCategoryIcon(null)
                      setNewCharacterCategoryIconTooltip('')
                    }}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="admin-modal__btn admin-modal__btn--primary">
                    Save
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {editVariation && (
          <div className="admin-modal-root" role="presentation">
            <button
              type="button"
              className="admin-modal-backdrop"
              aria-label="Close dialog"
              onClick={closeEditVariation}
            />
            <div
              className="admin-modal admin-modal--wide"
              role="dialog"
              aria-modal
              aria-labelledby="admin-edit-variation-title"
            >
              <div className="admin-modal__head">
                <h2 id="admin-edit-variation-title" className="admin-modal__title">
                  Edit character item
                </h2>
                <button
                  type="button"
                  className="admin-modal__close"
                  aria-label="Close"
                  onClick={closeEditVariation}
                >
                  ×
                </button>
              </div>
              <form className="admin-modal__form" onSubmit={saveVariationMeta}>
                <label className="admin-modal__label">
                  Label
                  <input
                    value={editVariation.label}
                    onChange={(e) =>
                      setEditVariation((prev) =>
                        prev ? { ...prev, label: e.target.value } : prev,
                      )
                    }
                    required
                  />
                </label>
                <label className="admin-modal__label">
                  Sort order
                  <input
                    type="number"
                    value={editVariation.sortOrder}
                    onChange={(e) =>
                      setEditVariation((prev) =>
                        prev ? { ...prev, sortOrder: Number(e.target.value) } : prev,
                      )
                    }
                  />
                </label>
                <div className="admin-modal__grid-2">
                  <div className="admin-modal__preview-box">
                    <strong className="admin-modal__preview-title">Variation image</strong>
                    <img
                      src={editVariationImagePreviewUrl ?? assetUrl(editVariation.imagePath)}
                      alt="Variation preview"
                      className="admin-modal__preview-img"
                    />
                  </div>
                </div>
                <div className="admin-upload-dropzone">
                  <input
                    id="edit-variation-image-input"
                    type="file"
                    accept="image/*"
                    className="admin-upload-dropzone__input"
                    onChange={(e) => {
                      const file = e.target.files?.[0] ?? null
                      setEditVariationImageFile(file)
                      if (file) {
                        setEditVariationImagePreviewUrl(URL.createObjectURL(file))
                      } else {
                        setEditVariationImagePreviewUrl(null)
                      }
                    }}
                  />
                  <label htmlFor="edit-variation-image-input" className="admin-upload-dropzone__label">
                    <strong>
                      {editVariationImageFile
                        ? editVariationImageFile.name
                        : 'Choose new image (optional)'}
                    </strong>
                    <span className="admin-modal__hint">
                      Replaces the current variation image.
                    </span>
                  </label>
                </div>
                <div className="admin-modal__actions">
                  <button
                    type="button"
                    className="admin-modal__btn admin-modal__btn--ghost"
                    onClick={closeEditVariation}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="admin-modal__btn admin-modal__btn--primary">
                    Save details
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {editCharacterCategoryModalOpen && (
          <div className="admin-modal-root" role="presentation">
            <button
              type="button"
              className="admin-modal-backdrop"
              aria-label="Close dialog"
              onClick={closeEditCategoryModal}
            />
            <div
              className="admin-modal admin-modal--wide admin-modal--character-category"
              role="dialog"
              aria-modal
              aria-labelledby="admin-edit-character-category-modal-title"
            >
              <div className="admin-modal__head">
                <h2
                  id="admin-edit-character-category-modal-title"
                  className="admin-modal__title"
                >
                  Edit character category
                </h2>
                <button
                  type="button"
                  className="admin-modal__close"
                  aria-label="Close"
                  onClick={closeEditCategoryModal}
                >
                  ×
                </button>
              </div>
              <form
                className="admin-modal__form admin-modal__form--character-category"
                onSubmit={submitEditCategory}
              >
                <p className="admin-modal__intro">
                  Update the category name, draw layer, and icon used in Character
                  Builder.
                </p>
                <div className="admin-modal__grid-2">
                  <label className="admin-modal__label">
                    Name
                    <input
                      value={editCharacterCategoryName}
                      onChange={(e) => setEditCharacterCategoryName(e.target.value)}
                      placeholder="e.g. body, hair, shoes"
                      required
                    />
                  </label>
                  <label className="admin-modal__label">
                    Layer order
                    <input
                      type="number"
                      value={editCharacterCategoryLayer}
                      onChange={(e) => setEditCharacterCategoryLayer(Number(e.target.value))}
                      required
                    />
                  </label>
                </div>
                {editCharacterCategoryIconPath && !editCharacterCategoryRemoveIcon ? (
                  <div className="admin-modal__existing-icon">
                    <img
                      src={assetUrl(editCharacterCategoryIconPath)}
                      alt="Current category icon"
                      className="admin-modal__existing-icon-img"
                    />
                    <span className="admin-modal__hint">Current icon</span>
                  </div>
                ) : null}
                <div className="admin-upload-dropzone">
                  <input
                    id="edit-character-category-icon-input"
                    type="file"
                    accept="image/*"
                    className="admin-upload-dropzone__input"
                    onChange={(e) => {
                      setEditCharacterCategoryIcon(e.target.files?.[0] ?? null)
                      setEditCharacterCategoryRemoveIcon(false)
                    }}
                  />
                  <label
                    htmlFor="edit-character-category-icon-input"
                    className="admin-upload-dropzone__label"
                  >
                    <strong>
                      {editCharacterCategoryIcon
                        ? editCharacterCategoryIcon.name
                        : 'Choose new category icon (optional)'}
                    </strong>
                    <span className="admin-modal__hint">
                      Replace the sidebar icon for this category.
                    </span>
                  </label>
                </div>
                {editCharacterCategoryIcon ? (
                  <p className="admin-modal__file-chip" role="status">
                    New icon: {editCharacterCategoryIcon.name}
                  </p>
                ) : null}
                <label className="admin-modal__label">
                  Icon tooltip (optional)
                  <input
                    value={editCharacterCategoryIconTooltip}
                    onChange={(e) => setEditCharacterCategoryIconTooltip(e.target.value)}
                    placeholder="e.g. Body"
                  />
                </label>
                <label className="admin-modal__checkbox">
                  <input
                    type="checkbox"
                    checked={editCharacterCategoryRemoveIcon}
                    onChange={(e) => {
                      setEditCharacterCategoryRemoveIcon(e.target.checked)
                      if (e.target.checked) setEditCharacterCategoryIcon(null)
                    }}
                  />
                  Remove current icon
                </label>
                <div className="admin-modal__actions">
                  <button
                    type="button"
                    className="admin-modal__btn admin-modal__btn--ghost"
                    onClick={closeEditCategoryModal}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="admin-modal__btn admin-modal__btn--primary">
                    Save changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {shapeModalOpen && (
          <div className="admin-modal-root" role="presentation">
            <button
              type="button"
              className="admin-modal-backdrop"
              aria-label="Close dialog"
              onClick={() => setShapeModalOpen(false)}
            />
            <div
              className="admin-modal"
              role="dialog"
              aria-modal
              aria-labelledby="admin-shape-modal-title"
            >
              <div className="admin-modal__head">
                <h2 id="admin-shape-modal-title" className="admin-modal__title">
                  Add shapes
                </h2>
                <button
                  type="button"
                  className="admin-modal__close"
                  aria-label="Close"
                  onClick={() => setShapeModalOpen(false)}
                >
                  ×
                </button>
              </div>
              <form className="admin-modal__form" onSubmit={uploadShapes}>
                <div className="admin-upload-dropzone">
                  <input
                    id="shape-file-input"
                    type="file"
                    accept="image/*"
                    multiple
                    className="admin-upload-dropzone__input"
                    onChange={(e) => setShapeFiles(Array.from(e.target.files ?? []))}
                  />
                  <label htmlFor="shape-file-input" className="admin-upload-dropzone__label">
                    <strong>
                      {shapeFiles.length === 0
                        ? 'Drop shape images or click to browse'
                        : shapeFiles.length === 1
                          ? shapeFiles[0].name
                          : `${shapeFiles.length} files selected`}
                    </strong>
                    <span className="admin-modal__hint">
                      Upload many shape images in one go.
                    </span>
                  </label>
                </div>
                <div className="admin-modal__actions">
                  <button
                    type="button"
                    className="admin-modal__btn admin-modal__btn--ghost"
                    onClick={() => setShapeModalOpen(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="admin-modal__btn admin-modal__btn--primary"
                    disabled={shapeFiles.length === 0}
                  >
                    Upload
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {editThoughtBubble && (
          <div className="admin-modal-root" role="presentation">
            <button
              type="button"
              className="admin-modal-backdrop"
              aria-label="Close dialog"
              onClick={() => setEditThoughtBubble(null)}
            />
            <div
              className="admin-modal"
              role="dialog"
              aria-modal
              aria-labelledby="admin-edit-thought-bubble-title"
            >
              <div className="admin-modal__head">
                <h2
                  id="admin-edit-thought-bubble-title"
                  className="admin-modal__title"
                >
                  Edit thought bubble
                </h2>
                <button
                  type="button"
                  className="admin-modal__close"
                  aria-label="Close"
                  onClick={() => setEditThoughtBubble(null)}
                >
                  ×
                </button>
              </div>
              <form
                key={editThoughtBubble._id}
                className="admin-modal__form"
                onSubmit={saveEditThoughtBubble}
              >
                <label className="admin-modal__label">
                  Label
                  <input
                    name="label"
                    defaultValue={editThoughtBubble.label}
                    required
                    autoFocus
                  />
                </label>
                <div className="admin-modal__actions">
                  <button
                    type="button"
                    className="admin-modal__btn admin-modal__btn--ghost"
                    onClick={() => setEditThoughtBubble(null)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="admin-modal__btn admin-modal__btn--primary"
                  >
                    Save
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        </main>
      </div>
    </div>
  )
}
