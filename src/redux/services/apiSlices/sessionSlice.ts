import { createApi } from "@reduxjs/toolkit/query/react";
import baseQueryWithReauth from "../../reauth/baseQueryWithReauth";

export const sessionSlice = createApi({
  reducerPath: "sessionApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Session"],
  endpoints: (builder) => ({
    createSession: builder.mutation({
      query: (body) => ({
        url: "/session", // adjust if your route prefix is different
        method: "POST",
        body,
      }),
      invalidatesTags: ["Session"],
    }),
    getMySessions: builder.query<
      any,
      { from?: string; to?: string; status?: string; page?: number; limit?: number; keyword?: string }
    >({
      query: ({ from, to, status, page, limit, keyword }) => ({
        url: "/session/my",
        method: "GET",
        params: { from, to, status, page, limit, keyword },
      }),
      providesTags: ["Session"],
    }),
  }),
});

export const { useCreateSessionMutation, useGetMySessionsQuery } = sessionSlice;
