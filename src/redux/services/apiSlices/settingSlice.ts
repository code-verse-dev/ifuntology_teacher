import { createApi } from "@reduxjs/toolkit/query/react";
import baseQueryWithReauth from "../../reauth/baseQueryWithReauth";

export const settingSlice = createApi({
  reducerPath: "settingApi",
  baseQuery: baseQueryWithReauth,
  endpoints: (builder) => ({
    getSettings: builder.query({
      query: (type) => ({
        url: `/setting/${type}`,
        method: "GET",
      }),
    }),
    getAllSettings: builder.query({
      query: () => ({
        url: "/setting",
        method: "GET",
      }),
    }),

  }),
});

export const {
    useGetSettingsQuery,
    useGetAllSettingsQuery,
} = settingSlice;
