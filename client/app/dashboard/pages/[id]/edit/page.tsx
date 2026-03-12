"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { MediaGalleryManager } from "@/components/MediaGalleryManager";
import { getMediaUrl } from "@/lib/mediaUrl";
import "../../../add-listing/add-listing.css";

const initialSeo = {
  metaTitle: "",
  metaDescription: "",
  metaKeywords: "",
  ogImage: "",
  noIndex: false,
};

export default function EditPagePage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const mediaRef = useRef<{ open: () => void }>(null);
  const [form, setForm] = useState<{
    title: string;
    slug: string;
    bannerId: string;
    bannerPreview?: { url: string; type: string };
    seo: typeof initialSeo;
  }>({ title: "", slug: "", bannerId: "", seo: initialSeo });
  const [loading, setLoading] = useState(!!id);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/pages/${id}`)
      .then((res) => res.json())
      .then((json) => {
        if (json?.data) {
          const d = json.data;
          const banner = typeof d.banner === "object" && d.banner ? d.banner : null;
          const bannerId = banner ? (banner as { _id: string })._id : (d.banner as string) ?? "";
          const bannerUrl = banner ? (banner as { url?: string }).url : undefined;
          const bannerType = banner ? (banner as { type?: string }).type ?? "image" : "image";
          const seo = d.seo && typeof d.seo === "object" ? d.seo : {};
          setForm({
            title: d.title ?? "",
            slug: d.slug ?? "",
            bannerId,
            bannerPreview: bannerUrl ? { url: bannerUrl, type: bannerType } : undefined,
            seo: {
              metaTitle: seo.metaTitle ?? "",
              metaDescription: seo.metaDescription ?? "",
              metaKeywords: Array.isArray(seo.metaKeywords) ? seo.metaKeywords.join(", ") : "",
              ogImage: seo.ogImage ?? "",
              noIndex: !!seo.noIndex,
            },
          });
        }
      })
      .catch(() => setError("Failed to load"))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!form.title.trim() || !form.slug.trim()) {
      setError("Title and slug are required.");
      return;
    }
    const slugNorm = form.slug.trim().toLowerCase().replace(/\s+/g, "-");
    setSaving(true);
    try {
      const seoPayload =
        form.seo.metaTitle ||
        form.seo.metaDescription ||
        form.seo.metaKeywords ||
        form.seo.ogImage ||
        form.seo.noIndex
          ? {
              metaTitle: form.seo.metaTitle.trim() || undefined,
              metaDescription: form.seo.metaDescription.trim() || undefined,
              metaKeywords: form.seo.metaKeywords
                ? form.seo.metaKeywords
                    .split(",")
                    .map((k) => k.trim())
                    .filter(Boolean)
                : undefined,
              ogImage: form.seo.ogImage.trim() || undefined,
              noIndex: form.seo.noIndex || undefined,
            }
          : undefined;
      const res = await fetch(`/api/pages/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title.trim(),
          slug: slugNorm,
          banner: form.bannerId || null,
          seo: seoPayload,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.message || "Update failed");
      router.push("/dashboard/pages");
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
        <Link href="/dashboard/pages" className="text-primary mb-2 d-inline-block">
          ← Pages
        </Link>
        <h2 className="fw-semibold mb-0 h3">Edit Page</h2>
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
              <div className="col-12">
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
                  <label className="form-label required">Slug</label>
                  <input
                    type="text"
                    className="form-control"
                    required
                    placeholder="e.g. about-us"
                    value={form.slug}
                    onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
                  />
                  <small className="text-muted">URL-friendly: lowercase, hyphens. Will be normalized on save.</small>
                </div>
              </div>
              <div className="col-12">
                <div className="form-group-enhanced">
                  <label className="form-label">Banner image (optional)</label>
                  <div className="border rounded p-3">
                    <button
                      type="button"
                      className="btn btn-outline-primary btn-sm"
                      onClick={() => mediaRef.current?.open()}
                    >
                      <i className="fa-solid fa-image me-1" />
                      {form.bannerId ? "Change image" : "Choose from media"}
                    </button>
                    {form.bannerId && !form.bannerPreview && <span className="ms-2 small text-success">1 selected</span>}
                    {form.bannerPreview && (
                      <div className="mt-3 media-selection-preview">
                        {form.bannerPreview.type === "video" ? (
                          <video
                            src={getMediaUrl(form.bannerPreview.url)}
                            controls
                            muted
                            playsInline
                            className="rounded"
                            style={{ maxWidth: "100%", maxHeight: 200 }}
                          />
                        ) : (
                          <img
                            src={getMediaUrl(form.bannerPreview.url)}
                            alt="Banner preview"
                            className="rounded"
                            style={{ maxWidth: "100%", maxHeight: 200, objectFit: "contain" }}
                          />
                        )}
                      </div>
                    )}
                  </div>
                  <MediaGalleryManager
                    ref={mediaRef}
                    mode="popup"
                    title="Select banner image"
                    allowTypes={["image", "360"]}
                    multiple={false}
                    selectedIds={form.bannerId ? [form.bannerId] : []}
                    onSelect={(items) => {
                      const item = items[0];
                      setForm((f) => ({
                        ...f,
                        bannerId: item?.id ?? "",
                        bannerPreview: item ? { url: item.url, type: item.type } : undefined,
                      }));
                    }}
                  />
                </div>
              </div>
              <div className="col-12">
                <div className="card">
                  <div className="card-header">
                    <h6 className="fs-17 fw-semi-bold mb-0">
                      <i className="fas fa-magnifying-glass me-2 text-primary" />
                      SEO (optional)
                    </h6>
                    <p className="text-muted mb-0 mt-2 small">Meta title, description and social sharing.</p>
                  </div>
                  <div className="card-body">
                    <div className="row g-4">
                      <div className="col-12">
                        <label className="form-label">Meta title</label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="e.g. About Us | Site Name"
                          value={form.seo.metaTitle}
                          onChange={(e) => setForm((f) => ({ ...f, seo: { ...f.seo, metaTitle: e.target.value } }))}
                        />
                      </div>
                      <div className="col-12">
                        <label className="form-label">Meta description</label>
                        <textarea
                          className="form-control"
                          rows={2}
                          placeholder="Short description for search results"
                          value={form.seo.metaDescription}
                          onChange={(e) => setForm((f) => ({ ...f, seo: { ...f.seo, metaDescription: e.target.value } }))}
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Meta keywords (comma-separated)</label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="keyword1, keyword2"
                          value={form.seo.metaKeywords}
                          onChange={(e) => setForm((f) => ({ ...f, seo: { ...f.seo, metaKeywords: e.target.value } }))}
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">OG image URL</label>
                        <input
                          type="url"
                          className="form-control"
                          placeholder="https://... for social sharing"
                          value={form.seo.ogImage}
                          onChange={(e) => setForm((f) => ({ ...f, seo: { ...f.seo, ogImage: e.target.value } }))}
                        />
                      </div>
                      <div className="col-12">
                        <div className="form-check">
                          <input
                            type="checkbox"
                            className="form-check-input"
                            id="page-seo-noindex-edit"
                            checked={form.seo.noIndex}
                            onChange={(e) => setForm((f) => ({ ...f, seo: { ...f.seo, noIndex: e.target.checked } }))}
                          />
                          <label className="form-check-label" htmlFor="page-seo-noindex-edit">
                            No index (ask search engines not to index this page)
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-4 d-flex gap-2">
              <Link href="/dashboard/pages" className="btn btn-secondary">
                Cancel
              </Link>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? "Saving…" : "Update Page"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
