import { createApi } from "@reduxjs/toolkit/query/react";
import baseQueryWithReauth from "../../reauth/baseQueryWithReauth";

export const subscriptionSlice = createApi({
  reducerPath: "subscriptionApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Subscription"],
  endpoints: (builder) => ({
    getMySubscriptions: builder.query<
      any,
      {
        page?: number;
        limit?: number;
        status?: string;
      }
    >({
      query: ({ page, limit, status }) => ({
        url: "/teacher-subscription/my",
        method: "GET",
        params: { page, limit, status },
      }),
      providesTags: ["Subscription"],
    }),
    getSubscriptionStats: builder.query<
      any,
      void
    >({
      query: () => ({
        url: "/teacher-subscription/stats",
        method: "GET",
      }),
    }),
    toggleAutoRenewal: builder.mutation<
      any,
      { subscriptionId: string, autoRenew: boolean }
    >({
      query: ({ subscriptionId , autoRenew }) => ({
        url: `/teacher-subscription/toggle-auto-renew/${subscriptionId}`,
        method: "PATCH",
        body: {
          autoRenew
        },
      }),
      invalidatesTags: ["Subscription"],
    }),
    cancelSubscription: builder.mutation<
      any,
      { subscriptionId: string }
    >({
      query: ({ subscriptionId }) => ({
        url: `/teacher-subscription/cancel/${subscriptionId}`,
        method: "PATCH",
      }),
    }),

  }),

});

export const {
  useGetMySubscriptionsQuery,
  useGetSubscriptionStatsQuery,
  useToggleAutoRenewalMutation,
  useCancelSubscriptionMutation,
} = subscriptionSlice;
