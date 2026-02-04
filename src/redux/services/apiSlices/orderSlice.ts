import { createApi } from "@reduxjs/toolkit/query/react";
import baseQueryWithReauth from "../../reauth/baseQueryWithReauth";

export const orderSlice = createApi({
  reducerPath: "orderApi",
  baseQuery: baseQueryWithReauth,
  endpoints: (builder) => ({
    getProducts: builder.query({
      query: () => ({
        url: "/order",
        method: "GET",
      }),
    }),

  }),
});

export const {
    useGetProductsQuery,
} = orderSlice;
