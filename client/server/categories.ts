import { apiClient } from "./client";

export interface CategoryItem {
  _id: string;
  name: string;
  slug: string;
  type?: string;
  icon?: string;
  order?: number;
}

interface CategoriesResponse {
  success?: boolean;
  data?: CategoryItem[];
}

export type CategoryType = "listing" | "blog";

export interface GetCategoriesParams {
  type?: CategoryType;
  parentOnly?: boolean;
}

export async function getCategories(params?: GetCategoriesParams | CategoryType): Promise<CategoryItem[]> {
  const search = new URLSearchParams();
  const type = typeof params === "string" ? params : params?.type;
  if (type) search.set("type", type);
  search.set("publishedOnly", "1");
  if (typeof params === "object" && params?.parentOnly) search.set("parentOnly", "1");
  const query = search.toString();
  const url = query ? `/api/categories?${query}` : "/api/categories";
  const { data } = await apiClient.get<CategoriesResponse>(url);
  if (data?.data && Array.isArray(data.data)) return data.data;
  return [];
}
