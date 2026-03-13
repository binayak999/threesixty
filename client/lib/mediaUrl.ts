/**
 * Base URL for media assets. When set, relative paths are prefixed so they resolve to the API.
 * For same-origin loading (recommended in production): leave unset so /uploads/... is requested
 * from the current origin and your server (Next.js rewrites or Nginx) proxies to the backend.
 */
export const MEDIA_BASE_URL =
  (typeof process !== "undefined" && process.env?.NEXT_PUBLIC_MEDIA_BASE_URL) ||
  (typeof process !== "undefined" && process.env?.NEXT_PUBLIC_API_URL) ||
  "";

/**
 * Returns the URL for media. Absolute URLs are returned as-is. Relative paths (e.g. /uploads/xxx)
 * are returned as-is when MEDIA_BASE_URL is empty (same-origin), or prefixed otherwise.
 */
export function getMediaUrl(url: string | undefined | null): string {
  if (url == null || url === "") return "";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  const path = url.startsWith("/") ? url : `/${url}`;
  const base = MEDIA_BASE_URL ? MEDIA_BASE_URL.replace(/\/$/, "") : "";
  return base ? `${base}${path}` : path;
}
