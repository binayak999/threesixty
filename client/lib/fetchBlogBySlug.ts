/**
 * Server-side only: fetches a single blog post by slug from the backend.
 * Use from async Server Components (e.g. app/blogs/[slug]/page.tsx).
 */

const API_URL = process.env.API_URL || "http://localhost:4000";

export interface BlogBySlugResult {
  _id: string;
  title: string;
  slug: string;
  excerpt?: string;
  content?: string;
  publishedAt?: string;
  updatedAt?: string;
  user?: { name?: string; email?: string };
  category?: { name?: string; slug?: string };
  medias?: Array<{
    role: string;
    media?: { url?: string; type?: string };
  }>;
}

export async function fetchBlogBySlug(slug: string): Promise<BlogBySlugResult | null> {
  try {
    const res = await fetch(`${API_URL}/api/blogs/slug/${encodeURIComponent(slug)}`, {
      next: { revalidate: 60 },
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok || !json?.success || !json?.data) return null;
    return json.data as BlogBySlugResult;
  } catch {
    return null;
  }
}
