"use client";

import Link from "next/link";
import { getMediaUrl } from "@/lib/mediaUrl";
import type { BlogItem } from "@/server";

const FALLBACK_IMG = "/assets/images/blog/01.jpg";

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

interface NewsSectionProps {
  articles: BlogItem[];
}

export default function NewsSection({ articles }: NewsSectionProps) {
  if (articles.length === 0) return null;

  return (
    <div className="py-5 bg-light overflow-hidden position-relative">
      <div className="decoration blur-2 z-1" />
      <div className="decoration blur-3 z-1" />
      <div className="container">
        <div className="row">
          <div className="col-xl-4 sidebar">
            <div className="section-header mb-5" data-aos="fade-down">
              <div className="d-inline-block font-caveat fs-1 fw-medium section-header__subtitle text-capitalize text-primary">Most Popular Articles</div>
              <h2 className="display-6 fw-semibold mb-3 section-header__title text-capitalize">Check out the trending contents that everyone&apos;s talking about.</h2>
              <div className="sub-title fs-16">Read our featured blog articles. Our articles will provide you with tips and insights that can be very helpful while traveling.</div>
              <div>
                <Link href="/blogs" className="btn btn-primary mt-4">View All Posts</Link>
              </div>
              <svg className="text-primary mt-4 d-none d-xl-block" width="200" height="211" viewBox="0 0 200 211" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M198.804 194.488C189.279 189.596 179.529 185.52 169.407 182.07L169.384 182.049C169.227 181.994 169.07 181.939 168.912 181.884C166.669 181.139 165.906 184.546 167.669 185.615C174.053 189.473 182.761 191.837 189.146 195.695C156.603 195.912 119.781 196.591 91.266 179.049C62.5221 161.368 48.1094 130.695 56.934 98.891C84.5539 98.7247 112.556 84.0176 129.508 62.667C136.396 53.9724 146.193 35.1448 129.773 30.2717C114.292 25.6624 93.7109 41.8875 83.1971 51.3147C70.1109 63.039 59.63 78.433 54.2039 95.0087C52.1221 94.9842 50.0776 94.8683 48.0703 94.6608C30.1803 92.8027 11.2197 83.6338 5.44902 65.1074C-1.88449 41.5699 14.4994 19.0183 27.9202 1.56641C28.6411 0.625793 27.2862 -0.561638 26.5419 0.358501C13.4588 16.4098 -0.221091 34.5242 0.896608 56.5659C1.8218 74.6941 14.221 87.9401 30.4121 94.2058C37.7076 97.0203 45.3454 98.5003 53.0334 98.8449C47.8679 117.532 49.2961 137.487 60.7729 155.283C87.7615 197.081 139.616 201.147 184.786 201.155L174.332 206.827C172.119 208.033 174.345 211.287 176.537 210.105C182.06 207.125 187.582 204.122 193.084 201.144C193.346 201.147 195.161 199.887 195.423 199.868C197.08 198.548 193.084 201.144 195.528 199.81C196.688 199.192 197.846 198.552 199.006 197.935C200.397 197.167 200.007 195.087 198.804 194.488ZM60.8213 88.0427C67.6894 72.648 78.8538 59.1566 92.1207 49.0388C98.8475 43.9065 106.334 39.2953 114.188 36.1439C117.295 34.8947 120.798 33.6609 124.168 33.635C134.365 33.5511 136.354 42.9911 132.638 51.031C120.47 77.4222 86.8639 93.9837 58.0983 94.9666C58.8971 92.6666 59.783 90.3603 60.8213 88.0427Z" fill="currentColor" />
              </svg>
            </div>
          </div>
          <div className="col-xl-8 content ps-xxl-5">
              {articles.map((item) => {
                const imageUrl = getFeatureImageUrl(item);
                const timeStr = formatDate(item.publishedAt);
                const categoryName = item.category?.name;
                return (
                  <div key={item._id} className="blog-list-card border-0 card d-md-flex flex-md-row mb-3 p-4 rounded-4 z-2">
                    <div className="flex-grow-1 p-post me-md-5">
                      <div className="hstack gap-3 mb-3">
                        {timeStr && <span className="fs-sm small text-muted">{timeStr}</span>}
                        {categoryName && (
                          <>
                            {timeStr && <span className="opacity-25">|</span>}
                            <Link className="badge border fw-semibold text-primary bg-white" href="/blogs">{categoryName}</Link>
                          </>
                        )}
                      </div>
                      <h2 className="fw-semibold news-title overflow-hidden text-capitalize">
                        <Link href={`/blogs/${item.slug}`}>{item.title}</Link>
                      </h2>
                      <p className="mb-0">{item.excerpt || "Read more about this article."}</p>
                    </div>
                    <div className="flex-shrink-0 img-wrapper mt-4 mt-md-0">
                      <Link href={`/blogs/${item.slug}`} className="thumb position-relative d-block overflow-hidden position-relative rounded-4">
                        <img src={imageUrl} alt="" height={300} width={300} className="image-zoom-hover object-fit-cover w-100" />
                      </Link>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </div>
    </div>
  );
}
