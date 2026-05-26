import { createApi } from "@reduxjs/toolkit/query/react";
import baseQueryWithReauth from "../../reauth/baseQueryWithReauth";

export const orderSlice = createApi({
  reducerPath: "orderApi",
  baseQuery: baseQueryWithReauth,
  endpoints: (builder) => ({
    getOrders: builder.query<
      any,
      {
        page?: number;
        limit?: number;
        keyword?: string;
      }
    >({
      query: ({page, limit, keyword}) => ({
        url: "/order/myorders",
        method: "GET",
        params: { page, limit, keyword },
      }),
    }),
    getOrderById: builder.query<any, string>({
      query: (id) => ({
        url: `/order/${id}`,
        method: "GET",
      }),
    }),
  }),
});

export const { useGetOrdersQuery, useGetOrderByIdQuery } = orderSlice;
