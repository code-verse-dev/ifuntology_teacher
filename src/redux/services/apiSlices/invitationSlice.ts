import { createApi } from "@reduxjs/toolkit/query/react";
import baseQueryWithReauth from "../../reauth/baseQueryWithReauth";

export const invitationSlice = createApi({
    reducerPath: "invitationApi",
    baseQuery: baseQueryWithReauth,
    endpoints: (builder) => ({
        inviteStudent: builder.mutation({
            query: (body) => ({
                url: "/invitation/create",
                method: "POST",
                body,
            }),
        }),
        inviteStudentBulk: builder.mutation({
            query: (body) => ({
                url: "/invitation/create-bulk",
                method: "POST",
                body,
            }),
        }),
        inviteStudentBulkCsv: builder.mutation({
            query: (file: File) => {
                const formData = new FormData();
                formData.append("file", file);
                return {
                    url: "/invitation/create-bulk-csv",
                    method: "POST",
                    body: formData,
                };
            },
        }),
        getMyStudents: builder.query<
            any,
            { page?: number; limit?: number; keyword?: string; courseType?: string }
        >({
            query: ({ page, limit, keyword, courseType } = {}) => ({
                url: "/invitation/my-students",
                method: "GET",
                params: { page, limit, keyword, courseType },
            }),
        }),
        getStudentById: builder.query<any, { studentId: string }>({
            query: ({ studentId }) => ({
                url: `/invitation/my-students/${studentId}`,
                method: "GET",
            }),
        }),
        resetStudentPassword: builder.mutation<any, { studentId: string; password: string }>({
            query: ({ studentId, password }) => ({
                url: `/invitation/my-students/${studentId}/reset-password`,
                method: "POST",
                body: { password },
            }),
        }),
        getAverageProgress: builder.query<
            any,
            { courseType?: string }
        >({
            query: ({ courseType }) => ({
                url: "/lesson-progress/teacher/average-progress",
                method: "GET",
                params: { courseType },
            }),
        }),
        getAdminAccount: builder.query<any, void>({
            query: () => ({
              url: "/user/admin-account",
              method: "GET",
            }),
          }),
    }),
});

export const {
    useInviteStudentMutation,
    useGetMyStudentsQuery,
    useGetStudentByIdQuery,
    useResetStudentPasswordMutation,
    useGetAverageProgressQuery,
    useGetAdminAccountQuery,
    useInviteStudentBulkMutation,
    useInviteStudentBulkCsvMutation,
} = invitationSlice;
