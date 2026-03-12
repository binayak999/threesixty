/**
 * Base URL for media assets (images, videos). When set, relative paths like
 * /uploads/... are prefixed with this so they resolve to the API/server that serves uploads.
 * Set NEXT_PUBLIC_MEDIA_BASE_URL in .env (e.g. http://localhost:4000) when media is on another origin.
 */
export const MEDIA_BASE_URL =
  (typeof process !== "undefined" && process.env?.NEXT_PUBLIC_MEDIA_BASE_URL) ||
  (typeof process !== "undefined" && process.env?.NEXT_PUBLIC_API_URL) ||
  "";

/**
 * Returns a full URL for media. If the given url is already absolute (starts with http),
 * it is returned as-is. Otherwise MEDIA_BASE_URL is prepended so relative paths resolve correctly.
 */
export function getMediaUrl(url: string | undefined | null): string {
  if (url == null || url === "") return "";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  const base = MEDIA_BASE_URL ? MEDIA_BASE_URL.replace(/\/$/, "") : "";
  const path = url.startsWith("/") ? url : `/${url}`;
  return base ? `${base}${path}` : path;
}
