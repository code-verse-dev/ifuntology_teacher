import { createApi } from "@reduxjs/toolkit/query/react";
import baseQueryWithReauth from "../../reauth/baseQueryWithReauth";

export const faqSlice = createApi({
    reducerPath: "faqApi",
    baseQuery: baseQueryWithReauth,
    endpoints: (builder) => ({
        getFaqs: builder.query<
            any,
            { page?: number; limit?: number; keyword?: string; module?: string }
        >({
            query: ({ page, limit, keyword, module }) => ({
                url: "/faqs",
                method: "GET",
                params: { page, limit, keyword, module },
            }),
        }),
    }),

});
export const {
    useGetFaqsQuery,
} = faqSlice;
