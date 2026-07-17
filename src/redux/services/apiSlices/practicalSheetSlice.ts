import { createApi } from "@reduxjs/toolkit/query/react";
import baseQueryWithReauth from "../../reauth/baseQueryWithReauth";

export type PracticalSheetRow = {
  cells: Record<string, string>;
};

export type PracticalSheet = {
  _id?: string;
  courseType: string;
  name: string;
  batchClass: string;
  startDate: string;
  dueDate: string;
  grade: string;
  rows: PracticalSheetRow[];
  exists?: boolean;
};

export const practicalSheetSlice = createApi({
  reducerPath: "practicalSheetApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["StudentPracticalSheet"],
  endpoints: (builder) => ({
    getStudentPracticalSheet: builder.query<
      any,
      { studentId: string; courseType: string }
    >({
      query: ({ studentId, courseType }) => ({
        url: `/practical-sheet/student/${studentId}/${encodeURIComponent(courseType)}`,
        method: "GET",
      }),
      providesTags: (_result, _error, arg) => [
        {
          type: "StudentPracticalSheet",
          id: `${arg.studentId}:${arg.courseType}`,
        },
      ],
    }),
  }),
});

export const { useGetStudentPracticalSheetQuery } = practicalSheetSlice;
