"use client";

import { useState, useEffect, useRef } from "react";
import { MediaGalleryManager, type MediaGalleryManagerRef } from "@/components/MediaGalleryManager";
import { apiClient } from "@/lib/apiClient";
import {
  SettingsFormState,
  INITIAL_SETTINGS,
  LANGUAGES,
  TIME_ZONES,
  ADMIN_ALIGN,
} from "./types";

const LABEL_CLASS =
  "col-sm-4 col-md-12 col-lg-3 text-start text-sm-end text-md-start text-lg-end col-form-label fw-medium fs-14";
const INPUT_WRAP_CLASS = "col-sm-8 col-md-12 col-lg-9 col-xl-7";

function MediaPickerField({
  label,
  hint,
  mediaId,
  mediaUrl,
  onOpen,
}: {
  label: string;
  hint: string;
  mediaId: string;
  mediaUrl: string;
  onOpen: () => void;
}) {
  return (
    <div className="mb-3 row">
      <label className={LABEL_CLASS}>{label}</label>
      <div className={INPUT_WRAP_CLASS}>
        <div className="d-flex align-items-center gap-2 flex-wrap">
          <button type="button" className="btn btn-outline-primary btn-sm" onClick={onOpen}>
            <i className="fa-solid fa-images me-1" />
            Choose from library
          </button>
          {mediaId && (
            <span className="small text-muted">
              {mediaUrl ? (
                <span className="d-inline-flex align-items-center gap-1">
                  <img src={mediaUrl} alt="" width={32} height={32} className="rounded" style={{ objectFit: "cover" }} />
                  Selected
                </span>
              ) : (
                "Selected"
              )}
            </span>
          )}
        </div>
        <div className="mt-1 text-primary small">{hint}</div>
      </div>
    </div>
  );
}

