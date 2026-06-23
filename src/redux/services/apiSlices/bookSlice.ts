import { createApi } from "@reduxjs/toolkit/query/react";
import baseQueryWithReauth from "../../reauth/baseQueryWithReauth";

/** Matches backend `QueryDto` query string params for list endpoints. */
export type BookAvailableForReviewParams = {
  page?: number;
  limit?: number;
  keyword?: string;
  status?: string;
  from?: string;
  to?: string;
};

/** Matches backend `AssignBookGradeDto` / `BookGrade`. */
export type AssignBookGradeBody = {
  grade: "FAIR" | "GOOD" | "EXCELLENT";
};

export const bookSlice = createApi({
  reducerPath: "bookApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Book", "MyBooks"],
  endpoints: (builder) => ({
    /** GET /api/book/available-for-review (teacher) */
    getAvailableForReview: builder.query<any, BookAvailableForReviewParams | void>({
      query: (params) => ({
        url: "/book/available-for-review",
        method: "GET",
        params: params ?? {},
      }),
      providesTags: () => ["Book"],
    }),
    /** GET /api/book/my — teacher's own books */
    getMyBooks: builder.query<
      any,
      { page?: number; limit?: number; keyword?: string; status?: string } | void
    >({
      query: (params) => ({
        url: "/book/my",
        method: "GET",
        params: params ?? {},
      }),
      providesTags: () => ["MyBooks"],
    }),
    /** POST /api/book */
    createBook: builder.mutation<any, FormData>({
      query: (body) => ({
        url: "/book",
        method: "POST",
        body,
      }),
      invalidatesTags: () => ["MyBooks"],
    }),
    /** DELETE /api/book/:id */
    deleteBookById: builder.mutation<any, { id: string }>({
      query: ({ id }) => ({
        url: `/book/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: () => ["MyBooks"],
    }),
    /** PATCH /api/book/:id/grade */
    assignGrade: builder.mutation<any, { bookId: string; body: AssignBookGradeBody }>({
      query: ({ bookId, body }) => ({
        url: `/book/${bookId}/grade`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: () => ["Book"],
    }),
    /** PATCH /api/book/:id/reject — return to student as draft */
    rejectReview: builder.mutation<any, { bookId: string }>({
      query: ({ bookId }) => ({
        url: `/book/${bookId}/reject`,
        method: "PATCH",
      }),
      invalidatesTags: () => ["Book"],
    }),
  }),
});

export const {
  useGetAvailableForReviewQuery,
  useLazyGetAvailableForReviewQuery,
  useGetMyBooksQuery,
  useCreateBookMutation,
  useDeleteBookByIdMutation,
  useAssignGradeMutation,
  useRejectReviewMutation,
} = bookSlice;
