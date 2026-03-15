import axios from "axios";

// Use NEXT_PUBLIC_API_URL in browser (client components calling getBlogs/getVideos etc.); API_URL on server
const rawUrl = process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || "http://localhost:4000";
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

/**
 * Unwrap list from API response. Accepts:
 * - { success?: boolean; data: T[] }
 * - { data: T[] }
 * - T[] (raw array)
 */
export function unwrapList<T>(body: unknown): T[] {
  if (Array.isArray(body)) return body as T[];
  if (body && typeof body === "object" && "data" in body) {
    const d = (body as { data: unknown }).data;
    if (Array.isArray(d)) return d as T[];
  }
  return [];
}
