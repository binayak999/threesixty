"use client";

import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { getMediaUrl } from "@/lib/mediaUrl";
import type { MediaGalleryManagerProps, MediaGalleryManagerRef, MediaItem, MediaType } from "./types";
import "./MediaGalleryManager.css";

const MEDIA_TYPES: { key: MediaType; label: string; icon: string; accept: string }[] = [
  { key: "image", label: "Images", icon: "fa-image", accept: "image/*" },
  { key: "360", label: "360°", icon: "fa-globe", accept: "image/*" },
  { key: "video", label: "Video", icon: "fa-video", accept: "video/*" },
  { key: "audio", label: "Audio", icon: "fa-music", accept: "audio/*" },
  { key: "file", label: "Files", icon: "fa-file", accept: "*/*" },
];


async function defaultFetch(): Promise<MediaItem[]> {
  try {
    const res = await fetch("/api/media");
    const data = await res.json();
    return Array.isArray(data?.items) ? data.items : [];
  } catch {
    return [];
  }
}

async function defaultUpload(files: File[], type: MediaType): Promise<MediaItem[]> {
  const formData = new FormData();
  files.forEach((f) => formData.append("files", f));
  formData.set("type", type);
  try {
    const res = await fetch("/api/media/upload", {
      method: "POST",
      body: formData,
    });
    const data = await res.json();
    return Array.isArray(data?.items) ? data.items : [];
  } catch {
    return [];
  }
}

