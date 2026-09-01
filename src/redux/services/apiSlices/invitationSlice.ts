import { createApi } from "@reduxjs/toolkit/query/react";
import baseQueryWithReauth from "../../reauth/baseQueryWithReauth";
import { batchSlice } from "./batchSlice";
import { paymentSlice } from "./paymentSlice";
import { subscriptionSlice } from "./subscriptionSlice";
import { bookSlice } from "./bookSlice";
import { chatSlice } from "./chatSlice";

export const invitationSlice = createApi({
    reducerPath: "invitationApi",
    baseQuery: baseQueryWithReauth,
    tagTypes: ["MyStudents"],
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
            providesTags: ["MyStudents"],
        }),
        getStudentById: builder.query<any, { studentId: string }>({
            query: ({ studentId }) => ({
                url: `/invitation/my-students/${studentId}`,
                method: "GET",
            }),
        }),
        deleteStudent: builder.mutation<any, { studentId: string }>({
            query: ({ studentId }) => ({
                url: `/invitation/my-students/${studentId}`,
                method: "DELETE",
            }),
            invalidatesTags: ["MyStudents"],
            async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
                try {
                    await queryFulfilled;
                    dispatch(batchSlice.util.invalidateTags(["InviteBatch"]));
                    dispatch(paymentSlice.util.invalidateTags(["WtrSubscription"]));
                    dispatch(subscriptionSlice.util.invalidateTags(["Subscription"]));
                    dispatch(bookSlice.util.invalidateTags(["Book", "MyBooks"]));
                    dispatch(chatSlice.util.invalidateTags(["Chats", "Messages"]));
                } catch {
                    // leave cache as-is on failure
                }
            },
        }),
        resetStudentPassword: builder.mutation<any, { studentId: string; password: string }>({
            query: ({ studentId, password }) => ({
                url: `/invitation/my-students/${studentId}/reset-password`,
                method: "POST",
                body: { password },
            }),
        }),
        addStudentToWriteToRead: builder.mutation<
            any,
            {
                studentId: string;
                batchId?: string;
                title?: string;
                teacherName?: string;
                organizationName?: string;
            }
        >({
            query: ({ studentId, ...body }) => ({
                url: `/invitation/my-students/${studentId}/add-to-write-to-read`,
                method: "POST",
                body,
            }),
            invalidatesTags: ["MyStudents"],
            async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
                try {
                    await queryFulfilled;
                    dispatch(batchSlice.util.invalidateTags(["InviteBatch"]));
                } catch {
                    // leave cache as-is on failure
                }
            },
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
    useDeleteStudentMutation,
    useResetStudentPasswordMutation,
    useAddStudentToWriteToReadMutation,
    useGetAverageProgressQuery,
    useGetAdminAccountQuery,
    useInviteStudentBulkMutation,
    useInviteStudentBulkCsvMutation,
} = invitationSlice;
