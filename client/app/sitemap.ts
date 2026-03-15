import type { MetadataRoute } from "next";
import { getSiteBaseUrl } from "@/lib/siteUrl";
import {
  getBlogSlugsForSitemap,
  getListingsDataForSitemap,
} from "@/lib/sitemapData";

/** Common static pages and listing index pages (blogs, videos, listings). */
const STATIC_PATHS = [
  "",
  "/about",
  "/contact",
  "/blogs",
  "/videos",
  "/listings",
] as const;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getSiteBaseUrl();
  if (!base) {
    return [];
  }

  const entries: MetadataRoute.Sitemap = [];

  // Static and common pages
  type ChangeFreq = "weekly" | "monthly";
  entries.push(
    ...STATIC_PATHS.map((path) => {
      const changeFrequency: ChangeFreq = path === "" ? "weekly" : "monthly";
      return {
        url: `${base}${path || "/"}`,
        lastModified: new Date(),
        changeFrequency,
        priority: path === "" ? 1 : 0.8,
      };
    })
  );

  // Blog posts
  const blogs = await getBlogSlugsForSitemap();
  for (const b of blogs) {
    entries.push({
      url: `${base}/blogs/${b.slug}`,
      lastModified: b.updatedAt ? new Date(b.updatedAt) : new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    });
  }

  // Listings and categories
  const { listings, categories } = await getListingsDataForSitemap();
  for (const l of listings) {
    entries.push({
      url: `${base}/listings/${l.slug}`,
      lastModified: l.updatedAt ? new Date(l.updatedAt) : new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    });
  }
  for (const c of categories) {
    entries.push({
      url: `${base}/category/${c.slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.6,
    });
  }

  return entries;
}
