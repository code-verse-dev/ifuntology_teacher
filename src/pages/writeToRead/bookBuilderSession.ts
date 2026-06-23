export const ACTIVE_BOOK_BUILDER_ID_KEY = "ifuntology.activeBookBuilderId";

export function setActiveBookBuilderId(bookId: string) {
  try {
    sessionStorage.setItem(ACTIVE_BOOK_BUILDER_ID_KEY, bookId);
  } catch {
    /* ignore */
  }
}

export function getActiveBookBuilderId(): string | null {
  try {
    return sessionStorage.getItem(ACTIVE_BOOK_BUILDER_ID_KEY);
  } catch {
    return null;
  }
}
