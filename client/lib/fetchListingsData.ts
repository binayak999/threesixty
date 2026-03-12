/**
 * Server-side only: fetches listings page data from the backend (listings, locations, categories).
 * Use from async Server Components (e.g. app/listings/page.tsx).
 */

const API_URL = process.env.API_URL || "http://localhost:4000";

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url, { next: { revalidate: 60 } });
  const data = await res.json().catch(() => ({}));
  return data as T;
}

export interface ListingsDataListing {
  _id: string;
  title: string;
  slug: string;
  description?: string;
  category?: { _id: string; name?: string; slug?: string };
  location?: { _id: string; name?: string; slug?: string; address?: string; city?: string };
  user?: { name?: string; email?: string };
  medias?: Array<{
    role: string;
    media?: { _id: string; url?: string; urlMedium?: string; urlLow?: string; type?: string };
  }>;
  isFeatured?: boolean;
  reviewAverage?: number;
  reviewCount?: number;
}

export interface ListingsDataLocation {
  _id: string;
  name: string;
  slug: string;
  city?: string;
  region?: string;
  country?: string;
  address?: string;
}

export interface ListingsDataCategory {
  _id: string;
  name: string;
  slug: string;
  type?: string;
  icon?: string;
  order?: number;
  /** Parent category id; absent or null = top-level category */
  parent?: string | null;
}

export interface ListingsData {
  listings: ListingsDataListing[];
  locations: ListingsDataLocation[];
  categories: ListingsDataCategory[];
}

export interface FetchListingsDataOptions {
  /** Search query for listings (title, description, etc.) - passed to backend */
  search?: string;
}

export async function fetchListingsData(options?: FetchListingsDataOptions): Promise<ListingsData> {
  const base = API_URL;
  const search = options?.search?.trim();
  const listingsUrl = search
    ? `${base}/api/listings?search=${encodeURIComponent(search)}&limit=100`
    : `${base}/api/listings?limit=100`;
  try {
    const [listingsRes, locationsRes, categoriesRes] = await Promise.all([
      fetchJson<{ success?: boolean; data?: ListingsDataListing[] }>(listingsUrl),
      fetchJson<{ success?: boolean; data?: ListingsDataLocation[] }>(`${base}/api/locations?hasListings=1`),
      fetchJson<{ success?: boolean; data?: ListingsDataCategory[] }>(`${base}/api/categories?type=listing&publishedOnly=1`),
    ]);

    const listings =
      listingsRes?.success && Array.isArray(listingsRes.data) ? listingsRes.data : [];
    const locations =
      locationsRes?.success && Array.isArray(locationsRes.data) ? locationsRes.data : [];
    const categories =
      categoriesRes?.success && Array.isArray(categoriesRes.data) ? categoriesRes.data : [];

    return { listings, locations, categories };
  } catch {
    return { listings: [], locations: [], categories: [] };
  }
}
