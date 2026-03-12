"use client";

import { useState, useCallback, useEffect } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { getMediaUrl } from "@/lib/mediaUrl";
import type { BannerItem } from "@/server";

export interface HeroLocationItem {
  _id: string;
  name: string;
  slug: string;
}

/** Fallback image when no banners (static image — no 360 viewer for better performance). */
const FALLBACK_PANORAMA_IMAGE = "https://i.imgur.com/G7t9QD9.jpg";

const PannellumViewer = dynamic(
  () => import("@/components/PannellumViewer").then((m) => m.default),
  { ssr: false, loading: () => <div className="w-100 h-100 bg-dark d-flex align-items-center justify-content-center"><div className="spinner-border text-light" role="status" /></div> }
);

function getMediaUrlFromBanner(banner: BannerItem): string {
  const m = banner.media;
  const url = typeof m === "object" && m && "url" in m ? (m as { url?: string }).url : undefined;
  return url ?? "";
}

/** Load pannellum.js only when we need 360° view; returns true when ready. */
function usePannellumScript(needed: boolean): boolean {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!needed) return;
    if (typeof window === "undefined") return;
    if (window.pannellum) {
      setReady(true);
      return;
    }
    const existing = document.querySelector('script[src*="pannellum.js"]');
    if (existing) {
      const check = () => {
        if (window.pannellum) setReady(true);
        else setTimeout(check, 50);
      };
      check();
      return;
    }
    const script = document.createElement("script");
    script.src = "/assets/js/pannellum.js";
    script.async = true;
    script.onload = () => setReady(true);
    script.onerror = () => setReady(false);
    document.body.appendChild(script);
    return () => {
      // leave script in place so switching banners doesn't re-fetch
    };
  }, [needed]);

  return ready;
}

function HeroImage({ src, alt, className }: { src: string; alt: string; className?: string }) {
  return (
    <img
      src={src}
      alt={alt}
      className={className}
      style={{ objectFit: "cover" }}
      decoding="async"
    />
  );
}

interface HeroSectionProps {
  banners: BannerItem[];
  /** Locations that have at least one listing (for search dropdown). */
  locations?: HeroLocationItem[];
}

