import { createApi } from "@reduxjs/toolkit/query/react";
import baseQueryWithReauth from "../../reauth/baseQueryWithReauth";

export type VidLibraryListParams = {
  courseType: string;
  page?: number;
  limit?: number;
};

export const vidLibrarySlice = createApi({
  reducerPath: "vidLibraryApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["VidLibrary"],
  endpoints: (builder) => ({
    getAccessibleCourseTypes: builder.query<any, void>({
      query: () => "/vid-library/accessible-course-types",
      providesTags: ["VidLibrary"],
    }),
    getVideosByCourseType: builder.query<any, VidLibraryListParams>({
      query: ({ courseType, page = 1, limit = 10 }) => ({
        url: "/vid-library",
        params: { courseType, page, limit },
      }),
      providesTags: ["VidLibrary"],
    }),
  }),
});

export const {
  useGetAccessibleCourseTypesQuery,
  useGetVideosByCourseTypeQuery,
} = vidLibrarySlice;
