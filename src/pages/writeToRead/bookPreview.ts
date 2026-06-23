import { SOCKET_URL } from "@/constants/api";

export type BookPreviewMeta = {
  pdfUrl?: string;
  coverWidthPx?: number;
  coverHeightPx?: number;
};

export function bookPdfSrc(book: BookPreviewMeta): string | null {
  const raw = book.pdfUrl?.trim();
  if (!raw) return null;
  if (raw.startsWith("http://") || raw.startsWith("https://")) return raw;
  const base = SOCKET_URL.replace(/\/+$/, "");
  return `${base}${raw.startsWith("/") ? raw : `/${raw}`}`;
}

export function bookPageAspect(book: BookPreviewMeta): number | undefined {
  const w = Number(book.coverWidthPx ?? 0);
  const h = Number(book.coverHeightPx ?? 0);
  if (w > 0 && h > 0) return h / w;
  return undefined;
}
