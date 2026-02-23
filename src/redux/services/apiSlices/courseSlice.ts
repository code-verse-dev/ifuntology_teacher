import { createApi } from "@reduxjs/toolkit/query/react";
import baseQueryWithReauth from "../../reauth/baseQueryWithReauth";

export const courseSlice = createApi({
  reducerPath: "courseApi",
  baseQuery: baseQueryWithReauth,
  endpoints: (builder) => ({
    getCourses: builder.query<any, void>({
      query: () => ({
        url: "/course",
        method: "GET",
      }),
    }),
   
  }),
});

export const { useGetCoursesQuery } = courseSlice;
