"use client";

import { useState, useEffect, useMemo } from "react";
import { SearchableSelect } from "@/components/SearchableSelect";
import { apiClient } from "@/lib/apiClient";
import type { AddListingFormState } from "../types";

interface CategoryOption {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  parent?: string | null;
}

const SLUG_ICON: Record<string, string> = {
  restaurant: "fa-utensils",
  accommodation: "fa-bed",
  religious: "fa-place-of-worship",
  historical: "fa-landmark",
  public: "fa-restroom",
  entertainment: "fa-theater-masks",
  shopping: "fa-shopping-bag",
  services: "fa-tools",
};

export default function Step1Category({
  form,
  update,
}: {
  form: AddListingFormState;
  update: (u: Partial<AddListingFormState>) => void;
}) {
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient
      .get<{ data?: CategoryOption[] }>("/api/categories?type=listing")
      .then((res) => {
        if (res.data?.data && Array.isArray(res.data.data)) setCategories(res.data.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const parentCategories = useMemo(
    () => categories.filter((c) => !c.parent),
    [categories]
  );

  const parentOptions = useMemo(
    () =>
      parentCategories.map((c) => ({
        value: c.slug,
        label: c.name,
        subtitle: c.description ?? undefined,
      })),
    [parentCategories]
  );

  const selectedParent = useMemo(
    () => parentCategories.find((c) => c.slug === form.category),
    [parentCategories, form.category]
  );

  const subcategories = useMemo(() => {
    if (!selectedParent) return [];
    return categories.filter(
      (c) => c.parent && String(c.parent) === String(selectedParent._id)
    );
  }, [categories, selectedParent]);

  const subcategoryOptions = useMemo(
    () =>
      subcategories.map((c) => ({
        value: c.slug,
        label: c.name,
        subtitle: c.description ?? undefined,
      })),
    [subcategories]
  );

  const handleCategoryChange = (v: string | string[]) => {
    const slug = String(v);
    update({ category: slug, subcategory: "" });
  };

  return (
    <div className="card mb-4">
      <div className="card-header position-relative">
        <h6 className="fs-17 fw-semi-bold mb-0">
          <i className="fas fa-layer-group me-2 text-primary" />
          Select Place Category
        </h6>
        <p className="text-muted mb-0 mt-2">Choose the type of place you want to list</p>
      </div>
      <div className="card-body">
        <SearchableSelect
          label="Category"
          options={parentOptions}
          value={form.category}
          onChange={handleCategoryChange}
          placeholder="Search categories..."
          loading={loading}
          emptyMessage="No categories found. Add listing categories from the dashboard."
          icon="fa-layer-group"
        />

        {!loading && selectedParent && subcategories.length > 0 && (
          <div className="mt-4">
            <SearchableSelect
              label="Subcategory (optional)"
              options={subcategoryOptions}
              value={form.subcategory}
              onChange={(v) => update({ subcategory: String(v) })}
              placeholder="Search subcategories..."
              emptyMessage="No subcategories."
              icon="fa-tags"
            />
          </div>
        )}

        {!loading && parentCategories.length > 0 && (
          <div className="mt-3 pt-3 border-top">
            <p className="text-muted small mb-2">Or pick from grid</p>
            <div className="row g-3" id="categoryGrid">
              {parentCategories.map((cat) => (
                <div key={cat._id} className="col-md-3 col-sm-6">
                  <div
                    role="button"
                    tabIndex={0}
                    className={`category-card ${form.category === cat.slug ? "selected" : ""}`}
                    data-category={cat.slug}
                    onClick={() => handleCategoryChange(cat.slug)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        handleCategoryChange(cat.slug);
                      }
                    }}
                  >
                    <div className="category-icon">
                      <i
                        className={`fas ${cat.icon && cat.icon.startsWith("fa-") ? cat.icon : cat.icon ? `fa-${cat.icon}` : SLUG_ICON[cat.slug] ?? "fa-circle"}`}
                      />
                    </div>
                    <h6 className="fw-medium mb-2">{cat.name}</h6>
                    <p className="text-muted small mb-0">{cat.description ?? ""}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
