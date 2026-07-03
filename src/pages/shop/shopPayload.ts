import type { ShopPreviewPayload } from "@/redux/services/apiSlices/shopSlice";
import {
  type LmsKitVariant,
} from "@/constants/lmsKitVariants";
import {
  isValidLmsKitQuantity,
  LMS_KIT_QUANTITY_ERROR,
} from "./utils/lmsKitQuantity";
import {
  getShopContactDetailsError,
  isShopContactDetailsComplete,
} from "./utils/shopContactDetails";

export type CatalogSelectedProduct = {
  name: string;
  image?: string;
  price: number;
  quantity: string;
};

export type ShopFormState = {
  organizationName: string;
  email: string;
  address: string;
  shippingAddress: string;
  shippingCountry: string;
  shippingCity: string;
  shippingState: string;
  shippingZip: string;
  shippingSameAsBilling: boolean;
  includeLms: boolean;
  includeEnrichment: boolean;
  includeWtr: boolean;
  lmsCourses: {
    courseType: string;
    kitVariant: LmsKitVariant;
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

export function hasPreviewReadySection(state: ShopFormState): boolean {
  if (state.includeLms && state.lmsCourses.some(isLmsCourseRowPreviewReady)) {
    return true;
  }
  if (
    state.includeEnrichment &&
    getMergedEnrichmentProducts(state).length > 0
  ) {
    return true;
  }
  if (state.includeWtr && Number(state.wtrNumberOfSeats) >= 1) {
    return true;
  }
  return false;
}

/** User-facing reason preview cannot run yet (when a section looks ready). */
export function getPreviewBlockReason(_state: ShopFormState): string | null {
  return null;
}

function buildPreviewPlaceholderContact(state: ShopFormState) {
  const billingShippingAddress = [state.streetAddress, state.address]
    .map((part) => part.trim())
    .filter(Boolean)
    .join(", ");

  return {
    email: state.email.trim() || "preview@ifuntology.com",
    address: state.address.trim() || "Pending",
    country: state.country.trim() || "United States",
    city: state.city.trim() || "Pending",
    state: state.stateVal.trim() || "NA",
    streetAddress: state.streetAddress.trim() || "Pending",
    zipCode: state.zip.trim() || "00000",
    shippingAddress: state.shippingSameAsBilling
      ? billingShippingAddress || "Pending"
      : state.shippingAddress.trim() || "Pending",
    shippingCountry: state.shippingSameAsBilling
      ? state.country.trim() || "United States"
      : state.shippingCountry.trim() || "United States",
    shippingCity: state.shippingSameAsBilling
      ? state.city.trim() || "Pending"
      : state.shippingCity.trim() || "Pending",
    shippingState: state.shippingSameAsBilling
      ? state.stateVal.trim() || "NA"
      : state.shippingState.trim() || "NA",
    shippingZipCode: state.shippingSameAsBilling
      ? state.zip.trim() || "00000"
      : state.shippingZip.trim() || "00000",
  };
}

function buildPreviewContactFields(state: ShopFormState) {
  if (isShopContactDetailsComplete(state)) {
    return {
      organizationName: state.organizationName.trim(),
      ...buildContactPayload(state),
    };
  }

  return {
    organizationName: state.organizationName.trim() || "Pending",
    ...buildPreviewPlaceholderContact(state),
  };
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

function buildContactPayload(state: ShopFormState) {
  const billingShippingAddress = [state.streetAddress, state.address]
    .map((part) => part.trim())
    .filter(Boolean)
    .join(", ");

  return {
    email: state.email.trim(),
    address: state.address.trim(),
    country: state.country.trim(),
    city: state.city.trim(),
    state: state.stateVal.trim(),
    streetAddress: state.streetAddress.trim(),
    zipCode: state.zip.trim(),
    shippingAddress: state.shippingSameAsBilling
      ? billingShippingAddress
      : state.shippingAddress.trim(),
    shippingCountry: state.shippingSameAsBilling
      ? state.country.trim()
      : state.shippingCountry.trim(),
    shippingCity: state.shippingSameAsBilling
      ? state.city.trim()
      : state.shippingCity.trim(),
    shippingState: state.shippingSameAsBilling
      ? state.stateVal.trim()
      : state.shippingState.trim(),
    shippingZipCode: state.shippingSameAsBilling
      ? state.zip.trim()
      : state.shippingZip.trim(),
  };
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
  if (!state.includeLms && !state.includeEnrichment && !state.includeWtr) {
    return null;
  }

  const payload: ShopPreviewPayload = {
    ...buildPreviewContactFields(state),
  };
  let hasPreviewSection = false;

  if (state.includeLms) {
    const validCourses = state.lmsCourses.filter(isLmsCourseRowPreviewReady);
    if (validCourses.length) {
      hasPreviewSection = true;
      payload.lms = {
        lmsCourses: validCourses.map((row) => ({
          courseType: row.courseType,
          kitVariant: row.kitVariant,
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
  const contactError = getShopContactDetailsError(state);
  if (contactError) {
    return { payload: null, error: contactError };
  }
  if (!state.includeLms && !state.includeEnrichment && !state.includeWtr) {
    return {
      payload: null,
      error: "Enable at least one section (LMS, enrichment, or Write to Read)",
    };
  }

  const payload: ShopPreviewPayload = {
    organizationName: state.organizationName.trim(),
    ...buildContactPayload(state),
  };

  if (state.includeLms) {
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
      lmsCourses: validCourses.map((row) => ({
        courseType: row.courseType,
        kitVariant: row.kitVariant,
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
    payload.enrichment = {
      products: validProducts,
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
      numberOfSeats: seats,
      bookPrintingRequests: state.wtrBookPrinting,
    };
  }

  return { payload: finalizePayload(payload, state), error: null };
}