const MediaGalleryManager = forwardRef<MediaGalleryManagerRef, MediaGalleryManagerProps>(
  function MediaGalleryManager(
    {
      mode = "popup",
      onSelect,
      allowTypes = ["image", "360", "video", "audio", "file"],
      multiple = true,
      selectedIds,
      title = "Media Gallery",
      items: initialItems,
      onUpload = defaultUpload,
      onFetch = defaultFetch,
      onDeleteSelected,
      hideUploadAndImport = false,
    },
    ref
  ) {
    const [items, setItems] = useState<MediaItem[]>(initialItems ?? []);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [activeTab, setActiveTab] = useState<MediaType | "all">("all");
    const [selected, setSelected] = useState<Set<string>>(
      () => new Set(Array.isArray(selectedIds) ? selectedIds : [])
    );
    const [showModal, setShowModal] = useState(false);
    const [importUrl, setImportUrl] = useState("");
    const [importError, setImportError] = useState("");
    const [importingUrl, setImportingUrl] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const fileInputRef = useRef<HTMLInputElement>(null);

    const loadItems = useCallback(async () => {
      if (initialItems !== undefined) return;
      setLoading(true);
      try {
        const data = await onFetch();
        setItems(data);
      } finally {
        setLoading(false);
      }
    }, [initialItems, onFetch]);

    useEffect(() => {
      if (initialItems !== undefined) {
        setItems(initialItems);
      } else {
        loadItems();
      }
    }, [initialItems, loadItems]);

    const selectedIdsKey = Array.isArray(selectedIds) ? selectedIds.join(",") : null;
    useEffect(() => {
      if (selectedIdsKey === null) return;
      setSelected(new Set(selectedIds ?? []));
    }, [selectedIdsKey]);

    useImperativeHandle(ref, () => ({
      open: () => setShowModal(true),
      close: () => setShowModal(false),
      refetch: () => loadItems(),
    }));

    useEffect(() => {
      if (!showModal) return;
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      document.body.classList.add("modal-open");
      return () => {
        document.body.style.overflow = prev;
        document.body.classList.remove("modal-open");
      };
    }, [showModal]);

    useEffect(() => {
      if (!showDeleteConfirm) return;
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      document.body.classList.add("modal-open");
      return () => {
        document.body.style.overflow = prev;
        document.body.classList.remove("modal-open");
      };
    }, [showDeleteConfirm]);

    const tabFiltered =
      activeTab === "all"
        ? items
        : items.filter((i) => i.type === activeTab);

    const searchLower = searchQuery.trim().toLowerCase();
    const filteredItems = searchLower
      ? tabFiltered.filter(
          (i) =>
            (i.filename ?? "").toLowerCase().includes(searchLower) ||
            (i.url ?? "").toLowerCase().includes(searchLower) ||
            (i.type ?? "").toLowerCase().includes(searchLower)
        )
      : tabFiltered;

    const types = MEDIA_TYPES.filter((t) => allowTypes.includes(t.key));

    const toggleSelect = (id: string) => {
      setSelected((prev) => {
        const next = new Set(prev);
        if (next.has(id)) next.delete(id);
        else if (!multiple) next.clear();
        next.add(id);
        return next;
      });
    };

    const selectAll = () => setSelected(new Set(filteredItems.map((i) => i.id)));
    const deselectAll = () => setSelected(new Set());

    const handleDeleteConfirmOpen = () => setShowDeleteConfirm(true);
    const handleDeleteConfirmClose = () => setShowDeleteConfirm(false);

    const handleDeleteSelected = async () => {
      if (selected.size === 0 || !onDeleteSelected) return;
      setShowDeleteConfirm(false);
      setDeleting(true);
      try {
        await onDeleteSelected(Array.from(selected));
        setSelected(new Set());
        await loadItems();
      } finally {
        setDeleting(false);
      }
    };

    const handleConfirm = () => {
      const selectedItems = items.filter((i) => selected.has(i.id));
      const ids = Array.isArray(selectedIds) ? selectedIds : [];
      if (ids.length > 0) {
        const orderMap = new Map(ids.map((id, idx) => [id, idx]));
        selectedItems.sort((a, b) => {
          const ai = orderMap.get(a.id) ?? 9999;
          const bi = orderMap.get(b.id) ?? 9999;
          return ai - bi;
        });
      }
      onSelect?.(selectedItems);
      setShowModal(false);
      setSelected(new Set());
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, type: MediaType) => {
      const files = e.target.files ? Array.from(e.target.files) : [];
      if (files.length === 0) return;
      setUploading(true);
      try {
        const newItems = await onUpload(files, type);
        setItems((prev) => [...newItems, ...prev]);
      } finally {
        setUploading(false);
        e.target.value = "";
      }
    };

    const triggerUpload = (type: MediaType) => {
      const config = MEDIA_TYPES.find((t) => t.key === type);
      if (!config || !fileInputRef.current) return;
      fileInputRef.current.accept = config.accept;
      fileInputRef.current.multiple = multiple;
      (fileInputRef.current as unknown as { __mediaType?: MediaType }).__mediaType = type;
      fileInputRef.current.click();
    };

    const handleInputUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const type = (e.target as unknown as { __mediaType?: MediaType }).__mediaType ?? "file";
      handleFileChange(e, type);
    };

    const handleImportFromUrl = async () => {
      const url = importUrl.trim();
      if (!url) return;
      setImportError("");
      setImportingUrl(true);
      try {
        const res = await fetch("/api/media/import-url", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url }),
        });
        const data = await res.json().catch(() => ({}));
        const item = (data as { item?: MediaItem }).item;
        if (!res.ok || !item) {
          setImportError((data as { message?: string }).message || "Import failed.");
          return;
        }
        setItems((prev) => [item, ...prev]);
        setImportUrl("");
      } catch {
        setImportError("Import failed.");
      } finally {
        setImportingUrl(false);
      }
    };

    const handlePaste = useCallback(
      async (e: ClipboardEvent) => {
        const items = e.clipboardData?.items;
        if (!items?.length) return;
        const files: File[] = [];
        for (const item of items) {
          if (item.kind === "file") {
            const file = item.getAsFile();
            if (file) files.push(file);
          }
        }
        if (files.length === 0) return;
        e.preventDefault();
        setUploading(true);
        try {
          const type: MediaType = activeTab === "all" ? "image" : activeTab;
          const newItems = await onUpload(files, type);
          setItems((prev) => [...newItems, ...prev]);
        } finally {
          setUploading(false);
        }
      },
      [activeTab, onUpload]
    );

    useEffect(() => {
      const isActive =
        (mode === "popup" ? showModal : true) && !(mode === "inline" && hideUploadAndImport);
      if (!isActive) return;
      window.addEventListener("paste", handlePaste);
      return () => window.removeEventListener("paste", handlePaste);
    }, [mode, showModal, hideUploadAndImport, handlePaste]);

    const content = (
      <div className="media-gallery-manager">
        {/* Tabs */}
        <ul className="nav nav-tabs mb-3 flex-nowrap overflow-auto">
          <li className="nav-item">
            <button
              type="button"
              className={`nav-link ${activeTab === "all" ? "active" : ""}`}
              onClick={() => setActiveTab("all")}
            >
              All
            </button>
          </li>
          {types.map((t) => (
            <li key={t.key} className="nav-item">
              <button
                type="button"
                className={`nav-link ${activeTab === t.key ? "active" : ""}`}
                onClick={() => setActiveTab(t.key)}
              >
                <i className={`fa-solid ${t.icon} me-1`} />
                {t.label}
              </button>
            </li>
          ))}
        </ul>

        {/* Search */}
        <div className="media-gallery-search mb-3">
          <div className="position-relative">
            <i className="fa-solid fa-search media-gallery-search-icon" aria-hidden />
            <input
              type="search"
              className="form-control"
              placeholder="Search by filename, URL, or type..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search media"
            />
            {searchQuery && (
              <button
                type="button"
                className="btn btn-link media-gallery-search-clear"
                onClick={() => setSearchQuery("")}
                aria-label="Clear search"
              >
                <i className="fa-solid fa-times" />
              </button>
            )}
          </div>
        </div>

        {!hideUploadAndImport && (
          <>
            {/* Upload zone - match dashboard media-upload-zone */}
            <div
              className="media-upload-zone mb-3"
              onClick={() => triggerUpload(activeTab === "all" ? "image" : activeTab)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && triggerUpload(activeTab === "all" ? "image" : activeTab)}
            >
              <input
                ref={fileInputRef}
                type="file"
                className="d-none"
                multiple
                onChange={handleInputUpload}
              />
              {uploading ? (
                <span className="upload-hint">Uploading…</span>
              ) : (
                <>
                  <div className="upload-icon">
                    <i className="fa-solid fa-cloud-upload-alt" />
                  </div>
                  <h6 className="fw-medium mb-2">Drag & drop files here or click to upload</h6>
                  <p className="upload-hint mb-0">
                    {activeTab === "all" ? "Images, 360°, video, audio, or any file" : `${types.find((t) => t.key === activeTab)?.label ?? activeTab} files`}
                  </p>
                  <p className="upload-hint small mt-2 mb-0">Paste (Ctrl+V / ⌘V) to add from clipboard</p>
                </>
              )}
            </div>

            {/* Import from URL */}
            <div className="media-url-import mb-3">
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
              {importError && (
                <p className="small text-danger mb-0 mt-1">{importError}</p>
              )}
            </div>
          </>
        )}

        {/* Select all / Deselect all / Delete selected - inline mode */}
        {mode === "inline" && (multiple || onDeleteSelected) && (
          <div className="d-flex flex-wrap align-items-center gap-2 mb-3">
            {multiple && (
              <>
                <button
                  type="button"
                  className="btn btn-outline-secondary btn-sm"
                  onClick={selectAll}
                  disabled={filteredItems.length === 0}
                >
                  Select all
                </button>
                <button
                  type="button"
                  className="btn btn-outline-secondary btn-sm"
                  onClick={deselectAll}
                  disabled={selected.size === 0}
                >
                  Deselect all
                </button>
              </>
            )}
            {onDeleteSelected && selected.size > 0 && (
              <button
                type="button"
                className="btn btn-danger btn-sm"
                onClick={handleDeleteConfirmOpen}
                disabled={deleting}
              >
                {deleting ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true" />
                    Deleting…
                  </>
                ) : (
                  <>
                    <i className="fa-solid fa-trash me-1" />
                    Delete selected ({selected.size})
                  </>
                )}
              </button>
            )}
          </div>
        )}

        {/* Grid - match dashboard media-preview-item */}
        {loading ? (
          <div className="media-empty-state">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading…</span>
            </div>
            <p className="mb-0 mt-2">Loading media…</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="media-empty-state">
            <div className="icon">
              <i className="fa-solid fa-folder-open" />
            </div>
            <p className="mb-0">
              {searchLower
                ? "No media match your search. Try a different term or clear the search."
                : hideUploadAndImport
                  ? "No media yet. Click Add assets to upload."
                  : "No media yet. Upload files above."}
            </p>
          </div>
        ) : (
          <div className="media-preview-grid">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className={`media-preview-item ${selected.has(item.id) ? "selected" : ""}`}
                onClick={() => toggleSelect(item.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === "Enter" && toggleSelect(item.id)}
              >
                {item.type === "image" || item.type === "360" ? (
                  <img
                    src={getMediaUrl(item.url)}
                    alt={item.filename ?? ""}
                    className="media-thumb"
                  />
                ) : item.type === "video" ? (
                  <video
                    src={getMediaUrl(item.url)}
                    className="media-thumb"
                    muted
                    playsInline
                    preload="metadata"
                  />
                ) : item.type === "audio" ? (
                  <div className="w-100 h-100 d-flex align-items-center justify-content-center bg-light">
                    <i className="fa-solid fa-music fa-3x text-secondary" />
                  </div>
                ) : (
                  <div className="w-100 h-100 d-flex align-items-center justify-content-center bg-light">
                    <i className="fa-solid fa-file fa-3x text-secondary" />
                  </div>
                )}
                <span className="media-type-badge">{item.type}</span>
                {selected.has(item.id) && (
                  <span className="media-check">
                    <i className="fa-solid fa-circle-check" />
                  </span>
                )}
                <span className="media-filename" title={item.filename}>
                  {item.filename ?? item.url}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    );

    const deleteConfirmModalEl = showDeleteConfirm ? (
      <div
        className="modal fade show d-block"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 1056,
          background: "rgba(0,0,0,0.5)",
        }}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="media-delete-confirm-title"
      >
        <div className="modal-dialog modal-dialog-centered modal-sm">
          <div className="modal-content media-gallery-manager">
            <div className="modal-header">
              <h5 className="modal-title fs-17 fw-semi-bold mb-0" id="media-delete-confirm-title">
                Delete media?
              </h5>
              <button
                type="button"
                className="btn-close"
                aria-label="Close"
                onClick={handleDeleteConfirmClose}
              />
            </div>
            <div className="modal-body">
              <p className="mb-0 text-muted">
                Delete {selected.size} item{selected.size !== 1 ? "s" : ""}? This action cannot be undone.
              </p>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={handleDeleteConfirmClose}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-danger"
                onClick={handleDeleteSelected}
                disabled={deleting}
              >
                {deleting ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true" />
                    Deleting…
                  </>
                ) : (
                  <>
                    <i className="fa-solid fa-trash me-1" />
                    Delete
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    ) : null;

    if (mode === "inline") {
      return (
        <>
          <div className="media-gallery-manager-inline">
            {content}
            {onSelect && multiple && selected.size > 0 && (
              <div className="mt-3">
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={() => onSelect(items.filter((i) => selected.has(i.id)))}
                >
                  Use selected ({selected.size})
                </button>
              </div>
            )}
          </div>
          {typeof document !== "undefined" && deleteConfirmModalEl && createPortal(deleteConfirmModalEl, document.body)}
        </>
      );
    }

    const modalEl = (
      <div
        className={`modal fade ${showModal ? "show d-block" : ""}`}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 1055,
          background: showModal ? "rgba(0,0,0,0.5)" : undefined,
        }}
        tabIndex={-1}
        aria-hidden={!showModal}
      >
        <div className="modal-dialog modal-xl modal-dialog-scrollable modal-dialog-centered">
          <div className="modal-content media-gallery-manager">
            <div className="modal-header">
              <h5 className="modal-title fs-17 fw-semi-bold mb-0">{title}</h5>
              <button
                type="button"
                className="btn-close"
                aria-label="Close"
                onClick={() => setShowModal(false)}
              />
            </div>
            <div className="modal-body">{content}</div>
            <div className="modal-footer">
              <button type="button" className="btn btn-outline-secondary" onClick={() => setShowModal(false)}>
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleConfirm}
                disabled={selected.size === 0}
              >
                {multiple ? `Use selected (${selected.size})` : "Use selected"}
              </button>
            </div>
          </div>
        </div>
      </div>
    );

    return (
      <>
        {typeof document !== "undefined" && showModal
          ? createPortal(modalEl, document.body)
          : null}
        {typeof document !== "undefined" && deleteConfirmModalEl && createPortal(deleteConfirmModalEl, document.body)}
      </>
    );
  }
);

export default MediaGalleryManager;
export type { MediaGalleryManagerProps, MediaGalleryManagerRef, MediaItem, MediaType };