export default function HeroSection({ banners, locations = [] }: HeroSectionProps) {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [locationSlug, setLocationSlug] = useState("");

  const hasBanners = banners.length > 0;
  const current = hasBanners ? banners[currentIndex] : null;

  if (!hasBanners) return null;
  const rawMediaUrl = current ? getMediaUrlFromBanner(current) : "";
  const mediaUrl = getMediaUrl(rawMediaUrl);
  const is360 = current?.is360 === true;
  const bannerLink = current?.link?.trim();
  const hasLink = bannerLink && bannerLink !== "#";

  const pannellumReady = usePannellumScript(is360);

  const goTo = useCallback((index: number) => {
    setCurrentIndex((prev) => (Math.max(0, index)) % Math.max(1, banners.length));
  }, [banners.length]);

  const overlay = (
    <div
      className="position-absolute top-0 start-0 w-100 h-100 bg-dark"
      style={{ opacity: 0.4, pointerEvents: "none" }}
      aria-hidden
    />
  );

  const wrapLink = (content: React.ReactNode) =>
    hasLink ? (
      <a href={bannerLink!} className="d-block w-100 h-100 text-decoration-none" target="_blank" rel="noopener noreferrer" aria-label={current ? `${current.title} – open link` : "Open link"}>
        {content}
      </a>
    ) : (
      content
    );

  const renderBannerContent = () => {
    if (!hasBanners || !current) {
      return (
        <HeroImage
          src={FALLBACK_PANORAMA_IMAGE}
          alt="360 Nepal"
          className="w-100 h-100 position-absolute top-0 start-0"
        />
      );
    }

    if (is360) {
      if (!pannellumReady) {
        return (
          <>
            <HeroImage src={mediaUrl || FALLBACK_PANORAMA_IMAGE} alt={current.title} className="w-100 h-100 position-absolute top-0 start-0" />
            <div className="w-100 h-100 bg-dark d-flex align-items-center justify-content-center position-absolute top-0 start-0">
              <div className="spinner-border text-light" role="status" />
            </div>
          </>
        );
      }
      return wrapLink(
        <PannellumViewer
          key={current._id}
          panoramaUrl={mediaUrl || FALLBACK_PANORAMA_IMAGE}
          className="position-absolute top-0 start-0 w-100 h-100"
        />
      );
    }

    return wrapLink(
      <>
        <HeroImage src={mediaUrl} alt={current.title} className="w-100 h-100 position-absolute top-0 start-0" />
        {overlay}
      </>
    );
  };

  return (
    <div className="align-items-center bg-dark d-flex hero-header-classic overflow-hidden position-relative">
      <div className="position-absolute w-100 h-100 top-0 start-0" style={{ zIndex: 0 }}>
        {renderBannerContent()}
      </div>
      {hasBanners && banners.length > 1 && (
        <div className="position-absolute bottom-0 end-0 z-2 d-flex align-items-center gap-2 mb-3 me-3">
          <button
            type="button"
            className="btn btn-light btn-sm rounded-circle opacity-75 hover-opacity-100 d-flex align-items-center justify-content-center"
            style={{ width: 44, height: 44 }}
            aria-label="Previous banner"
            onClick={() => goTo(currentIndex - 1)}
          >
            <i className="fa-solid fa-chevron-left" aria-hidden />
          </button>
          <button
            type="button"
            className="btn btn-light btn-sm rounded-circle opacity-75 hover-opacity-100 d-flex align-items-center justify-content-center"
            style={{ width: 44, height: 44 }}
            aria-label="Next banner"
            onClick={() => goTo(currentIndex + 1)}
          >
            <i className="fa-solid fa-chevron-right" aria-hidden />
          </button>
          <div className="d-flex gap-2 me-2">
            {banners.map((_, i) => (
              <button
                key={i}
                type="button"
                className={`rounded-circle border-0 p-0 ${i === currentIndex ? "bg-white" : "bg-white opacity-50"}`}
                style={{ width: 10, height: 10 }}
                aria-label={`Go to banner ${i + 1}`}
                onClick={() => goTo(i)}
              />
            ))}
          </div>
        </div>
      )}
      <div className="container position-relative" style={{ zIndex: 5 }}>
        <div className="hero-header-subtitle text-center text-white text-uppercase mb-3">
          WE ARE #1 ON THE MARKET
        </div>
        <h1 className="display-1 fw-bold hero-header_title text-capitalize text-white text-center mb-5">
          We&apos;re Here to Help You
          <br className="d-none d-lg-block" />{" "}
          <span className="font-caveat text-span">Navigate</span> While Traveling
        </h1>
        <div className="lead mb-4 mb-sm-5 text-center text-white">
          You&apos;ll get comprehensive results based on the provided location.
        </div>
        <div className="row justify-content-center">
          <div className="col-lg-10">
            <form
              className="border-0 card d-flex flex-column flex-md-row align-items-stretch position-relative search-wrapper gap-0"
              onSubmit={(e) => {
                e.preventDefault();
                const params = new URLSearchParams();
                if (searchQuery.trim()) params.set("q", searchQuery.trim());
                if (locationSlug) params.set("location", locationSlug);
                router.push(`/listings${params.toString() ? `?${params.toString()}` : ""}`);
              }}
            >
              <div className="align-items-center d-flex search-field flex-grow-1 flex-md-grow-1">
                <div className="svg-icon flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" className="bi bi-search" viewBox="0 0 16 16">
                    <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z" />
                  </svg>
                </div>
                <input
                  type="search"
                  className="form-control search-input border-0 bg-transparent"
                  placeholder="Search listings…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  aria-label="Search listings"
                />
              </div>
              <div className="vertical-divider d-none d-md-block align-self-stretch" />
              <div className="align-items-center d-flex search-field flex-grow-1 flex-md-grow-1">
                <div className="svg-icon flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" className="bi bi-geo-alt" viewBox="0 0 16 16">
                    <path d="M12.166 8.94c-.524 1.062-1.234 2.12-1.96 3.07A31.493 31.493 0 0 1 8 14.58a31.481 31.481 0 0 1-2.206-2.57c-.726-.95-1.436-2.008-1.96-3.07C3.304 7.867 3 6.862 3 6a5 5 0 0 1 10 0c0 .862-.305 1.867-.834 2.94zM8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10z" />
                    <path d="M8 8a2 2 0 1 1 0-4 2 2 0 0 1 0 4zm0 1a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" />
                  </svg>
                </div>
                <select
                  className="form-select search-select-field border-0 bg-transparent"
                  value={locationSlug}
                  onChange={(e) => setLocationSlug(e.target.value)}
                  aria-label="Location"
                >
                  <option value="">Location</option>
                  {locations.map((loc) => (
                    <option key={loc._id} value={loc.slug}>
                      {loc.name}
                    </option>
                  ))}
                </select>
              </div>
              <button
                type="submit"
                className="btn btn-primary search-submit-btn flex-shrink-0 rounded-pill px-4 py-2 fw-semibold d-flex align-items-center justify-content-center gap-2 mt-3 mt-md-0"
                aria-label="Search listings"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16" aria-hidden>
                  <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z" />
                </svg>
                <span>Search</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
