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
      query: ( {page, limit, status}) => ({
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
  }),
  
});

export const { 
    useGetMySubscriptionsQuery,
    useGetSubscriptionStatsQuery,
 } = subscriptionSlice;
