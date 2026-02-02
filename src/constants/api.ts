const { hostname } = window.location;

const servers = {
  local: "http://localhost:3030",
  customDev: "https://react.customdev.solutions:3030",
  live: "",
};

let publicUrl = "/";

let URL;
if (hostname.includes("react.customdev.solutions")) URL = servers.customDev;
else if (hostname.includes("local")) URL = servers.local;
else URL = servers.live;

export const SOCKET_URL = `${URL}`;
export const UPLOADS_URL = URL + "/Uploads/";
export const BASE_URL = URL + "/api";
export const PUBLIC_URL = publicUrl;
