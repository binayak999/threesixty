"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { apiClient } from "@/lib/apiClient";
import type { CategoryType } from "./types";
import { slugify } from "./types";
import "../../add-listing/add-listing.css";

const SLUG_DEBOUNCE_MS = 400;

type CategoryFormProps = {
  mode: "create" | "edit";
  categoryType: CategoryType;
  categoryId?: string;
  onSuccess: () => void;
};

export default function CategoryForm({
  mode,
  categoryType,
  categoryId,
  onSuccess,
}: CategoryFormProps) {
  const [form, setForm] = useState({
    name: "",
    slug: "",
    description: "",
    icon: "",
    order: "",
    status: "published" as "draft" | "published",
    parent: "",
    seo: {
      metaTitle: "",
      metaDescription: "",
      metaKeywords: "",
      ogImage: "",
      noIndex: false,
    },
  });
  const [parentOptions, setParentOptions] = useState<{ _id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(mode === "edit" && !!categoryId);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const slugManuallyEdited = useRef(false);

  useEffect(() => {
    if (!slugManuallyEdited.current && form.name.trim()) {
      const id = setTimeout(() => {
        setForm((f) => ({ ...f, slug: slugify(f.name) }));
      }, SLUG_DEBOUNCE_MS);
      return () => clearTimeout(id);
    }
  }, [form.name]);

  // Fetch categories of same type for parent dropdown
  useEffect(() => {
    if (!categoryType) return;
    apiClient
      .get<{ data?: { _id: string; name: string }[] }>(`/api/categories?type=${categoryType}`)
      .then((res) => {
        if (res.data?.data && Array.isArray(res.data.data)) {
          setParentOptions(res.data.data.map((c) => ({ _id: c._id, name: c.name })));
        }
      })
      .catch(() => {});
  }, [categoryType]);

  useEffect(() => {
    if (mode === "edit" && categoryId) {
      setLoading(true);
      apiClient
        .get<{ data?: Record<string, unknown> }>(`/api/categories/${categoryId}`)
        .then((res) => {
          const json = res.data;
          if (json?.data) {
            const c = json.data as Record<string, unknown> & { name: string; slug: string; description?: string; order?: number; parent?: { _id: string } | string };
            const parentId = c.parent?._id ?? c.parent ?? "";
            const seo = (c as { seo?: { metaTitle?: string; metaDescription?: string; metaKeywords?: string[]; ogImage?: string; noIndex?: boolean } }).seo;
            setForm({
              name: c.name,
              slug: c.slug,
              description: c.description || "",
              icon: (c as { icon?: string }).icon || "",
              order: c.order != null ? String(c.order) : "",
              status: (c as { status?: string }).status === "draft" ? "draft" : "published",
              parent: typeof parentId === "string" ? parentId : String(parentId),
              seo: {
                metaTitle: seo?.metaTitle ?? "",
                metaDescription: seo?.metaDescription ?? "",
                metaKeywords: Array.isArray(seo?.metaKeywords) ? seo.metaKeywords.join(", ") : "",
                ogImage: seo?.ogImage ?? "",
                noIndex: seo?.noIndex ?? false,
              },
            });
            slugManuallyEdited.current = true;
          }
        })
        .catch(() => setError("Failed to load category"))
        .finally(() => setLoading(false));
    }
  }, [mode, categoryId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        slug: form.slug.trim() || slugify(form.name),
        description: form.description.trim() || undefined,
        icon: form.icon.trim()
          ? form.icon.trim().startsWith("fa-")
            ? form.icon.trim()
            : `fa-${form.icon.trim()}`
          : undefined,
        order: form.order !== "" ? Number(form.order) : undefined,
        status: form.status,
        parent: form.parent.trim() || null,
        seo:
          form.seo.metaTitle || form.seo.metaDescription || form.seo.metaKeywords || form.seo.ogImage || form.seo.noIndex
            ? {
                metaTitle: form.seo.metaTitle.trim() || undefined,
                metaDescription: form.seo.metaDescription.trim() || undefined,
                metaKeywords: form.seo.metaKeywords
                  ? form.seo.metaKeywords.split(",").map((k) => k.trim()).filter(Boolean)
                  : undefined,
                ogImage: form.seo.ogImage.trim() || undefined,
                noIndex: form.seo.noIndex || undefined,
              }
            : undefined,
      };
      if (mode === "edit" && categoryId) {
        await apiClient.put(`/api/categories/${categoryId}`, payload);
      } else {
        await apiClient.post("/api/categories", { ...payload, type: categoryType });
      }
      onSuccess();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg || "Request failed");
    } finally {
      setSaving(false);
    }
  };

  const listHref = `/dashboard/categories/${categoryType}`;

  if (loading) {
    return (
      <div className="card">
        <div className="card-body text-center py-5">
          <div className="spinner-border text-primary" role="status" />
          <p className="mt-2 mb-0 text-muted">Loading…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card add-listing-form">
      <div className="card-header position-relative d-flex justify-content-between align-items-center">
        <h6 className="fs-17 fw-semi-bold mb-0">
          {mode === "edit" ? "Edit Category" : "Add Category"}
        </h6>
        <Link href={listHref} className="btn btn-outline-secondary btn-sm">
          <i className="fa-solid fa-arrow-left me-1" />
          Back to list
        </Link>
      </div>
      <div className="card-body">
        <form onSubmit={handleSubmit}>
          {error && (
            <div className="alert alert-danger py-2" role="alert">
              {error}
            </div>
          )}
          <div className="row g-4">
            <div className="col-md-4">
              <div className="form-group-enhanced">
                <label className="form-label required">Name</label>
                <input
                  type="text"
                  className="form-control"
                  required
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                />
              </div>
            </div>
            <div className="col-md-4">
              <div className="form-group-enhanced">
                <label className="form-label">Slug</label>
                <div className="input-group">
                  <input
                    type="text"
                    className="form-control"
                    value={form.slug}
                    onChange={(e) => {
                      slugManuallyEdited.current = true;
                      setForm((f) => ({ ...f, slug: e.target.value }));
                    }}
                  />
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => {
                      slugManuallyEdited.current = false;
                      setForm((f) => ({ ...f, slug: form.name ? slugify(form.name) : f.slug }));
                    }}
                    title="Regenerate slug from name"
                    aria-label="Regenerate slug"
                  >
                    <i className="fa-solid fa-arrows-rotate" />
                  </button>
                </div>
                <div className="form-text">Auto-generated from name if blank, or click refresh to regenerate</div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="form-group-enhanced">
                <label className="form-label">Parent category</label>
                <select
                  className="form-select"
                  value={form.parent}
                  onChange={(e) => setForm((f) => ({ ...f, parent: e.target.value }))}
                >
                  <option value="">None (top-level)</option>
                  {parentOptions
                    .filter((opt) => opt._id !== categoryId)
                    .map((opt) => (
                      <option key={opt._id} value={opt._id}>
                        {opt.name}
                      </option>
                    ))}
                </select>
                <div className="form-text">Optional. Choose a parent to make this a subcategory.</div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="form-group-enhanced">
                <label className="form-label">Order</label>
                <input
                  type="number"
                  className="form-control"
                  min={0}
                  value={form.order}
                  onChange={(e) => setForm((f) => ({ ...f, order: e.target.value }))}
                  placeholder="0"
                />
              </div>
            </div>
            <div className="col-md-4">
              <div className="form-group-enhanced">
                <label className="form-label">Status</label>
                <select
                  className="form-select"
                  value={form.status}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, status: e.target.value === "draft" ? "draft" : "published" }))
                  }
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </div>
            </div>
            <div className="col-12">
              <div className="form-group-enhanced">
                <label className="form-label">Icon (Font Awesome)</label>
                <div className="d-flex flex-wrap align-items-center gap-2">
                  <div className="input-group flex-grow-1" style={{ maxWidth: 220 }}>
                    <span className="input-group-text bg-light">
                      {form.icon ? (
                        <i className={`fa-solid ${form.icon.startsWith("fa-") ? form.icon : `fa-${form.icon}`}`} style={{ fontSize: "1.1rem" }} />
                      ) : (
                        <span className="text-muted">—</span>
                      )}
                    </span>
                    <input
                      type="text"
                      className="form-control"
                      value={form.icon}
                      onChange={(e) => setForm((f) => ({ ...f, icon: e.target.value }))}
                      placeholder="e.g. fa-house, fa-utensils"
                    />
                  </div>
                  <span className="text-muted small">Quick:</span>
                  {["fa-house", "fa-utensils", "fa-mountain-sun", "fa-hotel", "fa-store", "fa-car", "fa-plane", "fa-tree", "fa-heart"].map((ico) => (
                    <button
                      key={ico}
                      type="button"
                      className={`btn btn-sm ${form.icon === ico ? "btn-primary" : "btn-outline-secondary"}`}
                      onClick={() => setForm((f) => ({ ...f, icon: f.icon === ico ? "" : ico }))}
                      title={ico}
                    >
                      <i className={`fa-solid ${ico}`} />
                    </button>
                  ))}
                </div>
                <div className="form-text">Optional. Use a Font Awesome icon class (e.g. fa-house). Leave blank for no icon.</div>
              </div>
            </div>
            <div className="col-12">
              <div className="form-group-enhanced">
                <label className="form-label">Description</label>
                <textarea
                  className="form-control"
                  rows={2}
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  placeholder="Optional"
                />
              </div>
            </div>
            <div className="col-12">
              <div className="border-top pt-4 mt-2">
                <h6 className="fs-17 fw-semi-bold mb-3">
                  <i className="fa-solid fa-magnifying-glass me-2 text-primary" />
                  SEO
                </h6>
                <p className="text-muted mb-3">Meta title, description and social sharing (optional)</p>
                <div className="row g-4">
                  <div className="col-12">
                    <div className="form-group-enhanced">
                      <label className="form-label fw-medium mb-2">Meta title</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. Category Name | Site Name"
                        value={form.seo.metaTitle}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, seo: { ...f.seo, metaTitle: e.target.value } }))
                        }
                      />
                    </div>
                  </div>
                  <div className="col-12">
                    <div className="form-group-enhanced">
                      <label className="form-label fw-medium mb-2">Meta description</label>
                      <textarea
                        className="form-control"
                        rows={2}
                        placeholder="Short description for search results"
                        value={form.seo.metaDescription}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, seo: { ...f.seo, metaDescription: e.target.value } }))
                        }
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-group-enhanced">
                      <label className="form-label fw-medium mb-2">Meta keywords (comma-separated)</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="keyword1, keyword2"
                        value={form.seo.metaKeywords}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, seo: { ...f.seo, metaKeywords: e.target.value } }))
                        }
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-group-enhanced">
                      <label className="form-label fw-medium mb-2">OG image URL</label>
                      <input
                        type="url"
                        className="form-control"
                        placeholder="https://... for social sharing"
                        value={form.seo.ogImage}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, seo: { ...f.seo, ogImage: e.target.value } }))
                        }
                      />
                      <div className="form-text">Image used when sharing on social networks</div>
                    </div>
                  </div>
                  <div className="col-12">
                    <div className="form-check">
                      <input
                        type="checkbox"
                        className="form-check-input"
                        id="category-seo-noindex"
                        checked={form.seo.noIndex}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, seo: { ...f.seo, noIndex: e.target.checked } }))
                        }
                      />
                      <label className="form-check-label" htmlFor="category-seo-noindex">
                        No index (ask search engines not to index this)
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="text-end mt-3">
            <Link href={listHref} className="btn btn-secondary me-2">
              Cancel
            </Link>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? "Saving…" : mode === "edit" ? "Update" : "Add Category"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
