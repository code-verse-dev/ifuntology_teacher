import { createApi } from "@reduxjs/toolkit/query/react";
import baseQueryWithReauth from "../../reauth/baseQueryWithReauth";

export const lessonSlice = createApi({
  reducerPath: "lessonApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Lessons"],
  endpoints: (builder) => ({
    getLessonById: builder.query<any, { id: string }>({
      query: ({ id }) => ({
        url: `/lesson/${id}`,
        method: "GET",
      }),
      providesTags: ["Lessons"],
    }),
  }),
});

export const { useGetLessonByIdQuery } = lessonSlice;
