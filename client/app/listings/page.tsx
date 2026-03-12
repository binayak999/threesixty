import type { Metadata } from "next";
import Footer from "@/components/Footer";
import JsonLd from "@/components/JsonLd";
import { fetchListingsData } from "@/lib/fetchListingsData";
import { fetchPageBySlug } from "@/lib/fetchPageBySlug";
import { getSiteBaseUrl } from "@/lib/siteUrl";
import { buildCollectionPage } from "@/lib/schema";
import ListingsContent from "./ListingsContent";

const DEFAULT_LISTINGS_TITLE = "Listings | 360Nepal";
const DEFAULT_LISTINGS_DESCRIPTION =
  "Discover places, restaurants, and businesses in Nepal. Explore listings with photos, locations, and reviews.";

interface ListingsPageProps {
  searchParams: Promise<{ q?: string; location?: string; category?: string }>;
}

export async function generateMetadata(): Promise<Metadata> {
  const page = await fetchPageBySlug("listings");
  const seo = page?.seo;
  return {
    title: seo?.metaTitle ?? DEFAULT_LISTINGS_TITLE,
    description: seo?.metaDescription ?? DEFAULT_LISTINGS_DESCRIPTION,
    keywords: seo?.metaKeywords?.length ? seo.metaKeywords.join(", ") : undefined,
    openGraph: {
      title: seo?.metaTitle ?? DEFAULT_LISTINGS_TITLE,
      description: seo?.metaDescription ?? DEFAULT_LISTINGS_DESCRIPTION,
      images: seo?.ogImage ? [seo.ogImage] : undefined,
    },
    robots: seo?.noIndex ? { index: false, follow: false } : undefined,
  };
}

export default async function ListingsListPage({ searchParams }: ListingsPageProps) {
  const params = await searchParams;
  const search = params?.q?.trim();
  const [listingsResult, page] = await Promise.all([
    fetchListingsData(search ? { search } : undefined),
    fetchPageBySlug("listings"),
  ]);
  const { listings, locations, categories } = listingsResult;
  const baseUrl = getSiteBaseUrl();
  const listingsSchema = buildCollectionPage(baseUrl, {
    name: page?.seo?.metaTitle ?? page?.title ?? DEFAULT_LISTINGS_TITLE,
    description: page?.seo?.metaDescription ?? DEFAULT_LISTINGS_DESCRIPTION,
    path: "/listings",
  });
  return (
    <>
      <JsonLd data={listingsSchema} />
      <main>
        <ListingsContent
          initialListings={listings}
          initialLocations={locations}
          initialCategories={categories}
        />
      </main>
      <Footer />
    </>
  );
}
