"use client";

import Link from "next/link";
import { getMediaUrl } from "@/lib/mediaUrl";
import type { ListingItem } from "@/server";

const PLACEHOLDER_IMG = "/assets/images/place/17.jpg";

function getFeatureImageUrl(listing: ListingItem): string {
  const medias = listing.medias ?? [];
  const feature = medias.find((m) => m.role === "feature");
  const url = feature?.media?.url ?? feature?.media?.urlMedium ?? feature?.media?.urlLow;
  return url ? getMediaUrl(url) : PLACEHOLDER_IMG;
}

function getAddress(listing: ListingItem): string {
  const loc = listing.location;
  if (!loc) return "";
  if (typeof loc === "object" && "address" in loc && loc.address) return loc.address;
  if (typeof loc === "object" && "name" in loc && loc.name) return loc.name;
  return "";
}

interface PopularRestaurantsSectionProps {
  listings: ListingItem[];
}

export default function PopularRestaurantsSection({ listings }: PopularRestaurantsSectionProps) {
  if (listings.length === 0) return null;

  return (
    <div className="py-5 bg-light rounded-4 mx-3 my-3 bg-size-contain js-bg-image js-bg-image-lines" data-image-src="/assets/images/lines.svg">
      <div className="container">
        <div className="align-items-end row g-4 mb-5" data-aos="fade-down">
          <div className="col">
            <div className="section-header">
              <div className="font-caveat fs-1 fw-medium section-header__subtitle text-capitalize text-center text-primary text-xl-start">Popular</div>
              <h2 className="fw-semibold mb-0 section-header__title text-capitalize text-center text-xl-start display-6">Popular Restaurants</h2>
              <div className="sub-title fs-16 text-center text-xl-start">Discover featured listings. <span className="text-primary fw-semibold">Find what you&apos;re looking for.</span></div>
            </div>
          </div>
          <div className="col-12 col-xl-auto">
            <Link href="/listings" className="align-items-center d-flex fs-14 fw-bold gap-2 justify-content-center justify-content-xl-end l-spacing-1 text-primary text-uppercase">
              See All
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-arrow-up-right" viewBox="0 0 16 16">
                <path fillRule="evenodd" d="M14 2.5a.5.5 0 0 0-.5-.5h-6a.5.5 0 0 0 0 1h4.793L2.146 13.146a.5.5 0 0 0 .708.708L13 3.707V8.5a.5.5 0 0 0 1 0v-6z" />
              </svg>
            </Link>
          </div>
        </div>
        <div className="row g-4">
            {listings.map((item) => (
              <div key={item._id} className="col-lg-6 d-flex">
                <div className="border-0 card card-hover flex-fill overflow-hidden rounded-4 w-100">
                  <Link href={`/listings/${item.slug}`} className="stretched-link" />
                  <div className="card-body p-0">
                    <div className="g-0 h-100 row">
                      <div className="bg-white col-lg-5 col-md-5 col-xxl-5 position-relative">
                        <div className="card-image-hover dark-overlay h-100 overflow-hidden position-relative">
                          <img src={getFeatureImageUrl(item)} alt="" className="h-100 w-100 object-fit-cover" />
                          {item.isFeatured && (
                            <div className="align-items-center bg-blur border-0 card-badge d-flex d-inline-block fw-semibold gap-1 position-absolute start-0 text-uppercase text-white z-2">
                              <i className="fa-solid fa-star me-1" />Featured
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="col-lg-7 col-md-7 col-xxl-7 p-3 p-lg-4 p-md-3 p-sm-4">
                        <div className="d-flex flex-column h-100">
                          <h4 className="fs-19 fw-semibold mb-0">
                            {item.title}
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" className="bi bi-patch-check-fill text-success" viewBox="0 0 16 16"><path d="M10.067.87a2.89 2.89 0 0 0-4.134 0l-.622.638-.89-.011a2.89 2.89 0 0 0-2.924 2.924l.01.89-.636.622a2.89 2.89 0 0 0 0 4.134l.637.622-.011.89a2.89 2.89 0 0 0 2.924 2.924l.89-.01.622.636a2.89 2.89 0 0 0 4.134 0l.622-.637.89.011a2.89 2.89 0 0 0 2.924-2.924l-.01-.89.636-.622a2.89 2.89 0 0 0 0-4.134l-.637-.622.011-.89a2.89 2.89 0 0 0-2.924-2.924l-.89.01-.622-.636zm.287 5.984-3 3a.5.5 0 0 1-.708 0l-1.5-1.5a.5.5 0 1 1 .708-.708L7 8.793l2.646-2.647a.5.5 0 0 1 .708.708z" /></svg>
                          </h4>
                          {getAddress(item) && <p className="mt-1 fs-14 text-muted">{getAddress(item)}</p>}
                          <div className="d-flex flex-wrap gap-3 gap-lg-2 gap-xl-3 mt-auto z-1">
                            <Link href={`/listings/${item.slug}`} className="d-flex gap-2 align-items-center fs-13 fw-semibold">View details</Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
        </div>
        <div className="banner banne-restaurant dark-overlay mt-5 overflow-hidden position-relative rounded-4">
          <img src="/assets/images/banner-bg-03.jpg" className="bg-image js-image-parallax" alt="" />
          <div className="align-items-center g-4 h-100 justify-content-between p-3 p-sm-5 position-relative row text-white wrapper z-1">
            <div className="col-md-7 col-lg-6 text-center text-md-start">
              <div className="fs-14 l-spacing-1">SPECIAL OFFER</div>
              <h2 className="display-5 fw-semibold lh-1">Discover Nepal<br className="d-none d-lg-block" /> one listing at a time</h2>
              <p>Restaurants, hotels, and local favorites</p>
              <Link href="/listings" className="btn btn-primary mt-3">Explore listings</Link>
            </div>
            <div className="col-md-5 col-lg-4">
              <img src="/assets/images/png-img/happy-hour-02.png" alt="" className="img-fluid" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
