import { createApi } from "@reduxjs/toolkit/query/react";
import baseQueryWithReauth from "../../reauth/baseQueryWithReauth";

export const ticketSlice = createApi({
    reducerPath: "ticketApi",
    baseQuery: baseQueryWithReauth,
    tagTypes: ["Ticket"],
    endpoints: (builder) => ({
        getMyTickets: builder.query<
            any,
            { page?: number; limit?: number; keyword?: string; component?: string }
        >({
            query: ({ page, limit, keyword, component }) => ({
                url: "/ticket/my",
                method: "GET",
                params: { page, limit, keyword, component },
            }),
            providesTags: ["Ticket"],
        }),

        createTicket: builder.mutation<
            any,
            { data: any }
        >({
            query: ({ data }) => ({
                url: "/ticket",
                method: "POST",
                body: data,
            }),
            invalidatesTags: ["Ticket"],
        }),

    }),

});
export const {
    useGetMyTicketsQuery,
    useCreateTicketMutation,
} = ticketSlice;
