import { createApi } from "@reduxjs/toolkit/query/react";
import baseQueryWithReauth from "../../reauth/baseQueryWithReauth";

export type InviteRowInput = {
  email: string;
  firstName: string;
  lastName: string;
};

export type CreateInviteBatchBody = {
  subscriptionId: string;
  title: string;
  invites: InviteRowInput[];
};

export type CreateInviteBatchCsvBody = {
  title: string;
  subscriptionId: string;
  file: File;
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
    /** POST /api/batch/invite-batches */
    createInviteBatch: builder.mutation<any, CreateInviteBatchBody>({
      query: (body) => ({
        url: "/batch/invite-batches",
        method: "POST",
        body,
      }),
      invalidatesTags: ["InviteBatch"],
    }),
    /** POST /api/batch/invite-batches-csv */
    createInviteBatchCsv: builder.mutation<any, CreateInviteBatchCsvBody>({
      query: ({ title, subscriptionId, file }) => {
        const formData = new FormData();
        formData.append("title", title);
        formData.append("subscriptionId", subscriptionId);
        formData.append("file", file);
        return {
          url: "/batch/invite-batches-csv",
          method: "POST",
          body: formData,
        };
      },
      invalidatesTags: ["InviteBatch"],
    }),

    /** GET /api/batch/invite-batches */
    getInviteBatches: builder.query<any, InviteBatchesListParams | void>({
      query: (params) => ({
        url: "/batch/invite-batches",
        method: "GET",
        params: params ?? {},
      }),
      providesTags: () => ["InviteBatch"],
    }),

    /** GET /api/batch/invite-batches/:id */
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
  useGetInviteBatchesQuery,
  useLazyGetInviteBatchesQuery,
  useGetInviteBatchByIdQuery,
  useLazyGetInviteBatchByIdQuery,
} = batchSlice;
