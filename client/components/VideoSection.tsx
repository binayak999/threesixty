"use client";

import { useState, useCallback } from "react";
import { getMediaUrl } from "@/lib/mediaUrl";
import type { VideoItem } from "@/server";

function getYouTubeVideoId(link: string): string | null {
  if (!link || typeof link !== "string") return null;
  const trimmed = link.trim();
  const m = trimmed.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/);
  return m ? m[1] : null;
}

function getYouTubeThumbnailUrl(videoId: string): string {
  return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
}

interface VideoSectionProps {
  videos: VideoItem[];
}

export default function VideoSection({ videos }: VideoSectionProps) {
  const [playingId, setPlayingId] = useState<string | null>(null);

  const openModal = useCallback((videoId: string) => setPlayingId(videoId), []);
  const closeModal = useCallback(() => setPlayingId(null), []);

  if (videos.length === 0) return null;

  return (
    <div className="py-5">
      <div className="container py-4">
        <div className="row justify-content-center">
          <div className="col-sm-10 col-md-10 col-lg-8 col-xl-7">
            <div className="section-header text-center mb-5" data-aos="fade-down">
              <div className="d-inline-block font-caveat fs-1 fw-medium section-header__subtitle text-capitalize text-primary">Featured Videos</div>
              <h2 className="display-5 fw-semibold mb-3 section-header__title text-capitalize">Discover Amazing Travel Destinations</h2>
              <div className="sub-title fs-16">Watch our curated collection of travel videos. <span className="text-primary fw-semibold">Experience the world from every angle.</span></div>
            </div>
          </div>
        </div>
        <div className="row g-4">
            {videos.map((video) => {
              const videoId = getYouTubeVideoId(video.youtubeLink);
              const thumbObj = video.thumbnail && typeof video.thumbnail === "object" ? video.thumbnail : null;
              const thumbUrl = thumbObj?.url ? getMediaUrl(thumbObj.url) : (videoId ? getYouTubeThumbnailUrl(videoId) : "");
              if (!videoId) return null;
              return (
                <div key={video._id} className="col-lg-4 col-md-6">
                  <div
                    className="card video-card h-100"
                    role="button"
                    tabIndex={0}
                    onClick={() => openModal(videoId)}
                    onKeyDown={(e) => e.key === "Enter" && openModal(videoId)}
                  >
                    <div className="video-thumbnail position-relative">
                      <img src={thumbUrl} alt={video.title} className="card-img-top object-fit-cover" style={{ height: 220 }} />
                      <div className="play-overlay position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center">
                        <i className="fas fa-play text-white fs-1 opacity-90" />
                      </div>
                    </div>
                    <div className="card-body">
                      <h5 className="video-title card-title fw-semibold mb-0">{video.title}</h5>
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      {playingId && (
        <div className="modal fade show d-block" tabIndex={-1} style={{ backgroundColor: "rgba(0,0,0,0.5)" }} onClick={closeModal}>
          <div className="modal-dialog modal-xl modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Video Player</h5>
                <button type="button" className="btn-close" aria-label="Close" onClick={closeModal} />
              </div>
              <div className="modal-body p-0">
                <div className="ratio ratio-16x9">
                  <iframe
                    src={`https://www.youtube.com/embed/${playingId}?autoplay=1&rel=0`}
                    title="Video"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
