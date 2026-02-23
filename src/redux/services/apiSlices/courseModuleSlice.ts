import { createApi } from "@reduxjs/toolkit/query/react";
import baseQueryWithReauth from "../../reauth/baseQueryWithReauth";

export const courseModuleSlice = createApi({
  reducerPath: "courseModuleApi",
  baseQuery: baseQueryWithReauth,
  endpoints: (builder) => ({
    findByCourseType: builder.query<any, { courseType: string }>({
      query: ({ courseType }) => ({
        url: "/course-module",
        method: "GET",
        params: { courseType },
      }),
    }),
    getCourseModuleByCourseType: builder.query<any, { courseType: string }>({
      query: ({ courseType }) => ({
        url: `/course-module/course/by-type/${courseType}`,
        method: "GET",
       
      }),
    }),
  }),
});

export const {
  useFindByCourseTypeQuery,
  useGetCourseModuleByCourseTypeQuery,
} = courseModuleSlice;
