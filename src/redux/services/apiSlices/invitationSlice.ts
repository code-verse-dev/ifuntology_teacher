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
    }),
});

export const {
    useInviteStudentMutation,
    useGetMyStudentsQuery,
    useGetAverageProgressQuery,
} = invitationSlice;
