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
  }),
});

export const {
  useCreateSessionMutation,
} = sessionSlice;