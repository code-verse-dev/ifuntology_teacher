import type { ShopPreviewPayload } from "@/redux/services/apiSlices/shopSlice";
import {
  isValidLmsKitQuantity,
  LMS_KIT_QUANTITY_ERROR,
} from "./utils/lmsKitQuantity";

export type CatalogSelectedProduct = {
  name: string;
  image?: string;
  price: number;
  quantity: string;
};

export type ShopFormState = {
  organizationName: string;
  includeLms: boolean;
  includeEnrichment: boolean;
  includeWtr: boolean;
  lmsEmail: string;
  lmsAddress: string;
  lmsCourses: {
    courseType: string;
    noOfKits: string;
    webSubscriptions: string;
  }[];
  products: { id: string; quantity: string }[];
  catalogSelectedProducts: Record<string, CatalogSelectedProduct>;
  city: string;
  stateVal: string;
  country: string;
  streetAddress: string;
  zip: string;
  appliedCoupon: string | null;
  wtrSubscriptionType: string;
  wtrNumberOfSeats: string;
  wtrBookPrinting: boolean;
  taxExempt: boolean;
};

function getMergedEnrichmentProducts(state: ShopFormState) {
  const quantities = new Map<string, number>();

  for (const row of state.products) {
    if (!row.id || Number(row.quantity) <= 0) continue;
    quantities.set(
      row.id,
      (quantities.get(row.id) ?? 0) + Number(row.quantity)
    );
  }

  for (const [productId, meta] of Object.entries(state.catalogSelectedProducts)) {
    const qty = Number(meta.quantity);
    if (qty <= 0) continue;
    quantities.set(productId, (quantities.get(productId) ?? 0) + qty);
  }

  return Array.from(quantities.entries()).map(([product, quantity]) => ({
    product,
    quantity,
  }));
}

function isLmsCourseRowPreviewReady(row: ShopFormState["lmsCourses"][number]) {
  return (
    row.courseType &&
    Number(row.noOfKits) > 0 &&
    Number(row.webSubscriptions) > 0 &&
    isValidLmsKitQuantity(row.noOfKits) &&
    isValidLmsKitQuantity(row.webSubscriptions)
  );
}

function validateLmsCourseQuantities(
  courses: ShopFormState["lmsCourses"]
): string | null {
  for (let i = 0; i < courses.length; i++) {
    const row = courses[i];
    const hasQuantity =
      row.noOfKits.trim().length > 0 || row.webSubscriptions.trim().length > 0;
    if (!hasQuantity) continue;
    if (
      !isValidLmsKitQuantity(row.noOfKits) ||
      !isValidLmsKitQuantity(row.webSubscriptions)
    ) {
      return `Course ${i + 1}: ${LMS_KIT_QUANTITY_ERROR}`;
    }
  }
  return null;
}

function finalizePayload(
  payload: ShopPreviewPayload,
  state: ShopFormState
): ShopPreviewPayload {
  if (state.taxExempt) {
    payload.taxExempt = true;
  }
  return payload;
}

export function buildPreviewPayload(
  state: ShopFormState
): ShopPreviewPayload | null {
  if (!state.organizationName.trim()) return null;
  if (!state.includeLms && !state.includeEnrichment && !state.includeWtr) {
    return null;
  }

  const payload: ShopPreviewPayload = {
    organizationName: state.organizationName.trim(),
  };
  let hasPreviewSection = false;

  if (state.includeLms) {
    const validCourses = state.lmsCourses.filter(isLmsCourseRowPreviewReady);
    if (validCourses.length) {
      hasPreviewSection = true;
      payload.lms = {
        email: state.lmsEmail.trim() || "preview@example.com",
        address: state.lmsAddress.trim() || "Preview",
        lmsCourses: validCourses.map((row) => ({
          courseType: row.courseType,
          subscriptionType: "monthly",
          noOfKits: row.noOfKits,
          webSubscriptions: row.webSubscriptions,
        })),
      };
    }
  }

  if (state.includeEnrichment) {
    const validProducts = getMergedEnrichmentProducts(state);
    if (validProducts.length) {
      hasPreviewSection = true;
      payload.enrichment = {
        products: validProducts,
        city: state.city.trim() || undefined,
        streetAddress: state.streetAddress.trim() || undefined,
        state: state.stateVal.trim() || undefined,
        country: state.country.trim() || undefined,
        zipCode: state.zip.trim() || undefined,
        couponCode: state.appliedCoupon ?? undefined,
      };
    }
  }

  if (state.includeWtr) {
    const seats = Number(state.wtrNumberOfSeats);
    if (seats && seats >= 1) {
      hasPreviewSection = true;
      payload.wtr = {
        subscriberKind: "TEACHER",
        subscriptionType: state.wtrSubscriptionType as "monthly" | "yearly",
        numberOfSeats: seats,
        bookPrintingRequests: state.wtrBookPrinting,
      };
    }
  }

  return hasPreviewSection ? finalizePayload(payload, state) : null;
}

