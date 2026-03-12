export type BlogMediaRole = "feature" | "gallery" | "video";

export interface SeoForm {
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;
  ogImage: string;
  noIndex: boolean;
}

export interface BlogMediaRef {
  media: string | { _id: string; url?: string; urlMedium?: string; urlLow?: string; type?: string };
  role: BlogMediaRole;
  order?: number;
}

export type CategoryType = 'listing' | 'blog';

export interface BlogCategory {
  _id: string;
  name: string;
  slug: string;
  type?: CategoryType;
}

export interface BlogUser {
  _id: string;
  name?: string;
  email?: string;
}

export interface BlogItem {
  _id: string;
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  user: BlogUser | string;
  category?: BlogCategory | string | null;
  /** Feature (one), gallery (multiple), video (multiple). Populated medias.media. */
  medias?: BlogMediaRef[];
  tags?: string[];
  publishedAt?: string | null;
  status?: 'draft' | 'pending' | 'published';
  /** When true, can be highlighted on homepage */
  isFeatured?: boolean;
  seo?: SeoForm;
  createdAt: string;
  updatedAt: string;
}

export const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");

export const INITIAL_BLOG_FORM = {
  title: "",
  slug: "",
  excerpt: "",
  content: "",
  category: "",
  tags: "",
  status: "draft" as const,
  publishedAt: "",
  /** Single media id for cover image */
  featureMediaId: "",
  /** Media ids for gallery images (order = index) */
  galleryMediaIds: [] as string[],
  /** Media ids for videos (order = index) */
  videoMediaIds: [] as string[],
  seo: {
    metaTitle: "",
    metaDescription: "",
    metaKeywords: "",
    ogImage: "",
    noIndex: false,
  },
};
