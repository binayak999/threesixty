"use client";

import { useState, useEffect, useMemo } from "react";
import { SearchableSelect } from "@/components/SearchableSelect";
import type { AddListingFormState } from "../types";

interface LocationOption {
  _id: string;
  name: string;
  slug: string;
  address?: string;
  city?: string;
  region?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  countryRef?: { _id: string };
}

interface CountryOption {
  _id: string;
  code: string;
  name: string;
  slug: string;
}

export default function Step3Location({
  form,
  update,
}: {
  form: AddListingFormState;
  update: (u: Partial<AddListingFormState>) => void;
}) {
  const [locations, setLocations] = useState<LocationOption[]>([]);
  const [currentLocation, setCurrentLocation] = useState<LocationOption | null>(null);
  const [countries, setCountries] = useState<CountryOption[]>([]);
  const [provinces, setProvinces] = useState<string[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/locations?limit=500").then((res) => res.json()),
      fetch("/api/countries").then((res) => res.json()),
    ])
      .then(([locJson, countryJson]) => {
        if (locJson?.data && Array.isArray(locJson.data)) setLocations(locJson.data);
        if (countryJson?.data && Array.isArray(countryJson.data)) setCountries(countryJson.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // When country is selected, load provinces (regions) and cities for dropdowns
  useEffect(() => {
    const countryRefId = form.countryRefId?.trim();
    if (!countryRefId) {
      setProvinces([]);
      setCities([]);
      return;
    }
    Promise.all([
      fetch(`/api/locations?countryRef=${encodeURIComponent(countryRefId)}&distinct=region`).then((res) => res.json()),
      fetch(`/api/locations?countryRef=${encodeURIComponent(countryRefId)}&distinct=city`).then((res) => res.json()),
    ])
      .then(([regionJson, cityJson]) => {
        if (regionJson?.data && Array.isArray(regionJson.data)) setProvinces(regionJson.data);
        else setProvinces([]);
        if (cityJson?.data && Array.isArray(cityJson.data)) setCities(cityJson.data);
        else setCities([]);
      })
      .catch(() => {
        setProvinces([]);
        setCities([]);
      });
  }, [form.countryRefId]);

  // When editing, ensure the listing's location is in the options (it may not be in the paginated list)
  useEffect(() => {
    const id = form.locationId?.trim();
    if (!id) {
      setCurrentLocation(null);
      return;
    }
    const inList = locations.some((l) => l._id === id);
    if (inList) {
      setCurrentLocation(null);
      return;
    }
    let cancelled = false;
    fetch(`/api/locations/${id}`)
      .then((res) => res.json())
      .then((json) => {
        if (cancelled || !json?.data) return;
        setCurrentLocation(json.data as LocationOption);
      })
      .catch(() => setCurrentLocation(null));
    return () => {
      cancelled = true;
    };
  }, [form.locationId, locations]);

  const options = useMemo(() => {
    const base = [
      { value: "", label: "Create new address", subtitle: undefined },
      ...locations.map((l) => ({
        value: l._id,
        label: l.name,
        subtitle: l.city ?? undefined,
      })),
    ];
    if (currentLocation && !locations.some((l) => l._id === currentLocation._id)) {
      base.push({
        value: currentLocation._id,
        label: currentLocation.name,
        subtitle: currentLocation.city ?? undefined,
      });
    }
    return base;
  }, [locations, currentLocation]);

  const useExisting = (loc: LocationOption & { countryRef?: { _id: string } }) => {
    update({
      locationId: loc._id,
      countryRefId: (loc as { countryRef?: { _id: string } }).countryRef?._id ?? "",
      address: loc.address ?? "",
      city: loc.city ?? "",
      state: loc.region ?? "",
      country: loc.country ?? "",
      latitude: loc.latitude != null ? String(loc.latitude) : "",
      longitude: loc.longitude != null ? String(loc.longitude) : "",
    });
  };

  const useNewAddress = () => {
    update({ locationId: "" });
  };

  const handleLocationChange = (v: string | string[]) => {
    const id = String(v);
    if (!id) {
      useNewAddress();
      return;
    }
    const loc = locations.find((l) => l._id === id) ?? (currentLocation?._id === id ? currentLocation : null);
    if (loc) useExisting(loc);
  };

  const useExistingLocation = !!form.locationId;

  return (
    <div className="card mb-4">
      <div className="card-header position-relative">
        <h6 className="fs-17 fw-semi-bold mb-0">
          <i className="fas fa-map-marker-alt me-2 text-primary" />
          Location Details
        </h6>
      </div>
      <div className="card-body">
        <div className="mb-4">
          <SearchableSelect
            label="Use existing location"
            options={options}
            value={form.locationId}
            onChange={handleLocationChange}
            placeholder="Search locations... or create new address below"
            loading={loading}
            emptyMessage="No locations found. Create a new address below."
            icon="fa-map-marker-alt"
          />
          {useExistingLocation && (
            <button
              type="button"
              className="btn btn-sm btn-outline-secondary mt-2"
              onClick={useNewAddress}
            >
              Use new address instead
            </button>
          )}
        </div>

        {!useExistingLocation && (
          <div className="row g-4">
            <div className="col-sm-6">
              <div>
                <label className="required fw-medium mb-2">Country</label>
                <select
                  className="form-select"
                  value={form.countryRefId}
                  onChange={(e) => {
                    const val = e.target.value;
                    const c = countries.find((x) => x._id === val);
                    update({
                      countryRefId: val,
                      country: c?.name ?? "",
                    });
                  }}
                  required
                >
                  <option value="">Select Country</option>
                  {countries.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="col-sm-6">
              <div>
                <label className="required fw-medium mb-2">State/Province</label>
                {provinces.length > 0 ? (
                  <select
                    className="form-select"
                    value={form.state}
                    onChange={(e) => update({ state: e.target.value })}
                    required
                  >
                    <option value="">Select state or province</option>
                    {[
                      ...provinces,
                      ...(form.state && !provinces.includes(form.state) ? [form.state] : []),
                    ].map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    className="form-control"
                    placeholder={form.countryRefId ? "No options for this country" : "Select country first"}
                    value={form.state}
                    onChange={(e) => update({ state: e.target.value })}
                    required
                  />
                )}
              </div>
            </div>
            <div className="col-sm-6">
              <div>
                <label className="required fw-medium mb-2">City</label>
                {cities.length > 0 ? (
                  <select
                    className="form-select"
                    value={form.city}
                    onChange={(e) => update({ city: e.target.value })}
                    required
                  >
                    <option value="">Select city</option>
                    {[
                      ...cities,
                      ...(form.city && !cities.includes(form.city) ? [form.city] : []),
                    ].map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    className="form-control"
                    placeholder={form.countryRefId ? "Type city name" : "Select country first"}
                    value={form.city}
                    onChange={(e) => update({ city: e.target.value })}
                    required
                  />
                )}
              </div>
            </div>
            <div className="col-sm-6">
              <div>
                <label className="fw-medium mb-2">ZIP/Postal Code</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter ZIP or postal code"
                  value={form.zipcode}
                  onChange={(e) => update({ zipcode: e.target.value })}
                />
              </div>
            </div>
            <div className="col-sm-12">
              <div>
                <label className="required fw-medium mb-2">Full Address</label>
                <textarea
                  className="form-control"
                  rows={3}
                  placeholder="Enter complete address with landmarks"
                  value={form.address}
                  onChange={(e) => update({ address: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="col-sm-6">
              <div>
                <label className="fw-medium mb-2">Latitude</label>
                <input
                  type="number"
                  step="any"
                  className="form-control"
                  placeholder="e.g., 27.7172"
                  value={form.latitude}
                  onChange={(e) => update({ latitude: e.target.value })}
                />
                <div className="form-text">Optional: For precise location mapping</div>
              </div>
            </div>
            <div className="col-sm-6">
              <div>
                <label className="fw-medium mb-2">Longitude</label>
                <input
                  type="number"
                  step="any"
                  className="form-control"
                  placeholder="e.g., 85.3240"
                  value={form.longitude}
                  onChange={(e) => update({ longitude: e.target.value })}
                />
                <div className="form-text">Optional: For precise location mapping</div>
              </div>
            </div>
          </div>
        )}

        {useExistingLocation && (
          <div className="alert alert-light border mb-0">
            <strong>Using:</strong> {form.address && `${form.address}, `}
            {[form.city, form.state, form.country].filter(Boolean).join(", ")}
          </div>
        )}
      </div>
    </div>
  );
}
