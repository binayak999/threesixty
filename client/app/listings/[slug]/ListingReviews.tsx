"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { getMediaUrl } from "@/lib/mediaUrl";
import { MediaGalleryManager, type MediaGalleryManagerRef } from "@/components/MediaGalleryManager";

interface ReviewMedia {
  _id?: string;
  url?: string;
  urlMedium?: string;
  urlLow?: string;
  type?: string;
}

interface ReviewItem {
  _id: string;
  rating: number;
  comment: string;
  helpfulCount?: number;
  createdAt: string;
  user?: { name?: string; email?: string };
  reviewMedias?: ReviewMedia[];
}

function starIconClass(value: number, index: number): string {
  const v = value - index;
  if (v >= 1) return "fa-star-icon";
  if (v >= 0.5) return "fa-star-icon half";
  return "fa-star-icon none";
}

function TemplateStarRating({ value }: { value: number }) {
  return (
    <div className="d-flex align-items-center text-primary rating-stars" aria-label={`${value} out of 5 stars`}>
      {[0, 1, 2, 3, 4].map((i) => (
        <i key={i} className={starIconClass(value, i)} />
      ))}
    </div>
  );
}

const PROGRESS_COLORS = ["bg-primary", "bg-success", "bg-warning", "bg-info", "text-bg-danger"];

