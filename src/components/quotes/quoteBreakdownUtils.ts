export const formatQuoteCurrency = (value: number | string | undefined | null) => {
  if (value === undefined || value === null) return "—";
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (!Number.isFinite(num)) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
};

export const serviceTypeLabel: Record<string, string> = {
  lms: "Learning Management System",
  write_to_read: "Write to Read",
  enrichment_store: "Enrichment Store",
  shop_bundle: "Shop Bundle",
};

export const formatKitVariant = (variant?: string) => {
  if (!variant || variant === "STANDARD") return "Standard Kits";
  if (variant === "BUNDLE_4_IN_1") return "Bundle Kit 4 in 1";
  return variant.replace(/_/g, " ");
};

export const formatBillingPeriod = (type?: string) => {
  if (!type) return null;
  const lower = String(type).toLowerCase();
  if (lower === "monthly") return "Monthly";
  if (lower === "yearly") return "Yearly";
  if (lower === "lifetime") return "Lifetime";
  return type;
};

export const formatWtrSubscriberKind = (kind?: string) => {
  if (!kind) return null;
  if (kind === "TEACHER") return "Teacher / classroom";
  if (kind === "INDIVIDUAL") return "Individual";
  return kind.replace(/_/g, " ");
};

export const formatBool = (val?: boolean) => (val ? "Yes" : "No");

export const unitPrice = (total: number | undefined, qty: number | undefined) => {
  if (total == null || !qty) return null;
  return total / qty;
};

export function getQuoteTotals(quote: any) {
  const lineSubtotal =
    quote?.total != null
      ? Number(quote.total)
      : Math.max(0, Number(quote?.subTotal ?? 0) - Number(quote?.taxAmount ?? 0));
  const tax = Number(quote?.taxAmount ?? 0);
  const grandTotal =
    quote?.subTotal != null ? Number(quote.subTotal) : lineSubtotal + tax;
  const shipping = Math.max(0, Number((grandTotal - lineSubtotal - tax).toFixed(2)));

  return { lineSubtotal, tax, shipping, grandTotal };
}
