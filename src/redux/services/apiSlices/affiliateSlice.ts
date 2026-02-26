import { createApi } from "@reduxjs/toolkit/query/react";
import baseQueryWithReauth from "../../reauth/baseQueryWithReauth";

export const affiliateSlice = createApi({
  reducerPath: "affiliateApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Affiliate"],
  endpoints: (builder) => ({
    getDashboard: builder.query<any, void>({
      query: () => "/affiliate/dashboard",
      providesTags: ["Affiliate"]
    }),
    getAffiliateLink: builder.query<any, void>({
      query: () => "/affiliate/generate",
      providesTags: ["Affiliate"]
    }),
    requestWithdrawal: builder.mutation<any, { fullName: string; address: string; bankAccountDetails: { bankName: string; accountNo: string; accountTitle: string } }>({
      query: (body) => ({
        url: "/affiliate/withdraw",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Affiliate"],
    }),
  }),
});

export const {
  useGetDashboardQuery,
  useGetAffiliateLinkQuery,
  useRequestWithdrawalMutation,
} = affiliateSlice;