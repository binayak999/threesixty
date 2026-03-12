import type { Metadata } from "next";
import JsonLd from "@/components/JsonLd";
import { getSiteBaseUrl } from "@/lib/siteUrl";
import { getMediaUrl } from "@/lib/mediaUrl";
import { buildWebPage } from "@/lib/schema";
import { fetchPageBySlug } from "@/lib/fetchPageBySlug";
import { BlogsPageDataProvider } from "./BlogsPageDataContext";

const DEFAULT_BLOGS_TITLE = "Blogs | 360Nepal";
const DEFAULT_BLOGS_DESCRIPTION =
  "Stories, guides, and updates from 360Nepal. Explore Nepal from every angle.";
const DEFAULT_BANNER = "/assets/images/header/02.jpg";

export async function generateMetadata(): Promise<Metadata> {
  const page = await fetchPageBySlug("blogs");
  const seo = page?.seo;
  return {
    title: seo?.metaTitle ?? DEFAULT_BLOGS_TITLE,
    description: seo?.metaDescription ?? DEFAULT_BLOGS_DESCRIPTION,
    keywords: seo?.metaKeywords?.length ? seo.metaKeywords.join(", ") : undefined,
    openGraph: {
      title: seo?.metaTitle ?? DEFAULT_BLOGS_TITLE,
      description: seo?.metaDescription ?? DEFAULT_BLOGS_DESCRIPTION,
      images: seo?.ogImage ? [seo.ogImage] : undefined,
    },
    robots: seo?.noIndex ? { index: false, follow: false } : undefined,
  };
}

export default async function BlogsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const baseUrl = getSiteBaseUrl();
  const page = await fetchPageBySlug("blogs");
  const bannerUrl =
    page?.banner && typeof page.banner === "object" && page.banner.url
      ? getMediaUrl(page.banner.url)
      : DEFAULT_BANNER;
  const heroTitle =
    page?.title ?? "Blogs";

  const blogListSchema = buildWebPage(baseUrl, {
    name: page?.seo?.metaTitle ?? page?.title ?? DEFAULT_BLOGS_TITLE,
    description: page?.seo?.metaDescription ?? DEFAULT_BLOGS_DESCRIPTION,
    path: "/blogs",
  });

  return (
    <>
      <JsonLd data={blogListSchema} />
      <BlogsPageDataProvider bannerUrl={bannerUrl} heroTitle={heroTitle}>
        {children}
      </BlogsPageDataProvider>
    </>
  );
}
