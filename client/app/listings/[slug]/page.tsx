import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import { getMediaUrl } from "@/lib/mediaUrl";
import { notFound } from "next/navigation";
import ListingReviews from "./ListingReviews";

const API_URL = process.env.API_URL || "http://localhost:4000";

interface ListingPageProps {
  params: Promise<{ slug: string }>;
}

interface ReviewSummary {
  rating: number;
}

function starIconClasses(value: number, index: number): string {
  const v = value - index;
  if (v >= 1) return "fa-star-icon";
  if (v >= 0.5) return "fa-star-icon half";
  return "fa-star-icon none";
}

interface MediaRef {
  media?: { url?: string; urlMedium?: string; urlLow?: string; type?: string };
  role?: string;
  order?: number;
}

interface ListingData {
  _id: string;
  title: string;
  description: string;
  slug: string;
  status?: string;
  createdAt?: string;
  category?: { name?: string; slug?: string };
  location?: {
    name?: string;
    address?: string;
    city?: string;
    region?: string;
    country?: string;
  };
  medias?: MediaRef[];
  amenities?: Array<{ name?: string; slug?: string; icon?: string }>;
  openingHours?: Array<{
    dayOfWeek: string;
    openTime?: string;
    closeTime?: string;
    isClosed?: boolean;
  }>;
}

function getMediaUrlFromRef(m: MediaRef["media"]): string {
  if (!m) return "";
  return getMediaUrl(m.urlMedium || m.url || m.urlLow || "");
}

