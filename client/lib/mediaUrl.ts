/**
 * Base URL for media assets (backend origin that serves /uploads).
 * - Set NEXT_PUBLIC_MEDIA_BASE_URL to your backend root (e.g. https://api.360nepal.com) so
 *   image requests go directly to the backend when the proxy is unreliable.
 * - Or set NEXT_PUBLIC_API_URL as fallback (same: backend root, no trailing /api).
 * - Leave both unset for same-origin: browser requests /uploads/... and Next.js rewrites to backend.
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
