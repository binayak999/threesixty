"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import DataTable, { DataTableColumn } from "../components/DataTable";
import { apiClient } from "@/lib/apiClient";
import type { BlogItem, BlogCategory, BlogUser } from "./types";

const DEFAULT_LIMIT = 10;
const SEARCH_DEBOUNCE_MS = 400;

function getFeatureImageUrl(row: BlogItem): string | null {
  const feature = (row.medias || []).find((m) => m.role === "feature");
  if (!feature?.media) return null;
  const m = feature.media;
  return typeof m === "object" && m && "url" in m ? (m as { url?: string }).url ?? null : null;
}

export default function DashboardBlogsPage() {
  const [blogs, setBlogs] = useState<BlogItem[]>([]);
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

  const fetchBlogs = async (pageNum: number = 1, searchQuery: string = "") => {
    try {
      setLoading(true);
      const searchParam = searchQuery ? `&search=${encodeURIComponent(searchQuery)}` : "";
      const res = await apiClient.get<{ data?: BlogItem[]; pagination?: typeof pagination }>(
        `/api/blogs?page=${pageNum}&limit=${DEFAULT_LIMIT}${searchParam}`
      );
      const json = res.data;
      if (json?.data) setBlogs(json.data);
      else setBlogs([]);
      if (json?.pagination) setPagination(json.pagination);
      else setPagination(null);
    } catch {
      setBlogs([]);
      setPagination(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs(page, search);
  }, [page, search]);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this blog post?")) return;
    try {
      await apiClient.delete(`/api/blogs/${id}`);
      await fetchBlogs(page, search);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg || "Delete failed");
    }
  };

  const handleToggleFeatured = async (row: BlogItem) => {
    const id = row._id;
    const next = !row.isFeatured;
    setTogglingId(id);
    setError(null);
    try {
      await apiClient.patch(`/api/blogs/${id}`, { isFeatured: next });
      setBlogs((prev) =>
        prev.map((b) => (b._id === id ? { ...b, isFeatured: next } : b))
      );
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg || "Failed to update featured");
    } finally {
      setTogglingId(null);
    }
  };

  const columns: DataTableColumn<BlogItem>[] = [
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
          {row.excerpt && (
            <small className="text-muted text-truncate d-block" style={{ maxWidth: 200 }}>
              {row.excerpt}
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
            ? (row.category as BlogCategory).name
            : "-";
        return <span className="badge bg-info">{cat}</span>;
      },
    },
    {
      key: "author",
      label: "Author",
      render: (row) =>
        typeof row.user === "object" && row.user
          ? (row.user as BlogUser).name || (row.user as BlogUser).email || "-"
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
      key: "publishedAt",
      label: "Published",
      render: (row) =>
        row.publishedAt
          ? new Date(row.publishedAt).toLocaleDateString()
          : "-",
    },
    {
      key: "actions",
      label: "Action",
      render: (row) => (
        <div className="d-flex gap-1">
          <Link
            href={`/dashboard/blogs/${row._id}/edit`}
            className="btn btn-primary btn-sm"
            title="Edit"
          >
            <i className="fa-solid fa-pencil" />
          </Link>
          <Link
            href={`/dashboard/blogs/${row._id}`}
            className="btn btn-success btn-sm"
            title="View"
          >
            <i className="fa-solid fa-eye" />
          </Link>
          <a
            href={`/blogs/${row.slug}`}
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
        <div className="font-caveat fs-4 fw-bold text-primary">Blog Management</div>
        <h2 className="fw-semibold mb-0 h3">Blog Posts</h2>
        <div className="sub-title fs-16 text-muted">
          View and manage your blog content.
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
              <h6 className="fs-17 fw-semi-bold my-1">Blog Posts</h6>
              <p className="mb-0 text-muted">List of all blog posts. Add, edit, or view from here.</p>
            </div>
            <div className="text-end">
              <Link href="/dashboard/blogs/add" className="btn btn-primary fw-medium">
                <i className="fa-solid fa-plus me-1" />
                Add New Blog
              </Link>
            </div>
          </div>
        </div>
        <div className="card-body">
          <DataTable
            columns={columns}
            data={blogs}
            keyField="_id"
            loading={loading}
            emptyMessage="No blog posts yet. Click Add New Blog to create one."
            pagination={pagination ?? undefined}
            onPageChange={setPage}
            searchValue={searchInput}
            onSearchChange={setSearchInput}
            searchPlaceholder="Search title, excerpt, status…"
          />
        </div>
      </div>
    </div>
  );
}
