import { createApi } from "@reduxjs/toolkit/query/react";
import baseQueryWithReauth from "../../reauth/baseQueryWithReauth";

export type PracticalSheetRow = {
  entryDate?: string | null;
  cells: Record<string, string>;
  approved?: boolean;
  approvedAt?: string | null;
  approvedBy?: string | null;
};

export type PracticalSheetMonthProgress = {
  filled: number;
  totalDays: number;
  percent: number;
  from: string;
  to: string;
};

export type PracticalSheet = {
  _id?: string;
  courseType: string;
  name: string;
  creditWeights?: Record<string, string>;
  filter?: { from: string; to: string };
  monthProgress?: PracticalSheetMonthProgress;
  today?: string;
  todayEntry?: PracticalSheetRow | null;
  rows: PracticalSheetRow[];
  exists?: boolean;
};

export type TeacherPracticalEntry = {
  studentId: string;
  studentName: string;
  courseType: string;
  entryDate: string;
  cells: Record<string, string>;
  total: string;
  approved: boolean;
  approvedAt?: string | null;
  approvedBy?: string | null;
};

export const practicalSheetSlice = createApi({
  reducerPath: "practicalSheetApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["StudentPracticalSheet", "TeacherPracticalEntries"],
  endpoints: (builder) => ({
    getStudentPracticalSheet: builder.query<
      any,
      { studentId: string; courseType: string; from?: string; to?: string }
    >({
      query: ({ studentId, courseType, from, to }) => ({
        url: `/practical-sheet/student/${studentId}/${encodeURIComponent(courseType)}`,
        method: "GET",
        params: {
          ...(from ? { from } : {}),
          ...(to ? { to } : {}),
        },
      }),
      providesTags: (_result, _error, arg) => [
        {
          type: "StudentPracticalSheet",
          id: `${arg.studentId}:${arg.courseType}`,
        },
      ],
    }),
    getTeacherPracticalEntries: builder.query<
      any,
      {
        courseType?: string;
        from?: string;
        to?: string;
        page?: number;
        limit?: number;
      }
    >({
      query: ({ courseType, from, to, page = 1, limit = 20 } = {}) => ({
        url: "/practical-sheet/teacher/entries",
        method: "GET",
        params: {
          page,
          limit,
          ...(courseType ? { courseType } : {}),
          ...(from ? { from } : {}),
          ...(to ? { to } : {}),
        },
      }),
      providesTags: ["TeacherPracticalEntries"],
    }),
    teacherUpdatePracticalEntry: builder.mutation<
      any,
      {
        studentId: string;
        courseType: string;
        entryDate: string;
        cells?: Record<string, string>;
        approve?: boolean;
      }
    >({
      query: ({ studentId, courseType, entryDate, cells, approve }) => ({
        url: `/practical-sheet/student/${studentId}/${encodeURIComponent(courseType)}/entry/${entryDate}`,
        method: "PUT",
        body: {
          ...(cells ? { cells } : {}),
          ...(approve ? { approve: true } : {}),
        },
      }),
      invalidatesTags: (_result, _error, arg) => [
        {
          type: "StudentPracticalSheet",
          id: `${arg.studentId}:${arg.courseType}`,
        },
        "TeacherPracticalEntries",
      ],
    }),
    bulkApproveTodayPracticalEntries: builder.mutation<
      any,
      { courseType?: string } | void
    >({
      query: (body) => ({
        url: "/practical-sheet/teacher/entries/bulk-approve-today",
        method: "POST",
        body: body ?? {},
      }),
      invalidatesTags: ["TeacherPracticalEntries", "StudentPracticalSheet"],
    }),
  }),
});

export const {
  useGetStudentPracticalSheetQuery,
  useGetTeacherPracticalEntriesQuery,
  useTeacherUpdatePracticalEntryMutation,
  useBulkApproveTodayPracticalEntriesMutation,
} = practicalSheetSlice;
