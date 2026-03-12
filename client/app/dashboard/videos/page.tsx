"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getMediaUrl } from "@/lib/mediaUrl";
import DataTable, { DataTableColumn } from "../components/DataTable";

const SEARCH_DEBOUNCE_MS = 400;

interface MediaRef {
  _id: string;
  url?: string;
}

export interface VideoRow {
  _id: string;
  title: string;
  youtubeLink: string;
  thumbnail: MediaRef | string;
  status?: "pending" | "published";
  user?: { _id: string; name?: string; email?: string };
  createdAt?: string;
  updatedAt?: string;
}

const DEFAULT_LIMIT = 10;

export default function VideosPage() {
  const [items, setItems] = useState<VideoRow[]>([]);
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
      const res = await fetch(`/api/videos?all=1&page=${pageNum}&limit=${DEFAULT_LIMIT}${searchParam}`);
      const json = await res.json();
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
    if (!confirm("Delete this video?")) return;
    try {
      const res = await fetch(`/api/videos/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.message || "Delete failed");
      await fetchItems(page, search);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed");
    }
  };

  const columns: DataTableColumn<VideoRow>[] = [
    { key: "sl", label: "SL.", render: (_, i) => String((page - 1) * DEFAULT_LIMIT + i + 1) },
    { key: "title", label: "Title", render: (row) => <span className="fw-medium">{row.title}</span> },
    {
      key: "youtubeLink",
      label: "YouTube",
      render: (row) => (
        <a href={row.youtubeLink} target="_blank" rel="noopener noreferrer" className="text-primary text-truncate d-inline-block" style={{ maxWidth: 200 }}>
          {row.youtubeLink || "—"}
        </a>
      ),
    },
    {
      key: "thumbnail",
      label: "Thumbnail",
      render: (row) => {
        const thumb = typeof row.thumbnail === "object" && row.thumbnail ? row.thumbnail : null;
        const url = thumb?.url;
        return url ? (
          <img src={getMediaUrl(url)} alt="" className="rounded" style={{ width: 48, height: 36, objectFit: "cover" }} />
        ) : (
          <span className="text-muted">—</span>
        );
      },
    },
    {
      key: "status",
      label: "Status",
      render: (row) => {
        const st = row.status ?? "published";
        return (
          <span className={st === "published" ? "text-success" : "text-info"}>
            {st === "published" ? "Published" : "Pending"}
          </span>
        );
      },
    },
    {
      key: "actions",
      label: "Action",
      render: (row) => (
        <div className="d-flex gap-1">
          <Link href={`/dashboard/videos/${row._id}/edit`} className="btn btn-primary btn-sm" title="Edit">
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
        <div className="font-caveat fs-4 fw-bold text-primary">Videos</div>
        <h2 className="fw-semibold mb-0 h3">Videos</h2>
        <div className="sub-title fs-16 text-muted">Manage videos with YouTube links and thumbnails.</div>
      </div>
      {error && (
        <div className="alert alert-danger py-2 mb-3" role="alert">
          {error}
        </div>
      )}
      <div className="card">
        <div className="card-header position-relative d-flex justify-content-between align-items-center flex-wrap">
          <div>
            <h6 className="fs-17 fw-semi-bold my-1">All Videos</h6>
            <p className="mb-0 text-muted">Add, edit, or delete videos.</p>
          </div>
          <Link href="/dashboard/videos/add" className="btn btn-primary btn-sm">
            <i className="fa-solid fa-plus me-1" />
            Add Video
          </Link>
        </div>
        <div className="card-body">
          <DataTable
            columns={columns}
            data={items}
            keyField="_id"
            loading={loading}
            emptyMessage="No videos yet."
            pagination={pagination ?? undefined}
            onPageChange={setPage}
            searchValue={searchInput}
            onSearchChange={setSearchInput}
            searchPlaceholder="Search title, link, status…"
          />
        </div>
      </div>
    </div>
  );
}
