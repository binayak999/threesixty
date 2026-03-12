"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import DataTable, { DataTableColumn } from "../components/DataTable";

export interface ReviewListingRef {
  _id: string;
  title?: string;
  slug?: string;
}

export interface ReviewUserRef {
  _id: string;
  name?: string;
  email?: string;
}

export interface ReviewItem {
  _id: string;
  listing: ReviewListingRef | string;
  user: ReviewUserRef | string;
  parent?: string;
  rating: number;
  comment: string;
  helpfulCount: number;
  isApproved?: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function DashboardReviewsPage() {
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReviews = async () => {
    try {
      const res = await fetch("/api/reviews");
      const json = await res.json();
      if (json?.data) setReviews(json.data);
      else setReviews([]);
    } catch {
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleApprove = async (id: string, isApproved: boolean) => {
    try {
      const res = await fetch(`/api/reviews/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isApproved }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.message || "Update failed");
      await fetchReviews();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Update failed");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this review?")) return;
    try {
      const res = await fetch(`/api/reviews/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.message || "Delete failed");
      await fetchReviews();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed");
    }
  };

  const columns: DataTableColumn<ReviewItem>[] = [
    {
      key: "sl",
      label: "SL.",
      render: (_, index) => (index + 1).toString(),
    },
    {
      key: "listing",
      label: "Listing",
      render: (row) => {
        const listing =
          typeof row.listing === "object" && row.listing
            ? (row.listing as ReviewListingRef).title || (row.listing as ReviewListingRef).slug
            : "-";
        const slug =
          typeof row.listing === "object" && row.listing
            ? (row.listing as ReviewListingRef).slug
            : null;
        return slug ? (
          <Link href={`/listings/${slug}`} target="_blank" rel="noopener noreferrer" className="text-primary">
            {listing || "-"}
          </Link>
        ) : (
          <span>{listing || "-"}</span>
        );
      },
    },
    {
      key: "user",
      label: "User",
      render: (row) =>
        typeof row.user === "object" && row.user
          ? (row.user as ReviewUserRef).name || (row.user as ReviewUserRef).email || "-"
          : "-",
    },
    {
      key: "rating",
      label: "Rating",
      render: (row) => (
        <span className="badge bg-warning text-dark">
          {row.rating} / 5
        </span>
      ),
    },
    {
      key: "comment",
      label: "Comment",
      render: (row) => (
        <span className="text-truncate d-inline-block" style={{ maxWidth: 220 }}>
          {row.comment || "-"}
        </span>
      ),
    },
    {
      key: "helpfulCount",
      label: "Helpful",
      render: (row) => row.helpfulCount ?? 0,
    },
    {
      key: "isApproved",
      label: "Status",
      render: (row) => (
        <span className={`badge ${row.isApproved ? "bg-success" : "bg-secondary"}`}>
          {row.isApproved ? "Approved" : "Pending"}
        </span>
      ),
    },
    {
      key: "createdAt",
      label: "Created",
      render: (row) => new Date(row.createdAt).toLocaleDateString(),
    },
    {
      key: "actions",
      label: "Action",
      render: (row) => (
        <div className="d-flex gap-1 flex-wrap">
          {!row.isApproved && (
            <button
              type="button"
              className="btn btn-success btn-sm"
              title="Approve"
              onClick={() => handleApprove(row._id, true)}
            >
              <i className="fa-solid fa-check" />
            </button>
          )}
          {row.isApproved && (
            <button
              type="button"
              className="btn btn-warning btn-sm"
              title="Reject"
              onClick={() => handleApprove(row._id, false)}
            >
              <i className="fa-solid fa-times" />
            </button>
          )}
          <Link
            href={`/dashboard/reviews/${row._id}`}
            className="btn btn-outline-primary btn-sm"
            title="View"
          >
            <i className="fa-solid fa-eye" />
          </Link>
          <button
            type="button"
            className="btn btn-danger btn-sm"
            onClick={() => handleDelete(row._id)}
            title="Delete"
          >
            <i className="fa-solid fa-trash" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="py-4">
      <div className="section-header mb-4">
        <div className="font-caveat fs-4 fw-bold text-primary">Reviews</div>
        <h2 className="fw-semibold mb-0 h3">Reviews</h2>
        <div className="sub-title fs-16 text-muted">
          View and manage reviews.
        </div>
      </div>

      {error && (
        <div className="alert alert-danger py-2 mb-3" role="alert">
          {error}
        </div>
      )}

      <div className="card">
        <div className="card-header position-relative">
          <div className="d-flex justify-content-between align-items-center flex-wrap">
            <div>
              <h6 className="fs-17 fw-semi-bold my-1">Reviews</h6>
              <p className="mb-0 text-muted">List of all reviews. View or delete from here.</p>
            </div>
          </div>
        </div>
        <div className="card-body">
          <DataTable
            columns={columns}
            data={reviews}
            keyField="_id"
            loading={loading}
            emptyMessage="No reviews yet."
          />
        </div>
      </div>
    </div>
  );
}
