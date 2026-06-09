import { createApi } from "@reduxjs/toolkit/query/react";
import baseQueryWithReauth from "../../reauth/baseQueryWithReauth";

export type CharacterCatalogVariation = {
  id: string;
  categoryId: string;
  label: string;
  imagePath: string;
  sortOrder: number;
  isDefault: boolean;
};

export type CharacterCatalogCategory = {
  id: string;
  name: string;
  slug: string;
  layerOrder: number;
  iconPath?: string;
  iconTooltip?: string;
  variations: CharacterCatalogVariation[];
};

export const characterSlice = createApi({
  reducerPath: "characterApi",
  baseQuery: baseQueryWithReauth,
  endpoints: (builder) => ({
    getCharacterCatalog: builder.query<CharacterCatalogCategory[], void>({
      query: () => ({
        url: "/character/catalog",
        method: "GET",
      }),
      transformResponse: (response: CharacterCatalogCategory[] | { data?: CharacterCatalogCategory[] }) => {
        if (Array.isArray(response)) return response;
        return response?.data ?? [];
      },
    }),
  }),
});

export const { useGetCharacterCatalogQuery } = characterSlice;
