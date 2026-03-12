import { apiClient } from "./client";

export interface BlogMediaRef {
  role: string;
  media?: { url?: string };
}

export interface BlogItem {
  _id: string;
  slug: string;
  title: string;
  excerpt?: string;
  publishedAt?: string;
  user?: { name?: string; email?: string };
  category?: { name?: string; slug?: string };
  medias?: BlogMediaRef[];
}

interface BlogsResponse {
  data?: BlogItem[];
}

export interface GetBlogsParams {
  publishedOnly?: boolean;
  featuredOnly?: boolean;
  limit?: number;
}

export async function getBlogs(params?: GetBlogsParams): Promise<BlogItem[]> {
  const search = new URLSearchParams();
  if (params?.publishedOnly) search.set("publishedOnly", "1");
  if (params?.featuredOnly) search.set("featuredOnly", "1");
  const query = search.toString();
  const url = query ? `/api/blogs?${query}` : "/api/blogs";
  const { data } = await apiClient.get<BlogsResponse>(url);
  let list = data?.data && Array.isArray(data.data) ? data.data : [];
  if (params?.limit != null && params.limit > 0) list = list.slice(0, params.limit);
  return list;
}
