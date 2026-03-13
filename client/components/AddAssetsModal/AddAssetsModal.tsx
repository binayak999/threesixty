"use client";

import React, { useRef, useState, useCallback, useEffect } from "react";
import { createPortal } from "react-dom";
import { apiClient } from "@/lib/apiClient";
import "@/components/MediaGalleryManager/MediaGalleryManager.css";

async function uploadFiles(files: File[], type: string): Promise<unknown[]> {
  const formData = new FormData();
  files.forEach((f) => formData.append("files", f));
  formData.set("type", type);
  const res = await apiClient.post<{ items?: unknown[] }>("/api/media/upload", formData);
  return Array.isArray(res.data?.items) ? res.data.items : [];
}

async function importFromUrl(url: string): Promise<unknown | null> {
  const res = await apiClient.post<{ item?: unknown }>("/api/media/import-url", { url });
  return res.data?.item ?? null;
}

export interface AddAssetsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdded?: () => void;
}

export default function AddAssetsModal({ isOpen, onClose, onAdded }: AddAssetsModalProps) {
  const [uploading, setUploading] = useState(false);
  const [importUrl, setImportUrl] = useState("");
  const [importError, setImportError] = useState("");
  const [importingUrl, setImportingUrl] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = useCallback(async (files: File[]) => {
    if (files.length === 0) return;
    setUploading(true);
    try {
      await uploadFiles(files, "image");
      onAdded?.();
    } finally {
      setUploading(false);
    }
  }, [onAdded]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    if (files.length > 0) handleUpload(files);
    e.target.value = "";
  };

  const handleImportFromUrl = async () => {
    const url = importUrl.trim();
    if (!url) return;
    setImportError("");
    setImportingUrl(true);
    try {
      const item = await importFromUrl(url);
      if (item) {
        setImportUrl("");
        onAdded?.();
      } else {
        setImportError("Import failed.");
      }
    } catch {
      setImportError("Import failed.");
    } finally {
      setImportingUrl(false);
    }
  };

  const handlePaste = useCallback(
    (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items?.length) return;
      const files: File[] = [];
      for (const item of items) {
        if (item.kind === "file") {
          const file = item.getAsFile();
          if (file) files.push(file);
        }
      }
      if (files.length > 0) {
        e.preventDefault();
        handleUpload(files);
      }
    },
    [handleUpload]
  );

  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.body.classList.add("modal-open");
    window.addEventListener("paste", handlePaste);
    return () => {
      document.body.style.overflow = prev;
      document.body.classList.remove("modal-open");
      window.removeEventListener("paste", handlePaste);
    };
  }, [isOpen, handlePaste]);

  if (!isOpen) return null;

  const modalEl = (
    <div
      className="modal fade show d-block"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 1055,
        background: "rgba(0,0,0,0.5)",
      }}
      tabIndex={-1}
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-assets-modal-title"
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content media-gallery-manager">
          <div className="modal-header">
            <h5 className="modal-title fs-17 fw-semi-bold mb-0" id="add-assets-modal-title">
              <i className="fa-solid fa-plus me-2 text-primary" />
              Add assets
            </h5>
            <button type="button" className="btn-close" aria-label="Close" onClick={onClose} />
          </div>
          <div className="modal-body">
            <div
              className="media-upload-zone mb-3"
              onClick={() => fileInputRef.current?.click()}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                className="d-none"
                multiple
                accept="image/*,video/*,audio/*,*/*"
                onChange={handleFileChange}
              />
              {uploading ? (
                <span className="upload-hint">Uploading…</span>
              ) : (
                <>
                  <div className="upload-icon">
                    <i className="fa-solid fa-cloud-upload-alt" />
                  </div>
                  <h6 className="fw-medium mb-2">Drag & drop files here or click to upload</h6>
                  <p className="upload-hint mb-0">Images, 360°, video, audio, or any file</p>
                  <p className="upload-hint small mt-2 mb-0">Paste (Ctrl+V / ⌘V) to add from clipboard</p>
                </>
              )}
            </div>
            <div className="media-url-import">
              <label className="form-label small fw-medium text-muted mb-1">Import from URL</label>
              <div className="input-group">
                <input
                  type="url"
                  className="form-control"
                  placeholder="https://example.com/image.jpg"
                  value={importUrl}
                  onChange={(e) => {
                    setImportUrl(e.target.value);
                    setImportError("");
                  }}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleImportFromUrl())}
                />
                <button
                  type="button"
                  className="btn btn-outline-primary"
                  onClick={handleImportFromUrl}
                  disabled={!importUrl.trim() || importingUrl}
                >
                  {importingUrl ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true" />
                      Import
                    </>
                  ) : (
                    <>
                      <i className="fa-solid fa-link me-1" />
                      Import
                    </>
                  )}
                </button>
              </div>
              {importError && <p className="small text-danger mb-0 mt-1">{importError}</p>}
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return typeof document !== "undefined" ? createPortal(modalEl, document.body) : null;
}
