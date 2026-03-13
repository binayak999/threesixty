"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MediaGalleryManager, type MediaGalleryManagerRef } from "@/components/MediaGalleryManager";
import { getMediaUrl } from "@/lib/mediaUrl";
import "../../add-listing/add-listing.css";

export default function AddVideoPage() {
  const router = useRouter();
  const thumbnailRef = useRef<MediaGalleryManagerRef | null>(null);
  const [form, setForm] = useState<{
    title: string;
    youtubeLink: string;
    thumbnailId: string;
    thumbnailPreview?: { url: string; type: string };
  }>({ title: "", youtubeLink: "", thumbnailId: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!form.title.trim() || !form.youtubeLink.trim() || !form.thumbnailId) {
      setError("Title, YouTube link and thumbnail are required.");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/videos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title.trim(),
          youtubeLink: form.youtubeLink.trim(),
          thumbnail: form.thumbnailId,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.message || "Create failed");
      router.push("/dashboard/videos");
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
        <Link href="/dashboard/videos" className="text-primary mb-2 d-inline-block">
          ← Videos
        </Link>
        <h2 className="fw-semibold mb-0 h3">Add Video</h2>
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
                  <label className="form-label required">YouTube link</label>
                  <input
                    type="url"
                    className="form-control"
                    required
                    placeholder="https://www.youtube.com/watch?v=..."
                    value={form.youtubeLink}
                    onChange={(e) => setForm((f) => ({ ...f, youtubeLink: e.target.value }))}
                  />
                </div>
              </div>
              <div className="col-12">
                <div className="form-group-enhanced">
                  <label className="form-label required">Thumbnail image</label>
                  <div className="border rounded p-3">
                    <button
                      type="button"
                      className="btn btn-outline-primary btn-sm"
                      onClick={() => thumbnailRef.current?.open()}
                    >
                      <i className="fa-solid fa-image me-1" />
                      {form.thumbnailId ? "Change thumbnail" : "Choose from media"}
                    </button>
                    {form.thumbnailId && !form.thumbnailPreview && <span className="ms-2 small text-success">1 selected</span>}
                    {form.thumbnailPreview && (
                      <div className="mt-3 media-selection-preview">
                        {form.thumbnailPreview.type === "video" ? (
                          <video
                            src={getMediaUrl(form.thumbnailPreview.url)}
                            controls
                            muted
                            playsInline
                            className="rounded"
                            style={{ maxWidth: "100%", maxHeight: 160, objectFit: "contain" }}
                          />
                        ) : (
                          <img
                            src={getMediaUrl(form.thumbnailPreview.url)}
                            alt="Thumbnail preview"
                            className="rounded"
                            style={{ maxWidth: "100%", maxHeight: 160, objectFit: "contain" }}
                          />
                        )}
                      </div>
                    )}
                  </div>
                  <MediaGalleryManager
                    ref={thumbnailRef}
                    mode="popup"
                    title="Select thumbnail image"
                    allowTypes={["image", "360"]}
                    multiple={false}
                    selectedIds={form.thumbnailId ? [form.thumbnailId] : []}
                    onSelect={(items) => {
                      const item = items[0];
                      setForm((f) => ({
                        ...f,
                        thumbnailId: item?.id ?? "",
                        thumbnailPreview: item ? { url: item.url, type: item.type } : undefined,
                      }));
                    }}
                  />
                </div>
              </div>
            </div>
            <div className="mt-4 d-flex gap-2">
              <Link href="/dashboard/videos" className="btn btn-secondary">
                Cancel
              </Link>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? "Saving…" : "Add Video"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
