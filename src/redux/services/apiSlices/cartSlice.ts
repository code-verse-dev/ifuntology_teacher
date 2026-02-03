import { createApi } from "@reduxjs/toolkit/query/react";
import baseQueryWithReauth from "../../reauth/baseQueryWithReauth";

interface CartItem {
  product: string;
  quantity?: number;
}

interface CreateCartPayload {
  items?: CartItem[];
  couponCode?: string;
}

export const cartSlice = createApi({
  reducerPath: "cartApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Cart"],
  endpoints: (builder) => ({
    // GET CART
    getCart: builder.query<any, void>({
      query: () => ({
        url: "/cart",
        method: "GET",
      }),
      providesTags: ["Cart"],
    }),

    // CREATE / UPDATE CART
    createCart: builder.mutation<any, CreateCartPayload>({
      query: (body) => ({
        url: "/cart",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Cart"], // refetch cart after update
    }),

    // CLEAR CART
    clearCart: builder.mutation<any, void>({
      query: () => ({
        url: "/cart/clear",
        method: "PATCH",
      }),
      invalidatesTags: ["Cart"], // refetch cart after clearing
    }),
  }),
});

export const { useGetCartQuery, useCreateCartMutation, useClearCartMutation } = cartSlice;
