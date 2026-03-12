"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import type { AddListingFormState } from "../types";
import { MediaGalleryManager } from "@/components/MediaGalleryManager";
import type { MediaItem } from "@/components/MediaGalleryManager";
import { getMediaUrl } from "@/lib/mediaUrl";

export default function Step5Media({
  form,
  update,
}: {
  form: AddListingFormState;
  update: (u: Partial<AddListingFormState>) => void;
}) {
  const galleryRef = useRef<{ open: () => void }>(null);
  const [mediaCache, setMediaCache] = useState<Record<string, MediaItem>>({});
  const allMediaIds = [...form.mediaIds, ...form.media360Ids, ...form.videoIds];

  const fetchMedia = useCallback(async () => {
    try {
      const res = await fetch("/api/media");
      const data = await res.json();
      const items: MediaItem[] = Array.isArray(data?.items) ? data.items : (data?.data ?? []);
      setMediaCache((prev) => {
        const next = { ...prev };
        items.forEach((i) => {
          if (i.id) next[i.id] = i;
        });
        return next;
      });
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    if (allMediaIds.length > 0) fetchMedia();
  }, [allMediaIds.length, fetchMedia]);

  const handleSelect = useCallback(
    (items: MediaItem[]) => {
      const imageIds = items.filter((i) => i.type === "image" || i.type === "360").map((i) => i.id);
      const videoIds = items.filter((i) => i.type === "video").map((i) => i.id);
      const media360 = items.filter((i) => i.type === "360").map((i) => i.id);
      setMediaCache((prev) => {
        const next = { ...prev };
        items.forEach((i) => {
          if (i.id) next[i.id] = i;
        });
        return next;
      });
      update({
        mediaIds: imageIds,
        media360Ids: media360,
        videoIds,
      });
    },
    [update]
  );

  return (
    <div className="card mb-4">
      <div className="card-header position-relative">
        <h6 className="fs-17 fw-semi-bold mb-0">
          <i className="fas fa-images me-2 text-primary" />
          Media Gallery
        </h6>
      </div>
      <div className="card-body">
        <div className="row g-4">
          <div className="col-sm-12">
            <div className="form-group-enhanced">
              <label className="form-label required">Main Images</label>
              {form.mediaIds.length > 0 ? (
                <div className="mb-3">
                  <p className="text-muted small mb-2">
                    First image is the cover. Main: {form.mediaIds.length} | 360°: {form.media360Ids.length} | Videos: {form.videoIds.length}
                  </p>
                  <div className="d-flex flex-wrap gap-2 align-items-start">
                    {form.mediaIds.map((id, index) => {
                      const item = mediaCache[id];
                      const isCover = index === 0;
                      return (
                        <div
                          key={`${id}-${index}`}
                          className="position-relative rounded overflow-hidden border"
                          style={{ width: 80, height: 80, flexShrink: 0 }}
                        >
                          {item ? (
                            item.type === "image" || item.type === "360" ? (
                              <img
                                src={getMediaUrl(item.url)}
                                alt={item.filename ?? ""}
                                className="w-100 h-100 object-fit-cover"
                              />
                            ) : (
                              <div className="w-100 h-100 bg-light d-flex align-items-center justify-content-center">
                                <i className="fa-solid fa-file-image text-secondary" />
                              </div>
                            )
                          ) : (
                            <div className="w-100 h-100 bg-light d-flex align-items-center justify-content-center">
                              <span className="spinner-border spinner-border-sm text-primary" />
                            </div>
                          )}
                          {isCover && (
                            <span
                              className="position-absolute bottom-0 start-0 end-0 small bg-dark text-white text-center py-1"
                              style={{ fontSize: "0.65rem" }}
                            >
                              Cover
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : null}
              <div className="media-upload-zone d-flex flex-column align-items-center justify-content-center">
                <div className="upload-icon">
                  <i className="fas fa-cloud-upload-alt" />
                </div>
                <h6 className="fw-medium mb-2">Drag & Drop Images Here or choose from library</h6>
                <p className="text-muted mb-3">Click the button below to select from your media library</p>
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={() => galleryRef.current?.open()}
                >
                  <i className="fas fa-plus me-2" />
                  Choose from library
                </button>
                <div className="form-text mt-2">
                  Upload high-quality images (recommended: 1200x800px). First image will be the cover photo.
                </div>
              </div>
            </div>
          </div>
        </div>
        <MediaGalleryManager
          ref={galleryRef}
          mode="popup"
          title="Select media"
          allowTypes={["image", "360", "video"]}
          multiple
          selectedIds={allMediaIds}
          onSelect={handleSelect}
        />
      </div>
    </div>
  );
}
