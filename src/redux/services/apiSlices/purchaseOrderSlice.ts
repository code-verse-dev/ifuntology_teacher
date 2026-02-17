import { createApi } from "@reduxjs/toolkit/query/react";
import baseQueryWithReauth from "../../reauth/baseQueryWithReauth";

export const purchaseOrderSlice = createApi({
  reducerPath: "purchaseOrderApi",
  baseQuery: baseQueryWithReauth,
  endpoints: (builder) => ({
   
    getMyPuchaseOrders: builder.query<
      any,
      {
        page: number;
        limit: number;
        keyword?: string;
      }
    >({
      query: ({ page, limit, keyword }) => ({
        url: "/porder/my",
        method: "GET",
        params: { keyword, page, limit },
      }),
    }),
    getMyPurchaseOrderStats: builder.query<any, void>({
      query: () => ({
        url: "/porder/my-stats",
        method: "GET",
      }),
    }),
    getPurchaseOrderByQuoteId: builder.query<any, string>({
      query: (id) => ({
        url: `/porder/quote/${id}`,
        method: "GET",
      }),
    }),
  }),

});

export const {
    useGetMyPuchaseOrdersQuery,
    useGetMyPurchaseOrderStatsQuery,
    useGetPurchaseOrderByQuoteIdQuery,
} = purchaseOrderSlice;
