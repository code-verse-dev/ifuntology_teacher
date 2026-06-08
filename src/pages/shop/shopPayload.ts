import type { ShopPreviewPayload } from "@/redux/services/apiSlices/shopSlice";

export type ShopFormState = {
  organizationName: string;
  includeLms: boolean;
  includeEnrichment: boolean;
  includeWtr: boolean;
  lmsEmail: string;
  lmsAddress: string;
  lmsSubscriptionType: string;
  lmsCourses: {
    courseType: string;
    noOfKits: string;
    webSubscriptions: string;
  }[];
  products: { id: string; quantity: string }[];
  city: string;
  stateVal: string;
  country: string;
  streetAddress: string;
  zip: string;
  appliedCoupon: string | null;
  wtrSubscriptionType: string;
  wtrNumberOfSeats: string;
  wtrBookPrinting: boolean;
};

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

  if (state.includeLms) {
    const validCourses = state.lmsCourses.filter(
      (row) =>
        row.courseType &&
        Number(row.noOfKits) > 0 &&
        Number(row.webSubscriptions) > 0
    );
    if (!validCourses.length) return null;
    payload.lms = {
      email: state.lmsEmail.trim() || "preview@example.com",
      address: state.lmsAddress.trim() || "Preview",
      lmsCourses: validCourses.map((row) => ({
        courseType: row.courseType,
        subscriptionType: state.lmsSubscriptionType,
        noOfKits: row.noOfKits,
        webSubscriptions: row.webSubscriptions,
      })),
    };
  }

  if (state.includeEnrichment) {
    const validProducts = state.products
      .filter((p) => p.id && Number(p.quantity) > 0)
      .map((p) => ({
        product: p.id,
        quantity: Number(p.quantity),
      }));
    if (!validProducts.length) return null;
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

  if (state.includeWtr) {
    const seats = Number(state.wtrNumberOfSeats);
    if (!seats || seats < 1) return null;
    payload.wtr = {
      subscriberKind: "TEACHER",
      subscriptionType: state.wtrSubscriptionType as "monthly" | "yearly",
      numberOfSeats: seats,
      bookPrintingRequests: state.wtrBookPrinting,
    };
  }

  return payload;
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
        subscriptionType: state.lmsSubscriptionType,
        noOfKits: row.noOfKits,
        webSubscriptions: row.webSubscriptions,
      })),
    };
  }

  if (state.includeEnrichment) {
    const validProducts = state.products
      .filter((p) => p.id && Number(p.quantity) > 0)
      .map((p) => ({
        product: p.id,
        quantity: Number(p.quantity),
      }));
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

  return { payload, error: null };
}
