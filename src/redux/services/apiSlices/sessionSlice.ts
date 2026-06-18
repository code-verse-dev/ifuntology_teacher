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
    getTeacherUpcomingSessions: builder.query<
      any,
      { from?: string; to?: string; page?: number; limit?: number }
    >({
      query: ({ from, to, page, limit }) => ({
        url: "/session/my/upcoming",
        method: "GET",
        params: { from, to, page, limit },
      }),
      providesTags: ["Session"],
    }),
    joinMeeting: builder.mutation<any, string>({
      query: (sessionId) => ({
        url: `/session/join-meeting/${sessionId}`,
        method: "POST",
      }),
    }),
    startMeeting: builder.mutation<any, string>({
      query: (sessionId) => ({
        url: `/session/start-meeting/${sessionId}`,
        method: "POST",
      }),
    }),
    createTeacherHostedSession: builder.mutation<any, Record<string, unknown>>({
      query: (body) => ({
        url: "/session/teacher-hosted",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Session"],
    }),
    getMyTeacherHostedSessions: builder.query<
      any,
      { from?: string; to?: string; status?: string; page?: number; limit?: number; keyword?: string }
    >({
      query: (params) => ({
        url: "/session/teacher-hosted/my",
        method: "GET",
        params,
      }),
      providesTags: ["Session"],
    }),
    /** Pass a session Mongo id, or empty string to list inviteable students before creating a session (teacher only). */
    getInviteableStudents: builder.query<any, string>({
      query: (sessionId) =>
        sessionId
          ? {
              url: `/session/${sessionId}/inviteable-students`,
              method: "GET",
            }
          : {
              url: "/session/inviteable-students",
              method: "GET",
            },
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
  useGetTeacherUpcomingSessionsQuery,
  useJoinMeetingMutation,
  useStartMeetingMutation,
  useCreateTeacherHostedSessionMutation,
  useGetMyTeacherHostedSessionsQuery,
  useGetInviteableStudentsQuery,
  useSetSessionInvitesMutation,
} = sessionSlice;
