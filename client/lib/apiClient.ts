import axios from "axios";

/**
 * Shared axios instance for client-side API calls.
 * Talks to backend directly (NEXT_PUBLIC_API_URL in browser, API_URL on server); no Next.js API proxy.
 * - withCredentials: true so cookies (auth_session) are sent.
 * - FormData: Content-Type is cleared so axios/browser sets multipart/form-data with boundary.
 */
const API_BASE = process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || "http://localhost:4000";

export const apiClient = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use((config) => {
  if (typeof FormData !== "undefined" && config.data instanceof FormData) {
    delete config.headers["Content-Type"];
  }
  return config;
});

apiClient.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      // Optional: redirect to sign-in or clear session
    }
    return Promise.reject(err);
  }
);
