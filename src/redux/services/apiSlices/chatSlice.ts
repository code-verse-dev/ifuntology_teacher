import { createApi } from "@reduxjs/toolkit/query/react";
import baseQueryWithReauth from "../../reauth/baseQueryWithReauth";

export const chatSlice = createApi({
  reducerPath: "chatApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Chats", "Messages"],
  endpoints: (builder) => ({
    getChats: builder.query<any, { keyword?: string }>({
      query: ({ keyword }) => ({
        url: "/chat",
        method: "GET",
        params: { keyword },
      }),
      providesTags: ["Chats"],
    }),
    createChat: builder.mutation<any, { sender: string; receiver: string }>({
      query: (body) => ({
        url: "/chat",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Chats"],
    }),
    getMessages: builder.query<any, { chatId: string }>({
      query: ({ chatId }) => ({
        url: `/message/${chatId}`,
        method: "GET",
      }),
      providesTags: ["Messages"],
    }),
    sendMessage: builder.mutation<any, { chatId: string; content: string }>({
      query: ({ chatId, content }) => ({
        url: "/message",
        method: "POST",
        body: { chatId, content },
      }),
    }),
   
  }),
});

export const { useGetChatsQuery, useCreateChatMutation, useGetMessagesQuery, useSendMessageMutation } = chatSlice;
