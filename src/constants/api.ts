const { hostname } = window.location;

const servers = {
  local: "http://localhost:3011",
  customDev: "https://react.customdev.solutions:3011",
  live: "",
  dummy: "https://9d2f-204-157-158-10.ngrok-free.app",
};

let URL;
let publicUrl = "/";

type Environment = "development" | "customdev" | "live" | "testing";
let enviroment: Environment = "development";

if (hostname.includes("customdev.solutions")) {
  URL = servers.customDev;
  publicUrl = "/ifuntology-teacher";
  enviroment = "customdev";
} else if (hostname.includes("localhost")) {
  URL = servers.local;
  enviroment = "development"; 
} else {
  URL = servers.live;
  enviroment = "live";
}
export const SOCKET_URL = URL;
export const UPLOADS_URL = `${URL}/`;
export const BASE_URL = `${URL}/api`;
export const PUBLIC_URL = publicUrl;
export const ENV = enviroment;
