"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { MediaGalleryManager, type MediaGalleryManagerRef } from "@/components/MediaGalleryManager";
import { getMediaUrl } from "@/lib/mediaUrl";
import { apiClient } from "@/lib/apiClient";
import "../../../add-listing/add-listing.css";

export default function EditVideoPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const thumbnailRef = useRef<MediaGalleryManagerRef | null>(null);
  const [form, setForm] = useState<{
    title: string;
    youtubeLink: string;
    thumbnailId: string;
    status: "pending" | "published";
    thumbnailPreview?: { url: string; type: string };
  }>({ title: "", youtubeLink: "", thumbnailId: "", status: "published" });
  const [loading, setLoading] = useState(!!id);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    apiClient
      .get<{ data?: { title?: string; youtubeLink?: string; thumbnail?: { _id: string; url?: string; type?: string } | string; status?: string } }>(`/api/videos/${id}`)
      .then((res) => {
        const json = res.data;
        if (json?.data) {
          const d = json.data;
          const thumb = typeof d.thumbnail === "object" && d.thumbnail ? d.thumbnail : null;
          const thumbId = thumb ? (thumb as { _id: string })._id : (d.thumbnail as string) ?? "";
          const thumbUrl = thumb ? (thumb as { url?: string }).url : undefined;
          const thumbType = thumb ? (thumb as { type?: string }).type ?? "image" : "image";
          setForm({
            title: d.title ?? "",
            youtubeLink: d.youtubeLink ?? "",
            thumbnailId: thumbId,
            status: (d as { status?: string }).status === "pending" ? "pending" : "published",
            thumbnailPreview: thumbUrl ? { url: thumbUrl, type: thumbType } : undefined,
          });
        }
      })
      .catch(() => setError("Failed to load"))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!form.title.trim() || !form.youtubeLink.trim()) {
      setError("Title and YouTube link are required.");
      return;
    }
    setSaving(true);
    try {
      await apiClient.put(`/api/videos/${id}`, {
        title: form.title.trim(),
        youtubeLink: form.youtubeLink.trim(),
        thumbnail: form.thumbnailId || undefined,
        status: form.status,
      });
      router.push("/dashboard/videos");
      router.refresh();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg || "Request failed");
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
        <Link href="/dashboard/videos" className="text-primary mb-2 d-inline-block">
          ← Videos
        </Link>
        <h2 className="fw-semibold mb-0 h3">Edit Video</h2>
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
                  <label className="form-label">Status</label>
                  <select
                    className="form-select"
                    value={form.status}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, status: e.target.value === "pending" ? "pending" : "published" }))
                    }
                  >
                    <option value="pending">Pending approval</option>
                    <option value="published">Published</option>
                  </select>
                  <p className="form-text text-muted small mb-0">Set to Published to make the video visible to everyone.</p>
                </div>
              </div>
              <div className="col-12">
                <div className="form-group-enhanced">
                  <label className="form-label">Thumbnail image (optional)</label>
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
                {saving ? "Saving…" : "Update Video"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
