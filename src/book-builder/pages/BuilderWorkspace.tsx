import { useLocation } from 'react-router-dom'
import { useBuilderPaths } from '../lib/builderPaths'
import { BookBuilder } from './BookBuilder'
import { CharacterComposerPage } from './CharacterComposerPage'

/**
 * Keeps BookBuilder mounted while the user visits Character Builder.
 * Without this, React Router unmounts the book editor and in-memory pages are lost
 * until the next server draft load (often stale if autosave has not run).
 */
export function BuilderWorkspace() {
  const location = useLocation()
  const { characterHref } = useBuilderPaths()

  const base = characterHref.replace(/\/$/, '')
  const path = location.pathname.replace(/\/$/, '')
  const onCharacterRoute =
    path === base || (path.startsWith(`${base}/`) && path.length > base.length)

  return (
    <>
      <div
        className="builder-workspace__book"
        style={{ display: onCharacterRoute ? 'none' : 'contents' }}
        aria-hidden={onCharacterRoute ? true : undefined}
      >
        <BookBuilder />
      </div>
      {onCharacterRoute ? <CharacterComposerPage /> : null}
    </>
  )
}
