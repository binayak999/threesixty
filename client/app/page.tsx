import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import HeroSection from "@/components/HeroSection";
import CategoriesSection from "@/components/CategoriesSection";
import AdsSection from "@/components/AdsSection";
import PlacesSection from "@/components/PlacesSection";
import PopularRestaurantsSection from "@/components/PopularRestaurantsSection";
import VideoSection from "@/components/VideoSection";
import TrendingNowSection from "@/components/TrendingNowSection";
import NewsSection from "@/components/NewsSection";
import AboutSection from "@/components/AboutSection";
import JsonLd from "@/components/JsonLd";
import { fetchHomeData } from "@/lib/fetchHomeData";
import { fetchPageBySlug } from "@/lib/fetchPageBySlug";
import { getSiteBaseUrl } from "@/lib/siteUrl";
import { buildWebPage } from "@/lib/schema";
import type { BannerItem, CategoryItem, LocationItem, ListingItem, VideoItem, BlogItem } from "@/server";

const DEFAULT_HOME_TITLE = "360Nepal - Discover Every Angle, Every Story";
const DEFAULT_HOME_DESCRIPTION =
  "Your ultimate guide to exploring, connecting, and thriving in Nepal's rich cultural landscape. Explore listings, blogs, videos, and more.";

export async function generateMetadata(): Promise<Metadata> {
  const page = await fetchPageBySlug("home");
  const seo = page?.seo;
  return {
    title: seo?.metaTitle ?? DEFAULT_HOME_TITLE,
    description: seo?.metaDescription ?? DEFAULT_HOME_DESCRIPTION,
    keywords: seo?.metaKeywords?.length ? seo.metaKeywords.join(", ") : undefined,
    openGraph: {
      title: seo?.metaTitle ?? DEFAULT_HOME_TITLE,
      description: seo?.metaDescription ?? DEFAULT_HOME_DESCRIPTION,
      images: seo?.ogImage ? [seo.ogImage] : undefined,
    },
    robots: seo?.noIndex ? { index: false, follow: false } : undefined,
  };
}

export default async function HomePage() {
  const [data, page] = await Promise.all([
    fetchHomeData(),
    fetchPageBySlug("home"),
  ]);
  const baseUrl = getSiteBaseUrl();
  const homeSchema = buildWebPage(baseUrl, {
    name: page?.seo?.metaTitle ?? page?.title ?? DEFAULT_HOME_TITLE,
    description: page?.seo?.metaDescription ?? DEFAULT_HOME_DESCRIPTION,
    path: "/",
  });

  return (
    <>
      <JsonLd data={homeSchema} />
      <Navbar />
      <main>
        <HeroSection banners={data.banners as BannerItem[]} locations={data.locations as LocationItem[]} />
        <CategoriesSection categories={data.categories as CategoryItem[]} />
        <AdsSection banners={(data.adsBanners ?? []) as BannerItem[]} />
        <PlacesSection locations={(data.locations as LocationItem[]).slice(0, 4)} listings={data.listingsForPlaces as ListingItem[]} />
        <PopularRestaurantsSection listings={(data.featuredListings ?? []) as ListingItem[]} adsBanners={(data.adsBanners ?? []) as BannerItem[]} />
        <VideoSection videos={data.videos as VideoItem[]} />
        <TrendingNowSection posts={data.trendingBlogs as BlogItem[]} />
        <NewsSection articles={data.newsBlogs as BlogItem[]} />
        <AboutSection />
      </main>
      <Footer />
    </>
  );
}
