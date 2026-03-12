"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import type { AddListingFormState } from "../types";

interface CategoryOption {
  _id: string;
  name: string;
  slug: string;
  parent?: string | null;
}

export default function Step2BasicInfo({
  form,
  update,
}: {
  form: AddListingFormState;
  update: (u: Partial<AddListingFormState>) => void;
}) {
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [subcategoryOpen, setSubcategoryOpen] = useState(false);
  const subcategoryRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/categories?type=listing")
      .then((res) => res.json())
      .then((json) => {
        if (json?.data && Array.isArray(json.data)) setCategories(json.data);
      })
      .catch(() => {});
  }, []);

  const parentCategories = useMemo(
    () => categories.filter((c) => !c.parent),
    [categories]
  );
  const selectedParent = useMemo(
    () => parentCategories.find((c) => c.slug === form.category),
    [parentCategories, form.category]
  );
  const subcategoryOptions = useMemo(() => {
    if (!selectedParent) return [] as { slug: string; name: string }[];
    return categories
      .filter((c) => c.parent && String(c.parent) === String(selectedParent._id))
      .map((c) => ({ slug: c.slug, name: c.name }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [categories, selectedParent]);

  const selectedSubcategoryName = useMemo(
    () => subcategoryOptions.find((o) => o.slug === form.subcategory)?.name ?? "",
    [subcategoryOptions, form.subcategory]
  );

  const query = form.subcategory.trim().toLowerCase();
  const filtered = query
    ? subcategoryOptions.filter(
        (o) =>
          o.name.toLowerCase().includes(query) || o.slug.toLowerCase().includes(query)
      )
    : subcategoryOptions;

  useEffect(() => {
    if (!selectedParent || !form.subcategory) return;
    const valid = subcategoryOptions.some(
      (o) => o.slug === form.subcategory.trim() || o.name.toLowerCase() === form.subcategory.trim().toLowerCase()
    );
    if (!valid) update({ subcategory: "" });
  }, [selectedParent?._id]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (subcategoryRef.current && !subcategoryRef.current.contains(e.target as Node)) {
        setSubcategoryOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="card mb-4">
      <div className="card-header position-relative">
        <h6 className="fs-17 fw-semi-bold mb-0">
          <i className="fas fa-info-circle me-2 text-primary" />
          Basic Information
        </h6>
      </div>
      <div className="card-body">
        <div className="row g-4">
          <div className="col-sm-8">
            <div className="form-group-enhanced">
              <label className="form-label required">Place Name/Title</label>
              <input
                type="text"
                className="form-control"
                placeholder="Enter the name of your place"
                value={form.title}
                onChange={(e) => update({ title: e.target.value })}
                required
              />
              <div className="form-text">This will be the main title displayed in search results</div>
            </div>
          </div>
          <div className="col-sm-4">
            <div className="form-group-enhanced" ref={subcategoryRef}>
              <label className="form-label required">Sub-Category</label>
              {!form.category ? (
                <p className="form-control-plaintext text-muted small mb-0">
                  Select a category in Step 1 first.
                </p>
              ) : subcategoryOptions.length === 0 ? (
                <p className="form-control-plaintext text-muted small mb-0">
                  No subcategories for this category. You can add subcategories in Dashboard → Categories.
                </p>
              ) : (
                <>
                  <div className="position-relative">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Search or select..."
                      value={selectedSubcategoryName || form.subcategory}
                      onChange={(e) => {
                        const val = e.target.value;
                        update({ subcategory: val });
                        setSubcategoryOpen(true);
                      }}
                      onFocus={() => setSubcategoryOpen(true)}
                      onKeyDown={(e) => {
                        if (e.key === "Escape") setSubcategoryOpen(false);
                      }}
                      autoComplete="off"
                    />
                    <button
                      type="button"
                      className="btn btn-link position-absolute end-0 top-50 translate-middle-y text-secondary text-decoration-none py-0 pe-2"
                      style={{ fontSize: "0.8rem" }}
                      onClick={() => setSubcategoryOpen((o) => !o)}
                      aria-label="Toggle dropdown"
                    >
                      <i className={`fas fa-chevron-${subcategoryOpen ? "up" : "down"}`} />
                    </button>
                    {subcategoryOpen && (
                      <ul
                        className="list-group position-absolute w-100 shadow-sm border rounded mt-1 overflow-auto"
                        style={{ maxHeight: 220, zIndex: 1050 }}
                      >
                        {filtered.length === 0 ? (
                          <li className="list-group-item text-muted small">No matches in subcategories.</li>
                        ) : (
                          filtered.map((opt) => (
                            <li
                              key={opt.slug}
                              role="option"
                              className={`list-group-item list-group-item-action ${form.subcategory === opt.slug ? "active" : ""}`}
                              style={{ cursor: "pointer" }}
                              onMouseDown={(e) => e.preventDefault()}
                              onClick={() => {
                                update({ subcategory: opt.slug });
                                setSubcategoryOpen(false);
                              }}
                            >
                              {opt.name}
                            </li>
                          ))
                        )}
                      </ul>
                    )}
                  </div>
                  <div className="form-text">Subcategories for {selectedParent?.name ?? form.category}</div>
                </>
              )}
            </div>
          </div>
          <div className="col-sm-6">
            <div className="form-group-enhanced">
              <label className="form-label">Business/Brand Name</label>
              <input
                type="text"
                className="form-control"
                placeholder="Official business or brand name"
                value={form.brandName}
                onChange={(e) => update({ brandName: e.target.value })}
              />
              <div className="form-text">If different from place name</div>
            </div>
          </div>
          <div className="col-sm-6">
            <div className="form-group-enhanced">
              <label className="form-label">Establishment Year</label>
              <input
                type="number"
                className="form-control"
                placeholder="e.g., 2010"
                min={1800}
                max={new Date().getFullYear()}
                value={form.establishmentYear}
                onChange={(e) => update({ establishmentYear: e.target.value })}
              />
            </div>
          </div>
          <div className="col-sm-4">
            <div className="form-group-enhanced">
              <label className="form-label">Owner/Manager Name</label>
              <input
                type="text"
                className="form-control"
                placeholder="Full name"
                value={form.ownerName}
                onChange={(e) => update({ ownerName: e.target.value })}
              />
            </div>
          </div>
          <div className="col-sm-4">
            <div className="form-group-enhanced">
              <label className="form-label">License/Registration Number</label>
              <input
                type="text"
                className="form-control"
                placeholder="Business license number"
                value={form.licenseNumber}
                onChange={(e) => update({ licenseNumber: e.target.value })}
              />
            </div>
          </div>
          <div className="col-sm-4">
            <div className="form-group-enhanced">
              <label className="form-label">Tax ID/VAT Number</label>
              <input
                type="text"
                className="form-control"
                placeholder="Tax identification number"
                value={form.taxId}
                onChange={(e) => update({ taxId: e.target.value })}
              />
            </div>
          </div>
          <div className="col-sm-12">
            <div className="form-group-enhanced">
              <label className="form-label required">Description</label>
              <textarea
                className="form-control"
                rows={5}
                placeholder="Describe your place (min 50 characters)"
                value={form.description}
                onChange={(e) => update({ description: e.target.value })}
                required
                minLength={50}
              />
              <div className="form-text">Minimum 50 characters. This description will be used for SEO and search results.</div>
            </div>
          </div>
          <div className="col-sm-6">
            <div className="form-group-enhanced">
              <label className="form-label">Short Description</label>
              <textarea
                className="form-control"
                rows={2}
                maxLength={150}
                placeholder="Brief one-line description for listings"
                value={form.shortDescription}
                onChange={(e) => update({ shortDescription: e.target.value })}
              />
              <div className="form-text">{form.shortDescription.length}/150 characters</div>
            </div>
          </div>
          <div className="col-sm-6">
            <div className="form-group-enhanced">
              <label className="form-label">Tags</label>
              <input
                type="text"
                className="form-control"
                placeholder="Enter relevant tags separated by commas"
                value={form.tags}
                onChange={(e) => update({ tags: e.target.value })}
              />
              <div className="form-text">Add relevant keywords to help people find your place</div>
            </div>
          </div>
          <div className="col-sm-4">
            <div className="form-group-enhanced">
              <label className="form-label">Average Price Range</label>
              <select
                className="form-select"
                value={form.priceRangeGeneral}
                onChange={(e) => update({ priceRangeGeneral: e.target.value })}
              >
                <option value="">Select price range</option>
                <option value="free">Free</option>
                <option value="budget">Budget ($)</option>
                <option value="moderate">Moderate ($$)</option>
                <option value="expensive">Expensive ($$$)</option>
                <option value="luxury">Luxury ($$$$)</option>
              </select>
            </div>
          </div>
          <div className="col-sm-4">
            <div className="form-group-enhanced">
              <label className="form-label">Capacity/Size</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g., 50 people, 100 sqft"
                value={form.capacity}
                onChange={(e) => update({ capacity: e.target.value })}
              />
              <div className="form-text">Maximum capacity or area size</div>
            </div>
          </div>
          <div className="col-sm-4">
            <div className="form-group-enhanced">
              <label className="form-label">Languages Spoken</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g., English, Nepali, Hindi"
                value={form.languages}
                onChange={(e) => update({ languages: e.target.value })}
              />
            </div>
          </div>
          <div className="col-sm-12">
            <div className="form-group-enhanced">
              <label className="form-label">Place Access Type</label>
              <select
                className="form-select"
                value={form.accessType}
                onChange={(e) => update({ accessType: e.target.value })}
              >
                <option value="">Select access type</option>
                <option value="public">Public - Open to everyone</option>
                <option value="free">Free - No entry fee required</option>
                <option value="paid">Paid - Entry fee required</option>
                <option value="restricted">Restricted - Limited access</option>
                <option value="private">Private - By invitation only</option>
                <option value="membership">Membership - Members only</option>
              </select>
              <div className="form-text">Choose how people can access your place</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
