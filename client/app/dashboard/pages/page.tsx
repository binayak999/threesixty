"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getMediaUrl } from "@/lib/mediaUrl";
import DataTable, { DataTableColumn } from "../components/DataTable";
import { apiClient } from "@/lib/apiClient";

interface MediaRef {
  _id: string;
  url?: string;
}

interface SeoRef {
  metaTitle?: string;
  metaDescription?: string;
}

export interface PageRow {
  _id: string;
  title: string;
  slug: string;
  banner?: MediaRef | string | null;
  seo?: SeoRef;
  createdAt?: string;
  updatedAt?: string;
}

const DEFAULT_LIMIT = 10;
const SEARCH_DEBOUNCE_MS = 400;

export default function PagesPage() {
  const [items, setItems] = useState<PageRow[]>([]);
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

  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [searchInput]);

  const fetchItems = async (pageNum: number = 1, searchQuery: string = "") => {
    try {
      setLoading(true);
      const searchParam = searchQuery ? `&search=${encodeURIComponent(searchQuery)}` : "";
      const res = await apiClient.get<{ data?: PageRow[]; pagination?: typeof pagination }>(
        `/api/pages?page=${pageNum}&limit=${DEFAULT_LIMIT}${searchParam}`
      );
      const json = res.data;
      if (json?.data) setItems(json.data);
      else setItems([]);
      if (json?.pagination) setPagination(json.pagination);
      else setPagination(null);
    } catch {
      setItems([]);
      setPagination(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems(page, search);
  }, [page, search]);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this page?")) return;
    try {
      await apiClient.delete(`/api/pages/${id}`);
      await fetchItems(page, search);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg || "Delete failed");
    }
  };

  const columns: DataTableColumn<PageRow>[] = [
    { key: "sl", label: "SL.", render: (_, i) => String((page - 1) * DEFAULT_LIMIT + i + 1) },
    { key: "title", label: "Title", render: (row) => <span className="fw-medium">{row.title}</span> },
    { key: "slug", label: "Slug", render: (row) => <code className="small">{row.slug}</code> },
    {
      key: "banner",
      label: "Banner",
      render: (row) => {
        const media = typeof row.banner === "object" && row.banner ? row.banner : null;
        const url = media?.url;
        return url ? (
          <img src={getMediaUrl(url)} alt="" className="rounded" style={{ width: 80, height: 40, objectFit: "cover" }} />
        ) : (
          <span className="text-muted">—</span>
        );
      },
    },
    {
      key: "seo",
      label: "SEO",
      render: (row) => (row.seo?.metaTitle ? <span className="badge bg-secondary">Yes</span> : <span className="text-muted">—</span>),
    },
    {
      key: "actions",
      label: "Action",
      render: (row) => (
        <div className="d-flex gap-1">
          <Link href={`/dashboard/pages/${row._id}/edit`} className="btn btn-primary btn-sm" title="Edit">
            <i className="fa-solid fa-pencil" />
          </Link>
          <button type="button" className="btn btn-danger btn-sm" onClick={() => handleDelete(row._id)} title="Delete">
            <i className="fa-solid fa-trash" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="py-4">
      <div className="section-header mb-4">
        <div className="font-caveat fs-4 fw-bold text-primary">Pages</div>
        <h2 className="fw-semibold mb-0 h3">Pages</h2>
        <div className="sub-title fs-16 text-muted">Manage custom pages with title, slug, banner and SEO.</div>
      </div>
      {error && (
        <div className="alert alert-danger py-2 mb-3" role="alert">
          {error}
        </div>
      )}
      <div className="card">
        <div className="card-header position-relative d-flex justify-content-between align-items-center flex-wrap">
          <div>
            <h6 className="fs-17 fw-semi-bold my-1">All Pages</h6>
            <p className="mb-0 text-muted">Add, edit, or delete pages.</p>
          </div>
          <Link href="/dashboard/pages/add" className="btn btn-primary btn-sm">
            <i className="fa-solid fa-plus me-1" />
            Add Page
          </Link>
        </div>
        <div className="card-body">
          <DataTable
            columns={columns}
            data={items}
            keyField="_id"
            loading={loading}
            emptyMessage="No pages yet."
            pagination={pagination ?? undefined}
            onPageChange={setPage}
            searchValue={searchInput}
            onSearchChange={setSearchInput}
            searchPlaceholder="Search title, slug…"
          />
        </div>
      </div>
    </div>
  );
}
