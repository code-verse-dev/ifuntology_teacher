export const PACK_SIZE_12 = 12;
export const PACK_SIZE_15 = 15;

export type PackSize = typeof PACK_SIZE_12 | typeof PACK_SIZE_15;

export const PACK_QUANTITY_ERROR =
  "Quantity must be a multiple of 12 or 15 (e.g. 12, 24, 36 or 15, 30, 45).";

const PACK_STEP_STORAGE_KEY = "ifuntology-pack-step";

export function requiresPackQuantity(product: {
  isAllowedSingle?: boolean;
} | null | undefined): boolean {
  return product?.isAllowedSingle === false;
}

export function isValidPackQuantity(quantity: number): boolean {
  if (!Number.isInteger(quantity) || quantity <= 0) return false;

  for (let packs12 = 0; packs12 <= Math.floor(quantity / PACK_SIZE_12); packs12++) {
    if ((quantity - packs12 * PACK_SIZE_12) % PACK_SIZE_15 === 0) {
      return true;
    }
  }

  return false;
}

export function rememberPackStep(productId: string, step: PackSize) {
  if (typeof window === "undefined") return;
  try {
    const raw = sessionStorage.getItem(PACK_STEP_STORAGE_KEY);
    const map = raw ? JSON.parse(raw) : {};
    map[productId] = step;
    sessionStorage.setItem(PACK_STEP_STORAGE_KEY, JSON.stringify(map));
  } catch {
    // ignore storage failures
  }
}

export function getPackStep(quantity: number, productId?: string): PackSize {
  if (productId && typeof window !== "undefined") {
    try {
      const raw = sessionStorage.getItem(PACK_STEP_STORAGE_KEY);
      const map = raw ? JSON.parse(raw) : {};
      if (map[productId] === PACK_SIZE_12 || map[productId] === PACK_SIZE_15) {
        return map[productId];
      }
    } catch {
      // fall through to quantity inference
    }
  }

  if (quantity % PACK_SIZE_15 === 0 && quantity % PACK_SIZE_12 !== 0) {
    return PACK_SIZE_15;
  }
  if (quantity % PACK_SIZE_12 === 0 && quantity > 0) {
    return PACK_SIZE_12;
  }
  if (quantity % PACK_SIZE_15 === 0 && quantity > 0) {
    return PACK_SIZE_15;
  }
  return PACK_SIZE_12;
}
