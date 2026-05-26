import { createApi } from "@reduxjs/toolkit/query/react";
import baseQueryWithReauth from "../../reauth/baseQueryWithReauth";

export const categorySlice = createApi({
  reducerPath: "categoryApi",
  baseQuery: baseQueryWithReauth,
  endpoints: (builder) => ({
    getCategories: builder.query({
      query: () => ({
        url: "/categories",
        method: "GET",
      }),
    }),

  }),
});

export const {
    useGetCategoriesQuery,
} = categorySlice;
