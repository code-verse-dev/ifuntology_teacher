export const LMS_KIT_QUANTITY_ERROR =
  "Quantity must be a multiple of 12 or 15 (e.g. 12, 24, 36 or 15, 30, 45).";

export function isValidLmsKitQuantity(value: string | number): boolean {
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0) return false;
  return n % 12 === 0 || n % 15 === 0;
}

export function getLmsKitQuantityError(value: string): string | null {
  if (!value.trim()) return null;
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0) {
    return "Enter a quantity greater than 0.";
  }
  if (!isValidLmsKitQuantity(n)) {
    return LMS_KIT_QUANTITY_ERROR;
  }
  return null;
}
