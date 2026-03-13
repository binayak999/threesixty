"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiClient } from "@/lib/apiClient";

interface BlogPost {
  _id: string;
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  tags?: string[];
  publishedAt?: string;
  user?: { name?: string; email?: string };
  category?: { name?: string; slug?: string };
  medias?: Array<{
    media?: { url?: string; type?: string };
    role: string;
    order?: number;
  }>;
}

interface BlogCommentType {
  _id: string;
  authorName: string;
  authorEmail?: string;
  content: string;
  createdAt: string;
  user?: { name?: string; email?: string };
}

function getMediaUrl(medias: BlogPost["medias"], role: string): string | null {
  const m = (medias || []).find((x) => x.role === role);
  if (!m?.media || typeof m.media !== "object") return null;
  return (m.media as { url?: string }).url ?? null;
}

export default function BlogPostContent({ slug }: { slug: string }) {
  const [blog, setBlog] = useState<BlogPost | null>(null);
  const [comments, setComments] = useState<BlogCommentType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [commentSuccess, setCommentSuccess] = useState(false);
  const [form, setForm] = useState({ authorName: "", authorEmail: "", content: "" });

  useEffect(() => {
    apiClient
      .get<{ data?: BlogPost }>(`/api/blogs/slug/${encodeURIComponent(slug)}`)
      .then((res) => {
        const json = res.data;
        if (json?.data) {
          setBlog(json.data);
          return apiClient.get<{ data?: BlogCommentType[] }>(`/api/blog-comments?blogId=${json.data._id}&approvedOnly=1`);
        }
        setError("Blog not found");
        return null;
      })
      .then((r) => {
        if (r?.data?.data) setComments(r.data.data);
      })
      .catch(() => setError("Failed to load"))
      .finally(() => setLoading(false));
  }, [slug]);

  const refetchComments = (blogId: string) => {
    apiClient
      .get<{ data?: BlogCommentType[] }>(`/api/blog-comments?blogId=${blogId}&approvedOnly=1`)
      .then((res) => res.data?.data && setComments(res.data.data));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!blog || !form.authorName.trim() || !form.authorEmail.trim() || !form.content.trim()) return;
    setSubmitting(true);
    setCommentSuccess(false);
    apiClient
      .post<{ success?: boolean }>("/api/blog-comments", {
        blog: blog._id,
        authorName: form.authorName.trim(),
        authorEmail: form.authorEmail.trim(),
        content: form.content.trim(),
      })
      .then((res) => {
        if (res.data?.success) {
          setForm({ authorName: "", authorEmail: "", content: "" });
          setCommentSuccess(true);
          refetchComments(blog._id);
        }
      })
      .finally(() => setSubmitting(false));
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status" />
        <p className="mt-2 text-muted">Loading…</p>
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="py-5">
        <div className="alert alert-warning">{error || "Blog not found"}</div>
        <Link href="/blogs">Back to blogs</Link>
      </div>
    );
  }

  const featureUrl = getMediaUrl(blog.medias, "feature");
  const authorName = (typeof blog.user === "object" && blog.user ? (blog.user as { name?: string }).name || (blog.user as { email?: string }).email : null) ?? "Author";
  const categoryName = typeof blog.category === "object" && blog.category ? (blog.category as { name?: string }).name : null;

  return (
    <div className="py-5">
      <div className="container py-4">
        <div className="row justify-content-center">
          <div className="col-xl-10 col-xxl-8">
            <article className="post single-post">
              <section className="dark-overlay hero mx-3 overflow-hidden position-relative py-4 py-lg-5 rounded-4 text-white mt-4">
                {featureUrl ? (
                  <img className="bg-image" src={featureUrl} alt="" style={{ objectFit: "cover" }} />
                ) : (
                  <img className="bg-image" src="/assets/images/header/02.jpg" alt="" />
                )}
                <div className="container overlay-content py-5">
                  <div className="row justify-content-center">
                    <div className="col-lg-10 col-xl-10 text-center">
                      {categoryName && (
                        <div className="bg-primary d-inline-block fs-14 mb-3 px-4 py-2 rounded-5 sub-title text-white text-uppercase">
                          {categoryName} / {blog.publishedAt ? new Date(blog.publishedAt).toLocaleDateString() : ""}
                        </div>
                      )}
                      <h1 className="display-4 fw-semibold section-header__title text-capitalize mb-0">{blog.title}</h1>
                    </div>
                  </div>
                </div>
              </section>

              <div className="entry-content cs-content mt-4">
                {blog.excerpt && <p className="lead text-muted">{blog.excerpt}</p>}
                <div style={{ whiteSpace: "pre-wrap" }}>{blog.content}</div>
              </div>

              {Array.isArray(blog.tags) && blog.tags.length > 0 && (
                <div className="d-flex flex-wrap gap-3 my-4 post-tags tagcloud">
                  {blog.tags.map((t) => (
                    <Link key={t} href={`/blogs?tag=${encodeURIComponent(t)}`} className="fs-15 fw-semibold" rel="tag">
                      {t}
                    </Link>
                  ))}
                </div>
              )}

              <div className="author-info border p-4 mb-5 rounded mt-5">
                <div className="d-flex">
                  <div className="flex-shrink-0">
                    <span className="d-flex align-items-center justify-content-center rounded-circle bg-primary text-white" style={{ width: 70, height: 70, fontSize: "1.5rem" }}>
                      {authorName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-grow-1 ms-4">
                    <div className="fs-12 fw-medium l-spacing-1 text-muted text-uppercase">Written by</div>
                    <h4 className="fs-18 mb-0">{authorName}</h4>
                  </div>
                </div>
              </div>

              <div className="mb-4 mt-5">
                <h4 className="fw-semibold fs-3 mb-4">Comments ({comments.length})</h4>
                {comments.length === 0 ? (
                  <p className="text-muted">No comments yet. Be the first to reply.</p>
                ) : (
                  <ul className="list-unstyled">
                    {[...comments].reverse().map((c) => (
                      <li key={c._id} className="border-bottom pb-3 mb-3">
                        <div className="d-flex gap-2 align-items-center mb-1">
                          <strong>{typeof c.user === "object" && c.user ? (c.user as { name?: string }).name || (c.user as { email?: string }).email : c.authorName}</strong>
                          <span className="small text-muted">{new Date(c.createdAt).toLocaleString()}</span>
                        </div>
                        <p className="mb-0" style={{ whiteSpace: "pre-wrap" }}>{c.content}</p>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="mb-4 mb-lg-0">
                <h4 className="fw-semibold fs-3 mb-4">Leave a <span className="font-caveat text-primary">Reply</span></h4>
                <p className="required small text-muted">Your email address will not be published. Required fields are marked *</p>
                {commentSuccess && (
                  <div className="alert alert-success py-2 mb-3">Thank you. Your comment is awaiting moderation.</div>
                )}
                <form className="row g-4 mt-2" onSubmit={handleSubmit}>
                  <div className="col-sm-6">
                    <label className="fw-medium mb-2">Full Name *</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Enter your name"
                      required
                      value={form.authorName}
                      onChange={(e) => setForm((f) => ({ ...f, authorName: e.target.value }))}
                    />
                  </div>
                  <div className="col-sm-6">
                    <label className="fw-medium mb-2">Email Address *</label>
                    <input
                      type="email"
                      className="form-control"
                      placeholder="Enter your email address"
                      required
                      value={form.authorEmail}
                      onChange={(e) => setForm((f) => ({ ...f, authorEmail: e.target.value }))}
                    />
                  </div>
                  <div className="col-12">
                    <label className="fw-medium mb-2">Comment *</label>
                    <textarea
                      className="form-control"
                      rows={5}
                      placeholder="Your comment"
                      required
                      value={form.content}
                      onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
                    />
                  </div>
                  <div className="col-12 text-end">
                    <button type="submit" className="btn btn-primary" disabled={submitting}>
                      {submitting ? "Submitting…" : "Leave a comment"}
                    </button>
                  </div>
                </form>
              </div>
            </article>
          </div>
        </div>
      </div>
    </div>
  );
}
