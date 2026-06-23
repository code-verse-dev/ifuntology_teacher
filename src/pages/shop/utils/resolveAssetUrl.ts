import { SOCKET_URL, UPLOADS_URL } from "@/constants/api";

/** Resolve product filenames, `/uploads/...`, or absolute URLs to a browser src. */
export function resolveAssetUrl(path?: string | null): string | null {
  if (!path?.trim()) return null;
  const trimmed = path.trim();
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }
  if (trimmed.startsWith("/uploads/") || trimmed.startsWith("/Uploads/")) {
    const base = SOCKET_URL?.replace(/\/+$/, "") ?? "";
    return base ? `${base}${trimmed}` : trimmed;
  }
  return UPLOADS_URL + trimmed.replace(/^\/+/, "");
}

export function pickRandom<T>(items: T[], count: number): T[] {
  if (items.length <= count) return [...items];
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, count);
}
