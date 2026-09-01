import { createApi } from "@reduxjs/toolkit/query/react";
import baseQueryWithReauth from "../../reauth/baseQueryWithReauth";
import type { IntroFormData } from "@/pages/funtologyBusinessBuilder/introFormData";
import type { StudentBudgetInput } from "@/pages/funtologyBusinessBuilder/studentBudgetData";

export type SavedEstimate = {
  _id: string;
  name: string;
  intro?: Partial<IntroFormData> | null;
  itemQty?: Record<string, string>;
  budget?: StudentBudgetInput | null;
  estimateGrandTotal?: number;
  estimateMaterialsTotal?: number;
  estimateFurnitureTotal?: number;
  budgetRemainingAnnual?: number;
  createdAt?: string;
  updatedAt?: string;
};

export type SavedEstimatePayload = {
  name: string;
  intro?: Partial<IntroFormData> | null;
  itemQty?: Record<string, string>;
  budget?: StudentBudgetInput | null;
  estimateGrandTotal?: number;
  estimateMaterialsTotal?: number;
  estimateFurnitureTotal?: number;
  budgetRemainingAnnual?: number;
};

export const businessBuilderSlice = createApi({
  reducerPath: "businessBuilderApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["SavedEstimates"],
  endpoints: (builder) => ({
    getMySavedEstimates: builder.query<
      any,
      { page?: number; limit?: number; keyword?: string }
    >({
      query: ({ page = 1, limit = 10, keyword } = {}) => ({
        url: "/business-builder/estimates",
        method: "GET",
        params: {
          page,
          limit,
          ...(keyword ? { keyword } : {}),
        },
      }),
      providesTags: ["SavedEstimates"],
    }),
    getSavedEstimateById: builder.query<any, string>({
      query: (id) => ({
        url: `/business-builder/estimates/${id}`,
        method: "GET",
      }),
      providesTags: (_result, _error, id) => [{ type: "SavedEstimates", id }],
    }),
    createSavedEstimate: builder.mutation<any, SavedEstimatePayload>({
      query: (body) => ({
        url: "/business-builder/estimates",
        method: "POST",
        body,
      }),
      invalidatesTags: ["SavedEstimates"],
    }),
    updateSavedEstimate: builder.mutation<
      any,
      { id: string; data: Partial<SavedEstimatePayload> }
    >({
      query: ({ id, data }) => ({
        url: `/business-builder/estimates/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["SavedEstimates"],
    }),
    deleteSavedEstimate: builder.mutation<any, string>({
      query: (id) => ({
        url: `/business-builder/estimates/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["SavedEstimates"],
    }),
  }),
});

export const {
  useGetMySavedEstimatesQuery,
  useGetSavedEstimateByIdQuery,
  useCreateSavedEstimateMutation,
  useUpdateSavedEstimateMutation,
  useDeleteSavedEstimateMutation,
} = businessBuilderSlice;
