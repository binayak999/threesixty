"use client";

import { useMemo, useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import type {
  ListingsDataCategory,
  ListingsDataListing,
  ListingsDataLocation,
} from "@/lib/fetchListingsData";

/** UI card shape derived from API listing */
export interface ListingCardItem {
  slug: string;
  title: string;
  location: string;
  rating?: number;
  reviewCount?: string;
  image: string;
  category: string;
  categorySlug: string;
  locationSlug: string;
  badge: string | null;
  description: string;
  phone?: string;
}

function mapApiListingToCard(listing: ListingsDataListing): ListingCardItem {
  const featureMedia = listing.medias?.find((m) => m.role === "feature")?.media
    || listing.medias?.[0]?.media;
  const image =
    featureMedia?.urlMedium || featureMedia?.url || featureMedia?.urlLow
    || "/assets/images/place/01.jpg";
  const locationName =
    typeof listing.location === "object" && listing.location
      ? listing.location.name || listing.location.slug || ""
      : "";
  const locationSlug =
    typeof listing.location === "object" && listing.location
      ? listing.location.slug || ""
      : "";
  const categoryName =
    typeof listing.category === "object" && listing.category
      ? listing.category.name || listing.category.slug || ""
      : "";
  const categorySlug =
    typeof listing.category === "object" && listing.category
      ? listing.category.slug || ""
      : "";
  const reviewCount = listing.reviewCount ?? 0;
  const rating = listing.reviewAverage ?? (reviewCount > 0 ? undefined : undefined);
  return {
    slug: listing.slug,
    title: listing.title,
    location: locationName,
    locationSlug,
    category: categoryName,
    categorySlug,
    image,
    badge: listing.isFeatured ? "Featured" : null,
    description: listing.description ?? "",
    rating: rating ?? undefined,
    reviewCount: reviewCount > 0 ? String(reviewCount) : "0",
  };
}

const SORT_OPTIONS = [
  { value: "latest", label: "Latest" },
  { value: "nearby", label: "Nearby" },
  { value: "top-rated", label: "Top rated" },
  { value: "random", label: "Random" },
  { value: "a-z", label: "A-Z" },
];

const PAGE_SIZE = 6;

export interface ListingsContentProps {
  initialListings: ListingsDataListing[];
  initialLocations: ListingsDataLocation[];
  initialCategories: ListingsDataCategory[];
  /** When provided (e.g. from /category/restaurant route), category and sidebar checkbox are pre-selected */
  initialCategorySlug?: string;
  /** When true (e.g. on /category/[slug] page), hide the search/filter bar below the navbar */
  hideFilterBar?: boolean;
  /** Shown in a top section when provided (e.g. category name on /category/[slug]) */
  pageTitle?: string;
  /** Shown below pageTitle when provided */
  pageDescription?: string;
}

export default function ListingsContent({
  initialListings,
  initialLocations,
  initialCategories,
  initialCategorySlug,
  hideFilterBar = false,
  pageTitle,
  pageDescription,
}: ListingsContentProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLocations, setSelectedLocations] = useState<Set<string>>(new Set());
  const [categoryFilter, setCategoryFilter] = useState(initialCategorySlug ?? "");
  const [selectedSubcategories, setSelectedSubcategories] = useState<Set<string>>(new Set());
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(
    () => new Set(initialCategorySlug ? [initialCategorySlug] : [])
  );
  const [sortBy, setSortBy] = useState("latest");
  const [page, setPage] = useState(1);
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const listingsForUi = useMemo(
    () => initialListings.map(mapApiListingToCard),
    [initialListings]
  );

  const parentCategories = useMemo(
    () => initialCategories.filter((c) => !c.parent || c.parent === null),
    [initialCategories]
  );

  const categoriesWithCount = useMemo(() => {
    const countBySlug: Record<string, number> = {};
    listingsForUi.forEach((l) => {
      if (l.categorySlug) countBySlug[l.categorySlug] = (countBySlug[l.categorySlug] ?? 0) + 1;
    });
    return initialCategories.map((c) => ({
      id: c.slug,
      _id: c._id,
      name: c.name,
      parent: c.parent ?? null,
      count: countBySlug[c.slug] ?? 0,
    }));
  }, [initialCategories, listingsForUi]);

  const parentCategoriesWithCount = useMemo(() => {
    const countBySlug: Record<string, number> = {};
    listingsForUi.forEach((l) => {
      if (l.categorySlug) countBySlug[l.categorySlug] = (countBySlug[l.categorySlug] ?? 0) + 1;
    });
    const childSlugByParent: Record<string, string[]> = {};
    initialCategories.forEach((c) => {
      const pid = c.parent ? String(c.parent) : null;
      if (pid) {
        if (!childSlugByParent[pid]) childSlugByParent[pid] = [];
        childSlugByParent[pid].push(c.slug);
      }
    });
    return parentCategories.map((p) => {
      const childSlugs = childSlugByParent[p._id] ?? [];
      const count = (countBySlug[p.slug] ?? 0) + childSlugs.reduce((s, slug) => s + (countBySlug[slug] ?? 0), 0);
      return { id: p.slug, name: p.name, count };
    });
  }, [initialCategories, listingsForUi, parentCategories]);

  /** Parent slug from header dropdown or from sidebar when exactly one category is selected */
  const effectiveParentSlug =
    categoryFilter || (selectedCategories.size === 1 ? Array.from(selectedCategories)[0]! : "");

  const subcategoriesForSelectedParent = useMemo(() => {
    if (!effectiveParentSlug) return [];
    const selected = initialCategories.find((c) => c.slug === effectiveParentSlug);
    if (!selected) return [];
    return initialCategories.filter((c) => c.parent && String(c.parent) === String(selected._id));
  }, [initialCategories, effectiveParentSlug]);

  useEffect(() => {
    const q = searchParams.get("q") ?? "";
    const location = searchParams.get("location") ?? "";
    const category = searchParams.get("category") ?? "";
    setSearchQuery(q);
    setSelectedLocations(location ? new Set([location]) : new Set());
    if (category) {
      setCategoryFilter(category);
      setSelectedCategories(new Set([category]));
    } else {
      setCategoryFilter("");
      setSelectedCategories(new Set());
    }
  }, [searchParams]);

  useEffect(() => {
    setSelectedSubcategories(new Set());
  }, [effectiveParentSlug]);

  const toggleLocation = useCallback((slug: string) => {
    setSelectedLocations((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return next;
    });
    setPage(1);
  }, []);

  const toggleSubcategory = useCallback((slug: string) => {
    setSelectedSubcategories((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return next;
    });
    setPage(1);
  }, []);

  const toggleCategory = useCallback((id: string) => {
    setSelectedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const clearFilters = useCallback(() => {
    setSelectedCategories(new Set());
    setSelectedLocations(new Set());
    setSelectedSubcategories(new Set());
    setSortBy("latest");
    setCategoryFilter("");
    setSearchQuery("");
    setPage(1);
    setSidebarOpen(false);
  }, []);

  const updateListingsUrl = useCallback(() => {
    if (pathname !== "/listings") return;
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.set("q", searchQuery.trim());
    if (selectedLocations.size === 1) params.set("location", [...selectedLocations][0]!);
    if (categoryFilter) params.set("category", categoryFilter);
    const query = params.toString();
    const url = query ? `/listings?${query}` : "/listings";
    router.replace(url);
  }, [pathname, router, searchQuery, selectedLocations, categoryFilter]);

  const filteredAndSortedListings = useMemo(() => {
    let list = [...listingsForUi];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (l) =>
          l.title.toLowerCase().includes(q) ||
          l.description.toLowerCase().includes(q) ||
          l.location.toLowerCase().includes(q) ||
          l.category.toLowerCase().includes(q)
      );
    }
    if (categoryFilter) {
      const selectedCat = initialCategories.find((c) => c.slug === categoryFilter);
      const childSlugs = selectedCat
        ? initialCategories.filter((c) => c.parent && String(c.parent) === String(selectedCat._id)).map((c) => c.slug)
        : [];
      const allowedSlugs = [categoryFilter, ...childSlugs];
      if (selectedSubcategories.size > 0) {
        list = list.filter((l) => l.categorySlug && selectedSubcategories.has(l.categorySlug));
      } else {
        list = list.filter((l) => l.categorySlug && allowedSlugs.includes(l.categorySlug));
      }
    }
    if (selectedCategories.size > 0) {
      const slugSets = Array.from(selectedCategories).map((parentSlug) => {
        const parent = initialCategories.find((c) => c.slug === parentSlug);
        const childSlugs = parent
          ? initialCategories.filter((c) => c.parent && String(c.parent) === String(parent._id)).map((c) => c.slug)
          : [];
        return new Set([parentSlug, ...childSlugs]);
      });
      list = list.filter((l) =>
        l.categorySlug && slugSets.some((set) => set.has(l.categorySlug!))
      );
    }
    if (selectedSubcategories.size > 0) {
      list = list.filter((l) => l.categorySlug && selectedSubcategories.has(l.categorySlug));
    }
    if (selectedLocations.size > 0) {
      list = list.filter((l) => selectedLocations.has(l.locationSlug));
    }

    if (sortBy === "a-z") list.sort((a, b) => a.title.localeCompare(b.title));
    else if (sortBy === "top-rated") list.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
    else if (sortBy === "random") list.sort(() => Math.random() - 0.5);

    return list;
  }, [listingsForUi, searchQuery, categoryFilter, selectedSubcategories, selectedLocations, selectedCategories, sortBy, initialCategories]);

  const totalCount = filteredAndSortedListings.length;
  const totalPages = Math.ceil(totalCount / PAGE_SIZE) || 1;
  const currentPage = Math.min(page, totalPages);
  const paginatedListings = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredAndSortedListings.slice(start, start + PAGE_SIZE);
  }, [filteredAndSortedListings, currentPage]);

  return (
    <>
      {/* Header: card + sticky-top (matches listings-list-left.html) — navbar + search bar stick together */}
      <div className="border-0 card header rounded-0 sticky-top">
        <Navbar />
        {!hideFilterBar && (
        <div className="border-bottom border-top search-bar py-3 py-xl-2 px-3 px-xl-4">
          <div className="row align-items-center g-2 gx-lg-3 mx-0">
              <div className="col-12 d-xl-none text-center mb-1">
                <h2 className="fw-semibold search-bar-title mb-0">
                  Find what you <span className="font-caveat text-primary">want</span>
                </h2>
              </div>
              <div className="col-12 d-flex flex-wrap align-items-center gap-2 gx-lg-3" style={{ gap: "0.5rem 0.75rem" }}>
                <div className="d-flex flex-grow-1 flex-shrink-1 min-width-0" style={{ flex: "1 1 0%", minWidth: "120px" }}>
                  <div className="search-select-input has-icon position-relative w-100">
                    <span className="form-icon-start position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" aria-hidden>
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                        <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z" />
                      </svg>
                    </span>
                    <input
                      className="form-control ps-5"
                      type="text"
                      placeholder="What are you looking for?"
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setPage(1);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          updateListingsUrl();
                        }
                      }}
                    />
                  </div>
                </div>
                <div className="d-none d-md-flex flex-grow-1 flex-shrink-1 min-width-0" style={{ flex: "1 1 0%", minWidth: "120px" }}>
                  <div className="search-select has-icon position-relative w-100">
                    <svg className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" style={{ zIndex: 2 }} xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16" aria-hidden>
                      <path d="M12.166 8.94c-.524 1.062-1.234 2.12-1.96 3.07A31.493 31.493 0 0 1 8 14.58a31.481 31.481 0 0 1-2.206-2.57c-.726-.95-1.436-2.008-1.96-3.07C3.304 7.867 3 6.862 3 6a5 5 0 0 1 10 0c0 .862-.305 1.867-.834 2.94zM8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10z" />
                      <path d="M8 8a2 2 0 1 1 0-4 2 2 0 0 1 0 4zm0 1a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" />
                    </svg>
                    <select
                      className="form-select"
                      style={{ paddingLeft: "2.75rem" }}
                      aria-label="Location"
                      value={selectedLocations.size === 0 ? "" : selectedLocations.size === 1 ? [...selectedLocations][0] : "multiple"}
                      onChange={(e) => {
                        const v = e.target.value;
                        setSelectedLocations(v && v !== "multiple" ? new Set([v]) : new Set());
                        setPage(1);
                      }}
                    >
                      <option value="">All locations</option>
                      {selectedLocations.size > 1 && <option value="multiple">Multiple selected</option>}
                      {initialLocations.map((loc) => (
                        <option key={loc._id} value={loc.slug}>
                          {loc.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="d-none d-md-flex flex-grow-1 flex-shrink-1 min-width-0" style={{ flex: "1 1 0%", minWidth: "120px" }}>
                  <div className="search-select has-icon position-relative w-100">
                    <svg className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" style={{ zIndex: 2 }} xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16" aria-hidden>
                      <path d="M5.5 2A3.5 3.5 0 0 0 2 5.5v5A3.5 3.5 0 0 0 5.5 14h5a3.5 3.5 0 0 0 3.5-3.5V8a.5.5 0 0 1 1 0v2.5a4.5 4.5 0 0 1-4.5 4.5h-5A4.5 4.5 0 0 1 1 10.5v-5A4.5 4.5 0 0 1 5.5 1H8a.5.5 0 0 1 0 1H5.5z" />
                      <path d="M16 3a3 3 0 1 1-6 0 3 3 0 0 1 6 0z" />
                    </svg>
                    <select
                      className="form-select"
                      style={{ paddingLeft: "2.75rem" }}
                      aria-label="Category"
                      value={categoryFilter}
                      onChange={(e) => {
                        setCategoryFilter(e.target.value);
                        setPage(1);
                      }}
                    >
                      <option value="">All categories</option>
                      {parentCategoriesWithCount.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                {subcategoriesForSelectedParent.length > 0 && (
                  <div className="d-none d-md-flex flex-grow-1 flex-shrink-1 min-width-0" style={{ flex: "1 1 0%", minWidth: "120px" }}>
                    <div className="search-select has-icon position-relative w-100">
                      <svg className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" style={{ zIndex: 2 }} xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16" aria-hidden>
                        <path d="M5.5 2A3.5 3.5 0 0 0 2 5.5v5A3.5 3.5 0 0 0 5.5 14h5a3.5 3.5 0 0 0 3.5-3.5V8a.5.5 0 0 1 1 0v2.5a4.5 4.5 0 0 1-4.5 4.5h-5A4.5 4.5 0 0 1 1 10.5v-5A4.5 4.5 0 0 1 5.5 1H8a.5.5 0 0 1 0 1H5.5z" />
                        <path d="M16 3a3 3 0 1 1-6 0 3 3 0 0 1 6 0z" />
                      </svg>
                      <select
                        className="form-select"
                        style={{ paddingLeft: "2.75rem" }}
                        aria-label="Subcategory"
                        value={selectedSubcategories.size === 0 ? "" : selectedSubcategories.size === 1 ? [...selectedSubcategories][0] : "multiple"}
                        onChange={(e) => {
                          const v = e.target.value;
                          setSelectedSubcategories(v && v !== "multiple" ? new Set([v]) : new Set());
                          setPage(1);
                        }}
                      >
                        <option value="">All subcategories</option>
                        {selectedSubcategories.size > 1 && <option value="multiple">Multiple selected</option>}
                        {subcategoriesForSelectedParent.map((sub) => (
                          <option key={sub.slug} value={sub.slug}>
                            {sub.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}
              </div>
              <div className="col-12 col-md-auto d-xl-none mt-2 mt-md-0">
                <div className="d-flex flex-wrap justify-content-center gap-2">
                  <button
                    type="button"
                    className="sidebarCollapse btn btn-outline-primary btn-sm align-items-center d-inline-flex gap-2"
                    onClick={() => setSidebarOpen(true)}
                    aria-label="All filters"
                  >
                    <i className="fa-solid fa-sliders fs-6" />
                    <span>Filters</span>
                  </button>
                  <Link href="/listings" className="btn btn-outline-secondary btn-sm align-items-center d-inline-flex gap-2 text-decoration-none" aria-label="View map">
                    <i className="fa-solid fa-map-location-dot fs-6" />
                    <span>Map</span>
                  </Link>
                </div>
              </div>
            </div>
        </div>
        )}
      </div>

      {pageTitle != null && pageTitle !== "" && (
        <div className="border-bottom bg-light py-4 py-lg-5">
          <div className="container">
            <div className="row justify-content-center">
              <div className="col-lg-10 col-xl-8 text-center">
                <h1 className="display-5 fw-semibold mb-3 section-header__title text-capitalize">
                  {pageTitle}
                </h1>
                {pageDescription != null && pageDescription !== "" && (
                  <p className="lead text-muted mb-0">{pageDescription}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="py-3 py-xl-5 bg-gradient">
        <div className="container">
          <div className="row">
            {/* Sidebar filters */}
            <aside className="col-xl-3 filters-col content pe-lg-4 pe-xl-5 shadow-end">
              <div className={`js-sidebar-filters-mobile ${sidebarOpen ? "active" : ""}`}>
                <div className="border-bottom d-flex justify-content-between align-items-center p-3 sidebar-filters-header d-xl-none">
                  <button
                    type="button"
                    className="align-items-center btn-icon d-flex filter-close justify-content-center rounded-circle border-0 bg-transparent"
                    onClick={() => setSidebarOpen(false)}
                    aria-label="Close filters"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-x-lg" viewBox="0 0 16 16">
                      <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8 2.146 2.854Z" />
                    </svg>
                  </button>
                  <span className="fs-3 fw-semibold">Filters</span>
                  <button type="button" className="text-primary fw-medium border-0 bg-transparent" onClick={clearFilters}>
                    Clear
                  </button>
                </div>
                <div className="sidebar-filters-body p-3 p-xl-0">
                  <div className="mb-4 border-bottom pb-4">
                    <div className="mb-3">
                      <h4 className="fs-5 fw-semibold mb-2">Locations</h4>
                      <p className="mb-0 small">Filter by location</p>
                    </div>
                    {initialLocations.length === 0 ? (
                      <p className="small text-muted mb-0">No locations</p>
                    ) : (
                      <>
                        <div className="form-check mb-2">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            id="loc-all"
                            checked={selectedLocations.size === 0}
                            onChange={() => { setSelectedLocations(new Set()); setPage(1); }}
                          />
                          <label className="form-check-label" htmlFor="loc-all">
                            All locations
                          </label>
                        </div>
                        {initialLocations.map((loc) => (
                          <div className="form-check mb-2" key={loc._id}>
                            <input
                              className="form-check-input"
                              type="checkbox"
                              id={`loc-${loc.slug}`}
                              checked={selectedLocations.has(loc.slug)}
                              onChange={() => toggleLocation(loc.slug)}
                            />
                            <label className="form-check-label" htmlFor={`loc-${loc.slug}`}>
                              {loc.name}
                            </label>
                          </div>
                        ))}
                      </>
                    )}
                  </div>
                  <div className="mb-4 border-bottom pb-4">
                    <div className="mb-3">
                      <h4 className="fs-5 fw-semibold mb-2">Categories</h4>
                      <p className="mb-0 small">Filter by category</p>
                    </div>
                    {parentCategoriesWithCount.map((cat) => (
                      <div className="form-check mb-2" key={cat.id}>
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id={`cat-${cat.id}`}
                          checked={selectedCategories.has(cat.id)}
                          onChange={() => toggleCategory(cat.id)}
                        />
                        <label className="form-check-label" htmlFor={`cat-${cat.id}`}>
                          {cat.name}
                          <span className="count fs-13 ms-1 text-muted">({cat.count})</span>
                        </label>
                      </div>
                    ))}
                  </div>
                  {subcategoriesForSelectedParent.length > 0 && (
                    <div className="mb-4 border-bottom pb-4">
                      <div className="mb-3">
                        <h4 className="fs-5 fw-semibold mb-2">Subcategory</h4>
                        <p className="mb-0 small">Filter by subcategory</p>
                      </div>
                      <div className="form-check mb-2">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="sub-all"
                          checked={selectedSubcategories.size === 0}
                          onChange={() => { setSelectedSubcategories(new Set()); setPage(1); }}
                        />
                        <label className="form-check-label" htmlFor="sub-all">
                          All subcategories
                        </label>
                      </div>
                      {subcategoriesForSelectedParent.map((sub) => (
                        <div className="form-check mb-2" key={sub.slug}>
                          <input
                            className="form-check-input"
                            type="checkbox"
                            id={`sub-${sub.slug}`}
                            checked={selectedSubcategories.has(sub.slug)}
                            onChange={() => toggleSubcategory(sub.slug)}
                          />
                          <label className="form-check-label" htmlFor={`sub-${sub.slug}`}>
                            {sub.name}
                          </label>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="mb-4 border-bottom pb-4">
                    <div className="mb-3">
                      <h4 className="fs-5 fw-semibold mb-1">Order by</h4>
                      <p className="mb-0 small">Sort results</p>
                    </div>
                    <select className="form-select" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                      {SORT_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <button type="button" className="btn btn-primary w-100" onClick={() => setPage(1)}>
                    Apply filters
                  </button>
                  <button type="button" className="align-items-center d-flex fw-medium gap-2 justify-content-center mt-2 small text-center border-0 bg-transparent text-body" onClick={clearFilters}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-arrow-clockwise" viewBox="0 0 16 16">
                      <path fillRule="evenodd" d="M8 3a5 5 0 1 0 4.546 2.914.5.5 0 0 1 .908-.417A6 6 0 1 1 8 2v1z" />
                      <path d="M8 4.466V.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384L8.41 4.658A.25.25 0 0 1 8 4.466z" />
                    </svg>
                    Clear filters
                  </button>
                </div>
              </div>
            </aside>

            <div className="col-xl-9 ps-lg-4 ps-xl-5 sidebar">
              {/* Toolbox */}
              <div className="d-flex flex-wrap align-items-center mb-3 gap-2">
                <div className="col fs-18 text-nowrap">
                  All <span className="fw-bold text-dark">{totalCount}</span> listing{totalCount !== 1 ? "s" : ""} found
                </div>
                <div className="border-0 card d-inline-flex flex-row flex-wrap gap-1 p-1 rounded-3 shadow-sm">
                  <button
                    type="button"
                    className={`btn btn-sm px-2 py-1 ${viewMode === "grid" ? "btn-primary" : "btn-light"}`}
                    onClick={() => setViewMode("grid")}
                    aria-label="Grid view"
                  >
                    <i className="fa-solid fa-border-all" />
                  </button>
                  <button
                    type="button"
                    className={`btn btn-sm px-2 py-1 ${viewMode === "list" ? "btn-primary" : "btn-light"}`}
                    onClick={() => setViewMode("list")}
                    aria-label="List view"
                  >
                    <i className="fa-solid fa-list" />
                  </button>
                </div>
              </div>

              {/* Listing cards */}
              <div className={viewMode === "grid" ? "row g-4" : ""}>
                {paginatedListings.length === 0 ? (
                  <div className="text-center py-5 text-muted">
                    <p className="mb-0">No listings match your filters. Try adjusting your search or clear filters.</p>
                  </div>
                ) : viewMode === "grid" ? (
                  paginatedListings.map((item) => (
                    <div key={item.slug} className="col-md-6 col-lg-4">
                      <div className="card border-0 shadow-sm overflow-hidden rounded-4 h-100 card-hover card-hover-bg">
                        <Link href={`/listings/${item.slug}`} className="stretched-link" />
                        <div className="card-body p-0">
                          <div className="card-image-hover dark-overlay overflow-hidden position-relative" style={{ height: 200 }}>
                            <img src={item.image} alt="" className="h-100 w-100 object-fit-cover" />
                            {item.badge && (
                              <div className="bg-blur card-badge d-inline-block position-absolute start-0 text-white z-2 m-2">
                                <i className="fa-solid fa-star me-1" />
                                {item.badge}
                              </div>
                            )}
                          </div>
                          <div className="p-3">
                            <div className="align-items-center d-flex flex-wrap gap-1 text-primary card-start mb-2">
                              <i className="fa-solid fa-star" />
                              <span className="fw-medium text-primary">
                                <span className="fs-6 fw-semibold me-1">({item.rating != null ? Number(item.rating).toFixed(1) : "—"})</span>
                                {item.reviewCount} reviews
                              </span>
                            </div>
                            <h4 className="fs-18 fw-semibold mb-0">{item.title}</h4>
                            <p className="small text-muted mb-0 mt-1">{item.location}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  paginatedListings.map((item) => (
                    <div key={item.slug} className="card border-0 shadow-sm overflow-hidden rounded-4 mb-4 card-hover card-hover-bg">
                      <Link href={`/listings/${item.slug}`} className="stretched-link" />
                      <div className="card-body p-0">
                        <div className="g-0 row">
                          <div className="col-lg-5 col-md-5 col-xl-4 position-relative">
                            <div className="card-image-hover dark-overlay h-100 overflow-hidden position-relative">
                              <img src={item.image} alt="" className="h-100 w-100 object-fit-cover" />
                              {item.badge && (
                                <div className="bg-blur card-badge d-inline-block position-absolute start-0 text-white z-2 m-2">
                                  <i className="fa-solid fa-star me-1" />
                                  {item.badge}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="col-lg-7 col-md-7 col-xl-8 p-3 p-lg-4 p-md-3 p-sm-4">
                            <div className="d-flex flex-column h-100">
                              <div className="align-items-center d-flex flex-wrap gap-1 text-primary card-start mb-2">
                                <i className="fa-solid fa-star" />
                                <span className="fw-medium text-primary">
                                  <span className="fs-6 fw-semibold me-1">({item.rating != null ? Number(item.rating).toFixed(1) : "—"})</span>
                                  {item.reviewCount} reviews
                                </span>
                              </div>
                              <h4 className="fs-18 fw-semibold mb-0">
                                {item.title}
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" className="bi bi-patch-check-fill text-success ms-1" viewBox="0 0 16 16">
                                  <path d="M10.067.87a2.89 2.89 0 0 0-4.134 0l-.622.638-.89-.011a2.89 2.89 0 0 0-2.924 2.924l.01.89-.636.622a2.89 2.89 0 0 0 0 4.134l.637.622-.011.89a2.89 2.89 0 0 0 2.924 2.924l.89-.01.622.636a2.89 2.89 0 0 0 4.134 0l.622-.637.89.011a2.89 2.89 0 0 0 2.924-2.924l-.01-.89.636-.622a2.89 2.89 0 0 0 0-4.134l-.637-.622.011-.89a2.89 2.89 0 0 0-2.924-2.924l-.89.01-.622-.636zm.287 5.984-3 3a.5.5 0 0 1-.708 0l-1.5-1.5a.5.5 0 1 1 .708-.708L7 8.793l2.646-2.647a.5.5 0 0 1 .708.708z" />
                                </svg>
                              </h4>
                              <p className="mt-3 fs-15">{item.description}</p>
                              <div className="d-flex flex-wrap gap-3 mt-auto z-1">
                                <a href={`tel:${item.phone?.replace(/\D/g, "")}`} className="d-flex gap-2 align-items-center fs-13 fw-semibold text-decoration-none text-body" onClick={(e) => e.preventDefault()}>
                                  <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="#9b9b9b" className="bi bi-telephone" viewBox="0 0 16 16">
                                    <path d="M3.654 1.328a.678.678 0 0 0-1.015-.063L1.605 2.3c-.483.484-.661 1.169-.45 1.77a17.568 17.568 0 0 0 4.168 6.608 17.569 17.569 0 0 0 6.608 4.168c.601.211 1.286.033 1.77-.45l1.034-1.034a.678.678 0 0 0-.063-1.015l-2.307-1.794a.678.678 0 0 0-.58-.122l-2.19.547a1.745 1.745 0 0 1-1.657-.459L5.482 8.062a1.745 1.745 0 0 1-.46-1.657l.548-2.19a.678.678 0 0 0-.122-.58L3.654 1.328z" />
                                  </svg>
                                  <span>{item.phone}</span>
                                </a>
                                <span className="d-flex gap-2 align-items-center fs-13 fw-semibold text-muted">
                                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="#9b9b9b" className="bi bi-compass" viewBox="0 0 16 16">
                                    <path d="M8 16.016a7.5 7.5 0 0 0 1.962-14.74A1 1 0 0 0 9 0H7a1 1 0 0 0-.962 1.276A7.5 7.5 0 0 0 8 16.016zm6.5-7.5a6.5 6.5 0 1 1-13 0 6.5 6.5 0 0 1 13 0z" />
                                    <path d="m6.94 7.44 4.95-2.83-2.83 4.95-4.949 2.83 2.828-4.95z" />
                                  </svg>
                                  Directions
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <nav className="justify-content-center mt-5 pagination align-items-center d-flex flex-wrap gap-2">
                  <button
                    type="button"
                    className="prev page-numbers border-0 bg-transparent d-flex align-items-center gap-1"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage <= 1}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="bi bi-arrow-left-short" viewBox="0 0 16 16">
                      <path fillRule="evenodd" d="M12 8a.5.5 0 0 1-.5.5H5.707l2.147 2.146a.5.5 0 0 1-.708.708l-3-3a.5.5 0 0 1 0-.708l3-3a.5.5 0 1 1 .708.708L5.707 7.5H11.5a.5.5 0 0 1 .5.5z" />
                    </svg>
                    previous
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      type="button"
                      className={`page-numbers ${p === currentPage ? "current" : ""} border-0 rounded px-2 py-1 ${p === currentPage ? "bg-primary text-white" : "bg-transparent"}`}
                      onClick={() => setPage(p)}
                    >
                      {p}
                    </button>
                  ))}
                  <button
                    type="button"
                    className="next page-numbers border-0 bg-transparent d-flex align-items-center gap-1"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage >= totalPages}
                  >
                    next
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="bi bi-arrow-right-short" viewBox="0 0 16 16">
                      <path fillRule="evenodd" d="M4 8a.5.5 0 0 1 .5-.5h5.793L8.146 5.354a.5.5 0 1 1 .708-.708l3 3a.5.5 0 0 1 0 .708l-3 3a.5.5 0 0 1-.708-.708L10.293 8.5H4.5A.5.5 0 0 1 4 8z" />
                    </svg>
                  </button>
                </nav>
              )}
            </div>
          </div>
        </div>
      </div>


      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="d-xl-none position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50 z-2"
          style={{ zIndex: 1040 }}
          onClick={() => setSidebarOpen(false)}
          onKeyDown={(e) => e.key === "Escape" && setSidebarOpen(false)}
          role="button"
          tabIndex={0}
          aria-label="Close overlay"
        />
      )}
    </>
  );
}
