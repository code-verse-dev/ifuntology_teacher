import { useMemo } from 'react'
import { useBuilderHost } from '../context/BuilderHostContext'

const DEFAULT_BUILDER_HREF = '/builder'
const DEFAULT_CHARACTER_HREF = '/builder/character'

export function characterComposerUrl(
  characterHref: string,
  editId?: string | null,
): string {
  if (!editId) return characterHref
  const url = new URL(
    characterHref,
    typeof window !== 'undefined' ? window.location.origin : 'http://localhost',
  )
  url.searchParams.set('edit', editId)
  return `${url.pathname}${url.search}`
}

export function useBuilderPaths() {
  const host = useBuilderHost()
  return useMemo(() => {
    const builderHref = host?.builderHref ?? DEFAULT_BUILDER_HREF
    const characterHref = host?.characterHref ?? DEFAULT_CHARACTER_HREF
    return {
      builderHref,
      characterHref,
      characterComposerUrl: (editId?: string | null) =>
        characterComposerUrl(characterHref, editId),
      fetchInit: host?.fetchInit,
    }
  }, [host?.builderHref, host?.characterHref, host?.fetchInit])
}