export default function SettingsForm() {
  const [form, setForm] = useState<SettingsFormState>(INITIAL_SETTINGS);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const faviconRef = useRef<MediaGalleryManagerRef | null>(null);
  const dashboardLogoRef = useRef<MediaGalleryManagerRef | null>(null);
  const websiteLogoRef = useRef<MediaGalleryManagerRef | null>(null);
  const headerBgRef = useRef<MediaGalleryManagerRef | null>(null);
  const footerBgRef = useRef<MediaGalleryManagerRef | null>(null);

  useEffect(() => {
    apiClient
      .get<{ success?: boolean; data?: Record<string, string> }>("/api/settings")
      .then((res) => {
        const json = res.data;
        if (json?.success && json?.data) {
          setForm((prev) => ({ ...prev, ...json.data }));
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const update = (field: keyof SettingsFormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setMessage(null);
  };

  const handleReset = () => {
    setForm(INITIAL_SETTINGS);
    setMessage({ type: "success", text: "Form reset to default values." });
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const res = await apiClient.put<{ message?: string }>("/api/settings", form);
      setMessage({ type: "success", text: res.data?.message || "Settings saved." });
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setMessage({ type: "error", text: msg || "Failed to save settings." });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="card">
        <div className="card-body text-center py-5">
          <div className="spinner-border text-primary" role="status" />
          <p className="mt-2 mb-0 text-muted">Loading settings…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="card-header position-relative">
        <h6 className="fs-17 fw-semi-bold mb-0">Application Setting</h6>
      </div>
      <div className="card-body">
        {message && (
          <div
            className={`alert py-2 mb-3 ${message.type === "success" ? "alert-success" : "alert-danger"}`}
            role="alert"
          >
            {message.text}
          </div>
        )}
        <div className="row">
          <div className="col-xl-10 col-xxl-8">
            <div className="mb-3 row">
              <label htmlFor="applicationTitle" className={`${LABEL_CLASS} required`}>
                Application Title
              </label>
              <div className={INPUT_WRAP_CLASS}>
                <input
                  type="text"
                  className="form-control"
                  id="applicationTitle"
                  value={form.applicationTitle}
                  onChange={(e) => update("applicationTitle", e.target.value)}
                />
              </div>
            </div>
            <div className="mb-3 row">
              <label htmlFor="address" className={LABEL_CLASS}>
                Address
              </label>
              <div className={INPUT_WRAP_CLASS}>
                <textarea
                  className="form-control"
                  id="address"
                  rows={3}
                  value={form.address}
                  onChange={(e) => update("address", e.target.value)}
                />
              </div>
            </div>
            <div className="mb-3 row">
              <label htmlFor="emailAddress" className={LABEL_CLASS}>
                Email Address
              </label>
              <div className={INPUT_WRAP_CLASS}>
                <input
                  type="email"
                  className="form-control"
                  id="emailAddress"
                  value={form.emailAddress}
                  onChange={(e) => update("emailAddress", e.target.value)}
                />
              </div>
            </div>
            <div className="mb-3 row">
              <label htmlFor="phone" className={LABEL_CLASS}>
                Phone Number
              </label>
              <div className={INPUT_WRAP_CLASS}>
                <input
                  type="tel"
                  className="form-control"
                  id="phone"
                  value={form.phone}
                  onChange={(e) => update("phone", e.target.value)}
                />
              </div>
            </div>
            <MediaPickerField
              label="Favicon"
              hint="Recommended 32×32 px (jpg, jpeg, png, gif, ico)."
              mediaId={form.faviconMediaId}
              mediaUrl={form.faviconMediaUrl}
              onOpen={() => faviconRef.current?.open()}
            />
            <MediaPickerField
              label="Dashboard Logo"
              hint="Recommended 184×42 px (jpg, jpeg, png, gif, ico)."
              mediaId={form.dashboardLogoMediaId}
              mediaUrl={form.dashboardLogoMediaUrl}
              onOpen={() => dashboardLogoRef.current?.open()}
            />
            <MediaPickerField
              label="Website Logo"
              hint="Recommended 163×50 px (jpg, jpeg, png, gif, ico)."
              mediaId={form.websiteLogoMediaId}
              mediaUrl={form.websiteLogoMediaUrl}
              onOpen={() => websiteLogoRef.current?.open()}
            />
            <MediaPickerField
              label="Header Background Image"
              hint="Recommended 1968×462 px (jpg, png)."
              mediaId={form.headerBgMediaId}
              mediaUrl={form.headerBgMediaUrl}
              onOpen={() => headerBgRef.current?.open()}
            />
            <MediaPickerField
              label="Footer Background Image"
              hint="Recommended 1968×462 px (jpg, png)."
              mediaId={form.footerBgMediaId}
              mediaUrl={form.footerBgMediaUrl}
              onOpen={() => footerBgRef.current?.open()}
            />
            <div className="mb-3 row">
              <label htmlFor="language" className={LABEL_CLASS}>
                Language
              </label>
              <div className={INPUT_WRAP_CLASS}>
                <select
                  className="form-select"
                  id="language"
                  value={form.language}
                  onChange={(e) => update("language", e.target.value)}
                >
                  {LANGUAGES.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="mb-3 row">
              <label htmlFor="timeZone" className={`${LABEL_CLASS} required`}>
                Time Zone
              </label>
              <div className={INPUT_WRAP_CLASS}>
                <select
                  className="form-select"
                  id="timeZone"
                  value={form.timeZone}
                  onChange={(e) => update("timeZone", e.target.value)}
                >
                  {TIME_ZONES.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="mb-3 row">
              <label htmlFor="adminAlign" className={LABEL_CLASS}>
                Admin Align
              </label>
              <div className={INPUT_WRAP_CLASS}>
                <select
                  className="form-select"
                  id="adminAlign"
                  value={form.adminAlign}
                  onChange={(e) => update("adminAlign", e.target.value)}
                >
                  {ADMIN_ALIGN.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="mb-3 row">
              <label htmlFor="officeTime" className={LABEL_CLASS}>
                Office Time
              </label>
              <div className={INPUT_WRAP_CLASS}>
                <textarea
                  className="form-control"
                  id="officeTime"
                  rows={3}
                  value={form.officeTime}
                  onChange={(e) => update("officeTime", e.target.value)}
                />
              </div>
            </div>
            <div className="mb-3 row">
              <label htmlFor="location" className={LABEL_CLASS}>
                Latitude, Longitude
              </label>
              <div className={INPUT_WRAP_CLASS}>
                <input
                  type="text"
                  className="form-control"
                  id="location"
                  placeholder="e.g. 27.7172, 85.3240"
                  value={form.latitudeLongitude}
                  onChange={(e) => update("latitudeLongitude", e.target.value)}
                />
              </div>
            </div>
            <div className="mb-3 row">
              <label htmlFor="footer" className={LABEL_CLASS}>
                Footer Text
              </label>
              <div className={INPUT_WRAP_CLASS}>
                <input
                  type="text"
                  className="form-control"
                  id="footer"
                  value={form.footerText}
                  onChange={(e) => update("footerText", e.target.value)}
                />
              </div>
            </div>
            <div className="row mt-4">
              <div className="col-12 text-center">
                <button
                  type="button"
                  className="btn btn-outline-secondary fw-semi-bold"
                  onClick={handleReset}
                >
                  Reset
                </button>
                <button
                  type="button"
                  className="btn btn-primary fw-semi-bold ms-2"
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving ? "Saving…" : "Save"}
                </button>
              </div>
            </div>
          </div>
        </div>
        <MediaGalleryManager
          ref={faviconRef}
          mode="popup"
          title="Select favicon"
          allowTypes={["image"]}
          multiple={false}
          selectedIds={form.faviconMediaId ? [form.faviconMediaId] : []}
          onSelect={(items) =>
            setForm((f) => ({
              ...f,
              faviconMediaId: items[0]?.id ?? "",
              faviconMediaUrl: items[0]?.url ?? "",
            }))
          }
        />
        <MediaGalleryManager
          ref={dashboardLogoRef}
          mode="popup"
          title="Select dashboard logo"
          allowTypes={["image", "360"]}
          multiple={false}
          selectedIds={form.dashboardLogoMediaId ? [form.dashboardLogoMediaId] : []}
          onSelect={(items) =>
            setForm((f) => ({
              ...f,
              dashboardLogoMediaId: items[0]?.id ?? "",
              dashboardLogoMediaUrl: items[0]?.url ?? "",
            }))
          }
        />
        <MediaGalleryManager
          ref={websiteLogoRef}
          mode="popup"
          title="Select website logo"
          allowTypes={["image", "360"]}
          multiple={false}
          selectedIds={form.websiteLogoMediaId ? [form.websiteLogoMediaId] : []}
          onSelect={(items) =>
            setForm((f) => ({
              ...f,
              websiteLogoMediaId: items[0]?.id ?? "",
              websiteLogoMediaUrl: items[0]?.url ?? "",
            }))
          }
        />
        <MediaGalleryManager
          ref={headerBgRef}
          mode="popup"
          title="Select header background image"
          allowTypes={["image"]}
          multiple={false}
          selectedIds={form.headerBgMediaId ? [form.headerBgMediaId] : []}
          onSelect={(items) =>
            setForm((f) => ({
              ...f,
              headerBgMediaId: items[0]?.id ?? "",
              headerBgMediaUrl: items[0]?.url ?? "",
            }))
          }
        />
        <MediaGalleryManager
          ref={footerBgRef}
          mode="popup"
          title="Select footer background image"
          allowTypes={["image"]}
          multiple={false}
          selectedIds={form.footerBgMediaId ? [form.footerBgMediaId] : []}
          onSelect={(items) =>
            setForm((f) => ({
              ...f,
              footerBgMediaId: items[0]?.id ?? "",
              footerBgMediaUrl: items[0]?.url ?? "",
            }))
          }
        />
      </div>
    </div>
  );
}
