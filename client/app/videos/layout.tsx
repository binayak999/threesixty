import type { Metadata } from "next";
import JsonLd from "@/components/JsonLd";
import { getSiteBaseUrl } from "@/lib/siteUrl";
import { getMediaUrl } from "@/lib/mediaUrl";
import { buildWebPage } from "@/lib/schema";
import { fetchPageBySlug } from "@/lib/fetchPageBySlug";
import { VideosPageDataProvider } from "./VideosPageDataContext";

const DEFAULT_VIDEOS_TITLE = "Videos | 360Nepal";
const DEFAULT_VIDEOS_DESCRIPTION =
  "Watch our curated collection of videos. Experience Nepal from every angle.";
const DEFAULT_BANNER = "/assets/images/header/02.jpg";

export async function generateMetadata(): Promise<Metadata> {
  const page = await fetchPageBySlug("videos");
  const seo = page?.seo;
  return {
    title: seo?.metaTitle ?? DEFAULT_VIDEOS_TITLE,
    description: seo?.metaDescription ?? DEFAULT_VIDEOS_DESCRIPTION,
    keywords: seo?.metaKeywords?.length ? seo.metaKeywords.join(", ") : undefined,
    openGraph: {
      title: seo?.metaTitle ?? DEFAULT_VIDEOS_TITLE,
      description: seo?.metaDescription ?? DEFAULT_VIDEOS_DESCRIPTION,
      images: seo?.ogImage ? [seo.ogImage] : undefined,
    },
    robots: seo?.noIndex ? { index: false, follow: false } : undefined,
  };
}

export default async function VideosLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const baseUrl = getSiteBaseUrl();
  const page = await fetchPageBySlug("videos");
  const bannerUrl =
    page?.banner && typeof page.banner === "object" && page.banner.url
      ? getMediaUrl(page.banner.url)
      : DEFAULT_BANNER;
  const heroTitle = page?.title ?? "Videos";
  const heroLead =
    page?.seo?.metaDescription ?? DEFAULT_VIDEOS_DESCRIPTION;

  const videosSchema = buildWebPage(baseUrl, {
    name: page?.seo?.metaTitle ?? page?.title ?? DEFAULT_VIDEOS_TITLE,
    description: page?.seo?.metaDescription ?? DEFAULT_VIDEOS_DESCRIPTION,
    path: "/videos",
  });

  return (
    <>
      <JsonLd data={videosSchema} />
      <VideosPageDataProvider bannerUrl={bannerUrl} heroTitle={heroTitle} heroLead={heroLead}>
        {children}
      </VideosPageDataProvider>
    </>
  );
}
