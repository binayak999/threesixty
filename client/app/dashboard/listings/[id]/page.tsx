"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { getMediaUrl as resolveMediaUrl } from "@/lib/mediaUrl";
import type { ListingItem, ListingCategory, ListingUser, ListingLocation, ListingMediaRef } from "../types";

function getMediaUrlFromRef(m: ListingMediaRef["media"]): string | null {
  if (!m) return null;
  return typeof m === "object" && m && "url" in m ? (m as { url?: string }).url ?? null : null;
}

export default function ViewListingPage() {
  const params = useParams();
  const id = params?.id as string | undefined;
  const [listing, setListing] = useState<ListingItem | null>(null);
  const [loading, setLoading] = useState(!!id);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }
    fetch(`/api/listings/${id}`)
      .then((res) => res.json())
      .then((json) => {
        if (json?.data) setListing(json.data);
        else setError("Listing not found");
      })
      .catch(() => setError("Failed to load listing"))
      .finally(() => setLoading(false));
  }, [id]);

  if (!id) {
    return (
      <div className="py-4">
        <div className="alert alert-warning">Invalid listing ID.</div>
        <Link href="/dashboard/listings">Back to list</Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="py-4">
        <div className="card">
          <div className="card-body text-center py-5">
            <div className="spinner-border text-primary" role="status" />
            <p className="mt-2 mb-0 text-muted">Loading…</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="py-4">
        <div className="alert alert-danger">{error || "Listing not found"}</div>
        <Link href="/dashboard/listings">Back to list</Link>
      </div>
    );
  }

  const category =
    typeof listing.category === "object" && listing.category
      ? (listing.category as ListingCategory).name || (listing.category as ListingCategory).slug
      : null;
  const owner =
    typeof listing.user === "object" && listing.user
      ? (listing.user as ListingUser).name || (listing.user as ListingUser).email
      : null;
  const loc = typeof listing.location === "object" && listing.location ? (listing.location as ListingLocation) : null;
  const locationStr = loc ? [loc.address, loc.city, loc.region, loc.country].filter(Boolean).join(", ") : null;

  const medias = listing.medias || [];
  const byRole = (role: string) => medias.filter((m: ListingMediaRef) => m.role === role).sort((a: ListingMediaRef, b: ListingMediaRef) => (a.order ?? 0) - (b.order ?? 0));
  const feature = byRole("feature")[0];
  const gallery = byRole("gallery");
  const videos = byRole("video");

  return (
    <div className="py-4">
      <div className="d-flex justify-content-between align-items-start flex-wrap gap-2 mb-4">
        <div className="section-header">
          <div className="font-caveat fs-4 fw-bold text-primary">Listing</div>
          <h2 className="fw-semibold mb-0 h3">{listing.title}</h2>
          <div className="sub-title fs-16 text-muted">
            <Link href="/dashboard/listings" className="text-primary">
              ← Back to listings
            </Link>
          </div>
        </div>
        <div className="d-flex gap-2">
          <Link href={`/dashboard/listings/${listing._id}/edit`} className="btn btn-primary">
            <i className="fa-solid fa-pencil me-1" />
            Edit
          </Link>
          <a
            href={`/listings/${listing.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-outline-secondary"
          >
            <i className="fa-solid fa-external-link me-1" />
            View on site
          </a>
        </div>
      </div>

      <div className="card">
        <div className="card-body">
          {(feature || gallery.length > 0 || videos.length > 0) && (
            <div className="mb-4">
              {feature && (() => {
                const url = getMediaUrlFromRef(feature.media);
                return url ? (
                  <div className="mb-3">
                    <img
                      src={resolveMediaUrl(url)}
                      alt="Feature"
                      className="img-fluid rounded w-100"
                      style={{ maxHeight: 320, objectFit: "cover" }}
                    />
                  </div>
                ) : null;
              })()}
              {gallery.length > 0 && (
                <div className="row g-2 mb-3">
                  {gallery.map((m: ListingMediaRef) => {
                    const url = getMediaUrlFromRef(m.media);
                    const key = typeof m.media === "string" ? m.media : (m.media as { _id: string })._id;
                    return url ? (
                      <div key={key} className="col-6 col-md-4">
                        <img
                          src={resolveMediaUrl(url)}
                          alt="Gallery"
                          className="img-fluid rounded"
                          style={{ objectFit: "cover", width: "100%", height: 140 }}
                        />
                      </div>
                    ) : null;
                  })}
                </div>
              )}
              {videos.length > 0 && (
                <div className="row g-2 mb-3">
                  {videos.map((m: ListingMediaRef) => {
                    const url = getMediaUrlFromRef(m.media);
                    const key = typeof m.media === "string" ? m.media : (m.media as { _id: string })._id;
                    return url ? (
                      <div key={key} className="col-12">
                        <video src={resolveMediaUrl(url)} controls className="rounded w-100" style={{ maxHeight: 360 }} />
                      </div>
                    ) : null;
                  })}
                </div>
              )}
            </div>
          )}
          <div className="d-flex flex-wrap gap-2 mb-3">
            {category && <span className="badge bg-info">{category}</span>}
            {owner && <span className="text-muted">Owner: {owner}</span>}
            <span className={(listing.status ?? (listing as { isActive?: boolean }).isActive) === "published" ? "text-success" : (listing as { status?: string }).status === "pending" ? "text-info" : "text-warning"}>
              {(listing.status ?? (listing as { isActive?: boolean }).isActive) === "published" ? "Published" : (listing as { status?: string }).status === "pending" ? "Pending" : "Draft"}
            </span>
            <span className="text-muted">{new Date(listing.createdAt).toLocaleString()}</span>
          </div>
          {locationStr && (
            <p className="text-muted mb-2">
              <i className="fa-solid fa-location-dot me-1" />
              {locationStr}
            </p>
          )}
          <div className="mb-3" style={{ whiteSpace: "pre-wrap" }}>
            {listing.description}
          </div>
        </div>
      </div>
    </div>
  );
}
