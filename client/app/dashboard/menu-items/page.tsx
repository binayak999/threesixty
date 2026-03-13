"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import DataTable, { DataTableColumn } from "../components/DataTable";
import { apiClient } from "@/lib/apiClient";

export interface MenuItemListingRef {
  _id: string;
  title?: string;
  slug?: string;
}

export interface MenuItemRow {
  _id: string;
  listing: MenuItemListingRef | string;
  title: string;
  detail?: string;
  price: number;
  label?: string;
  createdAt?: string;
  updatedAt?: string;
}

export default function MenuItemsPage() {
  const [items, setItems] = useState<MenuItemRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchItems = async () => {
    try {
      const res = await apiClient.get<{ data?: MenuItemRow[] }>("/api/menu-items");
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
    if (!confirm("Delete this menu item?")) return;
    try {
      await apiClient.delete(`/api/menu-items/${id}`);
      await fetchItems();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg || "Delete failed");
    }
  };

  const columns: DataTableColumn<MenuItemRow>[] = [
    { key: "sl", label: "SL.", render: (_, i) => String(i + 1) },
    {
      key: "listing",
      label: "Listing",
      render: (row) => {
        const l = typeof row.listing === "object" && row.listing ? row.listing : null;
        const title = l?.title ?? (l as { slug?: string } | undefined)?.slug ?? "—";
        const slug = l?.slug ?? null;
        return slug ? (
          <Link href={`/listings/${slug}`} target="_blank" rel="noopener noreferrer" className="text-primary">
            {title}
          </Link>
        ) : (
          <span>{title}</span>
        );
      },
    },
    { key: "title", label: "Title", render: (row) => <span className="fw-medium">{row.title}</span> },
    {
      key: "detail",
      label: "Detail",
      render: (row) => (
        <span className="text-truncate d-inline-block text-muted" style={{ maxWidth: 180 }}>
          {row.detail || "—"}
        </span>
      ),
    },
    { key: "price", label: "Price", render: (row) => <span>{row.price != null ? Number(row.price) : "—"}</span> },
    { key: "label", label: "Label", render: (row) => row.label ?? "—" },
    {
      key: "actions",
      label: "Action",
      render: (row) => (
        <div className="d-flex gap-1">
          <Link href={`/dashboard/menu-items/${row._id}/edit`} className="btn btn-primary btn-sm" title="Edit">
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
        <div className="font-caveat fs-4 fw-bold text-primary">Menu Items</div>
        <h2 className="fw-semibold mb-0 h3">Menu Items</h2>
        <div className="sub-title fs-16 text-muted">Manage menu items for listings.</div>
      </div>
      {error && (
        <div className="alert alert-danger py-2 mb-3" role="alert">
          {error}
        </div>
      )}
      <div className="card">
        <div className="card-header position-relative d-flex justify-content-between align-items-center flex-wrap">
          <div>
            <h6 className="fs-17 fw-semi-bold my-1">All Menu Items</h6>
            <p className="mb-0 text-muted">Add, edit, or delete menu items.</p>
          </div>
          <Link href="/dashboard/menu-items/add" className="btn btn-primary btn-sm">
            <i className="fa-solid fa-plus me-1" />
            Add Menu Item
          </Link>
        </div>
        <div className="card-body">
          <DataTable columns={columns} data={items} keyField="_id" loading={loading} emptyMessage="No menu items yet." />
        </div>
      </div>
    </div>
  );
}