export function buildSubmitPayload(
  state: ShopFormState
): { payload: ShopPreviewPayload | null; error: string | null } {
  if (!state.organizationName.trim()) {
    return { payload: null, error: "Organization name is required" };
  }
  if (!state.includeLms && !state.includeEnrichment && !state.includeWtr) {
    return {
      payload: null,
      error: "Enable at least one section (LMS, enrichment, or Write to Read)",
    };
  }

  const payload: ShopPreviewPayload = {
    organizationName: state.organizationName.trim(),
  };

  if (state.includeLms) {
    if (!state.lmsEmail.trim()) {
      return { payload: null, error: "Email is required for LMS" };
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(state.lmsEmail.trim())) {
      return { payload: null, error: "Please enter a valid LMS email address" };
    }
    if (!state.lmsAddress.trim()) {
      return { payload: null, error: "Address is required for LMS" };
    }
    const lmsQuantityError = validateLmsCourseQuantities(state.lmsCourses);
    if (lmsQuantityError) {
      return { payload: null, error: lmsQuantityError };
    }
    const validCourses = state.lmsCourses.filter(
      (row) =>
        row.courseType &&
        Number(row.noOfKits) > 0 &&
        Number(row.webSubscriptions) > 0
    );
    if (!validCourses.length) {
      return { payload: null, error: "Add at least one valid LMS course" };
    }
    payload.lms = {
      email: state.lmsEmail.trim(),
      address: state.lmsAddress.trim(),
      lmsCourses: validCourses.map((row) => ({
        courseType: row.courseType,
        subscriptionType: "monthly",
        noOfKits: row.noOfKits,
        webSubscriptions: row.webSubscriptions,
      })),
    };
  }

  if (state.includeEnrichment) {
    const validProducts = getMergedEnrichmentProducts(state);
    if (!validProducts.length) {
      return { payload: null, error: "Add at least one enrichment product" };
    }
    if (!state.country.trim()) {
      return { payload: null, error: "Country is required for enrichment" };
    }
    if (!state.city.trim()) {
      return { payload: null, error: "City is required for enrichment" };
    }
    if (!state.stateVal.trim()) {
      return { payload: null, error: "State is required for enrichment" };
    }
    if (!state.streetAddress.trim()) {
      return { payload: null, error: "Street address is required for enrichment" };
    }
    if (!state.zip.trim()) {
      return { payload: null, error: "Zip code is required for enrichment" };
    }
    payload.enrichment = {
      products: validProducts,
      city: state.city.trim(),
      streetAddress: state.streetAddress.trim(),
      state: state.stateVal.trim(),
      country: state.country.trim(),
      zipCode: state.zip.trim(),
      couponCode: state.appliedCoupon ?? undefined,
    };
  }

  if (state.includeWtr) {
    const seats = Number(state.wtrNumberOfSeats);
    if (!seats || seats < 1) {
      return {
        payload: null,
        error: "Number of student seats must be at least 1 for Write to Read",
      };
    }
    payload.wtr = {
      subscriberKind: "TEACHER",
      subscriptionType: state.wtrSubscriptionType as "monthly" | "yearly",
      numberOfSeats: seats,
      bookPrintingRequests: state.wtrBookPrinting,
    };
  }

  return { payload: finalizePayload(payload, state), error: null };
}
