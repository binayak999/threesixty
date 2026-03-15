/**
 * Base URL for media assets (backend origin). Only used when we need an absolute URL
 * (e.g. open graph, redirects). For <img src> we use relative paths to avoid hydration mismatch.
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

/** @deprecated Prefer relative URLs for in-page media. */
export const MEDIA_BASE_URL = getMediaBaseUrl();

/**
 * Returns the URL for media in the app (e.g. <img src>). Uses relative paths (/uploads/...)
 * so server and client render the same URL and Next.js rewrites can proxy to the backend.
 * Absolute URLs from the API are returned as-is. This avoids hydration mismatch from
 * env differing between server (no NEXT_PUBLIC_*) and client (inlined).
 */
export function getMediaUrl(url: string | undefined | null): string {
  if (url == null || url === "") return "";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  const path = url.startsWith("/") ? url : `/${url}`;
  // Always use relative path so SSR and client output match; rewrites proxy /uploads to backend
  return path;
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
