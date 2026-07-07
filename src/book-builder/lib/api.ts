import { BASE_URL, SOCKET_URL } from '@/constants/api'

/**
 * API origin for `fetch(apiUrl('/api/...'))`.
 * Uses the same `BASE_URL` / `SOCKET_URL` as the rest of the app (`constants/api.ts`).
 */
function normalizeApiBase(raw: string | undefined): string {
  if (raw == null) return ''
  const t = raw.trim().replace(/\/+$/, '')
  return t
}

export const API_BASE = normalizeApiBase(import.meta.env.VITE_API_URL)

/** Set by `BuilderHostProvider` when the builder runs inside another app (e.g. student portal). */
let runtimeAssetOrigin: string | null = null

export function setRuntimeAssetOrigin(origin: string | null | undefined): void {
  if (origin == null || !String(origin).trim()) {
    runtimeAssetOrigin = null
    return
  }
  runtimeAssetOrigin = String(origin).trim().replace(/\/+$/, '')
}

function resolveAssetBase(): string {
  if (runtimeAssetOrigin) return runtimeAssetOrigin
  return SOCKET_URL || API_BASE || ''
}

function joinAppApiPath(path: string): string {
  const p = path.startsWith('/') ? path : `/${path}`
  const apiBase =
    BASE_URL?.trim().replace(/\/+$/, '') ||
    (SOCKET_URL ? `${SOCKET_URL.replace(/\/+$/, '')}/api` : '')
  if (!apiBase) return p
  if (p.startsWith('/api/')) return `${apiBase}${p.slice(4)}`
  return `${apiBase}${p}`
}

export function apiUrl(path: string): string {
  if (path.startsWith('http://') || path.startsWith('https://')) return path
  const p = path.startsWith('/') ? path : `/${path}`
  if (p.startsWith('/api/')) return joinAppApiPath(p)
  const base = resolveAssetBase().replace(/\/+$/, '')
  return base ? `${base}${p}` : p
}

export function builderApiPath(path: string): string {
  return apiUrl(path)
}

/** Response body text, preferring JSON `message` / `error` when present. */
export async function readApiErrorMessage(res: Response): Promise<string> {
  const text = await res.text()
  try {
    const j = JSON.parse(text) as { message?: unknown; error?: unknown }
    if (typeof j.message === 'string' && j.message.trim()) return j.message.trim()
    if (typeof j.error === 'string' && j.error.trim()) return j.error.trim()
  } catch {
    /* not JSON */
  }
  const trimmed = text.trim()
  if (trimmed) return trimmed
  return `${res.status} ${res.statusText}`.trim()
}

/** Paths stored on the API server (character parts, elements, shapes, etc.). */
export function isServerStoredAssetPath(imagePath: string): boolean {
  return /^\/(uploads|Uploads)\//i.test(imagePath.trim())
}

export function assetUrl(imagePath: string): string {
  if (!imagePath?.trim()) return imagePath
  if (imagePath.startsWith('http')) return imagePath
  const base = resolveAssetBase()
  const p = imagePath.startsWith('/') ? imagePath : `/${imagePath}`
  if (base) return `${base}${p}`
  return p
}

/** Uploaded files use the API origin; builder `public/` assets stay on the SPA origin. */
export function mediaUrl(imagePath: string): string {
  if (!imagePath?.trim()) return imagePath
  if (imagePath.startsWith('http')) return imagePath
  if (isServerStoredAssetPath(imagePath)) return assetUrl(imagePath)
  return publicAssetUrl(imagePath.replace(/^\//, ''))
}

/**
 * URL for a file served from Vite `public/` (same origin as the SPA).
 * Prepends `import.meta.env.BASE_URL` so assets work when the app is hosted under a subpath.
 * Optional: set `VITE_PUBLIC_IMAGE_VERSION` (e.g. after replacing files under `public/images`)
 * to bust browser cache without a hard refresh.
 */
/** Stable request defaults for book-builder fetches (avoid effect dependency loops). */
export const BUILDER_DEFAULT_FETCH_INIT: RequestInit = {
  cache: 'no-store',
  credentials: 'include',
}

let runtimeFetchInit: RequestInit | undefined

export function setRuntimeFetchInit(init: RequestInit | undefined): void {
  runtimeFetchInit = init
}

export function getBuilderFetchInit(extra?: RequestInit): RequestInit {
  return {
    cache: 'no-store',
    credentials: 'include',
    ...runtimeFetchInit,
    ...extra,
  }
}

export async function builderFetch(
  input: string,
  init?: RequestInit,
): Promise<Response> {
  return fetch(input, getBuilderFetchInit(init))
}

export function publicAssetUrl(path: string): string {
  const raw = path.startsWith('/') ? path.slice(1) : path
  const base = import.meta.env.BASE_URL || '/'
  const url = base.endsWith('/') ? `${base}${raw}` : `${base}/${raw}`
  const v = import.meta.env.VITE_PUBLIC_IMAGE_VERSION?.trim()
  if (!v) return url
  const sep = url.includes('?') ? '&' : '?'
  return `${url}${sep}v=${encodeURIComponent(v)}`
}
