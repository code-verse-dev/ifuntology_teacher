import { parseQty } from "./estimateData";

export const SALON_PREVIEW_ITEM_IDS = [
  "laundry-washer",
  "laundry-dryer",
  "barber-pole",
  "recv-desk-custom",
  "recv-desk-standard",
  "recv-guest-chairs",
  "counter-vanity-sink",
  "furn-styling-chair",
  "furn-barber-chair",
  "nail-table",
  "nail-pedi-spa",
  "skin-facial-bed",
  "tech-pos",
  "mkt-sign",
] as const;

export type SalonPreviewItemId = (typeof SALON_PREVIEW_ITEM_IDS)[number];

export function pickSalonPreviewQty(
  itemQty: Record<string, string>,
): Record<string, number> {
  const out: Record<string, number> = {};
  for (const id of SALON_PREVIEW_ITEM_IDS) {
    const qty = parseQty(itemQty[id] ?? "");
    if (qty > 0) out[id] = qty;
  }
  return out;
}
