import { createApi } from "@reduxjs/toolkit/query/react";
import baseQueryWithReauth from "../../reauth/baseQueryWithReauth";

export const purchaseOrderSlice = createApi({
  reducerPath: "purchaseOrderApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Cart"],
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
    utilizePurchaseOrder: builder.mutation<
      any,
      { serviceType: string; poNumber: string }
    >({
      query: (body) => ({
        url: "/porder/utilize",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Cart"],
    }),
  }),

});

export const {
  useGetMyPuchaseOrdersQuery,
  useGetMyPurchaseOrderStatsQuery,
  useGetPurchaseOrderByQuoteIdQuery,
  useUtilizePurchaseOrderMutation,
} = purchaseOrderSlice;
