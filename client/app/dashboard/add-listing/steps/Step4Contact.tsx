"use client";

import type { AddListingFormState } from "../types";

export default function Step4Contact({
  form,
  update,
}: {
  form: AddListingFormState;
  update: (u: Partial<AddListingFormState>) => void;
}) {
  return (
    <div className="card mb-4">
      <div className="card-header position-relative">
        <h6 className="fs-17 fw-semi-bold mb-0">
          <i className="fas fa-phone me-2 text-primary" />
          Contact Information
        </h6>
      </div>
      <div className="card-body">
        <div className="row g-4">
          <div className="col-sm-4">
            <div>
              <label className="fw-medium mb-2">Phone Number</label>
              <input
                type="tel"
                className="form-control"
                placeholder="+1 (555) 123-4567"
                value={form.phone}
                onChange={(e) => update({ phone: e.target.value })}
              />
            </div>
          </div>
          <div className="col-sm-4">
            <div>
              <label className="fw-medium mb-2">Email Address</label>
              <input
                type="email"
                className="form-control"
                placeholder="contact@example.com"
                value={form.email}
                onChange={(e) => update({ email: e.target.value })}
              />
            </div>
          </div>
          <div className="col-sm-4">
            <div>
              <label className="fw-medium mb-2">Website URL</label>
              <input
                type="url"
                className="form-control"
                placeholder="https://www.example.com"
                value={form.website}
                onChange={(e) => update({ website: e.target.value })}
              />
            </div>
          </div>
          <div className="col-sm-12">
            <hr />
            <h6 className="fw-medium text-dark mb-3">Social Media Links <span className="fs-13 ms-1 text-muted">(optional)</span></h6>
          </div>
          <div className="col-sm-6">
            <div>
              <label className="fw-medium mb-2">Facebook Page</label>
              <input
                type="url"
                className="form-control"
                placeholder="https://facebook.com/yourpage"
                value={form.facebook}
                onChange={(e) => update({ facebook: e.target.value })}
              />
            </div>
          </div>
          <div className="col-sm-6">
            <div>
              <label className="fw-medium mb-2">Instagram Profile</label>
              <input
                type="url"
                className="form-control"
                placeholder="https://instagram.com/yourprofile"
                value={form.instagram}
                onChange={(e) => update({ instagram: e.target.value })}
              />
            </div>
          </div>
          <div className="col-sm-6">
            <div>
              <label className="fw-medium mb-2">Twitter Profile</label>
              <input
                type="url"
                className="form-control"
                placeholder="https://twitter.com/yourprofile"
                value={form.twitter}
                onChange={(e) => update({ twitter: e.target.value })}
              />
            </div>
          </div>
          <div className="col-sm-6">
            <div>
              <label className="fw-medium mb-2">LinkedIn Page</label>
              <input
                type="url"
                className="form-control"
                placeholder="https://linkedin.com/company/yourcompany"
                value={form.linkedin}
                onChange={(e) => update({ linkedin: e.target.value })}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
