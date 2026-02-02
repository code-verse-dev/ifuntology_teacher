import { PUBLIC_URL } from "../constants/api";

export const ImageUrl = (image: string) => `${PUBLIC_URL}/images/${image}`.replace("//", "/");
