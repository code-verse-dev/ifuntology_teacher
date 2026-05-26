import { createApi } from "@reduxjs/toolkit/query/react";
import baseQueryWithReauth from "../../reauth/baseQueryWithReauth";

/** Matches backend `QueryDto` for teacher print-order list. */
export type PrintOrderTeacherListParams = {
  page?: number;
  limit?: number;
  keyword?: string;
  status?: string;
  from?: string;
  to?: string;
};

export const printOrderSlice = createApi({
  reducerPath: "printOrderApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["PrintOrder"],
  endpoints: (builder) => ({
    getTeacherPrintOrders: builder.query<
      any,
      PrintOrderTeacherListParams | void
    >({
      query: (params) => ({
        url: "/print-order/teacher",
        method: "GET",
        params: params ?? {},
      }),
      providesTags: () => ["PrintOrder"],
    }),
    approvePrintOrder: builder.mutation<any, { id: string }>({
      query: ({ id }) => ({
        url: `/print-order/${id}/approve`,
        method: "PATCH",
      }),
      invalidatesTags: () => ["PrintOrder"],
    }),
  }),
});

export const {
  useGetTeacherPrintOrdersQuery,
  useLazyGetTeacherPrintOrdersQuery,
  useApprovePrintOrderMutation,
} = printOrderSlice;
