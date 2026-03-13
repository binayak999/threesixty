"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import DataTable, { DataTableColumn } from "../../components/DataTable";
import { apiClient } from "@/lib/apiClient";
import type { CategoryType, CategoryItem } from "./types";

export default function CategoriesListPage() {
  const params = useParams();
  const type = (params?.type as string)?.toLowerCase();
  const categoryType: CategoryType | null =
    type === "blog" || type === "listing" ? type : null;

  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(!!categoryType);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = async () => {
    if (!categoryType) return;
    try {
      const res = await apiClient.get<{ data?: CategoryItem[] }>(`/api/categories?type=${categoryType}`);
      if (res.data?.data) setCategories(res.data.data);
      else setCategories([]);
    } catch {
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (categoryType) {
      setLoading(true);
      fetchCategories();
    } else {
      setLoading(false);
    }
  }, [categoryType]);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this category?")) return;
    try {
      await apiClient.delete(`/api/categories/${id}`);
      await fetchCategories();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg || "Delete failed");
    }
  };

  if (!categoryType) {
    return (
      <div className="py-4">
        <div className="alert alert-warning">Invalid category type. Use blog or listing.</div>
        <Link href="/dashboard">Back to Dashboard</Link>
      </div>
    );
  }

  const title = "Categories";
  const columns: DataTableColumn<CategoryItem>[] = [
    { key: "sl", label: "SL.", render: (_, i) => String(i + 1) },
    { key: "name", label: "Name", render: (row) => <span className="fw-medium">{row.name}</span> },
    { key: "slug", label: "Slug", render: (row) => <code className="small">{row.slug}</code> },
    {
      key: "description",
      label: "Description",
      render: (row) => (
        <span className="text-muted text-truncate d-inline-block" style={{ maxWidth: 200 }}>
          {row.description || "—"}
        </span>
      ),
    },
    { key: "order", label: "Order", render: (row) => row.order ?? "—" },
    {
      key: "status",
      label: "Status",
      render: (row) => {
        const st = row.status ?? "published";
        return (
          <span className={`badge ${st === "published" ? "bg-success" : "bg-secondary"}`}>
            {st === "published" ? "Published" : "Draft"}
          </span>
        );
      },
    },
    {
      key: "actions",
      label: "Action",
      render: (row) => (
        <div className="d-flex gap-1">
          <Link
            href={`/dashboard/categories/${categoryType}/${row._id}/edit`}
            className="btn btn-primary btn-sm"
            title="Edit"
          >
            <i className="fa-solid fa-pencil" />
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
        <div className="font-caveat fs-4 fw-bold text-primary">Categories</div>
        <h2 className="fw-semibold mb-0 h3">{title}</h2>
        <div className="sub-title fs-16 text-muted">
          <Link href="/dashboard" className="text-primary">
            ← Dashboard
          </Link>
          {categoryType === "blog" ? (
            <> · <Link href="/dashboard/categories/listing">Listing categories</Link></>
          ) : (
            <> · <Link href="/dashboard/categories/blog">Blog categories</Link></>
          )}
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
              <h6 className="fs-17 fw-semi-bold my-1">{title}</h6>
              <p className="mb-0 text-muted">
                Manage categories for {categoryType === "blog" ? "blog posts" : "listings"}.
              </p>
            </div>
            <Link
              href={`/dashboard/categories/${categoryType}/add`}
              className="btn btn-primary fw-medium"
            >
              <i className="fa-solid fa-plus me-1" />
              Add Category
            </Link>
          </div>
        </div>
        <div className="card-body">
          <DataTable
            columns={columns}
            data={categories}
            keyField="_id"
            loading={loading}
            emptyMessage={`No ${categoryType} categories yet. Click Add Category to create one.`}
          />
        </div>
      </div>
    </div>
  );
}
