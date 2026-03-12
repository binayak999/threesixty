export interface ListingUser {
  _id: string;
  name?: string;
  email?: string;
}

export interface ListingCategory {
  _id: string;
  name?: string;
  slug?: string;
}

export interface ListingLocation {
  _id: string;
  address?: string;
  city?: string;
  region?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
}

export interface ListingMediaRef {
  media: string | { _id: string; url?: string; urlMedium?: string; urlLow?: string; type?: string };
  role: "feature" | "gallery" | "video";
  order?: number;
}

export interface ListingItem {
  _id: string;
  title: string;
  description: string;
  slug: string;
  category: ListingCategory | string;
  location: ListingLocation | string;
  user: ListingUser | string;
  medias?: ListingMediaRef[];
  /** draft | published; legacy isActive treated as published when true */
  status?: 'draft' | 'published';
  /** When true, can be highlighted on homepage */
  isFeatured?: boolean;
  openingHours?: Array<{ dayOfWeek: string; openTime?: string; closeTime?: string; isClosed: boolean }>;
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    metaKeywords?: string[];
    ogImage?: string;
    noIndex?: boolean;
  };
  createdAt: string;
  updatedAt: string;
}
