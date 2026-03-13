"use client";

import { useState, useEffect } from "react";
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

export default function AddLocationPage() {
  const router = useRouter();
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
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiClient
      .get<{ data?: CountryOption[] }>("/api/countries")
      .then((res) => {
        if (res.data?.data && Array.isArray(res.data.data)) setCountries(res.data.data);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!form.countryRef) {
      setRegions([]);
      return;
    }
    apiClient
      .get<{ data?: RegionOption[] }>(`/api/locations?countryRef=${encodeURIComponent(form.countryRef)}&limit=500`)
      .then((res) => {
        if (res.data?.data && Array.isArray(res.data.data)) setRegions(res.data.data);
        else setRegions([]);
      })
      .catch(() => setRegions([]));
  }, [form.countryRef]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      await apiClient.post("/api/locations", {
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
      });
      router.push("/dashboard/locations");
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
        <Link href="/dashboard/locations" className="text-primary mb-2 d-inline-block">
          ← Locations
        </Link>
        <h2 className="fw-semibold mb-0 h3">Add Location</h2>
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
                  <input
                    type="text"
                    className="form-control"
                    required
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value, slug: f.slug || slugify(e.target.value) }))}
                  />
                </div>
              </div>
              <div className="col-md-6">
                <div className="form-group-enhanced">
                  <label className="form-label">Slug</label>
                  <input
                    type="text"
                    className="form-control"
                    value={form.slug}
                    onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
                  />
                </div>
              </div>
              <div className="col-12">
                <div className="form-group-enhanced">
                  <label className="form-label">Address</label>
                  <input
                    type="text"
                    className="form-control"
                    value={form.address}
                    onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
                  />
                </div>
              </div>
              <div className="col-md-4">
                <div className="form-group-enhanced">
                  <label className="form-label">City</label>
                  <input type="text" className="form-control" value={form.city} onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))} />
                </div>
              </div>
              <div className="col-md-4">
                <div className="form-group-enhanced">
                  <label className="form-label">Country</label>
                  <select
                    className="form-select"
                    value={form.countryRef}
                    onChange={(e) => {
                      const id = e.target.value;
                      const c = countries.find((x) => x._id === id);
                      setForm((f) => ({ ...f, countryRef: id, country: c?.name ?? "", regionRef: "", region: "" }));
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
              <div className="col-md-4">
                <div className="form-group-enhanced">
                  <label className="form-label">State / Province / Region</label>
                  <select
                    className="form-select"
                    value={form.regionRef}
                    onChange={(e) => {
                      const id = e.target.value;
                      const r = regions.find((x) => x._id === id);
                      if (r) {
                        setForm((f) => ({
                          ...f,
                          regionRef: id,
                          region: r.region ?? r.name,
                          name: f.name || r.name,
                          slug: f.slug || slugify(r.name),
                        }));
                      } else {
                        setForm((f) => ({ ...f, regionRef: "", region: f.region }));
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
                  <div className="form-text">Optional: pick from seeded regions or enter custom below</div>
                </div>
              </div>
              <div className="col-md-4">
                <div className="form-group-enhanced">
                  <label className="form-label">Region (custom)</label>
                  <input type="text" className="form-control" value={form.region} onChange={(e) => setForm((f) => ({ ...f, region: e.target.value }))} placeholder="If not selected above" />
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
                {saving ? "Saving…" : "Add Location"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
