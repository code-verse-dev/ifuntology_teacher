import type { AppDispatch } from "@/redux/store";
import { bookSlice } from "@/redux/services/apiSlices/bookSlice";

export type MyBookListItem = {
  _id: string;
  coverUrl?: string;
  coverStorageKey?: string;
  coverWidthPx?: number;
  coverHeightPx?: number;
  pdfExportStatus?: string;
  pdfExportError?: string;
  pdfUrl?: string;
  pdfStorageKey?: string;
  pageCount?: number;
  wordCount?: number;
  updatedAt?: string;
  [key: string]: unknown;
};

const MY_BOOKS_QUERY = { page: 1, limit: 50 } as const;

export function patchMyBooksCache(
  dispatch: AppDispatch,
  book: Partial<MyBookListItem> & { _id: string }
) {
  dispatch(
    bookSlice.util.updateQueryData("getMyBooks", MY_BOOKS_QUERY, (draft: unknown) => {
      const root = draft as {
        data?: MyBookListItem[] | { docs?: MyBookListItem[] };
      };
      const docs = Array.isArray(root?.data)
        ? root.data
        : root?.data?.docs;
      if (!Array.isArray(docs)) return;
      const idx = docs.findIndex((b) => String(b._id) === String(book._id));
      if (idx >= 0) {
        docs[idx] = { ...docs[idx], ...book };
      }
    })
  );
}

export function notifyMyBooksChanged(book?: Partial<MyBookListItem> & { _id: string }) {
  window.dispatchEvent(
    new CustomEvent("wtr-book-saved", { detail: book ?? null })
  );
}
