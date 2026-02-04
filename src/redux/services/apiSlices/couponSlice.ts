import { createApi } from "@reduxjs/toolkit/query/react";
import baseQueryWithReauth from "../../reauth/baseQueryWithReauth";

export const couponSlice = createApi({
  reducerPath: "couponApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Coupon"],
  endpoints: (builder) => ({
    checkCoupon: builder.mutation<any, { code: string; amount: string }>({
      query: ({ code, amount }) => ({
        url: "/coupon/redeem",
        method: "POST",
        body: { code, amount },
      }),
    }),
  }),
});

export const {
    useCheckCouponMutation,
} = couponSlice;
