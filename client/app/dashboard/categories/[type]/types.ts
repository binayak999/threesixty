export type CategoryType = "listing" | "blog";

export interface CategorySeo {
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string[];
  ogImage?: string;
  noIndex?: boolean;
}

export interface CategoryItem {
  _id: string;
  name: string;
  slug: string;
  type: CategoryType;
  description?: string;
  /** Font Awesome icon class (e.g. fa-house, fa-utensils) */
  icon?: string;
  /** Parent category ID for hierarchy */
  parent?: string | null;
  order?: number;
  status?: 'draft' | 'published';
  seo?: CategorySeo;
  createdAt?: string;
  updatedAt?: string;
}

export const slugify = (s: string) =>
  s
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-");
