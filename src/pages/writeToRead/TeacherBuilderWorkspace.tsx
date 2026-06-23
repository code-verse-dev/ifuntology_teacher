import { useLocation } from "react-router-dom";
import { useBuilderPaths } from "@/book-builder/lib/builderPaths";
import { BookBuilder } from "@/book-builder/pages/BookBuilder";
import { CharacterComposerPage } from "@/book-builder/pages/CharacterComposerPage";

/**
 * Keeps BookBuilder mounted while the user visits Character Builder.
 */
export function TeacherBuilderWorkspace() {
  const location = useLocation();
  const { characterHref } = useBuilderPaths();

  const base = characterHref.replace(/\/$/, "");
  const path = location.pathname.replace(/\/$/, "");
  const onCharacterRoute =
    path === base || (path.startsWith(`${base}/`) && path.length > base.length);

  return (
    <>
      <div
        className="builder-workspace__book"
        style={{ display: onCharacterRoute ? "none" : "contents" }}
        aria-hidden={onCharacterRoute ? true : undefined}
      >
        <BookBuilder />
      </div>
      {onCharacterRoute ? <CharacterComposerPage /> : null}
    </>
  );
}
