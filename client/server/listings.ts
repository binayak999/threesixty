import { apiClient, unwrapList } from "./client";

export interface ListingMediaRef {
  role: string;
  media?: { _id: string; url?: string; urlMedium?: string; urlLow?: string; type?: string };
}

export interface ListingItem {
  _id: string;
  title: string;
  slug: string;
  description?: string;
  category?: { _id: string; name?: string; slug?: string };
  location?: { _id: string; name?: string; slug?: string; address?: string; city?: string };
  user?: { name?: string; email?: string };
  medias?: ListingMediaRef[];
  isFeatured?: boolean;
}

interface ListingsResponse {
  success?: boolean;
  data?: ListingItem[];
}

export interface GetListingsParams {
  featuredOnly?: boolean;
  limit?: number;
}

export async function getListings(params?: GetListingsParams): Promise<ListingItem[]> {
  const search = new URLSearchParams();
  if (params?.featuredOnly) search.set("featuredOnly", "1");
  if (params?.limit != null && params.limit > 0) search.set("limit", String(params.limit));
  const query = search.toString();
  const url = query ? `/api/listings?${query}` : "/api/listings";
  const { data } = await apiClient.get<ListingsResponse>(url);
  let list = unwrapList<ListingItem>(data);
  if (params?.limit != null && params.limit > 0) list = list.slice(0, params.limit);
  return list;
}
