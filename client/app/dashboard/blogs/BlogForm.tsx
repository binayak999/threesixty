"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { MediaGalleryManager, type MediaGalleryManagerRef } from "@/components/MediaGalleryManager";
import { getMediaUrl } from "@/lib/mediaUrl";
import type { BlogItem, BlogCategory, BlogMediaRef } from "./types";
import { slugify, INITIAL_BLOG_FORM } from "./types";

type BlogFormProps = {
  mode: "create" | "edit";
  blogId?: string;
  categories: BlogCategory[];
  onSuccess: () => void;
};

function getMediaId(m: BlogMediaRef | undefined): string | null {
  if (!m?.media) return null;
  return typeof m.media === "string" ? m.media : (m.media as { _id: string })._id;
}

export default function BlogForm({ mode, blogId, categories, onSuccess }: BlogFormProps) {
  type MediaPreview = { url: string; type: string };
  type BlogFormState = Omit<typeof INITIAL_BLOG_FORM, "status"> & {
    status: "draft" | "pending" | "published";
    galleryMediaIds: string[];
    videoMediaIds: string[];
    featureMediaPreview: MediaPreview | undefined;
    galleryMediaPreviews: MediaPreview[];
    videoMediaPreviews: MediaPreview[];
  };
  const [form, setForm] = useState<BlogFormState>(() => ({
    ...INITIAL_BLOG_FORM,
    status: "draft",
    galleryMediaIds: [] as string[],
    videoMediaIds: [] as string[],
    featureMediaPreview: undefined as MediaPreview | undefined,
    galleryMediaPreviews: [] as MediaPreview[],
    videoMediaPreviews: [] as MediaPreview[],
  }));
  const [loading, setLoading] = useState(mode === "edit" && !!blogId);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const featureRef = useRef<MediaGalleryManagerRef | null>(null);
  const galleryRef = useRef<MediaGalleryManagerRef | null>(null);
  const videoRef = useRef<MediaGalleryManagerRef | null>(null);

  useEffect(() => {
    if (mode === "edit" && blogId) {
      setLoading(true);
      fetch(`/api/blogs/${blogId}`)
        .then((res) => res.json())
        .then((json) => {
          if (json?.data) {
            const b: BlogItem = json.data;
            const medias = b.medias || [];
            const feature = medias.find((m) => m.role === "feature");
            const gallery = medias.filter((m) => m.role === "gallery").sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
            const video = medias.filter((m) => m.role === "video").sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
            const getPreview = (m: BlogMediaRef | undefined): MediaPreview | undefined => {
              const media = m?.media;
              if (!media || typeof media !== "object") return undefined;
              const url = (media as { url?: string }).url;
              if (!url) return undefined;
              return { url, type: (media as { type?: string }).type ?? "image" };
            };
            setForm({
              title: b.title,
              slug: b.slug,
              excerpt: b.excerpt || "",
              content: b.content || "",
              category:
                typeof b.category === "object" && b.category?._id
                  ? b.category._id
                  : (b.category as string) || "",
              tags: Array.isArray(b.tags) ? b.tags.join(", ") : "",
              status: (b as { status?: string }).status === 'published' ? 'published' : (b as { status?: string }).status === 'pending' ? 'pending' : 'draft',
              publishedAt: b.publishedAt
                ? new Date(b.publishedAt).toISOString().slice(0, 16)
                : "",
              featureMediaId: getMediaId(feature!) ?? "",
              galleryMediaIds: gallery.map(getMediaId).filter(Boolean) as string[],
              videoMediaIds: video.map(getMediaId).filter(Boolean) as string[],
              featureMediaPreview: feature ? getPreview(feature) : undefined,
              galleryMediaPreviews: gallery.map(getPreview).filter((p): p is MediaPreview => !!p),
              videoMediaPreviews: video.map(getPreview).filter((p): p is MediaPreview => !!p),
              seo: {
                metaTitle: (b as { seo?: { metaTitle?: string } }).seo?.metaTitle ?? "",
                metaDescription: (b as { seo?: { metaDescription?: string } }).seo?.metaDescription ?? "",
                metaKeywords: Array.isArray((b as { seo?: { metaKeywords?: string[] } }).seo?.metaKeywords)
                  ? (b as { seo?: { metaKeywords?: string[] } }).seo!.metaKeywords!.join(", ")
                  : "",
                ogImage: (b as { seo?: { ogImage?: string } }).seo?.ogImage ?? "",
                noIndex: (b as { seo?: { noIndex?: boolean } }).seo?.noIndex ?? false,
              },
            });
          }
        })
        .catch(() => setError("Failed to load blog"))
        .finally(() => setLoading(false));
    }
  }, [mode, blogId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      const medias: { media: string; role: "feature" | "gallery" | "video"; order: number }[] = [];
      if (form.featureMediaId) {
        medias.push({ media: form.featureMediaId, role: "feature", order: 0 });
      }
      form.galleryMediaIds.forEach((id, i) => {
        medias.push({ media: id, role: "gallery", order: i });
      });
      form.videoMediaIds.forEach((id, i) => {
        medias.push({ media: id, role: "video", order: i });
      });
      const payload = {
        title: form.title.trim(),
        slug: form.slug.trim() || slugify(form.title),
        excerpt: form.excerpt.trim() || undefined,
        content: form.content.trim(),
        category: form.category || undefined,
        tags: form.tags
          ? form.tags.split(",").map((t) => t.trim()).filter(Boolean)
          : [],
        status: form.status === 'published' ? 'published' : form.status === 'pending' ? 'pending' : 'draft',
        publishedAt: form.publishedAt || undefined,
        medias,
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
      if (mode === "edit" && blogId) {
        const res = await fetch(`/api/blogs/${blogId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json?.message || "Update failed");
      } else {
        const res = await fetch("/api/blogs", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json?.message || "Create failed");
      }
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Request failed");
    } finally {
      setSaving(false);
    }
  };

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
    <div className="card">
      <div className="card-header position-relative d-flex justify-content-between align-items-center">
        <h6 className="fs-17 fw-semi-bold mb-0">
          {mode === "edit" ? "Edit Blog Post" : "Add New Blog Post"}
        </h6>
        <Link href="/dashboard/blogs" className="btn btn-outline-secondary btn-sm">
          <i className="fa-solid fa-arrow-left me-1" />
          Back to list
        </Link>
      </div>
      <div className="card-body add-listing-form">
        <form onSubmit={handleSubmit}>
          {error && (
            <div className="alert alert-danger py-2" role="alert">
              {error}
            </div>
          )}
          <div className="row g-4">
            <div className="col-sm-8">
              <div className="form-group-enhanced">
                <label className="form-label required">Blog Title</label>
                <input
                type="text"
                className="form-control"
                required
                value={form.title}
                onChange={(e) => {
                  setForm((f) => ({ ...f, title: e.target.value }));
                  if (!form.slug) setForm((f) => ({ ...f, slug: slugify(e.target.value) }));
                }}
              />
              </div>
            </div>
            <div className="col-sm-4">
              <div className="form-group-enhanced">
                <label className="form-label">Category</label>
                <select
                className="form-select"
                value={form.category}
                onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
              >
                <option value="">— Select —</option>
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
              </div>
            </div>
            <div className="col-sm-6">
              <div className="form-group-enhanced">
                <label className="form-label">Slug</label>
                <input
                type="text"
                className="form-control"
                placeholder="Auto-generated from title"
                value={form.slug}
                onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
              />
              <div className="form-text">Auto-generated from title if left blank</div>
              </div>
            </div>
            <div className="col-sm-6">
              <div className="form-group-enhanced">
                <label className="form-label">Tags (comma-separated)</label>
                <input
                type="text"
                className="form-control"
                placeholder="e.g. technology, tips"
                value={form.tags}
                onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))}
              />
              </div>
            </div>
            <div className="col-12">
              <div className="form-group-enhanced">
                <label className="form-label">Media</label>
              <div className="row g-3">
                <div className="col-md-4">
                  <div className="border rounded p-3 h-100">
                    <div className="fw-medium mb-2">Feature image</div>
                    <p className="small text-muted mb-2">One cover image for the blog.</p>
                    <button
                      type="button"
                      className="btn btn-outline-primary btn-sm w-100"
                      onClick={() => featureRef.current?.open()}
                    >
                      <i className="fa-solid fa-image me-1" />
                      {form.featureMediaId ? "Change" : "Choose"}
                    </button>
                    {form.featureMediaId && !form.featureMediaPreview && (
                      <div className="mt-2 small text-success">1 selected</div>
                    )}
                    {form.featureMediaPreview && (
                      <div className="mt-3 media-selection-preview">
                        {form.featureMediaPreview.type === "video" ? (
                          <video
                            src={getMediaUrl(form.featureMediaPreview.url)}
                            controls
                            muted
                            playsInline
                            className="rounded w-100"
                            style={{ maxHeight: 160, objectFit: "contain" }}
                          />
                        ) : (
                          <img
                            src={getMediaUrl(form.featureMediaPreview.url)}
                            alt="Feature preview"
                            className="rounded w-100"
                            style={{ maxHeight: 160, objectFit: "contain" }}
                          />
                        )}
                      </div>
                    )}
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="border rounded p-3 h-100">
                    <div className="fw-medium mb-2">Gallery</div>
                    <p className="small text-muted mb-2">Multiple images for the post.</p>
                    <button
                      type="button"
                      className="btn btn-outline-primary btn-sm w-100"
                      onClick={() => galleryRef.current?.open()}
                    >
                      <i className="fa-solid fa-images me-1" />
                      Choose ({form.galleryMediaIds.length})
                    </button>
                    {form.galleryMediaPreviews.length > 0 && (
                      <div className="mt-3 d-flex flex-wrap gap-2 media-selection-preview">
                        {form.galleryMediaPreviews.map((p, i) =>
                          p.type === "video" ? (
                            <video
                              key={i}
                              src={getMediaUrl(p.url)}
                              muted
                              playsInline
                              className="rounded"
                              style={{ width: 64, height: 64, objectFit: "cover" }}
                            />
                          ) : (
                            <img
                              key={i}
                              src={getMediaUrl(p.url)}
                              alt=""
                              className="rounded"
                              style={{ width: 64, height: 64, objectFit: "cover" }}
                            />
                          )
                        )}
                      </div>
                    )}
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="border rounded p-3 h-100">
                    <div className="fw-medium mb-2">Videos</div>
                    <p className="small text-muted mb-2">Video attachments.</p>
                    <button
                      type="button"
                      className="btn btn-outline-primary btn-sm w-100"
                      onClick={() => videoRef.current?.open()}
                    >
                      <i className="fa-solid fa-video me-1" />
                      Choose ({form.videoMediaIds.length})
                    </button>
                    {form.videoMediaPreviews.length > 0 && (
                      <div className="mt-3 d-flex flex-wrap gap-2 media-selection-preview">
                        {form.videoMediaPreviews.map((p, i) => (
                          <video
                            key={i}
                            src={getMediaUrl(p.url)}
                            muted
                            playsInline
                            className="rounded"
                            style={{ width: 80, height: 60, objectFit: "cover" }}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <MediaGalleryManager
                ref={featureRef}
                mode="popup"
                title="Select feature image"
                allowTypes={["image", "360"]}
                multiple={false}
                selectedIds={form.featureMediaId ? [form.featureMediaId] : []}
                onSelect={(items) => {
                  const item = items[0];
                  setForm((f) => ({
                    ...f,
                    featureMediaId: item?.id ?? "",
                    featureMediaPreview: item ? { url: item.url, type: item.type } : undefined,
                  }));
                }}
              />
              <MediaGalleryManager
                ref={galleryRef}
                mode="popup"
                title="Select gallery images"
                allowTypes={["image", "360"]}
                multiple
                selectedIds={form.galleryMediaIds}
                onSelect={(items) =>
                  setForm((f) => ({
                    ...f,
                    galleryMediaIds: items.map((i) => i.id),
                    galleryMediaPreviews: items.map((i) => ({ url: i.url, type: i.type })),
                  }))
                }
              />
              <MediaGalleryManager
                ref={videoRef}
                mode="popup"
                title="Select videos"
                allowTypes={["video"]}
                multiple
                selectedIds={form.videoMediaIds}
                onSelect={(items) =>
                  setForm((f) => ({
                    ...f,
                    videoMediaIds: items.map((i) => i.id),
                    videoMediaPreviews: items.map((i) => ({ url: i.url, type: i.type })),
                  }))
                }
              />
              </div>
            </div>
            <div className="col-12">
              <div className="form-group-enhanced">
                <label className="form-label">Excerpt</label>
                <textarea
                className="form-control"
                rows={2}
                placeholder="Brief description..."
                value={form.excerpt}
                onChange={(e) => setForm((f) => ({ ...f, excerpt: e.target.value }))}
              />
              </div>
            </div>
            <div className="col-12">
              <div className="form-group-enhanced">
                <label className="form-label required">Content</label>
                <textarea
                className="form-control"
                rows={6}
                required
                value={form.content}
                onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
              />
              </div>
            </div>
            <div className="col-sm-4">
              <div className="form-group-enhanced">
                <label className="form-label">Status</label>
                <select
                  className="form-select"
                  value={form.status}
                  onChange={(e) => {
                    const v = e.target.value;
                    setForm((f) => ({ ...f, status: v === "published" ? "published" : v === "pending" ? "pending" : "draft" }));
                  }}
                >
                  <option value="draft">Draft</option>
                  <option value="pending">Pending approval</option>
                  <option value="published">Published</option>
                </select>
              </div>
            </div>
            <div className="col-sm-4">
              <div className="form-group-enhanced">
                <label className="form-label">Publish Date</label>
                <input
                type="datetime-local"
                className="form-control"
                value={form.publishedAt}
                onChange={(e) => setForm((f) => ({ ...f, publishedAt: e.target.value }))}
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
                        placeholder="e.g. My Blog Post | Site Name"
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
                        id="blog-seo-noindex"
                        checked={form.seo.noIndex}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, seo: { ...f.seo, noIndex: e.target.checked } }))
                        }
                      />
                      <label className="form-check-label" htmlFor="blog-seo-noindex">
                        No index (ask search engines not to index this)
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="text-end mt-4">
            <Link href="/dashboard/blogs" className="btn btn-secondary me-2">
              Cancel
            </Link>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? "Saving…" : mode === "edit" ? "Update" : "Publish Blog"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
