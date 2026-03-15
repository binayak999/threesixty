import { apiClient, unwrapList } from "./client";

export interface LocationItem {
  _id: string;
  name: string;
  slug: string;
  city?: string;
  region?: string;
  country?: string;
  address?: string;
}

interface LocationsResponse {
  success?: boolean;
  data?: LocationItem[];
}

export interface GetLocationsParams {
  hasListings?: boolean;
}

export async function getLocations(params?: GetLocationsParams): Promise<LocationItem[]> {
  const search = new URLSearchParams();
  if (params?.hasListings) search.set("hasListings", "1");
  const query = search.toString();
  const url = query ? `/api/locations?${query}` : "/api/locations";
  const { data } = await apiClient.get<LocationsResponse>(url);
  return unwrapList<LocationItem>(data);
}