export default function ListingReviews({
  listingId,
  slug,
  embedded,
}: {
  listingId: string;
  slug: string;
  embedded?: boolean;
}) {
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [reviewMediaIds, setReviewMediaIds] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const mediaGalleryRef = useRef<MediaGalleryManagerRef | null>(null);

  const fetchReviews = useCallback(() => {
    setLoading(true);
    fetch(`/api/reviews?listingId=${encodeURIComponent(listingId)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data?.data && Array.isArray(data.data)) setReviews(data.data);
      })
      .catch(() => setReviews([]))
      .finally(() => setLoading(false));
  }, [listingId]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  useEffect(() => {
    fetch("/api/auth/session")
      .then((r) => r.json())
      .then((data: { user?: unknown }) => setIsLoggedIn(!!data?.user))
      .catch(() => setIsLoggedIn(false));
  }, []);

  const averageRating = reviews.length
    ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
    : 0;
  const ratingCounts = [5, 4, 3, 2, 1].map((r) => ({
    stars: r,
    count: reviews.filter((rev) => Math.round(rev.rating) === r).length,
  }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (rating < 1 || rating > 5) {
      setError("Please select a rating (1–5 stars).");
      return;
    }
    if (!comment.trim()) {
      setError("Please enter your review comment.");
      return;
    }
    setSubmitting(true);
    fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        listingId,
        rating,
        comment: comment.trim(),
        reviewMedias: reviewMediaIds.length > 0 ? reviewMediaIds : undefined,
      }),
    })
      .then(async (res) => {
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data?.message || "Failed to submit review");
        return data;
      })
      .then(() => {
        setSuccess(true);
        setRating(0);
        setComment("");
        setReviewMediaIds([]);
        fetchReviews();
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to submit"))
      .finally(() => setSubmitting(false));
  };

  const content = (
    <>
      <div className="mb-4">
        <h4 className="fw-semibold fs-3 mb-4">
          Latest Property <span className="font-caveat text-primary">Reviews</span>
        </h4>
        <div className="border p-4 mb-5 rounded-4">
          <div className="row g-4 align-items-center">
            <div className="col-sm-auto">
              <div className="rating-block text-center">
                <h5 className="font-caveat fs-4 mb-4">Average user rating</h5>
                <div className="rating-point position-relative ml-auto mr-auto">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="120"
                    height="120"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="0.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="feather feather-star text-primary"
                  >
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                  <h3 className="position-absolute mb-0 fs-18 text-primary">
                    {reviews.length ? averageRating.toFixed(1) : "—"}
                  </h3>
                </div>
                <span className="fs-13">{reviews.length} review{reviews.length !== 1 ? "s" : ""}</span>
              </div>
            </div>
            <div className="col">
              <div className="rating-position">
                <h5 className="font-caveat fs-4 mb-4">Rating breakdown</h5>
                {ratingCounts.map(({ stars, count }, idx) => (
                  <div key={stars} className="align-items-center d-flex mb-2 rating-dimension gap-2">
                    <div className="d-flex align-items-center gap-2">
                      <span className="fs-14 fw-semibold rating-points">{stars}</span>
                      <div className="d-flex align-items-center text-primary rating-stars">
                        {[0, 1, 2, 3, 4].map((i) => (
                          <i key={i} className={starIconClass(stars, i)} />
                        ))}
                      </div>
                    </div>
                    <div className="progress flex-grow-1 me-2">
                      <div
                        className={`progress-bar ${PROGRESS_COLORS[idx] || "bg-primary"}`}
                        role="progressbar"
                        style={{
                          width: reviews.length ? `${(count / reviews.length) * 100}%` : "0%",
                        }}
                        aria-valuenow={reviews.length ? Math.round((count / reviews.length) * 100) : 0}
                        aria-valuemin={0}
                        aria-valuemax={100}
                      />
                    </div>
                    <div className="bg-dark fs-11 fw-medium px-2 py-1 rounded-pill text-white user-rating">
                      {count}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <p className="text-muted">Loading reviews…</p>
      ) : reviews.length > 0 ? (
        <div className="mb-5">
          {reviews.map((rev) => (
            <div key={rev._id} className="d-flex mb-4 border-bottom pb-4">
              <div className="flex-shrink-0">
                <div
                  className="object-fit-cover rounded-circle bg-primary bg-opacity-10 d-flex align-items-center justify-content-center text-primary"
                  style={{ width: 70, height: 70 }}
                >
                  <i className="fa-solid fa-user fs-5" />
                </div>
              </div>
              <div className="flex-grow-1 ms-4">
                <div className="comment-header d-flex flex-wrap gap-2 mb-3">
                  <div>
                    <h4 className="fs-18 mb-0">
                      - {rev.user?.name || rev.user?.email || "Anonymous"}
                    </h4>
                    <div className="comment-datetime fs-12 text-muted">
                      {new Date(rev.createdAt).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                  <div className="d-flex align-items-center gap-2 ms-auto">
                    <TemplateStarRating value={rev.rating} />
                    <span className="fs-14 fw-semibold rating-points">{rev.rating}/5</span>
                  </div>
                </div>
                <div className="fs-15" style={{ whiteSpace: "pre-wrap" }}>
                  {rev.comment}
                </div>
                {rev.reviewMedias && rev.reviewMedias.length > 0 && (
                  <div className="row mt-3 g-2 review-image zoom-gallery">
                    {rev.reviewMedias.map((media) => {
                      const src = getMediaUrl(media.urlMedium || media.url || media.urlLow || "");
                      if (!src) return null;
                      return (
                        <div className="col-auto" key={media._id || src}>
                          <a
                            href={getMediaUrl(media.url || media.urlMedium || media.urlLow || "")}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="galary-overlay-hover dark-overlay position-relative d-block overflow-hidden rounded-3"
                          >
                            <img
                              src={src}
                              alt=""
                              className="img-fluid rounded-3 object-fit-cover"
                              height={70}
                              width={112}
                            />
                            <div className="galary-hover-element h-100 position-absolute start-50 top-50 translate-middle w-100">
                              <i className="fa-solid fa-expand text-white position-absolute top-50 start-50 translate-middle bg-primary rounded-1 p-2 lh-1" />
                            </div>
                          </a>
                        </div>
                      );
                    })}
                  </div>
                )}
                <a
                  href="#"
                  className="btn btn-light btn-sm mt-4 px-3 rounded-pill gap-2 d-inline-flex"
                  onClick={(e) => e.preventDefault()}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    fill="currentColor"
                    className="bi bi-hand-thumbs-up"
                    viewBox="0 0 16 16"
                  >
                    <path d="M8.864.046C7.908-.193 7.02.53 6.956 1.466c-.072 1.051-.23 2.016-.428 2.59-.125.36-.479 1.013-1.04 1.639-.557.623-1.282 1.178-2.131 1.41C2.685 7.288 2 7.87 2 8.72v4.001c0 .845.682 1.464 1.448 1.545 1.07.114 1.564.415 2.068.723l.048.03c.272.165.578.348.97.484.397.136.861.217 1.466.217h3.5c.937 0 1.599-.477 1.934-1.064a1.86 1.86 0 0 0 .254-.912c0-.152-.023-.312-.077-.464.201-.263.38-.578.488-.901.11-.33.172-.762.004-1.149.069-.13.12-.269.159-.403.077-.27.113-.568.113-.857 0-.288-.036-.585-.113-.856a2.144 2.144 0 0 0-.138-.362 1.9 1.9 0 0 0 .234-1.734c-.206-.592-.682-1.1-1.2-1.272-.847-.282-1.803-.276-2.516-.211a9.84 9.84 0 0 0-.443.05 9.365 9.365 0 0 0-.062-4.509A1.38 1.38 0 0 0 9.125.111L8.864.046zM11.5 14.721H8c-.51 0-.863-.069-1.14-.164-.281-.097-.506-.228-.776-.393l-.04-.024c-.555-.339-1.198-.731-2.49-.868-.333-.036-.554-.29-.554-.55V8.72c0-.254.226-.543.62-.65 1.095-.3 1.977-.996 2.614-1.708.635-.71 1.064-1.475 1.238-1.978.243-.7.407-1.768.482-2.85.025-.362.36-.594.667-.518l.262.066c.16.04.258.143.288.255a8.34 8.34 0 0 1-.145 4.725.5.5 0 0 0 .595.644l.003-.001.014-.003.058-.014a8.908 8.908 0 0 1 1.036-.157c.663-.06 1.457-.054 2.11.164.175.058.45.3.57.65.107.308.087.67-.266 1.022l-.353.353.353.354c.043.043.105.141.154.315.048.167.075.37.075.581 0 .212-.027.414-.075.582-.05.174-.111.272-.154.315l-.353.353.353.354c.047.047.109.177.005.488a2.224 2.224 0 0 1-.505.805l-.353.353.353.354c.006.005.041.05.041.17a.866.866 0 0 1-.121.416c-.165.288-.503.56-1.066.56z" />
                  </svg>
                  Helpful Review
                  <div className="vr d-none d-sm-inline-block" />
                  <span className="fw-semibold">{rev.helpfulCount ?? 0}</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-muted mb-5">No reviews yet. Be the first to review!</p>
      )}

      <hr className="my-5" />

      <div className="mb-4 mb-lg-0">
        <h4 className="fw-semibold fs-3 mb-4">
          Leave a <span className="font-caveat text-primary">Review</span>
        </h4>
        {isLoggedIn === false ? (
          <p className="text-muted mb-3">
            <Link
              href={`/sign-in?redirect=${encodeURIComponent(`/listings/${slug}`)}`}
              className="btn btn-primary"
            >
              Sign in to leave a review
            </Link>
          </p>
        ) : (
          <form className="row g-4" onSubmit={handleSubmit}>
            <div className="col-sm-12">
              <label className="required fw-medium mb-2">Your rating</label>
              <div className="d-flex align-items-center gap-2 flex-wrap">
                {[1, 2, 3, 4, 5].map((r) => (
                  <button
                    key={r}
                    type="button"
                    className="btn btn-link p-0 border-0 text-warning"
                    onMouseEnter={() => setHoverRating(r)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setRating(r)}
                    aria-label={`${r} star${r > 1 ? "s" : ""}`}
                  >
                    <i
                      className={
                        (hoverRating || rating) >= r
                          ? "fa-solid fa-star"
                          : "fa-regular fa-star"
                      }
                      style={{ fontSize: "1.5rem" }}
                    />
                  </button>
                ))}
                <span className="ms-2 text-muted">
                  {(hoverRating || rating) || "—"} / 5
                </span>
              </div>
            </div>
            <div className="col-sm-12">
              <label className="required fw-medium mb-2">Your review</label>
              <textarea
                className="form-control"
                rows={7}
                placeholder="Tell us what we can help you with!"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                required
                minLength={10}
              />
              <div className="form-text">Minimum 10 characters.</div>
            </div>
            <div className="col-sm-12">
              <label className="fw-medium mb-2">Photos (optional)</label>
              <div className="d-flex flex-wrap align-items-center gap-2">
                <button
                  type="button"
                  className="btn btn-outline-primary btn-sm"
                  onClick={() => mediaGalleryRef.current?.open()}
                >
                  <i className="fa-solid fa-image me-1" />
                  Add photos
                </button>
                {reviewMediaIds.length > 0 && (
                  <span className="small text-muted">
                    {reviewMediaIds.length} photo{reviewMediaIds.length !== 1 ? "s" : ""} selected
                  </span>
                )}
              </div>
              <MediaGalleryManager
                ref={mediaGalleryRef}
                mode="popup"
                title="Select photos for your review"
                allowTypes={["image", "360"]}
                multiple={true}
                selectedIds={reviewMediaIds}
                onSelect={(items) => setReviewMediaIds(items.map((i) => i.id))}
              />
            </div>
            {error && (
              <div className="col-12">
                <div className="alert alert-danger py-2 mb-0">{error}</div>
              </div>
            )}
            {success && (
              <div className="col-12">
                <div className="alert alert-success py-2 mb-0">
                  Thank you! Your review has been submitted and is pending approval.
                </div>
              </div>
            )}
            <div className="col-sm-12 text-end">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={submitting || rating < 1 || !comment.trim()}
              >
                {submitting ? "Submitting…" : "Submit"}
              </button>
            </div>
          </form>
        )}
      </div>
    </>
  );

  if (embedded) return content;
  return <div className="container py-5">{content}</div>;
}
