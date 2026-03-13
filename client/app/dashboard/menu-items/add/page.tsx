"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/apiClient";
import "../../add-listing/add-listing.css";

interface ListingOption {
  _id: string;
  title: string;
  slug: string;
}

export default function AddMenuItemPage() {
  const router = useRouter();
  const [listings, setListings] = useState<ListingOption[]>([]);
  const [form, setForm] = useState({ listing: "", title: "", detail: "", price: "", label: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiClient
      .get<{ data?: ListingOption[] }>("/api/listings?all=1")
      .then((res) => {
        if (res.data?.data && Array.isArray(res.data.data)) setListings(res.data.data);
      })
      .catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const price = form.price.trim() ? Number(form.price) : 0;
    if (!form.listing || !form.title.trim()) {
      setError("Listing and title are required.");
      return;
    }
    setSaving(true);
    try {
      await apiClient.post("/api/menu-items", {
        listing: form.listing,
        title: form.title.trim(),
        detail: form.detail.trim() || undefined,
        price,
        label: form.label.trim() || undefined,
      });
      router.push("/dashboard/menu-items");
      router.refresh();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg || "Request failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="py-4">
      <div className="section-header mb-4">
        <Link href="/dashboard/menu-items" className="text-primary mb-2 d-inline-block">
          ← Menu Items
        </Link>
        <h2 className="fw-semibold mb-0 h3">Add Menu Item</h2>
      </div>
      <div className="card add-listing-form">
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            {error && (
              <div className="alert alert-danger py-2" role="alert">
                {error}
              </div>
            )}
            <div className="row g-4">
              <div className="col-md-6">
                <div className="form-group-enhanced">
                  <label className="form-label required">Listing</label>
                  <select
                    className="form-select"
                    required
                    value={form.listing}
                    onChange={(e) => setForm((f) => ({ ...f, listing: e.target.value }))}
                  >
                    <option value="">Select listing</option>
                    {listings.map((l) => (
                      <option key={l._id} value={l._id}>
                        {l.title || l.slug}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="col-md-6">
                <div className="form-group-enhanced">
                  <label className="form-label required">Title</label>
                  <input
                    type="text"
                    className="form-control"
                    required
                    value={form.title}
                    onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  />
                </div>
              </div>
              <div className="col-12">
                <div className="form-group-enhanced">
                  <label className="form-label">Detail</label>
                  <textarea className="form-control" rows={2} value={form.detail} onChange={(e) => setForm((f) => ({ ...f, detail: e.target.value }))} />
                </div>
              </div>
              <div className="col-md-6">
                <div className="form-group-enhanced">
                  <label className="form-label required">Price</label>
                  <input
                    type="number"
                    step="0.01"
                    className="form-control"
                    value={form.price}
                    onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                  />
                </div>
              </div>
              <div className="col-md-6">
                <div className="form-group-enhanced">
                  <label className="form-label">Label</label>
                  <input type="text" className="form-control" value={form.label} onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))} placeholder="e.g. Best seller" />
                </div>
              </div>
            </div>
            <div className="mt-4 d-flex gap-2">
              <Link href="/dashboard/menu-items" className="btn btn-secondary">
                Cancel
              </Link>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? "Saving…" : "Add Menu Item"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
