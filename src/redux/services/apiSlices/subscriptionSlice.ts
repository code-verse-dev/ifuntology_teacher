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
      query: ({page, limit, status}) => ({
        url: "/subscription/my",
        method: "GET",
        params: { page, limit, status },
      }),
    }),
  }),
});

export const { 
    useGetMySubscriptionsQuery,
 } = subscriptionSlice;
