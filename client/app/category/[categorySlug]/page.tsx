import { notFound } from "next/navigation";
import Footer from "@/components/Footer";
import JsonLd from "@/components/JsonLd";
import { fetchListingsData, type ListingsDataListing } from "@/lib/fetchListingsData";
import { getSiteBaseUrl } from "@/lib/siteUrl";
import { buildCollectionPage } from "@/lib/schema";
import ListingsContent from "@/app/listings/ListingsContent";

interface CategoryPageProps {
  params: Promise<{ categorySlug: string }>;
}

function filterListingsByCategorySlug(
  listings: ListingsDataListing[],
  categories: { _id: string; slug: string; parent?: string | null }[],
  categorySlug: string
): ListingsDataListing[] {
  const category = categories.find((c) => c.slug === categorySlug);
  if (!category) return [];
  const childSlugs = categories
    .filter((c) => c.parent && String(c.parent) === String(category._id))
    .map((c) => c.slug);
  const allowedSlugs = new Set([categorySlug, ...childSlugs]);
  return listings.filter(
    (l) => l.category?.slug && allowedSlugs.has(l.category.slug)
  );
}

export async function generateMetadata({ params }: CategoryPageProps) {
  const { categorySlug } = await params;
  const { categories } = await fetchListingsData();
  const category = categories.find((c) => c.slug === categorySlug);
  const title = category
    ? `${category.name} | Listings | 360Nepal`
    : "Listings | 360Nepal";
  const description = category
    ? `Discover ${category.name} in Nepal. Explore places, photos, locations, and reviews.`
    : "Discover places and businesses in Nepal.";
  return {
    title,
    description,
    openGraph: { title, description },
  };
}

export default async function CategoryListingsPage({ params }: CategoryPageProps) {
  const { categorySlug } = await params;
  const { listings, locations, categories } = await fetchListingsData();
  const category = categories.find((c) => c.slug === categorySlug);
  if (!category) notFound();

  const categoryListings = filterListingsByCategorySlug(
    listings,
    categories,
    categorySlug
  );

  const baseUrl = getSiteBaseUrl();
  const path = `/category/${categorySlug}`;
  const schema = buildCollectionPage(baseUrl, {
    name: `${category.name} | Listings | 360Nepal`,
    description: `Discover ${category.name} in Nepal. Explore places, photos, locations, and reviews.`,
    path,
  });

  return (
    <>
      <JsonLd data={schema} />
      <main>
        <ListingsContent
          initialListings={categoryListings}
          initialLocations={locations}
          initialCategories={categories}
          initialCategorySlug={categorySlug}
          hideFilterBar
          pageTitle={category.name}
          pageDescription={`Discover ${category.name} in Nepal. Explore places, photos, locations, and reviews.`}
        />
      </main>
      <Footer />
    </>
  );
}
