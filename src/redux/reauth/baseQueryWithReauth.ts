import { fetchBaseQuery } from "@reduxjs/toolkit/query";
import { BASE_URL } from "../../constants/api";

const rawBaseQuery = fetchBaseQuery({
  baseUrl: BASE_URL,
  credentials: "include",
});

const baseQueryWithReauth = async (args: any, api: any, extraOptions: any) => {
  const result = await rawBaseQuery(args, api, extraOptions);

  if (result?.error?.status === 401 || result?.error?.status === "FETCH_ERROR") {

    // remove location from redux and local storage
    localStorage.removeItem("persist:location");

    localStorage.removeItem("user");
    api.dispatch({ type: "/user/logout" });

    if (window.location.hostname.includes("customdev.solutions")) {
      window.location.href = "/ifuntology/teacher/login";
    } else {
      window.location.href = "/login";
    }
  }

  return result;
};

export default baseQueryWithReauth;
