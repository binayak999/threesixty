"use client";

import Link from "next/link";
import { getMediaUrl } from "@/lib/mediaUrl";
import type { BlogItem } from "@/server";

const FALLBACK_IMG = "/assets/images/blog/01-lg.jpg";

function getFeatureImageUrl(blog: BlogItem): string {
  const medias = blog.medias ?? [];
  const feature = medias.find((m) => m.role === "feature");
  const url = feature?.media?.url;
  return url ? getMediaUrl(url) : FALLBACK_IMG;
}

function formatDate(dateStr: string | undefined): string {
  if (!dateStr) return "";
  try {
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffHours < 24) return `${diffHours} hours ago`;
    return d.toLocaleDateString();
  } catch {
    return "";
  }
}

interface TrendingNowSectionProps {
  posts: BlogItem[];
}

export default function TrendingNowSection({ posts }: TrendingNowSectionProps) {
  if (posts.length === 0) return null;

  return (
    <div className="py-5 position-relative overflow-hidden">
      <div className="container py-4">
        <div className="row justify-content-center">
          <div className="col-sm-10 col-md-10 col-lg-8 col-xl-7">
            <div className="section-header text-center mb-5" data-aos="fade-down">
              <div className="d-inline-block font-caveat fs-1 fw-medium section-header__subtitle text-capitalize text-primary">Trending Now</div>
              <h2 className="display-5 fw-semibold mb-3 section-header__title text-capitalize">Catch up on what&apos;s buzzing right now.</h2>
              <div className="sub-title fs-16">Discover featured articles. <span className="text-primary fw-semibold">Find what you&apos;re looking for.</span></div>
            </div>
          </div>
        </div>
        <div className="row justify-content-center">
          <div className="col-12">
            <div
              className={posts.length >= 2 ? "blog-carousel owl-carousel owl-theme owl-nav-bottom" : "row g-4"}
              data-owl-loop={posts.length >= 4 ? "true" : "false"}
            >
              {posts.map((post) => {
                const imageUrl = getFeatureImageUrl(post);
                const authorName = post.user?.name || post.user?.email || "Author";
                const categoryName = post.category?.name;
                const timeStr = formatDate(post.publishedAt);
                return (
                  <article key={post._id} className={`card h-100 overflow-hidden ${posts.length < 2 ? "col-12 col-md-6 col-lg-4" : ""}`}>
                    <div className="position-relative overflow-hidden">
                      <Link href={`/blogs/${post.slug}`} className="h-100 position-absolute start-0 top-0 w-100 z-1" aria-label="Read more" />
                      <img src={imageUrl} className="card-img-top image-zoom-hover" alt="" />
                    </div>
                    <div className="card-body">
                      <div className="hstack gap-3 mb-3">
                        {timeStr && <span className="fs-sm small text-muted">{timeStr}</span>}
                        {categoryName && (
                          <>
                            {timeStr && <span className="opacity-25">|</span>}
                            <Link className="badge border fw-semibold text-primary bg-white" href="/blogs">{categoryName}</Link>
                          </>
                        )}
                      </div>
                      <h3 className="h5 fw-semibold mb-0 post-title overflow-hidden">
                        <Link href={`/blogs/${post.slug}`}>{post.title}</Link>
                      </h3>
                    </div>
                    <div className="card-footer py-3">
                      <div className="d-flex align-items-center">
                        <div className="flex-shrink-0">
                          <span className="d-flex align-items-center justify-content-center rounded-circle bg-primary text-white" style={{ width: 48, height: 48, fontSize: "1rem" }}>
                            {authorName.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="flex-grow-1 ms-3">
                          <span className="fst-italic text-muted">By</span> <span className="fw-medium">{authorName}</span>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
