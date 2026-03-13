"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/apiClient";
import "../../add-listing/add-listing.css";

const slugify = (s: string) =>
  s
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-");

export default function AddAmenityPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", icon: "fa-check", slug: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      await apiClient.post("/api/amenities", {
        name: form.name.trim(),
        icon: form.icon.trim() || "fa-check",
        slug: form.slug.trim() || slugify(form.name),
      });
      router.push("/dashboard/amenities");
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
        <Link href="/dashboard/amenities" className="text-primary mb-2 d-inline-block">
          ← Amenities
        </Link>
        <h2 className="fw-semibold mb-0 h3">Add Amenity</h2>
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
              <div className="col-md-4">
                <div className="form-group-enhanced">
                  <label className="form-label required">Name</label>
                  <input
                    type="text"
                    className="form-control"
                    required
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value, slug: f.slug || slugify(e.target.value) }))}
                  />
                </div>
              </div>
              <div className="col-md-4">
                <div className="form-group-enhanced">
                  <label className="form-label">Slug</label>
                  <input
                    type="text"
                    className="form-control"
                    value={form.slug}
                    onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
                    placeholder="auto from name"
                  />
                </div>
              </div>
              <div className="col-md-4">
                <div className="form-group-enhanced">
                  <label className="form-label">Icon (Font Awesome class)</label>
                  <input
                    type="text"
                    className="form-control"
                    value={form.icon}
                    onChange={(e) => setForm((f) => ({ ...f, icon: e.target.value }))}
                    placeholder="fa-check"
                  />
                </div>
              </div>
            </div>
            <div className="mt-4 d-flex gap-2">
              <Link href="/dashboard/amenities" className="btn btn-secondary">
                Cancel
              </Link>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? "Saving…" : "Add Amenity"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
