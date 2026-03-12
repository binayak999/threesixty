/**
 * Canonical base URL for the site (used in JSON-LD and meta tags).
 * Set NEXT_PUBLIC_APP_URL in .env (e.g. https://360nepal.com).
 * On Vercel, VERCEL_URL is set and we can use https://${VERCEL_URL}.
 */
export function getSiteBaseUrl(): string {
  if (typeof process !== "undefined" && process.env?.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "");
  }
  if (typeof process !== "undefined" && process.env?.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return "";
}
