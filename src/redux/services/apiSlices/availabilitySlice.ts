import { createApi } from "@reduxjs/toolkit/query/react";
import baseQueryWithReauth from "../../reauth/baseQueryWithReauth";

export const availabilitySlice = createApi({
  reducerPath: "availabilityApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Availability"],
  endpoints: (builder) => ({
    findSchedule: builder.query({
      query: (date: string) => ({
        url: "/availability",
        method: "GET",
        params: { date },
      }),
      providesTags: ["Availability"],
    }),
  }),
});

export const { useFindScheduleQuery } = availabilitySlice;