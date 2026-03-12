"use client";

import { useEffect } from "react";
import type { AddListingFormState } from "../types";
import { DAYS } from "../types";

export default function Step7Settings({
  form,
  update,
  isAdmin = false,
}: {
  form: AddListingFormState;
  update: (u: Partial<AddListingFormState>) => void;
  isAdmin?: boolean;
}) {
  useEffect(() => {
    if (isAdmin && form.status === "pending") update({ status: "published" });
  }, [isAdmin]);

  const setHours = (index: number, field: "openTime" | "closeTime" | "isClosed", value: string | boolean) => {
    const next = [...form.openingHours];
    next[index] = { ...next[index], [field]: value };
    update({ openingHours: next });
  };

  return (
    <>
      <div className="card mb-4">
        <div className="card-header position-relative">
          <h6 className="fs-17 fw-semi-bold mb-0">
            <i className="fas fa-flag me-2 text-primary" />
            Status
          </h6>
          <p className="text-muted mb-0 mt-2">Draft is not visible; Pending awaits approval; Published is visible to all.</p>
        </div>
        <div className="card-body">
          <div className="row g-4">
            <div className="col-md-4">
              <div className="form-group-enhanced">
                <label className="form-label">Listing status</label>
                <select
                  className="form-select"
                  value={form.status}
                  onChange={(e) => {
                    const v = e.target.value;
                    update({ status: v === "published" ? "published" : v === "pending" ? "pending" : "draft" });
                  }}
                >
                  <option value="draft">Draft</option>
                  {!isAdmin && <option value="pending">Pending approval</option>}
                  <option value="published">Published</option>
                </select>
                {isAdmin && (
                  <div className="form-text small">As admin, your listing is published directly (no review).</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="card mb-4">
        <div className="card-header position-relative">
          <h6 className="fs-17 fw-semi-bold mb-0">
            <i className="fas fa-clock me-2 text-primary" />
            Opening Hours
          </h6>
          <p className="text-muted mb-0 mt-2">Set your business hours (optional)</p>
        </div>
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-sm">
              <thead>
                <tr>
                  <th>Day</th>
                  <th>Open</th>
                  <th>Close</th>
                  <th>Closed</th>
                </tr>
              </thead>
              <tbody>
                {DAYS.map((day, i) => (
                  <tr key={day}>
                    <td className="fw-medium">{day}</td>
                    <td>
                      <input
                        type="time"
                        className="form-control form-control-sm"
                        value={form.openingHours[i]?.openTime ?? "09:00"}
                        onChange={(e) => setHours(i, "openTime", e.target.value)}
                        disabled={form.openingHours[i]?.isClosed}
                      />
                    </td>
                    <td>
                      <input
                        type="time"
                        className="form-control form-control-sm"
                        value={form.openingHours[i]?.closeTime ?? "18:00"}
                        onChange={(e) => setHours(i, "closeTime", e.target.value)}
                        disabled={form.openingHours[i]?.isClosed}
                      />
                    </td>
                    <td>
                      <div className="form-check">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          checked={form.openingHours[i]?.isClosed ?? false}
                          onChange={(e) => setHours(i, "isClosed", e.target.checked)}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="card mb-4">
        <div className="card-header position-relative">
          <h6 className="fs-17 fw-semi-bold mb-0">
            <i className="fas fa-magnifying-glass me-2 text-primary" />
            SEO
          </h6>
          <p className="text-muted mb-0 mt-2">Meta title, description and social sharing (optional)</p>
        </div>
        <div className="card-body">
          <div className="row g-4">
            <div className="col-12">
              <div className="form-group-enhanced">
                <label className="form-label">Meta title</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Place Name | Site Name"
                  value={form.seo.metaTitle}
                  onChange={(e) =>
                    update({ seo: { ...form.seo, metaTitle: e.target.value } })
                  }
                />
              </div>
            </div>
            <div className="col-12">
              <div className="form-group-enhanced">
                <label className="form-label">Meta description</label>
                <textarea
                  className="form-control"
                  rows={2}
                  placeholder="Short description for search results"
                  value={form.seo.metaDescription}
                  onChange={(e) =>
                    update({ seo: { ...form.seo, metaDescription: e.target.value } })
                  }
                />
              </div>
            </div>
            <div className="col-md-6">
              <div className="form-group-enhanced">
                <label className="form-label">Meta keywords (comma-separated)</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="keyword1, keyword2"
                  value={form.seo.metaKeywords}
                  onChange={(e) =>
                    update({ seo: { ...form.seo, metaKeywords: e.target.value } })
                  }
                />
              </div>
            </div>
            <div className="col-md-6">
              <div className="form-group-enhanced">
                <label className="form-label">OG image URL</label>
                <input
                  type="url"
                  className="form-control"
                  placeholder="https://... for social sharing"
                  value={form.seo.ogImage}
                  onChange={(e) =>
                    update({ seo: { ...form.seo, ogImage: e.target.value } })
                  }
                />
                <div className="form-text">Image used when sharing on social networks</div>
              </div>
            </div>
            <div className="col-12">
              <div className="form-check">
                <input
                  type="checkbox"
                  className="form-check-input"
                  id="listing-seo-noindex"
                  checked={form.seo.noIndex}
                  onChange={(e) =>
                    update({ seo: { ...form.seo, noIndex: e.target.checked } })
                  }
                />
                <label className="form-check-label" htmlFor="listing-seo-noindex">
                  No index (ask search engines not to index this listing)
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
