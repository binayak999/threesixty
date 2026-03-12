"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import DataTable, { DataTableColumn } from "../components/DataTable";

export interface ListingUser {
  _id: string;
  name?: string;
  email?: string;
}

export interface ListingCategory {
  _id: string;
  name?: string;
  slug?: string;
}

export interface ListingItem {
  _id: string;
  title: string;
  description: string;
  slug: string;
  category: ListingCategory | string;
  user: ListingUser | string;
  status?: "draft" | "published";
  createdAt: string;
  updatedAt: string;
}

const statusLabels: Record<string, string> = {
  active: "Published",
  pending: "Draft",
  expired: "Expired",
};

export default function MyListingPage() {
  const searchParams = useSearchParams();
  const statusFilter = searchParams.get("status") || "active";
  const [listings, setListings] = useState<ListingItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchListings = async () => {
    try {
      const res = await fetch("/api/listings?all=1");
      const json = await res.json();
      if (json?.data) setListings(json.data);
      else setListings([]);
    } catch {
      setListings([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, []);

  const filteredListings = listings.filter((l) => {
    const st = l.status ?? (l as { isActive?: boolean }).isActive ? "published" : "draft";
    if (statusFilter === "active") return st === "published";
    if (statusFilter === "pending") return st === "draft";
    if (statusFilter === "expired") return st === "draft";
    return true;
  });

  const columns: DataTableColumn<ListingItem>[] = [
    {
      key: "sl",
      label: "SL.",
      render: (_, index) => (index + 1).toString(),
    },
    {
      key: "image",
      label: "Image",
      render: () => (
        <span className="avatar avatar-sm">
          <span className="avatar-img rounded bg-light d-flex align-items-center justify-content-center">
            <i className="fa-solid fa-image text-muted" />
          </span>
        </span>
      ),
    },
    {
      key: "title",
      label: "Title",
      render: (row) => (
        <div>
          <div className="fw-medium">{row.title}</div>
          {row.description && (
            <small className="text-muted text-truncate d-block" style={{ maxWidth: 220 }}>
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
        const st = row.status ?? (row as { isActive?: boolean }).isActive ? "published" : "draft";
        return (
          <div
            className={`d-flex align-items-center gap-1 fw-medium fs-14 ${
              st === "published" ? "text-success" : "text-warning"
            }`}
          >
            <i className="fa-solid fa-circle fs-10" />
            <span>{st === "published" ? "Published" : "Draft"}</span>
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
            href={`/dashboard/add-listing?edit=${row._id}`}
            className="btn btn-primary btn-sm"
            title="Edit"
          >
            <i className="fa-solid fa-pencil" />
          </Link>
          <Link
            href={`/listings/${row.slug}`}
            className="btn btn-success btn-sm"
            title="View"
            target="_blank"
            rel="noopener noreferrer"
          >
            <i className="fa-solid fa-eye" />
          </Link>
        </div>
      ),
    },
  ];

  return (
    <div className="py-4">
      <div className="align-items-end row g-4 mb-4">
        <div className="col">
          <div className="section-header">
            <div className="font-caveat fs-4 fw-bold text-primary">My Listings</div>
            <h2 className="fw-semibold mb-0 h3">
              {statusLabels[statusFilter] || "All"} Listings
            </h2>
            <div className="sub-title fs-16 text-muted">
              Manage your listings.{" "}
              <span className="text-primary fw-semibold">Find what you’re looking for.</span>
            </div>
          </div>
        </div>
        <div className="col-12 col-xl-auto">
          <Link
            href="/dashboard/add-listing"
            className="align-items-center d-flex fs-14 fw-bold gap-2 justify-content-center justify-content-xl-end l-spacing-1 text-primary text-uppercase"
          >
            Add listing
            <i className="fa-solid fa-arrow-up-right" />
          </Link>
        </div>
      </div>

      <div className="card">
        <div className="card-header position-relative">
          <div className="d-flex justify-content-between align-items-center flex-wrap">
            <div>
              <h6 className="fs-17 fw-semi-bold my-1">Listings</h6>
              <p className="mb-0 text-muted">Manage your listings. Use filters: Active, Pending, Expired.</p>
            </div>
            <div className="d-flex gap-2">
              <Link
                href="/dashboard/my-listing?status=active"
                className={`btn btn-sm ${statusFilter === "active" ? "btn-primary" : "btn-outline-primary"}`}
              >
                Active
              </Link>
              <Link
                href="/dashboard/my-listing?status=pending"
                className={`btn btn-sm ${statusFilter === "pending" ? "btn-primary" : "btn-outline-primary"}`}
              >
                Pending
              </Link>
              <Link
                href="/dashboard/my-listing?status=expired"
                className={`btn btn-sm ${statusFilter === "expired" ? "btn-primary" : "btn-outline-primary"}`}
              >
                Expired
              </Link>
            </div>
          </div>
        </div>
        <div className="card-body">
          <DataTable
            columns={columns}
            data={filteredListings}
            keyField="_id"
            loading={loading}
            emptyMessage="No listings yet. Add one from the link above."
          />
        </div>
      </div>
    </div>
  );
}
