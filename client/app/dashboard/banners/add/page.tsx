"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MediaGalleryManager } from "@/components/MediaGalleryManager";
import { getMediaUrl } from "@/lib/mediaUrl";
import "../../add-listing/add-listing.css";

export default function AddBannerPage() {
  const router = useRouter();
  const mediaRef = useRef<{ open: () => void }>(null);
  const [form, setForm] = useState<{
    title: string;
    mediaId: string;
    mediaPreview?: { url: string; type: string };
    is360: boolean;
    bannerType: "homebanner" | "adsbanner";
    link: string;
  }>({ title: "", mediaId: "", is360: false, bannerType: "homebanner", link: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!form.title.trim() || !form.mediaId) {
      setError("Title and image are required.");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/banners", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title.trim(),
          media: form.mediaId,
          is360: form.is360,
          bannerType: form.bannerType,
          link: form.link.trim() || undefined,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.message || "Create failed");
      router.push("/dashboard/banners");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Request failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="py-4">
      <div className="section-header mb-4">
        <Link href="/dashboard/banners" className="text-primary mb-2 d-inline-block">
          ← Banners
        </Link>
        <h2 className="fw-semibold mb-0 h3">Add Banner</h2>
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
                  <label className="form-label required">Banner image</label>
                  <div className="border rounded p-3">
                    <button
                      type="button"
                      className="btn btn-outline-primary btn-sm"
                      onClick={() => mediaRef.current?.open()}
                    >
                      <i className="fa-solid fa-image me-1" />
                      {form.mediaId ? "Change image" : "Choose from media"}
                    </button>
                    {form.mediaId && !form.mediaPreview && <span className="ms-2 small text-success">1 selected</span>}
                    {form.mediaPreview && (
                      <div className="mt-3 media-selection-preview">
                        {form.mediaPreview.type === "video" ? (
                          <video
                            src={getMediaUrl(form.mediaPreview.url)}
                            controls
                            muted
                            playsInline
                            className="rounded"
                            style={{ maxWidth: "100%", maxHeight: 200 }}
                          />
                        ) : (
                          <img
                            src={getMediaUrl(form.mediaPreview.url)}
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
                    selectedIds={form.mediaId ? [form.mediaId] : []}
                    onSelect={(items) => {
                      const item = items[0];
                      setForm((f) => ({
                        ...f,
                        mediaId: item?.id ?? "",
                        mediaPreview: item ? { url: item.url, type: item.type } : undefined,
                      }));
                    }}
                  />
                </div>
              </div>
              <div className="col-12">
                <div className="form-group-enhanced">
                  <label className="form-label">Banner type</label>
                  <select
                    className="form-select"
                    value={form.bannerType}
                    onChange={(e) => setForm((f) => ({ ...f, bannerType: e.target.value as "homebanner" | "adsbanner" }))}
                  >
                    <option value="homebanner">Home banner (hero on home page)</option>
                    <option value="adsbanner">Ads banner</option>
                  </select>
                </div>
              </div>
              <div className="col-12">
                <div className="form-group-enhanced">
                  <label className="form-label">Link (optional)</label>
                  <input
                    type="url"
                    className="form-control"
                    placeholder="# or leave empty for no link"
                    value={form.link}
                    onChange={(e) => setForm((f) => ({ ...f, link: e.target.value }))}
                  />
                  <small className="text-muted">If set and not #, clicking the banner will redirect to this URL.</small>
                </div>
              </div>
              <div className="col-12">
                <div className="form-check">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    id="banner-is360"
                    checked={form.is360}
                    onChange={(e) => setForm((f) => ({ ...f, is360: e.target.checked }))}
                  />
                  <label className="form-check-label" htmlFor="banner-is360">
                    Use 360° image view (load as interactive 360° instead of normal image)
                  </label>
                </div>
              </div>
            </div>
            <div className="mt-4 d-flex gap-2">
              <Link href="/dashboard/banners" className="btn btn-secondary">
                Cancel
              </Link>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? "Saving…" : "Add Banner"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
