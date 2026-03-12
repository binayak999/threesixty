/**
 * Fetches a page by slug from the API (for server components and generateMetadata).
 * Returns null if not found or on error.
 */

const API_URL = process.env.API_URL || "http://localhost:4000";

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

export interface PageBySlug {
  _id: string;
  title: string;
  slug: string;
  banner?: PageBanner | null;
  seo?: PageSeo | null;
}

export async function fetchPageBySlug(slug: string): Promise<PageBySlug | null> {
  try {
    const res = await fetch(
      `${API_URL}/api/pages/slug/${encodeURIComponent(slug)}`,
      { next: { revalidate: 60 } }
    );
    const json = await res.json().catch(() => ({}));
    if (!res.ok || !json?.data) return null;
    return json.data as PageBySlug;
  } catch {
    return null;
  }
}
