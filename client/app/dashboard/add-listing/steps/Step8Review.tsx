"use client";

import type { AddListingFormState } from "../types";
import { CATEGORIES } from "../types";

export default function Step8Review({
  form,
  update,
  isAdmin = false,
}: {
  form: AddListingFormState;
  update: (u: Partial<AddListingFormState>) => void;
  isAdmin?: boolean;
}) {
  const categoryName = CATEGORIES.find((c) => c.id === form.category)?.name ?? form.category;

  return (
    <>
      <div className="card mb-4">
        <div className="card-header position-relative">
          <h6 className="fs-17 fw-semi-bold mb-0">
            <i className="fas fa-eye me-2 text-primary" />
            Review your listing
          </h6>
        </div>
        <div className="card-body">
          <dl className="row mb-0">
            <dt className="col-sm-3 text-muted">Category</dt>
            <dd className="col-sm-9">{categoryName}</dd>
            <dt className="col-sm-3 text-muted">Title</dt>
            <dd className="col-sm-9">{form.title || "—"}</dd>
            <dt className="col-sm-3 text-muted">Location</dt>
            <dd className="col-sm-9">{[form.address, form.city, form.state, form.country].filter(Boolean).join(", ") || "—"}</dd>
            <dt className="col-sm-3 text-muted">Contact</dt>
            <dd className="col-sm-9">{[form.phone, form.email, form.website].filter(Boolean).join(" · ") || "—"}</dd>
            <dt className="col-sm-3 text-muted">Media</dt>
            <dd className="col-sm-9">{form.mediaIds.length + form.videoIds.length} item(s)</dd>
          </dl>
        </div>
      </div>

      <div className="card mb-4">
        <div className="card-header position-relative">
          <h6 className="fs-17 fw-semi-bold mb-0">
            <i className="fas fa-file-contract me-2 text-primary" />
            Terms and Conditions
          </h6>
        </div>
        <div className="card-body">
          <div className="form-check mb-3">
            <input
              type="checkbox"
              className="form-check-input"
              id="agree_terms"
              checked={form.agreeTerms}
              onChange={(e) => update({ agreeTerms: e.target.checked })}
              required
            />
            <label className="form-check-label" htmlFor="agree_terms">
              I agree to the Terms of Service and Privacy Policy
            </label>
          </div>
          <div className="form-check mb-3">
            <input
              type="checkbox"
              className="form-check-input"
              id="agree_listing"
              checked={form.agreeListingPolicy}
              onChange={(e) => update({ agreeListingPolicy: e.target.checked })}
              required
            />
            <label className="form-check-label" htmlFor="agree_listing">
              {isAdmin
                ? "I agree to the Listing Guidelines. As admin, my listing will be published directly."
                : "I agree to the Listing Guidelines and understand that my listing will be reviewed before publication"}
            </label>
          </div>
          <div className="form-check mb-3">
            <input
              type="checkbox"
              className="form-check-input"
              id="agree_accuracy"
              checked={form.agreeAccuracy}
              onChange={(e) => update({ agreeAccuracy: e.target.checked })}
              required
            />
            <label className="form-check-label" htmlFor="agree_accuracy">
              I confirm that all information provided is accurate and up-to-date
            </label>
          </div>
          <div className="form-check">
            <input
              type="checkbox"
              className="form-check-input"
              id="agree_marketing"
              checked={form.agreeMarketing}
              onChange={(e) => update({ agreeMarketing: e.target.checked })}
            />
            <label className="form-check-label" htmlFor="agree_marketing">
              I agree to receive marketing communications (optional)
            </label>
          </div>
        </div>
      </div>
    </>
  );
}
