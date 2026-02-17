import { createApi } from "@reduxjs/toolkit/query/react";
import baseQueryWithReauth from "../../reauth/baseQueryWithReauth";

export const quoteSlice = createApi({
  reducerPath: "quoteApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Quotes"],

  endpoints: (builder) => ({
    requestQuote: builder.mutation<any, { data: any }>({
      query: ({ data }) => ({
        url: "/quotes",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Quotes"],
    }),
    getMyQuotes: builder.query<
      any,
      {
        page: number;
        limit: number;
        keyword?: string;
      }
    >({
      query: ({ page, limit, keyword }) => ({
        url: "/quotes/my",
        method: "GET",
        params: { keyword, page, limit },
      }),
    }),
    getMyQuoteStats: builder.query<any, void>({
      query: () => ({
        url: "/quotes/my-stats",
        method: "GET",
      }),
    }),
    getQuoteById: builder.query<any, string>({
      query: (id) => ({
        url: `/quotes/${id}`,
        method: "GET",
      }),
      providesTags: (_result, _error, id) => [{ type: "Quotes", id }],
    }),
  }),

});

export const {
  useRequestQuoteMutation,
  useGetMyQuotesQuery,
  useGetMyQuoteStatsQuery,
  useGetQuoteByIdQuery,
} = quoteSlice;
