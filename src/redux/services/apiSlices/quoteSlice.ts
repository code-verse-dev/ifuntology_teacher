import { createApi } from "@reduxjs/toolkit/query/react";
import baseQueryWithReauth from "../../reauth/baseQueryWithReauth";

export const quoteSlice = createApi({
  reducerPath: "quoteApi",
  baseQuery: baseQueryWithReauth,
  endpoints: (builder) => ({


  }),
});

export const {
   
} = quoteSlice;
