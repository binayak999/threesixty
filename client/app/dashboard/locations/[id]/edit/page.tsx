"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import "../../../add-listing/add-listing.css";

const slugify = (s: string) =>
  s
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-");

interface CountryOption {
  _id: string;
  code: string;
  name: string;
  slug: string;
}

interface RegionOption {
  _id: string;
  name: string;
  slug: string;
  region?: string;
}

export default function EditLocationPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const [countries, setCountries] = useState<CountryOption[]>([]);
  const [regions, setRegions] = useState<RegionOption[]>([]);
  const [form, setForm] = useState({
    name: "",
    slug: "",
    address: "",
    city: "",
    region: "",
    countryRef: "",
    country: "",
    regionRef: "",
    latitude: "",
    longitude: "",
    description: "",
    isActive: true,
  });
  const [loading, setLoading] = useState(!!id);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/countries")
      .then((res) => res.json())
      .then((json) => {
        if (json?.data && Array.isArray(json.data)) setCountries(json.data);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!form.countryRef) {
      setRegions([]);
      return;
    }
    fetch(`/api/locations?countryRef=${encodeURIComponent(form.countryRef)}&limit=500`)
      .then((res) => res.json())
      .then((json) => {
        if (json?.data && Array.isArray(json.data)) setRegions(json.data);
        else setRegions([]);
      })
      .catch(() => setRegions([]));
  }, [form.countryRef]);

  useEffect(() => {
    if (!id || regions.length === 0) return;
    const match = regions.find((r) => r._id === id);
    if (match) {
      setForm((f) => ({ ...f, regionRef: match._id }));
    }
  }, [id, regions]);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/locations/${id}`)
      .then((res) => res.json())
      .then((json) => {
        if (json?.data) {
          const d = json.data;
          const countryId = typeof d.countryRef === "object" && d.countryRef?._id ? d.countryRef._id : d.countryRef ?? "";
          setForm({
            name: d.name ?? "",
            slug: d.slug ?? "",
            address: d.address ?? "",
            city: d.city ?? "",
            region: d.region ?? "",
            countryRef: countryId,
            country: d.country ?? "",
            regionRef: "",
            latitude: d.latitude != null ? String(d.latitude) : "",
            longitude: d.longitude != null ? String(d.longitude) : "",
            description: d.description ?? "",
            isActive: d.isActive !== false,
          });
        }
      })
      .catch(() => setError("Failed to load"))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      const res = await fetch(`/api/locations/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          slug: form.slug.trim() || slugify(form.name),
          address: form.address.trim() || undefined,
          city: form.city.trim() || undefined,
          region: form.region.trim() || undefined,
          countryRef: form.countryRef || undefined,
          country: form.country.trim() || undefined,
          latitude: form.latitude ? Number(form.latitude) : undefined,
          longitude: form.longitude ? Number(form.longitude) : undefined,
          description: form.description.trim() || undefined,
          isActive: form.isActive,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.message || "Update failed");
      router.push("/dashboard/locations");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Request failed");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-4 text-center">
        <div className="spinner-border text-primary" />
        <p className="mt-2 text-muted">Loading…</p>
      </div>
    );
  }

  return (
    <div className="py-4">
      <div className="section-header mb-4">
        <Link href="/dashboard/locations" className="text-primary mb-2 d-inline-block">
          ← Locations
        </Link>
        <h2 className="fw-semibold mb-0 h3">Edit Location</h2>
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
                  <label className="form-label required">Name</label>
                  <input type="text" className="form-control" required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
                </div>
              </div>
              <div className="col-md-6">
                <div className="form-group-enhanced">
                  <label className="form-label">Slug</label>
                  <input type="text" className="form-control" value={form.slug} onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))} />
                </div>
              </div>
              <div className="col-12">
                <div className="form-group-enhanced">
                  <label className="form-label">Address</label>
                  <input type="text" className="form-control" value={form.address} onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))} />
                </div>
              </div>
              <div className="col-md-3">
                <div className="form-group-enhanced">
                  <label className="form-label">Country</label>
                  <select
                    className="form-select"
                    value={form.countryRef}
                    onChange={(e) => {
                      const countryId = e.target.value;
                      const c = countries.find((x) => x._id === countryId);
                      setForm((f) => ({ ...f, countryRef: countryId, country: c?.name ?? "", regionRef: "", region: f.region }));
                    }}
                  >
                    <option value="">Select country</option>
                    {countries.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="col-md-3">
                <div className="form-group-enhanced">
                  <label className="form-label">State / Province / Region</label>
                  <select
                    className="form-select"
                    value={form.regionRef}
                    onChange={(e) => {
                      const rid = e.target.value;
                      const r = regions.find((x) => x._id === rid);
                      if (r) {
                        setForm((f) => ({
                          ...f,
                          regionRef: rid,
                          region: r.region ?? r.name,
                          name: f.name || r.name,
                          slug: f.slug || slugify(r.name),
                        }));
                      } else {
                        setForm((f) => ({ ...f, regionRef: "" }));
                      }
                    }}
                  >
                    <option value="">— Select or leave blank —</option>
                    {regions.map((r) => (
                      <option key={r._id} value={r._id}>
                        {r.name}
                      </option>
                    ))}
                  </select>
                  <div className="form-text">Optional: pick seeded or use custom</div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="form-group-enhanced">
                  <label className="form-label">Region (custom)</label>
                  <input type="text" className="form-control" value={form.region} onChange={(e) => setForm((f) => ({ ...f, region: e.target.value }))} placeholder="If not selected above" />
                </div>
              </div>
              <div className="col-md-3">
                <div className="form-group-enhanced">
                  <label className="form-label">City</label>
                  <input type="text" className="form-control" value={form.city} onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))} />
                </div>
              </div>
              <div className="col-md-6">
                <div className="form-group-enhanced">
                  <label className="form-label">Latitude</label>
                  <input type="text" className="form-control" value={form.latitude} onChange={(e) => setForm((f) => ({ ...f, latitude: e.target.value }))} />
                </div>
              </div>
              <div className="col-md-6">
                <div className="form-group-enhanced">
                  <label className="form-label">Longitude</label>
                  <input type="text" className="form-control" value={form.longitude} onChange={(e) => setForm((f) => ({ ...f, longitude: e.target.value }))} />
                </div>
              </div>
              <div className="col-12">
                <div className="form-group-enhanced">
                  <label className="form-label">Description</label>
                  <textarea className="form-control" rows={2} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
                </div>
              </div>
              <div className="col-12">
                <div className="form-check">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    id="loc-active"
                    checked={form.isActive}
                    onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
                  />
                  <label className="form-check-label" htmlFor="loc-active">
                    Active
                  </label>
                </div>
              </div>
            </div>
            <div className="mt-4 d-flex gap-2">
              <Link href="/dashboard/locations" className="btn btn-secondary">
                Cancel
              </Link>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? "Saving…" : "Update Location"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
