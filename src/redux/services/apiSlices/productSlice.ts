import { createApi } from "@reduxjs/toolkit/query/react";
import baseQueryWithReauth from "../../reauth/baseQueryWithReauth";

export const productSlice = createApi({
  reducerPath: "productApi",
  baseQuery: baseQueryWithReauth,
  endpoints: (builder) => ({
    getProducts: builder.query<
      any,
      {
        page: number;
        limit: number;
        keyword?: string;
        from?: string;
        to?: string;
        category?: string;
      }
    >({
      query: ({ page, limit, keyword, from, to, category }) => ({
        url: "/product",
        method: "GET",
        params: { keyword, page, limit, from, to, category },
      }),
    }),
    getInteractiveProducts: builder.query<
      any,
      {
        page: number;
        limit: number;
        keyword?: string;
        from?: string;
        to?: string;
        category?: string;
      }
    >({
      query: ({ page, limit, keyword, from, to }) => ({
        url: "/product/interactive",
        method: "GET",
        params: { keyword, page, limit, from, to },
      }),
    }),
    getProductById: builder.query<any, string>({
      query: (id) => ({
        url: `/product/${id}`,
        method: "GET",
      }),
    }),
    getProductsByCategory: builder.query<any, { categoryId: string }>({
      query: ({ categoryId }) => ({
        url: "/product/by-category",
        method: "GET",
        params: { categoryId },
      }),
    }),
    getProductByCourseType: builder.query<any, { courseType: string }>({
      query: ({ courseType }) => ({
        url: "/product/by-course-type",
        method: "GET",
        params: { courseType },
      }),
    }),
  }),
});

export const {
  useGetProductsQuery,
  useGetProductByIdQuery,
  useGetProductsByCategoryQuery,
  useLazyGetProductsByCategoryQuery,
  useGetProductByCourseTypeQuery,
  useGetInteractiveProductsQuery
} = productSlice;
