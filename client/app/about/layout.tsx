import type { Metadata } from "next";
import JsonLd from "@/components/JsonLd";
import { getSiteBaseUrl } from "@/lib/siteUrl";
import { getMediaUrl } from "@/lib/mediaUrl";
import { buildAboutPage, buildWebPage } from "@/lib/schema";
import { fetchPageBySlug, getPageBannerRawUrl } from "@/lib/fetchPageBySlug";
import { AboutPageDataProvider } from "./AboutPageDataContext";

const DEFAULT_ABOUT_TITLE = "About | 360Nepal";
const DEFAULT_ABOUT_DESCRIPTION =
  "Learn about 360Nepal — exploring Nepal's culture, cuisine, trusted local businesses, and immersive experiences.";
const DEFAULT_BANNER = "/assets/images/header/01.jpg";

export async function generateMetadata(): Promise<Metadata> {
  const page = await fetchPageBySlug("about");
  const seo = page?.seo;
  return {
    title: seo?.metaTitle ?? DEFAULT_ABOUT_TITLE,
    description: seo?.metaDescription ?? DEFAULT_ABOUT_DESCRIPTION,
    keywords: seo?.metaKeywords?.length ? seo.metaKeywords.join(", ") : undefined,
    openGraph: {
      title: seo?.metaTitle ?? DEFAULT_ABOUT_TITLE,
      description: seo?.metaDescription ?? DEFAULT_ABOUT_DESCRIPTION,
      images: seo?.ogImage ? [seo.ogImage] : undefined,
    },
    robots: seo?.noIndex ? { index: false, follow: false } : undefined,
  };
}

export default async function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const baseUrl = getSiteBaseUrl();
  const page = await fetchPageBySlug("about");
  const bannerUrl = (() => {
    const raw = getPageBannerRawUrl(page);
    return raw ? getMediaUrl(raw) : DEFAULT_BANNER;
  })();
  const heroTitle = page?.title ?? "360Nepal was founded with a vision to your original vision or inspiration.";
  const heroSubtitle =
    page?.seo?.metaDescription ?? "7+ YEARS EXPERIENCED IN FIELD";

  const aboutSchema = page?.seo
    ? buildWebPage(baseUrl, {
        name: page.seo.metaTitle ?? page.title ?? "About 360Nepal",
        description: page.seo.metaDescription ?? DEFAULT_ABOUT_DESCRIPTION,
        path: "/about",
      })
    : buildAboutPage(baseUrl);

  return (
    <>
      <JsonLd data={aboutSchema} />
      <AboutPageDataProvider bannerUrl={bannerUrl} heroTitle={heroTitle} heroSubtitle={heroSubtitle}>
        {children}
      </AboutPageDataProvider>
    </>
  );
}
