"use client";

import { useRef, useState } from "react";
import { MediaGalleryManager, type MediaGalleryManagerRef } from "@/components/MediaGalleryManager";
import { AddAssetsModal } from "@/components/AddAssetsModal";
import { apiClient } from "@/lib/apiClient";

export default function MediaGalleryPage() {
  const galleryRef = useRef<MediaGalleryManagerRef | null>(null);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleDeleteSelected = async (ids: string[]) => {
    setDeleteError(null);
    for (const id of ids) {
      try {
        await apiClient.delete(`/api/media/${id}`);
      } catch (err: unknown) {
        const msg =
          (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
        throw new Error(msg || "Delete failed");
      }
    }
  };

  const handleAdded = () => {
    galleryRef.current?.refetch();
  };

  return (
    <div className="py-4">
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-4">
        <h1 className="h4 fw-semibold mb-0">Media Gallery</h1>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => setAddModalOpen(true)}
        >
          <i className="fa-solid fa-plus me-2" />
          Add assets
        </button>
      </div>

      <p className="text-muted small mb-3">
        Upload via the Add assets button. Select items below to delete.
      </p>

      {deleteError && (
        <div className="alert alert-danger py-2 mb-3" role="alert">
          {deleteError}
        </div>
      )}

      <AddAssetsModal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onAdded={handleAdded}
      />

      <div className="card border-0 shadow-sm">
        <div className="card-body">
          <h2 className="h6 fw-semibold mb-3">Media library</h2>
          <MediaGalleryManager
            ref={galleryRef}
            mode="inline"
            multiple
            hideUploadAndImport
            onDeleteSelected={async (ids) => {
              try {
                await handleDeleteSelected(ids);
              } catch (err) {
                setDeleteError(err instanceof Error ? err.message : "Delete failed");
                throw err;
              }
            }}
          />
        </div>
      </div>
    </div>
  );
}
