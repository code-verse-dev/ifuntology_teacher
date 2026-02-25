import { createApi } from "@reduxjs/toolkit/query/react";
import baseQueryWithReauth from "../../reauth/baseQueryWithReauth";

export const paymentSlice = createApi({
  reducerPath: "paymentApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Payment", "Cart", "Subscription"],
  endpoints: (builder) => ({
    paymentConfig: builder.query<any, any>({
      query: () => ({
        url: "/payment/config",
        method: "GET",
      }),
      transformResponse: (res: any) => res?.data,
    }),
    paymentIntent: builder.mutation<any, { amount: number; currency: string }>({
      query: ({ amount, currency }) => ({
        url: "/payment/create-payment-intent",
        method: "POST",
        body: {
          amount,
          currency,
        },
      }),
      transformResponse: (res: any) => res?.data,
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
    getSavedPaymentMethods: builder.query<any, void>({
      query: () => ({
        url: "/payment/payment-methods",
        method: "GET",
      }),
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
} = paymentSlice;
