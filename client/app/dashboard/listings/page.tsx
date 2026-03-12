"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import DataTable, { DataTableColumn } from "../components/DataTable";
import type { ListingItem, ListingCategory, ListingUser } from "./types";

const DEFAULT_LIMIT = 10;
const SEARCH_DEBOUNCE_MS = 400;

function getFeatureImageUrl(row: ListingItem): string | null {
  const feature = (row.medias || []).find((m) => m.role === "feature");
  if (!feature?.media) return null;
  const m = feature.media;
  return typeof m === "object" && m && "url" in m ? (m as { url?: string }).url ?? null : null;
}

export default function DashboardListingsPage() {
  const [listings, setListings] = useState<ListingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [pagination, setPagination] = useState<{
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  } | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [searchInput]);

  const fetchListings = async (pageNum: number = 1, searchQuery: string = "") => {
    try {
      setLoading(true);
      const searchParam = searchQuery ? `&search=${encodeURIComponent(searchQuery)}` : "";
      const res = await fetch(`/api/listings?all=1&page=${pageNum}&limit=${DEFAULT_LIMIT}${searchParam}`);
      const json = await res.json();
      if (json?.data) setListings(json.data);
      else setListings([]);
      if (json?.pagination) setPagination(json.pagination);
      else setPagination(null);
    } catch {
      setListings([]);
      setPagination(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings(page, search);
  }, [page, search]);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this listing?")) return;
    try {
      const res = await fetch(`/api/listings/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.message || "Delete failed");
      await fetchListings(page, search);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed");
    }
  };

  const handleToggleFeatured = async (row: ListingItem) => {
    const id = row._id;
    const next = !row.isFeatured;
    setTogglingId(id);
    setError(null);
    try {
      const res = await fetch(`/api/listings/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isFeatured: next }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.message || "Update failed");
      setListings((prev) =>
        prev.map((l) => (l._id === id ? { ...l, isFeatured: next } : l))
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update featured");
    } finally {
      setTogglingId(null);
    }
  };

  const columns: DataTableColumn<ListingItem>[] = [
    {
      key: "sl",
      label: "SL.",
      render: (_, index) => String((page - 1) * DEFAULT_LIMIT + index + 1),
    },
    {
      key: "image",
      label: "Image",
      render: (row) => {
        const src = getFeatureImageUrl(row);
        return (
          <span className="avatar avatar-sm">
            {src ? (
              <img src={src} alt="" className="avatar-img rounded" style={{ objectFit: "cover" }} />
            ) : (
              <span className="avatar-img rounded bg-light d-flex align-items-center justify-content-center">
                <i className="fa-solid fa-image text-muted" />
              </span>
            )}
          </span>
        );
      },
    },
    {
      key: "isFeatured",
      label: "Featured",
      render: (row) => {
        const busy = togglingId === row._id;
        return (
          <button
            type="button"
            className="btn btn-link btn-sm p-0 text-decoration-none"
            onClick={() => handleToggleFeatured(row)}
            disabled={busy}
            title={row.isFeatured ? "Remove from featured" : "Set as featured"}
            aria-label={row.isFeatured ? "Remove from featured" : "Set as featured"}
          >
            {busy ? (
              <span className="spinner-border spinner-border-sm text-primary" />
            ) : (
              <i
                className={`fa-star ${row.isFeatured ? "fa-solid text-warning" : "fa-regular text-muted"}`}
              />
            )}
          </button>
        );
      },
    },
    {
      key: "title",
      label: "Title",
      render: (row) => (
        <div>
          <div className="fw-medium">{row.title}</div>
          {row.description && (
            <small className="text-muted text-truncate d-block" style={{ maxWidth: 200 }}>
              {row.description}
            </small>
          )}
        </div>
      ),
    },
    {
      key: "category",
      label: "Category",
      render: (row) => {
        const cat =
          typeof row.category === "object" && row.category
            ? (row.category as ListingCategory).name || (row.category as ListingCategory).slug
            : "-";
        return <span className="badge bg-info">{cat || "-"}</span>;
      },
    },
    {
      key: "author",
      label: "Owner",
      render: (row) =>
        typeof row.user === "object" && row.user
          ? (row.user as ListingUser).name || (row.user as ListingUser).email || "-"
          : "-",
    },
    {
      key: "status",
      label: "Status",
      render: (row) => {
        const st = row.status ?? ((row as { isActive?: boolean }).isActive ? "published" : "draft") as "draft" | "pending" | "published";
        return (
          <div
            className={`d-flex align-items-center gap-1 fw-medium fs-14 ${
              st === "published" ? "text-success" : st === "pending" ? "text-info" : "text-warning"
            }`}
          >
            <i className="fa-solid fa-circle fs-10" />
            <span>{st === "published" ? "Published" : st === "pending" ? "Pending" : "Draft"}</span>
          </div>
        );
      },
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
        <div className="d-flex gap-1">
          <Link
            href={`/dashboard/listings/${row._id}/edit`}
            className="btn btn-primary btn-sm"
            title="Edit"
          >
            <i className="fa-solid fa-pencil" />
          </Link>
          <Link
            href={`/dashboard/listings/${row._id}`}
            className="btn btn-success btn-sm"
            title="View"
          >
            <i className="fa-solid fa-eye" />
          </Link>
          <a
            href={`/listings/${row.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-outline-secondary btn-sm"
            title="Open on site"
          >
            <i className="fa-solid fa-external-link" />
          </a>
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
        <div className="font-caveat fs-4 fw-bold text-primary">Listings</div>
        <h2 className="fw-semibold mb-0 h3">Listings</h2>
        <div className="sub-title fs-16 text-muted">
          View and manage listings.
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
              <h6 className="fs-17 fw-semi-bold my-1">Listings</h6>
              <p className="mb-0 text-muted">List of all listings. Add, edit, or view from here.</p>
            </div>
            <div className="text-end">
              <Link href="/dashboard/listings/add" className="btn btn-primary fw-medium">
                <i className="fa-solid fa-plus me-1" />
                Add New Listing
              </Link>
            </div>
          </div>
        </div>
        <div className="card-body">
          <DataTable
            columns={columns}
            data={listings}
            keyField="_id"
            loading={loading}
            emptyMessage="No listings yet. Click Add New Listing to create one."
            pagination={pagination ?? undefined}
            onPageChange={setPage}
            searchValue={searchInput}
            onSearchChange={setSearchInput}
            searchPlaceholder="Search title, description, status…"
          />
        </div>
      </div>
    </div>
  );
}
