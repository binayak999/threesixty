/**
 * Base URL for media assets (backend origin that serves /uploads). Same logic everywhere so
 * home, listings, and single listing pages all resolve media URLs consistently.
 * - NEXT_PUBLIC_MEDIA_BASE_URL or NEXT_PUBLIC_API_URL: backend root (no trailing /api). Use for client + server.
 * - API_URL (server-only): fallback when NEXT_PUBLIC_* are unset; we strip /api to get origin.
 * - Leave all unset for same-origin: relative /uploads/... with Next.js rewrites.
 */
function getMediaBaseUrl(): string {
  if (typeof process === "undefined") return "";
  const fromPublic =
    process.env?.NEXT_PUBLIC_MEDIA_BASE_URL ||
    process.env?.NEXT_PUBLIC_API_URL ||
    "";
  if (fromPublic) return fromPublic.replace(/\/$/, "");
  const apiUrl = process.env?.API_URL || "";
  if (apiUrl) {
    const stripped = apiUrl.replace(/\/api\/?$/i, "").trim();
    return stripped.replace(/\/$/, "");
  }
  return "";
}

export const MEDIA_BASE_URL = getMediaBaseUrl();

/**
 * Returns the URL for media. Absolute URLs are returned as-is. Relative paths (e.g. /uploads/xxx)
 * are prefixed with MEDIA_BASE_URL when set, otherwise returned as-is (same-origin).
 */
export function getMediaUrl(url: string | undefined | null): string {
  if (url == null || url === "") return "";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  const path = url.startsWith("/") ? url : `/${url}`;
  const base = MEDIA_BASE_URL;
  return base ? `${base}${path}` : path;
}

/** Media object shape from API (listing, blog, banner, etc.). */
export interface MediaRef {
  url?: string;
  urlMedium?: string;
  urlLow?: string;
  type?: string;
}

/**
 * Resolve URL from a media ref (urlMedium || url || urlLow). Use this for listing images,
 * blog images, review images, etc. so all pages use the same media URL logic.
 * Accepts string (e.g. media ID when not populated) and returns "" in that case.
 */
export function getMediaUrlFromRef(media: MediaRef | string | null | undefined): string {
  if (media == null) return "";
  if (typeof media === "string") return "";
  const path = media.urlMedium || media.url || media.urlLow || "";
  return getMediaUrl(path);
}
