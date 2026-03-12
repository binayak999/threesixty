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

export async function getCategories(type?: CategoryType): Promise<CategoryItem[]> {
  const params = new URLSearchParams();
  if (type) params.set("type", type);
  params.set("publishedOnly", "1");
  const query = params.toString();
  const url = query ? `/api/categories?${query}` : "/api/categories";
  const { data } = await apiClient.get<CategoriesResponse>(url);
  if (data?.data && Array.isArray(data.data)) return data.data;
  return [];
}
