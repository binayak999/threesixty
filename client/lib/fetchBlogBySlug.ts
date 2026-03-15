/**
 * Server-side only: fetches a single blog post by slug from the backend.
 * Use from async Server Components (e.g. app/blogs/[slug]/page.tsx).
 */

const rawUrl = process.env.API_URL || "http://localhost:4000";
const API_BASE = rawUrl.replace(/\/api\/?$/, "");

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
    const res = await fetch(`${API_BASE}/api/blogs/slug/${encodeURIComponent(slug)}`, {
      next: { revalidate: 60 },
    });
    const json = await res.json().catch(() => ({}));
    const blog = (json?.data ?? json) as BlogBySlugResult | undefined;
    if (!res.ok || !blog?.slug) return null;
    return blog;
  } catch {
    return null;
  }
}
