import { useLocation } from "react-router-dom";
import { useBuilderPaths } from "@/book-builder/lib/builderPaths";
import BookBuilder from "@/book-builder/pages/BookBuilder";
import { CharacterComposerPage } from "@/book-builder/pages/CharacterComposerPage";
import { DailyAssignmentsGalleryPage } from "./DailyAssignmentsGalleryPage";

function normalizePath(path: string) {
  return path.replace(/\/$/, "");
}

/**
 * Keeps BookBuilder mounted while the user visits Character Builder or assignment galleries.
 */
export function TeacherBuilderWorkspace() {
  const location = useLocation();
  const { builderHref } = useBuilderPaths();

  const path = normalizePath(location.pathname);
  const baseBuilder = normalizePath(builderHref);
  const characterBase = `${baseBuilder}/character`;
  const wurtleBase = `${baseBuilder}/assignments/wurtle`;
  const wtrBase = `${baseBuilder}/assignments/wtr`;

  const onCharacterRoute =
    path === characterBase ||
    (path.startsWith(`${characterBase}/`) && path.length > characterBase.length);
  const onWurtleAssignmentsRoute = path === wurtleBase;
  const onWtrAssignmentsRoute = path === wtrBase;
  const hideBookBuilder =
    onCharacterRoute || onWurtleAssignmentsRoute || onWtrAssignmentsRoute;

  return (
    <>
      <div
        className="builder-workspace__book"
        style={{ display: hideBookBuilder ? "none" : "contents" }}
        aria-hidden={hideBookBuilder ? true : undefined}
      >
        <BookBuilder />
      </div>
      {onCharacterRoute ? <CharacterComposerPage /> : null}
      {onWurtleAssignmentsRoute ? (
        <DailyAssignmentsGalleryPage variant="wurtle" />
      ) : null}
      {onWtrAssignmentsRoute ? (
        <DailyAssignmentsGalleryPage variant="wtr" />
      ) : null}
    </>
  );
}
