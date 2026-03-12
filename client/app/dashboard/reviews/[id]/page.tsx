"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import type { ReviewItem, ReviewListingRef, ReviewUserRef } from "../page";

export default function ViewReviewPage() {
  const params = useParams();
  const id = params?.id as string | undefined;
  const [review, setReview] = useState<ReviewItem | null>(null);
  const [loading, setLoading] = useState(!!id);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }
    fetch(`/api/reviews/${id}`)
      .then((res) => res.json())
      .then((json) => {
        if (json?.data) setReview(json.data);
        else setError("Review not found");
      })
      .catch(() => setError("Failed to load review"))
      .finally(() => setLoading(false));
  }, [id]);

  if (!id) {
    return (
      <div className="py-4">
        <div className="alert alert-warning">Invalid review ID.</div>
        <Link href="/dashboard/reviews">Back to reviews</Link>
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

  if (error || !review) {
    return (
      <div className="py-4">
        <div className="alert alert-danger">{error || "Review not found"}</div>
        <Link href="/dashboard/reviews">Back to reviews</Link>
      </div>
    );
  }

  const listing =
    typeof review.listing === "object" && review.listing
      ? (review.listing as ReviewListingRef)
      : null;
  const user =
    typeof review.user === "object" && review.user
      ? (review.user as ReviewUserRef)
      : null;

  return (
    <div className="py-4">
      <div className="d-flex justify-content-between align-items-start flex-wrap gap-2 mb-4">
        <div className="section-header">
          <div className="font-caveat fs-4 fw-bold text-primary">Review</div>
          <h2 className="fw-semibold mb-0 h3">Review details</h2>
          <div className="sub-title fs-16 text-muted">
            <Link href="/dashboard/reviews" className="text-primary">
              ← Back to reviews
            </Link>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-body">
          <div className="d-flex flex-wrap gap-2 mb-3">
            {listing && (
              <span className="badge bg-info">
                <Link
                  href={`/listings/${listing.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white text-decoration-none"
                >
                  {listing.title || listing.slug}
                </Link>
              </span>
            )}
            {user && (
              <span className="text-muted">
                By {user.name || user.email || "-"}
              </span>
            )}
            <span className="badge bg-warning text-dark">{review.rating} / 5</span>
            <span className="text-muted">
              {new Date(review.createdAt).toLocaleString()}
            </span>
            {review.helpfulCount != null && review.helpfulCount > 0 && (
              <span className="text-muted">{review.helpfulCount} helpful</span>
            )}
          </div>
          <p className="mb-0" style={{ whiteSpace: "pre-wrap" }}>
            {review.comment}
          </p>
        </div>
      </div>
    </div>
  );
}
