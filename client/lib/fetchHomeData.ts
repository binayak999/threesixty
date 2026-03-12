/**
 * Server-side only: fetches all home page data from the backend in parallel.
 * Use from async Server Components (e.g. app/page.tsx).
 */

const API_URL = process.env.API_URL || "http://localhost:4000";

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url, { next: { revalidate: 60 } });
  const data = await res.json().catch(() => ({}));
  return data as T;
}

export interface HomeData {
  banners: Array<{
    _id: string;
    title: string;
    is360?: boolean;
    media: { _id: string; url?: string; type?: string } | string;
    bannerType?: string;
    link?: string;
  }>;
  categories: Array<{ _id: string; name: string; slug: string; type?: string; icon?: string; order?: number }>;
  locations: Array<{ _id: string; name: string; slug: string; city?: string; region?: string; country?: string; address?: string }>;
  featuredListings: Array<{
    _id: string;
    title: string;
    slug: string;
    description?: string;
    category?: { _id: string; name?: string; slug?: string };
    location?: { _id: string; name?: string; slug?: string; address?: string; city?: string };
    user?: { name?: string; email?: string };
    medias?: Array<{ role: string; media?: { _id: string; url?: string; urlMedium?: string; urlLow?: string } }>;
    isFeatured?: boolean;
  }>;
  videos: Array<{
    _id: string;
    title: string;
    youtubeLink: string;
    thumbnail?: { _id: string; url?: string } | null;
  }>;
  trendingBlogs: Array<{
    _id: string;
    slug: string;
    title: string;
    excerpt?: string;
    publishedAt?: string;
    user?: { name?: string; email?: string };
    category?: { name?: string; slug?: string };
    medias?: Array<{ role: string; media?: { url?: string } }>;
  }>;
  newsBlogs: Array<{
    _id: string;
    slug: string;
    title: string;
    excerpt?: string;
    publishedAt?: string;
    user?: { name?: string; email?: string };
    category?: { name?: string; slug?: string };
    medias?: Array<{ role: string; media?: { url?: string } }>;
  }>;
}

const emptyHomeData: HomeData = {
  banners: [],
  categories: [],
  locations: [],
  featuredListings: [],
  videos: [],
  trendingBlogs: [],
  newsBlogs: [],
};

export async function fetchHomeData(): Promise<HomeData> {
  const base = API_URL;
  try {
    const [bannersRes, categoriesRes, locationsRes, listingsRes, videosRes, featuredBlogsRes, latestBlogsRes] = await Promise.all([
      fetchJson<{ success?: boolean; data?: HomeData["banners"] }>(`${base}/api/banners?bannerType=homebanner&limit=5`),
      fetchJson<{ success?: boolean; data?: HomeData["categories"] }>(`${base}/api/categories?type=listing&publishedOnly=1&parentOnly=1`),
      fetchJson<{ success?: boolean; data?: HomeData["locations"] }>(`${base}/api/locations?hasListings=1`),
      fetchJson<{ success?: boolean; data?: HomeData["featuredListings"] }>(`${base}/api/listings?featuredOnly=1`),
      fetchJson<{ success?: boolean; data?: HomeData["videos"] }>(`${base}/api/videos`),
      fetchJson<{ success?: boolean; data?: HomeData["trendingBlogs"] }>(`${base}/api/blogs?publishedOnly=1&featuredOnly=1&limit=6`),
      fetchJson<{ success?: boolean; data?: HomeData["newsBlogs"] }>(`${base}/api/blogs?publishedOnly=1&limit=10`),
    ]);

    const banners = (bannersRes?.success && Array.isArray(bannersRes.data) ? bannersRes.data : []).slice(0, 5);
    const categories = categoriesRes?.success && Array.isArray(categoriesRes.data) ? categoriesRes.data : [];
    const locations = locationsRes?.success && Array.isArray(locationsRes.data) ? locationsRes.data : [];
    const featuredListings = (listingsRes?.success && Array.isArray(listingsRes.data) ? listingsRes.data : []).slice(0, 2);
    const videos = (videosRes?.success && Array.isArray(videosRes.data) ? videosRes.data : []).slice(0, 6);

    const featuredBlogs = (featuredBlogsRes?.success && Array.isArray(featuredBlogsRes.data) ? featuredBlogsRes.data : []) as HomeData["trendingBlogs"];
    const latestBlogs = (latestBlogsRes?.success && Array.isArray(latestBlogsRes.data) ? latestBlogsRes.data : []) as HomeData["trendingBlogs"];
    const featuredIds = new Set(featuredBlogs.map((b) => b._id));
    const fillFromLatest = latestBlogs.filter((b) => !featuredIds.has(b._id));
    const trendingBlogs = [...featuredBlogs, ...fillFromLatest].slice(0, 6);
    const newsBlogs = [...featuredBlogs, ...fillFromLatest].slice(0, 4);

    return {
      banners,
      categories,
      locations,
      featuredListings,
      videos,
      trendingBlogs,
      newsBlogs,
    };
  } catch {
    return emptyHomeData;
  }
}
