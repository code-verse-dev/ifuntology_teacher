import { createApi } from "@reduxjs/toolkit/query/react";
import baseQueryWithReauth from "../../reauth/baseQueryWithReauth";

export const faqSlice = createApi({
    reducerPath: "faqApi",
    baseQuery: baseQueryWithReauth,
    endpoints: (builder) => ({
        getFaqs: builder.query<
            any,
            { page?: number; limit?: number; keyword?: string; module?: string, published?: boolean }
        >({
            query: ({ page, limit, keyword, module, published }) => ({
                url: "/faqs",
                method: "GET",
                params: { page, limit, keyword, module, published },
            }),
        }),
    }),

});
export const {
    useGetFaqsQuery,
} = faqSlice;
