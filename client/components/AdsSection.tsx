"use client";

import { getMediaUrl } from "@/lib/mediaUrl";
import type { BannerItem } from "@/server";

function getBannerImageUrl(banner: BannerItem): string {
  const media = banner.media;
  if (typeof media === "string") return "";
  if (media && typeof media === "object" && "url" in media) return getMediaUrl((media as { url?: string }).url);
  return "";
}

interface AdsSectionProps {
  banners: BannerItem[];
}

export default function AdsSection({ banners }: AdsSectionProps) {
  if (!banners?.length) return null;

  return (
    <div className="py-5">
      <div className="container py-4">
        <div className="row g-4 justify-content-center">
          {banners.map((banner) => {
            const src = getBannerImageUrl(banner);
            if (!src) return null;
            const link = banner.link?.trim();
            const hasLink = link && link !== "#";
            const content = (
              <img
                src={src}
                alt={banner.title || "Ad"}
                className="w-100 h-100 object-fit-cover rounded-3"
                decoding="async"
              />
            );
            return (
              <div key={banner._id} className="col-12 col-md-6 col-lg-4">
                <div className="card border-0 rounded-3 overflow-hidden h-100">
                  {hasLink ? (
                    <a
                      href={link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="d-block position-relative overflow-hidden"
                      style={{ aspectRatio: "2/1", minHeight: 120 }}
                      aria-label={banner.title ? `${banner.title} – open link` : "Open ad link"}
                    >
                      {content}
                    </a>
                  ) : (
                    <div className="position-relative overflow-hidden" style={{ aspectRatio: "2/1", minHeight: 120 }}>
                      {content}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
