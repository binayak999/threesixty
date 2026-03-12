export type MediaType = "image" | "360" | "video" | "audio" | "file";

export interface MediaItem {
  id: string;
  /** Original / full quality URL */
  url: string;
  /** Medium quality variant (compressed) */
  urlMedium?: string;
  /** Low quality variant (compressed) */
  urlLow?: string;
  type: MediaType;
  filename?: string;
  mimeType?: string;
  size?: number;
  sizeMedium?: number;
  sizeLow?: number;
  createdAt?: string;
}

export interface MediaGalleryManagerProps {
  /** "popup" = render inside a modal; "inline" = render in place */
  mode?: "popup" | "inline";
  /** Called when user confirms selection (popup) or selects items (inline) */
  onSelect?: (items: MediaItem[]) => void;
  /** Types to show; default all */
  allowTypes?: MediaType[];
  /** Allow multiple selection */
  multiple?: boolean;
  /** Pre-selected item ids (controlled) */
  selectedIds?: string[];
  /** Title when in popup */
  title?: string;
  /** Optional initial items (e.g. from API); if not provided, fetches from API */
  items?: MediaItem[];
  /** Optional upload handler; if not provided, uses default API upload */
  onUpload?: (files: File[], type: MediaType) => Promise<MediaItem[]>;
  /** Optional fetch handler; if not provided, uses default API */
  onFetch?: () => Promise<MediaItem[]>;
  /** When set, shows "Select all", "Deselect all", and "Delete selected" in inline mode */
  onDeleteSelected?: (ids: string[]) => Promise<void>;
  /** When true (e.g. inline mode), hide upload zone and import-from-URL; use a separate "Add assets" popup */
  hideUploadAndImport?: boolean;
}

export interface MediaGalleryManagerRef {
  open: () => void;
  close: () => void;
  /** Refetch items (e.g. after bulk delete). No-op when items are controlled via props. */
  refetch: () => Promise<void>;
}
