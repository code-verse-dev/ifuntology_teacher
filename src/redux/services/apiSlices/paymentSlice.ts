import { createApi } from "@reduxjs/toolkit/query/react";
import baseQueryWithReauth from "../../reauth/baseQueryWithReauth";

/** POST /payment/create-payment-intent — generic amount or Write to Read print order. */
export type CreatePaymentIntentBody =
  | { amount: number; currency: string }
  | { type: "WTR_PRINT"; printOrderId: string };

export const paymentSlice = createApi({
  reducerPath: "paymentApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Payment", "Cart", "Subscription", "Cards", "WtrSubscription", "PrintOrder"],
  endpoints: (builder) => ({
    paymentConfig: builder.query<any, any>({
      query: () => ({
        url: "/payment/config",
        method: "GET",
      }),
      transformResponse: (res: any) => res?.data,
    }),
    paymentIntent: builder.mutation<any, CreatePaymentIntentBody>({
      query: (body) => ({
        url: "/payment/create-payment-intent",
        method: "POST",
        body,
      }),
      transformResponse: (res: any) => res?.data,
    }),

    /** POST /payment/wtr-print-payment — after Stripe confirms PI as requires_capture */
    confirmWtrPrintPayment: builder.mutation<
      any,
      { paymentIntentId: string; printOrderId: string; type: "WTR_PRINT" }
    >({
      query: (body) => ({
        url: "/payment/wtr-print-payment",
        method: "POST",
        body,
      }),
      invalidatesTags: ["PrintOrder", "Payment"],
    }),

    OrderPayment: builder.mutation<any, { data: any }>({
      query: ({ data }) => ({
        url: "/payment/order-payment",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Cart"],
    }),
    SubscriptionPayment: builder.mutation<any, { data: any }>({
      query: ({ data }) => ({
        url: "/payment/subscription-payment",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Subscription"],
    }),
    createSubscription: builder.mutation<any, {
      courseType: string;
      subscriptionType: string;
      numberOfSeats: number;
    }>({
      query: (data) => ({
        url: "/payment/create-subscription",
        method: "POST",
        body: data,
      }),
    }),

    getMyWtrSubscription: builder.query<any, void>({
      query: () => ({
        url: "/write-to-read/subscriptions/my",
        method: "GET",
      }),
      // Tag even when the request fails (e.g. 404) so invalidateTags refetches after checkout.
      providesTags: (_result, _error) => ["WtrSubscription"],
    }),

    createWtrSubscription: builder.mutation<
      any,
      {
        subscriptionType: "MONTHLY" | "YEARLY";
        subscriberKind: "TEACHER" | "INDIVIDUAL";
        pricingModel?: "FIXED" | "PER_SEAT";
        numberOfSeats?: number;
      }
    >({
      query: (body) => ({
        url: "/payment/create-wtr-subscription",
        method: "POST",
        body,
      }),
    }),
    getSavedPaymentMethods: builder.query<any, void>({
      query: () => ({
        url: "/payment/payment-methods",
        method: "GET",
      }),
      providesTags: ["Cards"],
    }),
    deleteSavedPaymentMethod: builder.mutation<any, { paymentMethodId: string }>({
      query: ({ paymentMethodId }) => ({
        url: `/payment/${paymentMethodId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Cards"],
    }),
  }),
});

export const {
  usePaymentConfigQuery,
  usePaymentIntentMutation,
  useOrderPaymentMutation,
  useSubscriptionPaymentMutation,
  useGetSavedPaymentMethodsQuery,
  useCreateSubscriptionMutation,
  useCreateWtrSubscriptionMutation,
  useGetMyWtrSubscriptionQuery,
  useDeleteSavedPaymentMethodMutation,
  useConfirmWtrPrintPaymentMutation,
} = paymentSlice;
