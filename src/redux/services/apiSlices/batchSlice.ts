import { createApi } from "@reduxjs/toolkit/query/react";
import baseQueryWithReauth from "../../reauth/baseQueryWithReauth";

export type InviteRowInput = {
  firstName: string;
  lastName: string;
  email?: string;
};

export type CreateInviteBatchBody = {
  subscriptionId: string;
  title: string;
  teacherName?: string;
  organizationName?: string;
  invites: InviteRowInput[];
};

export type CreateInviteBatchCsvBody = {
  title: string;
  subscriptionId: string;
  file: File;
  teacherName?: string;
  organizationName?: string;
};

export type AddBatchInvitesBody = {
  batchId: string;
  invites: InviteRowInput[];
};

export type UpdateBatchBody = {
  batchId: string;
  title?: string;
  teacherName?: string;
  organizationName?: string;
};

export type UpdateBatchStudentBody = {
  batchId: string;
  studentId: string;
  firstName: string;
  lastName: string;
};

export type InviteBatchesListParams = {
  page?: number;
  limit?: number;
  keyword?: string;
  subscriptionId?: string;
};

export const batchSlice = createApi({
  reducerPath: "batchApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["InviteBatch"],
  endpoints: (builder) => ({
    createInviteBatch: builder.mutation<any, CreateInviteBatchBody>({
      query: (body) => ({
        url: "/batch/invite-batches",
        method: "POST",
        body,
      }),
      invalidatesTags: ["InviteBatch"],
    }),
    createInviteBatchCsv: builder.mutation<any, CreateInviteBatchCsvBody>({
      query: ({ title, subscriptionId, file, teacherName, organizationName }) => {
        const formData = new FormData();
        formData.append("title", title);
        formData.append("subscriptionId", subscriptionId);
        formData.append("file", file);
        if (teacherName?.trim()) formData.append("teacherName", teacherName.trim());
        if (organizationName?.trim()) {
          formData.append("organizationName", organizationName.trim());
        }
        return {
          url: "/batch/invite-batches-csv",
          method: "POST",
          body: formData,
        };
      },
      invalidatesTags: ["InviteBatch"],
    }),
    addBatchInvites: builder.mutation<any, AddBatchInvitesBody>({
      query: ({ batchId, invites }) => ({
        url: `/batch/invite-batches/${batchId}/invites`,
        method: "POST",
        body: { invites },
      }),
      invalidatesTags: ["InviteBatch"],
    }),
    updateInviteBatch: builder.mutation<any, UpdateBatchBody>({
      query: ({ batchId, ...body }) => ({
        url: `/batch/invite-batches/${batchId}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["InviteBatch"],
    }),
    updateBatchStudent: builder.mutation<any, UpdateBatchStudentBody>({
      query: ({ batchId, studentId, firstName, lastName }) => ({
        url: `/batch/invite-batches/${batchId}/students/${studentId}`,
        method: "PATCH",
        body: { firstName, lastName },
      }),
      invalidatesTags: ["InviteBatch"],
    }),
    deleteBatchStudent: builder.mutation<
      any,
      { batchId: string; studentId: string }
    >({
      query: ({ batchId, studentId }) => ({
        url: `/batch/invite-batches/${batchId}/students/${studentId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["InviteBatch"],
    }),
    getInviteBatches: builder.query<any, InviteBatchesListParams | void>({
      query: (params) => ({
        url: "/batch/invite-batches",
        method: "GET",
        params: params ?? {},
      }),
      providesTags: () => ["InviteBatch"],
    }),
    getInviteBatchById: builder.query<any, string>({
      query: (id) => ({
        url: `/batch/invite-batches/${id}`,
        method: "GET",
      }),
      providesTags: (_result, _error, id) => [{ type: "InviteBatch" as const, id }],
    }),
  }),
});

export const {
  useCreateInviteBatchMutation,
  useCreateInviteBatchCsvMutation,
  useAddBatchInvitesMutation,
  useUpdateInviteBatchMutation,
  useUpdateBatchStudentMutation,
  useDeleteBatchStudentMutation,
  useGetInviteBatchesQuery,
  useLazyGetInviteBatchesQuery,
  useGetInviteBatchByIdQuery,
  useLazyGetInviteBatchByIdQuery,
} = batchSlice;
