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
  }),
});

export const {
  useRequestQuoteMutation,
} = quoteSlice;
