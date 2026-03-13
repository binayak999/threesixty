"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { MediaGalleryManager, type MediaGalleryManagerRef } from "@/components/MediaGalleryManager";
import { getMediaUrl } from "@/lib/mediaUrl";
import { apiClient } from "@/lib/apiClient";
import "@/app/dashboard/add-listing/add-listing.css";

export default function AddVideoPublicPage() {
  const router = useRouter();
  const thumbnailRef = useRef<MediaGalleryManagerRef | null>(null);
  const [checking, setChecking] = useState(true);
  const [allowed, setAllowed] = useState(false);
  const [form, setForm] = useState<{
    title: string;
    youtubeLink: string;
    thumbnailId: string;
    thumbnailPreview?: { url: string; type: string };
  }>({ title: "", youtubeLink: "", thumbnailId: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiClient
      .get<{ user: unknown }>("/api/auth/session")
      .then((res) => {
        if (res.data?.user) setAllowed(true);
        else router.replace("/sign-in?redirect=/add-video");
      })
      .catch(() => router.replace("/sign-in?redirect=/add-video"))
      .finally(() => setChecking(false));
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!form.title.trim() || !form.youtubeLink.trim()) {
      setError("Title and YouTube link are required.");
      return;
    }
    setSaving(true);
    try {
      await apiClient.post("/api/videos", {
        title: form.title.trim(),
        youtubeLink: form.youtubeLink.trim(),
        thumbnail: form.thumbnailId || undefined,
      });
      router.push("/profile");
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg || "Request failed");
    } finally {
      setSaving(false);
    }
  };

  if (checking) {
    return (
      <>
        <Navbar />
        <main className="min-vh-50 py-5">
          <div className="container py-4 text-center">
            <div className="spinner-border text-primary" role="status" />
            <p className="mt-2 text-muted">Checking login…</p>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (!allowed) {
    return null;
  }

  return (
    <>
      <Navbar />
      <main className="py-4">
        <div className="container">
          <div className="section-header mb-4">
            <Link href="/profile" className="text-primary mb-2 d-inline-block">
              ← Back to Profile
            </Link>
            <h1 className="fw-semibold mb-0 h3">Upload Video</h1>
            <p className="text-muted mb-0 mt-1">
              Add a video via YouTube link. It will be reviewed by an admin before it appears on the site.
            </p>
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
                        {form.thumbnailId && !form.thumbnailPreview && (
                          <span className="ms-2 small text-success">1 selected</span>
                        )}
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
                            thumbnailPreview: item
                              ? { url: item.url, type: item.type }
                              : undefined,
                          }));
                        }}
                      />
                    </div>
                  </div>
                </div>
                <div className="mt-4 d-flex gap-2">
                  <Link href="/profile" className="btn btn-secondary">
                    Cancel
                  </Link>
                  <button type="submit" className="btn btn-primary" disabled={saving}>
                    {saving ? "Saving…" : "Submit Video"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
