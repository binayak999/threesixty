"use client";

import { useState, useEffect, useMemo } from "react";
import { SearchableSelect } from "@/components/SearchableSelect";
import type { AddListingFormState } from "../types";

interface AmenityOption {
  _id: string;
  name: string;
  slug: string;
  icon?: string;
}

export default function Step6Features({
  form,
  update,
}: {
  form: AddListingFormState;
  update: (u: Partial<AddListingFormState>) => void;
}) {
  const [amenities, setAmenities] = useState<AmenityOption[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/amenities")
      .then((res) => res.json())
      .then((json) => {
        if (json?.data && Array.isArray(json.data)) setAmenities(json.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const options = useMemo(
    () =>
      amenities.map((a) => ({
        value: a.slug,
        label: a.name,
        subtitle: undefined,
      })),
    [amenities]
  );

  return (
    <div className="card mb-4">
      <div className="card-header position-relative">
        <h6 className="fs-17 fw-semi-bold mb-0">
          <i className="fas fa-star me-2 text-primary" />
          Features & Amenities
        </h6>
        <p className="text-muted mb-0 mt-2">Search and select all that apply</p>
      </div>
      <div className="card-body">
        <SearchableSelect
          label="Amenities"
          options={options}
          value={form.amenityIds}
          onChange={(v) => update({ amenityIds: Array.isArray(v) ? v : [v] })}
          multiple
          placeholder="Search amenities..."
          loading={loading}
          emptyMessage="No amenities found. Add amenities from the dashboard."
          icon="fa-star"
        />
        {!loading && form.amenityIds.length > 0 && (
          <p className="text-muted small mt-2 mb-0">
            {form.amenityIds.length} selected. Open the dropdown above to add or remove.
          </p>
        )}
      </div>
    </div>
  );
}
