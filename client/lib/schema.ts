/**
 * Schema.org JSON-LD builders for Google and other consumers.
 * All URLs should be absolute when baseUrl is set.
 */

const CONTEXT = "https://schema.org";

export function buildOrganization(baseUrl: string) {
  return {
    "@context": CONTEXT,
    "@type": "Organization",
    name: "360Nepal",
    url: baseUrl || undefined,
    description:
      "Your ultimate guide to exploring, connecting, and thriving in Nepal's rich cultural landscape. Discover every angle, every story.",
    logo: baseUrl ? `${baseUrl}/assets/images/logo.gif` : undefined,
  };
}

export function buildWebSite(baseUrl: string) {
  return {
    "@context": CONTEXT,
    "@type": "WebSite",
    name: "360Nepal",
    url: baseUrl || undefined,
    description:
      "Discover Every Angle, Every Story — Explore, Connect, Thrive. Nepal's guide to culture, cuisine, listings, and more.",
    publisher: baseUrl ? buildOrganization(baseUrl) : undefined,
    potentialAction: baseUrl
      ? {
          "@type": "SearchAction",
          target: { "@type": "EntryPoint", urlTemplate: `${baseUrl}/listings?q={search_term_string}` },
          "query-input": "required name=search_term_string",
        }
      : undefined,
  };
}

export function buildWebPage(
  baseUrl: string,
  opts: { name: string; description?: string; path: string }
) {
  const url = baseUrl ? `${baseUrl}${opts.path}` : undefined;
  return {
    "@context": CONTEXT,
    "@type": "WebPage",
    name: opts.name,
    description: opts.description,
    url,
  };
}

export function buildAboutPage(baseUrl: string) {
  return {
    "@context": CONTEXT,
    "@type": "AboutPage",
    name: "About 360Nepal",
    description:
      "Learn about 360Nepal — exploring Nepal's culture, cuisine, trusted local businesses, and immersive experiences.",
    url: baseUrl ? `${baseUrl}/about` : undefined,
  };
}

export function buildBlogPosting(
  baseUrl: string,
  opts: {
    headline: string;
    description?: string;
    slug: string;
    datePublished?: string;
    dateModified?: string;
    image?: string;
    author?: string;
  }
) {
  const url = baseUrl ? `${baseUrl}/blogs/${opts.slug}` : undefined;
  const schema: Record<string, unknown> = {
    "@context": CONTEXT,
    "@type": "BlogPosting",
    headline: opts.headline,
    description: opts.description,
    url,
    datePublished: opts.datePublished,
    dateModified: opts.dateModified || opts.datePublished,
  };
  if (opts.image) schema.image = opts.image;
  if (opts.author) schema.author = { "@type": "Person", name: opts.author };
  return schema;
}

export function buildItemList(
  baseUrl: string,
  opts: {
    name: string;
    description?: string;
    path: string;
    items: Array<{ name: string; url: string; image?: string }>;
  }
) {
  const listUrl = baseUrl ? `${baseUrl}${opts.path}` : undefined;
  return {
    "@context": CONTEXT,
    "@type": "ItemList",
    name: opts.name,
    description: opts.description,
    url: listUrl,
    numberOfItems: opts.items.length,
    itemListElement: opts.items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "Thing",
        name: item.name,
        url: item.url,
        image: item.image,
      },
    })),
  };
}

export function buildCollectionPage(
  baseUrl: string,
  opts: { name: string; description?: string; path: string }
) {
  return buildWebPage(baseUrl, {
    name: opts.name,
    description: opts.description,
    path: opts.path,
  });
}

export function buildVideoObject(
  baseUrl: string,
  opts: {
    name: string;
    description?: string;
    thumbnailUrl?: string;
    uploadDate?: string;
    embedUrl?: string;
    contentUrl?: string;
  }
) {
  const schema: Record<string, unknown> = {
    "@context": CONTEXT,
    "@type": "VideoObject",
    name: opts.name,
    description: opts.description,
    thumbnailUrl: opts.thumbnailUrl,
    uploadDate: opts.uploadDate,
  };
  if (opts.embedUrl) schema.embedUrl = opts.embedUrl;
  if (opts.contentUrl) schema.contentUrl = opts.contentUrl;
  return schema;
}
