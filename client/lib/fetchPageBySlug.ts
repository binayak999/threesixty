/**
 * Fetches a page by slug from the API (for server components and generateMetadata).
 * Returns null if not found or on error.
 * Uses server apiClient so base URL and behavior match the rest of the app.
 */

import { apiClient } from "@/server/client";

export interface PageSeo {
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string[];
  ogImage?: string;
  noIndex?: boolean;
}

export interface PageBanner {
  _id: string;
  url?: string;
  urlMedium?: string;
  urlLow?: string;
}

/** Get the first available image URL from a page's banner (populated Media). */
export function getPageBannerRawUrl(page: PageBySlug | null | undefined): string | undefined {
  const b = page?.banner;
  if (!b || typeof b !== "object") return undefined;
  const media = b as { url?: string; urlMedium?: string; urlLow?: string };
  return media.url ?? media.urlMedium ?? media.urlLow;
}

export interface PageBySlug {
  _id: string;
  title: string;
  slug: string;
  banner?: PageBanner | null;
  seo?: PageSeo | null;
}

export async function fetchPageBySlug(slug: string): Promise<PageBySlug | null> {
  try {
    const res = await apiClient.get<{ success?: boolean; data?: PageBySlug }>(
      `/api/pages/slug/${encodeURIComponent(slug)}`
    );
    const data = res.data;
    const page = (data?.data ?? data) as PageBySlug | undefined;
    if (!page?.slug) return null;
    return page;
  } catch {
    return null;
  }
}
