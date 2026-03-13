"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { getMediaUrl as resolveMediaUrl } from "@/lib/mediaUrl";
import { apiClient } from "@/lib/apiClient";
import type { BlogItem, BlogCategory, BlogUser, BlogMediaRef } from "../types";

function getMediaUrlFromRef(m: BlogMediaRef["media"]): string | null {
  if (!m) return null;
  return typeof m === "object" && m && "url" in m ? (m as { url?: string }).url ?? null : null;
}

export default function ViewBlogPage() {
  const params = useParams();
  const id = params?.id as string | undefined;
  const [blog, setBlog] = useState<BlogItem | null>(null);
  const [loading, setLoading] = useState(!!id);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }
    apiClient
      .get<{ data?: BlogItem }>(`/api/blogs/${id}`)
      .then((res) => {
        if (res.data?.data) setBlog(res.data.data);
        else setError("Blog not found");
      })
      .catch(() => setError("Failed to load blog"))
      .finally(() => setLoading(false));
  }, [id]);

  if (!id) {
    return (
      <div className="py-4">
        <div className="alert alert-warning">Invalid blog ID.</div>
        <Link href="/dashboard/blogs">Back to list</Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="py-4">
        <div className="card">
          <div className="card-body text-center py-5">
            <div className="spinner-border text-primary" role="status" />
            <p className="mt-2 mb-0 text-muted">Loading…</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="py-4">
        <div className="alert alert-danger">{error || "Blog not found"}</div>
        <Link href="/dashboard/blogs">Back to list</Link>
      </div>
    );
  }

  const category =
    typeof blog.category === "object" && blog.category
      ? (blog.category as BlogCategory).name
      : null;
  const author =
    typeof blog.user === "object" && blog.user
      ? (blog.user as BlogUser).name || (blog.user as BlogUser).email
      : null;

  return (
    <div className="py-4">
      <div className="d-flex justify-content-between align-items-start flex-wrap gap-2 mb-4">
        <div className="section-header">
          <div className="font-caveat fs-4 fw-bold text-primary">Blog</div>
          <h2 className="fw-semibold mb-0 h3">{blog.title}</h2>
          <div className="sub-title fs-16 text-muted">
            <Link href="/dashboard/blogs" className="text-primary">
              ← Back to blog list
            </Link>
          </div>
        </div>
        <div className="d-flex gap-2">
          <Link href={`/dashboard/blogs/${blog._id}/edit`} className="btn btn-primary">
            <i className="fa-solid fa-pencil me-1" />
            Edit
          </Link>
          <a
            href={`/blogs/${blog.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-outline-secondary"
          >
            <i className="fa-solid fa-external-link me-1" />
            View on site
          </a>
        </div>
      </div>

      <div className="card">
        <div className="card-body">
          {(blog.medias || []).length > 0 && (
            <div className="mb-4">
              {(blog.medias || []).filter((m: BlogMediaRef) => m.role === "feature").map((m: BlogMediaRef) => {
                const url = getMediaUrlFromRef(m.media);
                return url ? (
                  <div key={typeof m.media === "string" ? m.media : (m.media as { _id: string })._id} className="mb-3">
                    <img src={resolveMediaUrl(url)} alt="Feature" className="img-fluid rounded w-100" style={{ maxHeight: 320, objectFit: "cover" }} />
                  </div>
                ) : null;
              })}
              {(blog.medias || []).filter((m) => m.role === "gallery").length > 0 && (
                <div className="row g-2 mb-3">
                  {(blog.medias || [])
                    .filter((m: BlogMediaRef) => m.role === "gallery")
                    .sort((a: BlogMediaRef, b: BlogMediaRef) => (a.order ?? 0) - (b.order ?? 0))
                    .map((m: BlogMediaRef) => {
                      const url = getMediaUrlFromRef(m.media);
                      return url ? (
                        <div key={typeof m.media === "string" ? m.media : (m.media as { _id: string })._id} className="col-6 col-md-4">
                          <img src={resolveMediaUrl(url)} alt="Gallery" className="img-fluid rounded" style={{ objectFit: "cover", width: "100%", height: 140 }} />
                        </div>
                      ) : null;
                    })}
                </div>
              )}
              {(blog.medias || []).filter((m) => m.role === "video").length > 0 && (
                <div className="row g-2 mb-3">
                  {(blog.medias || [])
                    .filter((m: BlogMediaRef) => m.role === "video")
                    .sort((a: BlogMediaRef, b: BlogMediaRef) => (a.order ?? 0) - (b.order ?? 0))
                    .map((m: BlogMediaRef) => {
                      const url = getMediaUrlFromRef(m.media);
                      return url ? (
                        <div key={typeof m.media === "string" ? m.media : (m.media as { _id: string })._id} className="col-12">
                          <video src={resolveMediaUrl(url)} controls className="rounded w-100" style={{ maxHeight: 360 }} />
                        </div>
                      ) : null;
                    })}
                </div>
              )}
            </div>
          )}
          <div className="d-flex flex-wrap gap-2 mb-3">
            {category && (
              <span className="badge bg-info">{category}</span>
            )}
            {author && <span className="text-muted">By {author}</span>}
            <span className="text-muted">
              {(blog.status ?? (blog as { isActive?: boolean }).isActive) === "published" ? (
                <span className="text-success">Published</span>
              ) : (blog as { status?: string }).status === "pending" ? (
                <span className="text-info">Pending</span>
              ) : (
                <span className="text-warning">Draft</span>
              )}
            </span>
            {blog.publishedAt && (
              <span className="text-muted">
                {new Date(blog.publishedAt).toLocaleString()}
              </span>
            )}
          </div>
          {blog.excerpt && (
            <p className="lead text-muted mb-3">{blog.excerpt}</p>
          )}
          {blog.tags && blog.tags.length > 0 && (
            <div className="mb-3">
              {blog.tags.map((t: string) => (
                <span key={t} className="badge bg-light text-dark me-1">
                  {t}
                </span>
              ))}
            </div>
          )}
          <div
            className="blog-content"
            style={{ whiteSpace: "pre-wrap" }}
          >
            {blog.content}
          </div>
        </div>
      </div>
    </div>
  );
}
