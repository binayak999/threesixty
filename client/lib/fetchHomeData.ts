/**
 * Server-side only: fetches all home page data from the backend via client/server.
 * Use from async Server Components (e.g. app/page.tsx).
 */

import {
  getBanners,
  getCategories,
  getLocations,
  getListings,
  getVideos,
  getBlogs,
} from "@/server";

export interface HomeData {
  banners: Array<{
    _id: string;
    title: string;
    is360?: boolean;
    media: { _id: string; url?: string; type?: string } | string;
    bannerType?: string;
    link?: string;
  }>;
  /** Ads banners (bannerType: adsbanner) for the ads section */
  adsBanners: Array<{
    _id: string;
    title: string;
    media: { _id: string; url?: string; type?: string } | string;
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
  /** Listings used to show a real image per location in PlacesSection (need variety of locations) */
  listingsForPlaces: Array<{
    _id: string;
    title: string;
    slug: string;
    location?: { _id: string; name?: string; slug?: string };
    medias?: Array<{ role: string; media?: { _id: string; url?: string; urlMedium?: string; urlLow?: string } }>;
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
  adsBanners: [],
  categories: [],
  locations: [],
  featuredListings: [],
  listingsForPlaces: [],
  videos: [],
  trendingBlogs: [],
  newsBlogs: [],
};

export async function fetchHomeData(): Promise<HomeData> {
  try {
    const [
      banners,
      adsBannersRaw,
      categories,
      locations,
      featuredListingsRaw,
      listingsForPlacesRaw,
      videos,
      featuredBlogs,
      latestBlogs,
    ] = await Promise.all([
      getBanners({ bannerType: "homebanner", limit: 5 }),
      getBanners({ bannerType: "adsbanner", limit: 6 }),
      getCategories({ type: "listing", parentOnly: true }),
      getLocations({ hasListings: true }),
      getListings({ featuredOnly: true, limit: 6 }),
      getListings({ limit: 24 }),
      getVideos(6),
      getBlogs({ publishedOnly: true, featuredOnly: true, limit: 6 }),
      getBlogs({ publishedOnly: true, limit: 10 }),
    ]);

    const featuredIds = new Set(featuredBlogs.map((b) => b._id));
    const fillFromLatest = latestBlogs.filter((b) => !featuredIds.has(b._id));
    const trendingBlogs = [...featuredBlogs, ...fillFromLatest].slice(0, 6);
    const newsBlogs = [...featuredBlogs, ...fillFromLatest].slice(0, 4);

    return {
      banners,
      adsBanners: adsBannersRaw,
      categories,
      locations,
      featuredListings: featuredListingsRaw,
      listingsForPlaces: listingsForPlacesRaw,
      videos,
      trendingBlogs: trendingBlogs as HomeData["trendingBlogs"],
      newsBlogs: newsBlogs as HomeData["newsBlogs"],
    };
  } catch {
    return emptyHomeData;
  }
}
