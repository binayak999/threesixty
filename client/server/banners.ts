import { apiClient } from "./client";

export interface BannerMedia {
  _id: string;
  url?: string;
  type?: string;
}

export type BannerType = "homebanner" | "adsbanner";

export interface BannerItem {
  _id: string;
  title: string;
  is360?: boolean;
  media: BannerMedia | string;
  bannerType?: BannerType;
  /** When set and not "#", clicking the banner redirects here */
  link?: string;
}

interface BannersResponse {
  success?: boolean;
  data?: BannerItem[];
}

export interface GetBannersParams {
  bannerType?: BannerType;
}

export async function getBanners(params?: GetBannersParams): Promise<BannerItem[]> {
  const search = new URLSearchParams();
  if (params?.bannerType) search.set("bannerType", params.bannerType);
  const query = search.toString();
  const url = query ? `/api/banners?${query}` : "/api/banners";
  const { data } = await apiClient.get<BannersResponse>(url);
  if (data?.success && Array.isArray(data.data)) return data.data;
  return [];
}
