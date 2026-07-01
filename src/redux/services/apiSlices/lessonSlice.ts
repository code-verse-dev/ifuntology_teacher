import { createApi } from "@reduxjs/toolkit/query/react";
import baseQueryWithReauth from "../../reauth/baseQueryWithReauth";

export const lessonSlice = createApi({
  reducerPath: "lessonApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Lessons", "QuizQuestions"],
  endpoints: (builder) => ({
    getLessonById: builder.query<any, { id: string }>({
      query: ({ id }) => ({
        url: `/lesson/${id}`,
        method: "GET",
      }),
      providesTags: ["Lessons"],
    }),
    getCourseQuizzesForTeacher: builder.query<any, { courseType: string }>({
      query: ({ courseType }) => ({
        url: `/lesson/course-quizzes/${encodeURIComponent(courseType)}/teacher`,
        method: "GET",
      }),
      providesTags: ["Lessons", "QuizQuestions"],
    }),
    getCourseTestsForTeacher: builder.query<any, { courseType: string }>({
      query: ({ courseType }) => ({
        url: `/lesson/course-tests/${encodeURIComponent(courseType)}/teacher`,
        method: "GET",
      }),
      providesTags: ["Lessons", "QuizQuestions"],
    }),
    getCourseExamsForTeacher: builder.query<any, { courseType: string }>({
      query: ({ courseType }) => ({
        url: `/lesson/course-exams/${encodeURIComponent(courseType)}/teacher`,
        method: "GET",
      }),
      providesTags: ["Lessons", "QuizQuestions"],
    }),
    getQuizQuestions: builder.query<any, { lessonId: string }>({
      query: ({ lessonId }) => ({
        url: `/lesson-quiz-question/${lessonId}`,
        method: "GET",
      }),
      providesTags: ["QuizQuestions"],
    }),
  }),
});

export const {
  useGetLessonByIdQuery,
  useGetCourseQuizzesForTeacherQuery,
  useGetCourseTestsForTeacherQuery,
  useGetCourseExamsForTeacherQuery,
  useGetQuizQuestionsQuery,
} = lessonSlice;
