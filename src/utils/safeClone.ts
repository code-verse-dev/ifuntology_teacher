/**
 * Deep-clone JSON-serializable data without blowing Safari's smaller call stack.
 * Clones page-by-page instead of stringifying the entire tree at once.
 */
export function safeStructuredClone<T>(value: T): T {
  if (value == null || typeof value !== "object") return value;

  try {
    if (typeof structuredClone === "function") {
      return structuredClone(value);
    }
  } catch {
    /* fall through to per-chunk clone */
  }

  if (Array.isArray(value)) {
    return value.map((item) => cloneJsonChunk(item)) as T;
  }

  return cloneJsonChunk(value);
}

function cloneJsonChunk<T>(chunk: T): T {
  return JSON.parse(JSON.stringify(chunk)) as T;
}

/** Compare two page arrays without a single giant JSON.stringify call. */
export function areJsonSnapshotsEqual(a: unknown[], b: unknown[]): boolean {
  if (a === b) return true;
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    try {
      if (JSON.stringify(a[i]) !== JSON.stringify(b[i])) return false;
    } catch {
      return false;
    }
  }
  return true;
}
