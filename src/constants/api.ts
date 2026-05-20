const { hostname } = window.location;

const servers = {
  local: "http://localhost:3030",
  customDev: "https://react.customdev.solutions:3030",
  live: "",
};

function normalizeApiBase(raw: string | undefined): string {
  if (raw == null) return "";
  return raw.trim().replace(/\/+$/, "");
}

const viteApi = normalizeApiBase(import.meta.env.VITE_API_URL as string | undefined);

let URL = viteApi;
if (!URL) {
  if (hostname.includes("react.customdev.solutions")) {
    URL = servers.customDev;
  } else if (
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname.includes("local")
  ) {
    URL = servers.local;
  } else {
    URL = servers.live;
  }
}
if (!URL && import.meta.env.DEV) {
  URL = servers.local;
}

/** API host for uploads/PDFs; empty in prod same-origin setups uses relative `/api` + Vite proxy. */
export const SOCKET_URL = URL;
export const UPLOADS_URL = URL ? `${URL}/Uploads/` : "/Uploads/";
export const BASE_URL = URL ? `${URL}/api` : "/api";
export const PUBLIC_URL = "/";
