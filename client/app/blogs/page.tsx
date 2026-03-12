"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import { getBlogs, type BlogItem } from "@/server";
import { useBlogsPageData } from "./BlogsPageDataContext";

function getFeatureImageUrl(medias: BlogItem["medias"]): string | null {
  const m = (medias || []).find((x) => x.role === "feature");
  if (!m?.media || typeof m.media !== "object") return null;
  return (m.media as { url?: string }).url ?? null;
}

export default function BlogListPage() {
  const [blogs, setBlogs] = useState<BlogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { bannerUrl, heroTitle } = useBlogsPageData();

  useEffect(() => {
    getBlogs({ publishedOnly: true })
      .then((data) => setBlogs(data.filter((b) => b.slug)))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <Navbar />
      <main>
        <section className="dark-overlay hero mx-3 overflow-hidden position-relative py-4 py-lg-5 rounded-4 text-white mt-4">
          <img className="bg-image" src={bannerUrl} alt="" />
          <div className="container overlay-content py-5">
            <div className="row justify-content-center">
              <div className="col-lg-10 col-xl-10 text-center">
                <h1 className="display-4 fw-semibold section-header__title text-capitalize mb-0">{heroTitle}</h1>
              </div>
            </div>
          </div>
        </section>

        <div className="py-5">
          <div className="container py-4">
            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status" />
                <p className="mt-2 text-muted">Loading…</p>
              </div>
            ) : (
              <div className="row g-4">
                {blogs.map((post) => {
                  const imageUrl = getFeatureImageUrl(post.medias) || "/assets/images/blog/02-lg.jpg";
                  const authorName = post.user?.name || post.user?.email || "Author";
                  const categoryName = post.category?.name;
                  const dateStr = post.publishedAt ? new Date(post.publishedAt).toLocaleDateString() : "";
                  return (
                    <div key={post._id} className="col-md-6 col-lg-4">
                      <article className="card h-100 border-0 shadow-sm overflow-hidden rounded-3">
                        <div className="position-relative">
                          <Link href={`/blogs/${post.slug}`} className="d-block position-relative">
                            <img src={imageUrl} className="card-img-top image-zoom-hover object-fit-cover" alt="" style={{ height: 220 }} />
                          </Link>
                        </div>
                        <div className="card-body pb-2">
                          <div className="hstack gap-3 mb-2">
                            {dateStr && <span className="fs-sm small text-muted">{dateStr}</span>}
                            {categoryName && (
                              <>
                                {dateStr && <span className="opacity-25">|</span>}
                                <span className="badge border fw-semibold text-primary bg-white">{categoryName}</span>
                              </>
                            )}
                          </div>
                          <h3 className="fs-5 fw-semibold mb-2 post-title">
                            <Link href={`/blogs/${post.slug}`} className="text-decoration-none text-dark">{post.title}</Link>
                          </h3>
                          <p className="small text-muted mb-0">{post.excerpt || ""}</p>
                        </div>
                        <div className="card-footer bg-transparent border-0 pt-0 pb-3">
                          <div className="d-flex align-items-center">
                            <div className="flex-shrink-0">
                              <span className="d-flex align-items-center justify-content-center rounded-circle bg-primary text-white" style={{ width: 36, height: 36, fontSize: "0.875rem" }}>
                                {authorName.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div className="flex-grow-1 ms-2">
                              <span className="fst-italic text-muted small">By</span> <span className="fw-medium small">{authorName}</span>
                            </div>
                          </div>
                        </div>
                      </article>
                    </div>
                  );
                })}
              </div>
            )}
            {!loading && blogs.length === 0 && (
              <div className="text-center py-5 text-muted">No blog posts yet.</div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
