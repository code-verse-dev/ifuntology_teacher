import { createApi } from "@reduxjs/toolkit/query/react";
import baseQueryWithReauth from "../../reauth/baseQueryWithReauth";

export const surveySlice = createApi({
    reducerPath: "surveySlice",
    baseQuery: baseQueryWithReauth,
    tagTypes: ["Surveys", "SurveyQuestions", "SurveyAnswers"],
    endpoints: (builder) => ({
        getAvailableSurveys: builder.query<any, void>({
            query: () => ({ url: "/survey/available", method: "GET" }),
            providesTags: ["Surveys"],
        }),
        getSurveryQuestions: builder.query<any, { surveyId: string }>({
            query: ({ surveyId }) => ({ url: `/survey-questions/${surveyId}/questions`, method: "GET" }),
            providesTags: ["SurveyQuestions"],
        }),
        submitSurveyAnswers: builder.mutation<any, { surveyId: string; answers: any[] }>({
            query: ({ surveyId, answers }) => ({ url: `/survey-answers/${surveyId}`, method: "POST", body: { answers } }),
            invalidatesTags: ["Surveys", "SurveyAnswers"],
        }),
        getSurveyResponseById: builder.query<any, { responseId: string }>({
            query: ({ responseId }) => ({ url: `/survey-answers/by-id/${responseId}`, method: "GET" }),
            providesTags: ["SurveyAnswers"],
        }),
        
    }),
});

export const {
    useGetAvailableSurveysQuery,
    useGetSurveryQuestionsQuery,
    useSubmitSurveyAnswersMutation,
    useGetSurveyResponseByIdQuery,
} = surveySlice;
