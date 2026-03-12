"use client";

import Link from "next/link";
import type { LocationItem } from "@/server";

const PLACEHOLDER_IMAGES = [
  "/assets/images/locations/masonry/09.jpg",
  "/assets/images/locations/masonry/10.jpg",
  "/assets/images/locations/masonry/11.jpg",
  "/assets/images/locations/masonry/12.jpg",
];

function getPlaceImage(index: number): string {
  return PLACEHOLDER_IMAGES[index % PLACEHOLDER_IMAGES.length] ?? PLACEHOLDER_IMAGES[0];
}

interface PlacesSectionProps {
  locations: LocationItem[];
}

export default function PlacesSection({ locations }: PlacesSectionProps) {
  if (locations.length === 0) return null;

  const [first, second, ...rest] = locations;

  return (
    <div className="py-5">
      <div className="container py-4">
        <div className="row justify-content-center">
          <div className="col-sm-10 col-md-10 col-lg-8 col-xl-7">
            <div className="section-header text-center mb-5" data-aos="fade-down">
              <div className="d-inline-block font-caveat fs-1 fw-medium section-header__subtitle text-capitalize text-primary">Places</div>
              <h2 className="display-5 fw-semibold mb-3 section-header__title text-capitalize">Discover places to explore</h2>
              <div className="sub-title fs-16">Discover exciting locations. <span className="text-primary fw-semibold">Find what you&apos;re looking for.</span></div>
            </div>
          </div>
        </div>
        <div className="row g-4">
          {first && (
            <div className="col-md-6">
              <div className="card rounded-4 h-100 overflow-hidden bg-light border-0 position-relative">
                <div className="position-relative overflow-hidden dark-overlay h-100">
                  <img src={getPlaceImage(0)} className="h-100 w-100 object-fit-cover image-zoom-hover" alt="" />
                </div>
                <div className="card-body py-3">
                  <h4 className="font-caveat text-primary mb-0">{first.region || first.country || "Location"}</h4>
                  <h5 className="mb-0 fw-semibold"><Link href={`/listings?location=${encodeURIComponent(first.slug)}`} className="stretched-link">{first.name}</Link></h5>
                </div>
              </div>
            </div>
          )}
          {second && (
            <div className="col-md-3">
              <div className="card rounded-4 h-100 overflow-hidden bg-light border-0 position-relative">
                <div className="position-relative overflow-hidden dark-overlay h-100">
                  <img src={getPlaceImage(1)} className="h-100 w-100 object-fit-cover image-zoom-hover" alt="" />
                </div>
                <div className="card-body py-3">
                  <h4 className="font-caveat text-primary mb-0">{second.region || second.country || "Location"}</h4>
                  <h5 className="mb-0 fw-semibold"><Link href={`/listings?location=${encodeURIComponent(second.slug)}`} className="stretched-link">{second.name}</Link></h5>
                </div>
              </div>
            </div>
          )}
          {rest.length > 0 && (
            <div className="col-md-3">
              <div className="row g-4 h-100">
                {rest.map((loc, i) => (
                  <div key={loc._id} className="col-12">
                    <div className="card rounded-4 h-100 overflow-hidden bg-light border-0 position-relative">
                      <div className="position-relative overflow-hidden dark-overlay h-100">
                        <img src={getPlaceImage(2 + i)} className="h-100 w-100 object-fit-cover image-zoom-hover" alt="" />
                      </div>
                      <div className="card-body py-3">
                        <h4 className="font-caveat text-primary mb-0">{loc.region || loc.country || "Location"}</h4>
                        <h5 className="mb-0 fw-semibold"><Link href={`/listings?location=${encodeURIComponent(loc.slug)}`} className="stretched-link">{loc.name}</Link></h5>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