export default async function ListingDetailPage({ params }: ListingPageProps) {
  const { slug } = await params;

  const res = await fetch(`${API_URL}/api/listings/slug/${encodeURIComponent(slug)}`, {
    headers: { "Content-Type": "application/json" },
    next: { revalidate: 60 },
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || !json?.data) notFound();
  const listing = json.data as ListingData;

  let reviewAverage = 0;
  let reviewCount = 0;
  try {
    const revRes = await fetch(
      `${API_URL}/api/reviews?listingId=${encodeURIComponent(listing._id)}`,
      { headers: { "Content-Type": "application/json" }, next: { revalidate: 60 } }
    );
    const revJson = await revRes.json().catch(() => ({}));
    const reviews = (revJson?.data || []) as ReviewSummary[];
    reviewCount = reviews.length;
    reviewAverage =
      reviewCount > 0
        ? reviews.reduce((s, r) => s + r.rating, 0) / reviewCount
        : 0;
  } catch {
    // ignore
  }

  const medias = listing.medias || [];
  const byRole = (role: string) =>
    medias.filter((m) => m.role === role).sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  const feature = byRole("feature")[0];
  const gallery = byRole("gallery");
  const videos = byRole("video");

  const categoryName =
    typeof listing.category === "object" && listing.category
      ? (listing.category as { name?: string }).name || (listing.category as { slug?: string }).slug
      : "";
  const locationStr = listing.location
    ? [listing.location.address, listing.location.city, listing.location.region, listing.location.country]
        .filter(Boolean)
        .join(", ")
    : "";

  const featureUrl = feature ? getMediaUrlFromRef(feature.media) : "";
  const galleryUrls = gallery.map((m) => getMediaUrlFromRef(m.media)).filter(Boolean);

  return (
    <>
      <Navbar />
      <main>
        <div className="py-4">
          <div className="container">
            <div className="justify-content-between row align-items-center g-4">
              <div className="col-lg col-xxl-8">
                <h1 className="h2 page-header-title fw-semibold">{listing.title}</h1>
                <ul className="list-inline list-separator d-flex align-items-center mb-2">
                  {categoryName && (
                    <li className="list-inline-item">
                      <Link
                        className="fw-medium"
                        href={listing.category?.slug ? `/category/${listing.category.slug}` : "/listings"}
                      >
                        {categoryName}
                        <i className="fa-solid fa-arrow-up-right-from-square fs-14 ms-2" />
                      </Link>
                    </li>
                  )}
                  <li className="list-inline-item">
                    <div className="d-flex align-items-center gap-2 ms-auto">
                      <div className="d-flex align-items-center text-primary rating-stars">
                        {[0, 1, 2, 3, 4].map((i) => (
                          <i key={i} className={starIconClasses(reviewAverage, i)} />
                        ))}
                      </div>
                      <span className="fw-medium text-primary">
                        <span className="fs-6 fw-semibold me-1">
                          ({reviewCount ? reviewAverage.toFixed(1) : "—"})
                        </span>
                        <small>{reviewCount} review{reviewCount !== 1 ? "s" : ""}</small>
                      </span>
                    </div>
                  </li>
                </ul>
                <ul className="fs-14 fw-medium list-inline list-separator mb-0 text-muted">
                  {listing.createdAt && (
                    <li className="list-inline-item">
                      Posted {new Date(listing.createdAt).toLocaleDateString()}
                    </li>
                  )}
                  {locationStr && <li className="list-inline-item">{locationStr}</li>}
                </ul>
              </div>
              <div className="col-lg-auto">
                <div className="form-check form-check-bookmark mb-2 mb-sm-0">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    value=""
                    id="listingBookmarkCheck"
                  />
                  <label className="form-check-label" htmlFor="listingBookmarkCheck">
                    <span className="form-check-bookmark-default">
                      <i className="fa-regular fa-heart me-1" /> Save this listing
                    </span>
                    <span className="form-check-bookmark-active">
                      <i className="fa-solid fa-heart me-1" /> Saved
                    </span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="container">
          <div className="rounded-4 overflow-hidden">
            <div className="row gx-2 zoom-gallery">
              {featureUrl ? (
                <>
                  <div className="col-md-8">
                    <a className="d-block position-relative" href={featureUrl}>
                      <img
                        className="img-fluid w-100 object-fit-cover"
                        src={featureUrl}
                        alt={listing.title}
                        style={{ maxHeight: 400 }}
                      />
                      <div className="position-absolute bottom-0 end-0 mb-3 me-3">
                        <span className="align-items-center btn btn-light btn-sm d-flex d-md-none fw-semibold gap-2">
                          <i className="fa-solid fa-expand" />
                          <span> View photos</span>
                        </span>
                      </div>
                    </a>
                  </div>
                  {galleryUrls.length > 0 ? (
                    <div className="col-md-4 d-none d-md-inline-block">
                      {galleryUrls.slice(0, 2).map((url, i) => (
                        <a
                          key={i}
                          className={`d-block ${i === 0 ? "mb-2" : "position-relative"}`}
                          href={url}
                        >
                          <img
                            className="img-fluid w-100 object-fit-cover"
                            src={url}
                            alt=""
                            style={{ height: 194 }}
                          />
                          {i === 1 && (
                            <div className="position-absolute bottom-0 end-0 mb-3 me-3">
                              <span className="align-items-center btn btn-light btn-sm d-md-inline-flex d-none fw-semibold gap-2">
                                <i className="fa-solid fa-expand" />
                                <span> View photos</span>
                              </span>
                            </div>
                          )}
                        </a>
                      ))}
                    </div>
                  ) : null}
                </>
              ) : (
                <div className="col-12">
                  <div
                    className="bg-light d-flex align-items-center justify-content-center rounded"
                    style={{ minHeight: 280 }}
                  >
                    <span className="text-muted">No image</span>
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="d-flex justify-content-end mt-2">
            <span className="small text-dark fw-semibold">Published:</span>
            <span className="small ms-1 text-muted">
              {listing.createdAt
                ? new Date(listing.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })
                : "—"}
            </span>
          </div>
        </div>

        <div className="py-5">
          <div className="container">
            <div className="row">
              <div className="col-lg-8 content">
                <div className="mb-4">
                  <h4 className="fw-semibold fs-3 mb-4">
                    Latest Property <span className="font-caveat text-primary">Reviews</span>
                  </h4>
                  <div style={{ whiteSpace: "pre-wrap" }}>{listing.description}</div>
                </div>
                {listing.amenities && listing.amenities.length > 0 && (
                  <div className="mb-4">
                    <h4 className="fw-semibold fs-3 mb-4">
                      Amenities <span className="font-caveat text-primary">Available</span>
                    </h4>
                    <div className="row g-4">
                      {listing.amenities.map((a) => (
                        <div key={a.slug || a.name || ""} className="col-auto col-lg-3">
                          <div className="d-flex align-items-center text-dark">
                            <div className="flex-shrink-0">
                              {a.icon ? (
                                <i
                                  className={`fa-solid fs-18 ${a.icon.startsWith("fa-") ? a.icon : `fa-${a.icon}`}`}
                                  aria-hidden
                                />
                              ) : (
                                <i className="fa-solid fa-check fs-18" aria-hidden />
                              )}
                            </div>
                            <div className="flex-grow-1 fs-16 fw-medium ms-3">
                              {a.name || (a.slug && a.slug.replace(/-/g, " ")) || ""}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <hr className="my-5" />
                <ListingReviews listingId={listing._id} slug={slug} embedded />
              </div>
              <div className="col-lg-4 ps-xxl-5 sidebar">
                <div className="border p-4 rounded-4 sticky-top">
                  {listing.openingHours && listing.openingHours.length > 0 && (
                    <>
                      <h4 className="fw-semibold mb-4">
                        Opening <span className="font-caveat text-primary">Hours</span>
                      </h4>
                      {listing.openingHours.map((h, i) => (
                        <div
                          key={i}
                          className="align-items-center d-flex justify-content-between mb-3"
                        >
                          <span className="fw-semibold">{h.dayOfWeek}</span>
                          {h.isClosed ? (
                            <span className="fw-medium text-danger">Closed</span>
                          ) : (
                            <span className="fs-14">
                              {h.openTime || "—"} - {h.closeTime || "—"}
                            </span>
                          )}
                        </div>
                      ))}
                      <hr />
                    </>
                  )}
                  <h5 className="fw-semibold mb-2">Location</h5>
                  {locationStr ? (
                    <p className="mb-0 small">
                      <i className="fa-solid fa-location-dot me-2 text-primary" />
                      {locationStr}
                    </p>
                  ) : (
                    <p className="mb-0 small text-muted">Address not provided.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {videos.length > 0 && (
          <div className="container mb-5">
            <h4 className="fw-semibold fs-3 mb-3">Videos</h4>
            <div className="row g-3">
              {videos.map((m) => {
                const url = getMediaUrlFromRef(m.media);
                if (!url) return null;
                return (
                  <div key={url} className="col-12 col-md-6">
                    <video
                      src={url}
                      controls
                      className="rounded w-100"
                      style={{ maxHeight: 360 }}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="py-5 position-relative overflow-hidden">
          <div className="container py-4">
            <div className="row justify-content-center">
              <div className="col-sm-10 col-md-10 col-lg-8 col-xl-7">
                <div className="section-header text-center mb-5">
                  <div className="d-inline-block font-caveat fs-1 fw-medium section-header__subtitle text-capitalize text-primary">
                    Similar Listings
                  </div>
                  <h2 className="display-5 fw-semibold mb-3 section-header__title text-capitalize">
                    Similar Listings you may like
                  </h2>
                  <div className="sub-title fs-16">
                    Discover exciting categories.{" "}
                    <span className="text-primary fw-semibold">Find what you&apos;re looking for.</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="row g-4 justify-content-center">
              <div className="col-auto">
                <Link href="/listings" className="btn btn-primary">
                  View all listings
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
