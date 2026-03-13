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

export interface BannerRow {
  _id: string;
  title: string;
  media: MediaRef | string;
  is360?: boolean;
  bannerType?: "homebanner" | "adsbanner";
  link?: string;
  createdAt?: string;
  updatedAt?: string;
}

export default function BannersPage() {
  const [items, setItems] = useState<BannerRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchItems = async () => {
    try {
      const res = await apiClient.get<{ data?: BannerRow[] }>("/api/banners");
      if (res.data?.data) setItems(res.data.data);
      else setItems([]);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this banner?")) return;
    try {
      await apiClient.delete(`/api/banners/${id}`);
      await fetchItems();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg || "Delete failed");
    }
  };

  const columns: DataTableColumn<BannerRow>[] = [
    { key: "sl", label: "SL.", render: (_, i) => String(i + 1) },
    { key: "title", label: "Title", render: (row) => <span className="fw-medium">{row.title}</span> },
    { key: "bannerType", label: "Type", render: (row) => <span className="text-capitalize">{row.bannerType === "adsbanner" ? "Ads" : "Home"}</span> },
    {
      key: "media",
      label: "Image",
      render: (row) => {
        const media = typeof row.media === "object" && row.media ? row.media : null;
        const url = media?.url;
        return url ? (
          <span className="d-inline-flex align-items-center gap-1">
            <img src={getMediaUrl(url)} alt="" className="rounded" style={{ width: 80, height: 40, objectFit: "cover" }} />
            {row.is360 && (
              <span className="badge bg-info" title="360° view">360°</span>
            )}
          </span>
        ) : (
          <span className="text-muted">—</span>
        );
      },
    },
    {
      key: "actions",
      label: "Action",
      render: (row) => (
        <div className="d-flex gap-1">
          <Link href={`/dashboard/banners/${row._id}/edit`} className="btn btn-primary btn-sm" title="Edit">
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
        <div className="font-caveat fs-4 fw-bold text-primary">Banners</div>
        <h2 className="fw-semibold mb-0 h3">Banners</h2>
        <div className="sub-title fs-16 text-muted">Manage banners with title and image.</div>
      </div>
      {error && (
        <div className="alert alert-danger py-2 mb-3" role="alert">
          {error}
        </div>
      )}
      <div className="card">
        <div className="card-header position-relative d-flex justify-content-between align-items-center flex-wrap">
          <div>
            <h6 className="fs-17 fw-semi-bold my-1">All Banners</h6>
            <p className="mb-0 text-muted">Add, edit, or delete banners.</p>
          </div>
          <Link href="/dashboard/banners/add" className="btn btn-primary btn-sm">
            <i className="fa-solid fa-plus me-1" />
            Add Banner
          </Link>
        </div>
        <div className="card-body">
          <DataTable columns={columns} data={items} keyField="_id" loading={loading} emptyMessage="No banners yet." />
        </div>
      </div>
    </div>
  );
}
