/**
 * Server-only: fetches data for sitemap generation (blogs, listings, categories).
 * Uses backend API directly so sitemap.ts can run at build/request time without client.
 */

const rawUrl = process.env.API_URL || "http://localhost:4000";
const API_BASE = rawUrl.replace(/\/api\/?$/, "");

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url, { next: { revalidate: 3600 } });
  const data = await res.json().catch(() => ({}));
  return data as T;
}

export interface SitemapBlog {
  slug: string;
  updatedAt?: string;
}

const PAGE_SIZE = 100;

export async function getBlogSlugsForSitemap(): Promise<SitemapBlog[]> {
  const out: SitemapBlog[] = [];
  try {
    let page = 1;
    let hasMore = true;
    while (hasMore) {
      const data = await fetchJson<{
        success?: boolean;
        data?: { slug?: string; updatedAt?: string }[];
        pagination?: { totalPages: number };
      }>(`${API_BASE}/api/blogs?publishedOnly=1&limit=${PAGE_SIZE}&page=${page}`);
      const list = data?.success && Array.isArray(data.data) ? data.data : [];
      for (const b of list) {
        if (b?.slug) out.push({ slug: b.slug, updatedAt: b.updatedAt });
      }
      const totalPages = data?.pagination?.totalPages ?? 1;
      hasMore = page < totalPages;
      page += 1;
    }
  } catch {
    // return what we have
  }
  return out;
}

export interface SitemapListing {
  slug: string;
  updatedAt?: string;
}

export interface SitemapCategory {
  slug: string;
}

export interface SitemapListingsData {
  listings: SitemapListing[];
  categories: SitemapCategory[];
}

export async function getListingsDataForSitemap(): Promise<SitemapListingsData> {
  const listings: SitemapListing[] = [];
  let categories: SitemapCategory[] = [];
  try {
    const categoriesRes = await fetchJson<{ success?: boolean; data?: { slug: string }[] }>(
      `${API_BASE}/api/categories?type=listing&publishedOnly=1`
    );
    categories =
      categoriesRes?.success && Array.isArray(categoriesRes.data)
        ? categoriesRes.data
            .filter((c): c is { slug: string } => Boolean(c?.slug))
            .map((c) => ({ slug: c.slug }))
        : [];

    let page = 1;
    let hasMore = true;
    while (hasMore) {
      const listingsRes = await fetchJson<{
        success?: boolean;
        data?: { slug?: string; updatedAt?: string }[];
        pagination?: { totalPages: number };
      }>(`${API_BASE}/api/listings?limit=${PAGE_SIZE}&page=${page}`);
      const list = listingsRes?.success && Array.isArray(listingsRes.data) ? listingsRes.data : [];
      for (const l of list) {
        if (l?.slug) listings.push({ slug: l.slug, updatedAt: l.updatedAt });
      }
      const totalPages = listingsRes?.pagination?.totalPages ?? 1;
      hasMore = page < totalPages;
      page += 1;
    }
  } catch {
    // return what we have
  }
  return { listings, categories };
}
