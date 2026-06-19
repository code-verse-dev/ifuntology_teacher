import { createApi } from "@reduxjs/toolkit/query/react";
import baseQueryWithReauth from "../../reauth/baseQueryWithReauth";

export type ShopPreviewPayload = {
  organizationName: string;
  taxExempt?: boolean;
  lms?: {
    email: string;
    address: string;
    lmsCourses: {
      courseType: string;
      subscriptionType: string;
      noOfKits: string;
      webSubscriptions: string;
    }[];
  };
  enrichment?: {
    products: { product: string; quantity: number }[];
    city?: string;
    streetAddress?: string;
    state?: string;
    country?: string;
    zipCode?: string;
    couponCode?: string;
  };
  wtr?: {
    subscriberKind: "TEACHER" | "INDIVIDUAL";
    subscriptionType: "monthly" | "yearly";
    numberOfSeats?: number;
    noOfSubscriptions?: number;
    bookPrintingRequests?: boolean;
  };
};

export type ShopEligibility = {
  canProceed: boolean;
  lmsConflicts: { courseType: string; message: string }[];
  wtrConflict: boolean;
  messages: string[];
};

export type ConfirmShopPaymentPayload = ShopPreviewPayload & {
  paymentIntentId: string;
};

export const shopSlice = createApi({
  reducerPath: "shopApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["ShopQuotes"],
  endpoints: (builder) => ({
    previewShopPricing: builder.mutation<any, ShopPreviewPayload>({
      query: (body) => ({
        url: "/shop/preview",
        method: "POST",
        body,
      }),
    }),
    checkShopEligibility: builder.mutation<any, ShopPreviewPayload>({
      query: (body) => ({
        url: "/shop/eligibility",
        method: "POST",
        body,
      }),
    }),
    createShopQuote: builder.mutation<any, ShopPreviewPayload>({
      query: (body) => ({
        url: "/shop/quote",
        method: "POST",
        body,
      }),
      invalidatesTags: ["ShopQuotes"],
    }),
    shopCheckout: builder.mutation<any, ShopPreviewPayload>({
      query: (body) => ({
        url: "/shop/checkout",
        method: "POST",
        body,
      }),
    }),
    confirmShopPayment: builder.mutation<any, ConfirmShopPaymentPayload>({
      query: (body) => ({
        url: "/shop/confirm-payment",
        method: "POST",
        body,
      }),
    }),
  }),
});

export const {
  usePreviewShopPricingMutation,
  useCheckShopEligibilityMutation,
  useCreateShopQuoteMutation,
  useShopCheckoutMutation,
  useConfirmShopPaymentMutation,
} = shopSlice;
