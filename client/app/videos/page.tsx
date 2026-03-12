"use client";

import { useEffect, useState, useCallback } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getVideos, type VideoItem } from "@/server";
import { getMediaUrl } from "@/lib/mediaUrl";
import { useVideosPageData } from "./VideosPageDataContext";

function getYouTubeVideoId(link: string): string | null {
  if (!link || typeof link !== "string") return null;
  const trimmed = link.trim();
  const m = trimmed.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/);
  return m ? m[1] : null;
}

function getYouTubeThumbnailUrl(videoId: string): string {
  return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
}

export default function VideosListPage() {
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const { bannerUrl, heroTitle, heroLead } = useVideosPageData();

  useEffect(() => {
    getVideos()
      .then(setVideos)
      .finally(() => setLoading(false));
  }, []);

  const openModal = useCallback((videoId: string) => setPlayingId(videoId), []);
  const closeModal = useCallback(() => setPlayingId(null), []);

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
                <p className="lead mb-0 mt-2 opacity-90">{heroLead}</p>
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
                {videos.map((video) => {
                  const videoId = getYouTubeVideoId(video.youtubeLink);
                  const thumbObj = video.thumbnail && typeof video.thumbnail === "object" ? video.thumbnail : null;
                  const thumbUrl = thumbObj?.url ? getMediaUrl(thumbObj.url) : (videoId ? getYouTubeThumbnailUrl(videoId) : "");
                  if (!videoId) return null;
                  return (
                    <div key={video._id} className="col-md-6 col-lg-4">
                      <div
                        className="card video-card h-100 border-0 shadow-sm overflow-hidden rounded-3"
                        role="button"
                        tabIndex={0}
                        onClick={() => openModal(videoId)}
                        onKeyDown={(e) => e.key === "Enter" && openModal(videoId)}
                      >
                        <div className="video-thumbnail position-relative">
                          <img
                            src={thumbUrl}
                            alt={video.title}
                            className="card-img-top object-fit-cover image-zoom-hover"
                            style={{ height: 220 }}
                          />
                          <div className="play-overlay position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center">
                            <i className="fas fa-play text-white fs-1 opacity-90" />
                          </div>
                        </div>
                        <div className="card-body">
                          <h3 className="video-title card-title fw-semibold mb-0 fs-5">{video.title}</h3>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            {!loading && videos.length === 0 && (
              <div className="text-center py-5 text-muted">No videos yet.</div>
            )}
          </div>
        </div>
      </main>

      {playingId && (
        <div
          className="modal fade show d-block"
          tabIndex={-1}
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          onClick={closeModal}
        >
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

      <Footer />
    </>
  );
}
