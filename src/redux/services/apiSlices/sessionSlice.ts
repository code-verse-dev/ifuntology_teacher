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
    joinMeeting: builder.mutation<any, string>({
      query: (sessionId) => ({
        url: `/session/join-meeting/${sessionId}`,
        method: "POST",
      }),
    }),
    getInviteableStudents: builder.query<any, string>({
      query: (sessionId) => ({
        url: `/session/${sessionId}/inviteable-students`,
        method: "GET",
      }),
    }),
    setSessionInvites: builder.mutation<
      any,
      { sessionId: string; studentIds: string[] }
    >({
      query: ({ sessionId, studentIds }) => ({
        url: `/session/${sessionId}/invites`,
        method: "PATCH",
        body: { studentIds },
      }),
      invalidatesTags: ["Session"],
    }),
  }),
});

export const {
  useCreateSessionMutation,
  useGetMySessionsQuery,
  useJoinMeetingMutation,
  useGetInviteableStudentsQuery,
  useSetSessionInvitesMutation,
} = sessionSlice;
