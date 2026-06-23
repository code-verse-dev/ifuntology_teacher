import { useEffect, useState, type ReactNode } from 'react'

type Props = {
  candidates: string[]
  className?: string
  alt?: string
  draggable?: boolean
  fallback: ReactNode
}

/**
 * Picks the first loadable URL using off-DOM `Image()` probes so we never flash
 * through broken `<img src>` attempts (which caused sidebar icon flicker).
 */
export function PublicRasterIcon({
  candidates,
  className,
  alt = '',
  draggable = false,
  fallback,
}: Props) {
  const [resolvedSrc, setResolvedSrc] = useState<string | null>(null)

  useEffect(() => {
    if (candidates.length === 0) {
      setResolvedSrc(null)
      return
    }

    let cancelled = false

    const tryAt = (i: number) => {
      if (cancelled || i >= candidates.length) {
        if (!cancelled) setResolvedSrc(null)
        return
      }
      const url = candidates[i]
      const probe = new Image()
      probe.onload = () => {
        if (!cancelled) setResolvedSrc(url)
      }
      probe.onerror = () => tryAt(i + 1)
      probe.src = url
    }

    setResolvedSrc(null)
    tryAt(0)

    return () => {
      cancelled = true
    }
  }, [candidates.join('\0')])

  if (!resolvedSrc) return <>{fallback}</>

  return (
    <img
      src={resolvedSrc}
      alt={alt}
      className={className}
      draggable={draggable}
      decoding="async"
    />
  )
}
