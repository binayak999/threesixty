"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import DataTable, { DataTableColumn } from "../components/DataTable";

export interface AmenityItem {
  _id: string;
  name: string;
  icon: string;
  slug: string;
  createdAt?: string;
  updatedAt?: string;
}

export default function AmenitiesPage() {
  const [items, setItems] = useState<AmenityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchItems = async () => {
    try {
      const res = await fetch("/api/amenities");
      const json = await res.json();
      if (json?.data) setItems(json.data);
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
    if (!confirm("Delete this amenity?")) return;
    try {
      const res = await fetch(`/api/amenities/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.message || "Delete failed");
      await fetchItems();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed");
    }
  };

  const columns: DataTableColumn<AmenityItem>[] = [
    { key: "sl", label: "SL.", render: (_, i) => String(i + 1) },
    { key: "name", label: "Name", render: (row) => <span className="fw-medium">{row.name}</span> },
    { key: "slug", label: "Slug", render: (row) => <code className="small">{row.slug}</code> },
    {
      key: "icon",
      label: "Icon",
      render: (row) => (row.icon ? <i className={row.icon.startsWith("fa") ? row.icon : `fa-solid ${row.icon}`} /> : "—"),
    },
    {
      key: "actions",
      label: "Action",
      render: (row) => (
        <div className="d-flex gap-1">
          <Link href={`/dashboard/amenities/${row._id}/edit`} className="btn btn-primary btn-sm" title="Edit">
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
        <div className="font-caveat fs-4 fw-bold text-primary">Amenities</div>
        <h2 className="fw-semibold mb-0 h3">Amenities</h2>
        <div className="sub-title fs-16 text-muted">Manage amenities for listings.</div>
      </div>
      {error && (
        <div className="alert alert-danger py-2 mb-3" role="alert">
          {error}
        </div>
      )}
      <div className="card">
        <div className="card-header position-relative d-flex justify-content-between align-items-center flex-wrap">
          <div>
            <h6 className="fs-17 fw-semi-bold my-1">All Amenities</h6>
            <p className="mb-0 text-muted">Add, edit, or delete amenities.</p>
          </div>
          <Link href="/dashboard/amenities/add" className="btn btn-primary btn-sm">
            <i className="fa-solid fa-plus me-1" />
            Add Amenity
          </Link>
        </div>
        <div className="card-body">
          <DataTable columns={columns} data={items} keyField="_id" loading={loading} emptyMessage="No amenities yet." />
        </div>
      </div>
    </div>
  );
}
