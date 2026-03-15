import axios from "axios";

const rawUrl = process.env.API_URL || "http://localhost:4000";
// Strip trailing /api or /api/ so baseURL is the origin; server paths are always /api/...
const baseURL = rawUrl.replace(/\/api\/?$/, "");

/** Axios instance for server-side API calls. Talks to backend (API_URL) directly. */
export const apiClient = axios.create({
  baseURL,
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
});

apiClient.interceptors.response.use(
  (res) => res,
  (err) => {
    console.error("[API]", err?.response?.status, err?.config?.url, err?.message);
    return Promise.reject(err);
  }
);
