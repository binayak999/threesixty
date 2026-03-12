import axios from "axios";

/** Axios instance for app API calls. Uses relative /api paths (same origin). */
export const apiClient = axios.create({
  baseURL: "",
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
