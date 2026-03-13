"use client";

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import {
  AddListingFormState,
  DAYS,
  INITIAL_FORM_STATE,
} from "./types";
import { apiClient } from "@/lib/apiClient";
import Step1Category from "./steps/Step1Category";
import Step2BasicInfo from "./steps/Step2BasicInfo";
import Step3Location from "./steps/Step3Location";
import Step4Contact from "./steps/Step4Contact";
import Step5Media from "./steps/Step5Media";
import Step6Features from "./steps/Step6Features";
import Step7Settings from "./steps/Step7Settings";
import Step8Review from "./steps/Step8Review";

const TOTAL_STEPS = 8;
const STEP_LABELS = ["Category", "Basic Info", "Location", "Contact", "Media", "Features", "Settings", "Review"];

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

interface ListingApiLocation {
  _id?: string;
  address?: string;
  city?: string;
  region?: string;
  country?: string;
  countryRef?: { _id: string };
  latitude?: number;
  longitude?: number;
}

interface ListingApiCategory {
  _id: string;
  slug?: string;
  name?: string;
}

interface ListingApiMediaRef {
  media: string | { _id: string };
  role: string;
  order?: number;
}

interface ListingApiResponse {
  _id: string;
  title: string;
  description: string;
  slug: string;
  category: ListingApiCategory | string;
  location: ListingApiLocation | string;
  medias?: ListingApiMediaRef[];
  amenities?: Array<{ _id: string; slug?: string } | string>;
  openingHours?: Array<{ dayOfWeek: string; openTime?: string; closeTime?: string; isClosed: boolean }>;
  status?: 'draft' | 'pending' | 'published';
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    metaKeywords?: string[];
    ogImage?: string;
    noIndex?: boolean;
  };
}

function mapListingToForm(listing: ListingApiResponse): AddListingFormState {
  const loc = typeof listing.location === "object" && listing.location ? listing.location : null;
  const cat = typeof listing.category === "object" && listing.category ? listing.category : null;
  const catParent = cat && typeof (cat as { parent?: { slug?: string } }).parent === "object" ? (cat as { parent?: { slug?: string } }).parent : null;
  const isSubcategory = !!catParent?.slug;
  const medias = listing.medias || [];
  const byRole = (role: string) =>
    medias.filter((m) => m.role === role).sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  const toId = (m: ListingApiMediaRef) => (typeof m.media === "object" && m.media ? m.media._id : m.media);
  const feature = byRole("feature")[0];
  const gallery = byRole("gallery");
  const video = byRole("video");
  const mediaIds = feature ? [toId(feature), ...gallery.map(toId)] : gallery.map(toId);
  const videoIds = video.map(toId);
  const amenitySlugs = (listing.amenities || []).map((a) =>
    typeof a === "object" && a && "slug" in a ? (a as { slug?: string }).slug ?? String((a as { _id: string })._id) : String(a)
  );
  const locId = loc && "_id" in loc ? String((loc as { _id: string })._id) : "";
  const countryRefId = loc?.countryRef?._id ? String(loc.countryRef._id) : "";
  return {
    ...INITIAL_FORM_STATE,
    category: isSubcategory ? catParent!.slug! : (cat?.slug ?? ""),
    subcategory: isSubcategory ? (cat?.slug ?? "") : "",
    title: listing.title ?? "",
    description: listing.description ?? "",
    locationId: locId,
    countryRefId,
    state: loc?.region ?? "",
    city: loc?.city ?? "",
    country: loc?.country ?? "",
    address: loc?.address ?? "",
    latitude: loc?.latitude != null ? String(loc.latitude) : "",
    longitude: loc?.longitude != null ? String(loc.longitude) : "",
    mediaIds,
    media360Ids: [],
    videoIds,
    amenityIds: amenitySlugs,
    openingHours:
      Array.isArray(listing.openingHours) && listing.openingHours.length > 0
        ? listing.openingHours.map((h) => ({
            dayOfWeek: h.dayOfWeek,
            openTime: h.openTime ?? "09:00",
            closeTime: h.closeTime ?? "18:00",
            isClosed: !!h.isClosed,
          }))
        : INITIAL_FORM_STATE.openingHours,
    status: (listing.status === 'published' || listing.status === 'pending' || listing.status === 'draft') ? listing.status : 'draft',
    seo: listing.seo
      ? {
          metaTitle: listing.seo.metaTitle ?? "",
          metaDescription: listing.seo.metaDescription ?? "",
          metaKeywords: Array.isArray(listing.seo.metaKeywords) ? listing.seo.metaKeywords.join(", ") : "",
          ogImage: listing.seo.ogImage ?? "",
          noIndex: !!listing.seo.noIndex,
        }
      : INITIAL_FORM_STATE.seo,
    agreeTerms: true,
    agreeListingPolicy: true,
    agreeAccuracy: true,
    agreeMarketing: false,
  };
}

export interface AddListingFormProps {
  mode?: "create" | "edit";
  listingId?: string;
  onSuccess?: () => void;
}

const ADMIN_ROLES = ["admin", "superadmin"];

export default function AddListingForm({ mode = "create", listingId, onSuccess }: AddListingFormProps) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<AddListingFormState>(INITIAL_FORM_STATE);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loadingEdit, setLoadingEdit] = useState(!!listingId);
  const [editingSlug, setEditingSlug] = useState<string>("");
  const [isAdmin, setIsAdmin] = useState(false);
  const isEdit = mode === "edit" && listingId;

  useEffect(() => {
    apiClient
      .get<{ user?: { role?: string } }>("/api/auth/session")
      .then((res) => {
        const role = res.data?.user?.role;
        setIsAdmin(!!role && ADMIN_ROLES.includes(role));
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!listingId) return;
    let cancelled = false;
    setLoadingEdit(true);
    apiClient
      .get<{ data?: ListingApiResponse }>(`/api/listings/${listingId}`)
      .then((res) => {
        const json = res.data;
        if (cancelled || !json?.data) return;
        const listing = json.data as ListingApiResponse;
        setForm(mapListingToForm(listing));
        setEditingSlug(listing.slug ?? "");
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoadingEdit(false);
      });
    return () => {
      cancelled = true;
    };
  }, [listingId]);

  const update = useCallback((updates: Partial<AddListingFormState>) => {
    setForm((prev) => ({ ...prev, ...updates }));
  }, []);

  const progressPercent = (step / TOTAL_STEPS) * 100;

  const validateStep = useCallback(
    (s: number): boolean => {
      setError("");
      if (s === 1) return !!form.category;
      if (s === 2) {
        if (!form.title?.trim()) {
          setError("Place name is required.");
          return false;
        }
        if (!form.description?.trim()) {
          setError("Description is required.");
          return false;
        }
        if (form.description.length < 50) {
          setError("Description must be at least 50 characters.");
          return false;
        }
        return true;
      }
      if (s === 3) {
        if (form.locationId?.trim()) return true;
        if (!form.country?.trim()) {
          setError("Country is required.");
          return false;
        }
        if (!form.state?.trim()) {
          setError("State/Province is required.");
          return false;
        }
        if (!form.city?.trim()) {
          setError("City is required.");
          return false;
        }
        if (!form.address?.trim()) {
          setError("Full address is required.");
          return false;
        }
        return true;
      }
      if (s === 5) {
        if (form.mediaIds.length === 0) {
          setError("Please add at least one image.");
          return false;
        }
        return true;
      }
      if (s === 8) {
        if (!form.agreeTerms || !form.agreeListingPolicy || !form.agreeAccuracy) {
          setError("Please agree to all required terms.");
          return false;
        }
        return true;
      }
      return true;
    },
    [form]
  );

  const goNext = () => {
    if (!validateStep(step)) return;
    if (step < TOTAL_STEPS) setStep(step + 1);
  };

  const goPrev = () => {
    if (step > 1) setStep(step - 1);
  };

  const buildPayload = useCallback(() => {
    const locationPayload = {
      address: form.address,
      city: form.city,
      region: form.state,
      country: form.country,
      countryRef: form.countryRefId || undefined,
      zipcode: form.zipcode || undefined,
      latitude: form.latitude ? Number(form.latitude) : undefined,
      longitude: form.longitude ? Number(form.longitude) : undefined,
    };
    const seoPayload =
      form.seo.metaTitle ||
      form.seo.metaDescription ||
      form.seo.metaKeywords ||
      form.seo.ogImage ||
      form.seo.noIndex
        ? {
            metaTitle: form.seo.metaTitle.trim() || undefined,
            metaDescription: form.seo.metaDescription.trim() || undefined,
            metaKeywords: form.seo.metaKeywords
              ? form.seo.metaKeywords.split(",").map((k) => k.trim()).filter(Boolean)
              : undefined,
            ogImage: form.seo.ogImage.trim() || undefined,
            noIndex: form.seo.noIndex || undefined,
          }
        : undefined;
    const payload: Record<string, unknown> = {
      category: form.subcategory?.trim() || form.category,
      title: form.title,
      description: form.description,
      mediaIds: form.mediaIds,
      media360Ids: form.media360Ids,
      videoIds: form.videoIds,
      amenityIds: form.amenityIds,
      openingHours: form.openingHours,
      status: form.status === 'published' ? 'published' : form.status === 'pending' ? 'pending' : 'draft',
      seo: seoPayload,
    };
    if (form.locationId?.trim()) {
      payload.locationId = form.locationId.trim();
    } else {
      payload.location = locationPayload;
    }
    return payload;
  }, [form]);

  const handleSubmit = async () => {
    if (!validateStep(8)) return;
    setSubmitting(true);
    setError("");
    try {
      if (isEdit) {
        const res = await apiClient.put<{ success?: boolean; message?: string }>(
          `/api/listings/${listingId}`,
          { ...buildPayload(), slug: editingSlug }
        );
        const data = res.data;
        if (data?.success && onSuccess) {
          onSuccess();
          return;
        }
        setSuccess(true);
      } else {
        const slug = slugify(form.title) + "-" + Date.now();
        const res = await apiClient.post<{ success?: boolean; message?: string }>(
          "/api/listings/create",
          {
            ...buildPayload(),
            slug,
            shortDescription: form.shortDescription || undefined,
            tags: form.tags ? form.tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
            contact: {
              phone: form.phone || undefined,
              email: form.email || undefined,
              website: form.website || undefined,
              facebook: form.facebook || undefined,
              instagram: form.instagram || undefined,
              twitter: form.twitter || undefined,
              linkedin: form.linkedin || undefined,
            },
          }
        );
        const data = res.data;
        if (!data?.success) {
          setError(data?.message || "Failed to create listing.");
          return;
        }
        if (onSuccess) {
          onSuccess();
          return;
        }
        setSuccess(true);
      }
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="card border-0 shadow-sm">
        <div className="card-body text-center py-5">
          <i className="fa-solid fa-circle-check text-success fa-4x mb-3" />
          <h3 className="h5 fw-semibold mb-2">
            {isEdit ? "Listing updated" : "Listing submitted"}
          </h3>
          <p className="text-muted mb-4">
            {isEdit ? "Your listing has been updated." : isAdmin ? "Your listing has been published." : "Your listing has been submitted for review."}
          </p>
          <Link href="/dashboard/listings" className="btn btn-primary me-2">
            Back to Listings
          </Link>
          {!isEdit && (
            <button
              type="button"
              className="btn btn-outline-primary"
              onClick={() => {
                setSuccess(false);
                setForm(INITIAL_FORM_STATE);
                setStep(1);
              }}
            >
              Add another
            </button>
          )}
        </div>
      </div>
    );
  }

  if (loadingEdit) {
    return (
      <div className="card border-0 shadow-sm">
        <div className="card-body text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2 mb-0 text-muted">Loading listing...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="add-listing-form">
      {/* Progress - match original HTML */}
      <div className="step-progress">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="mb-0">{isEdit ? "Edit Listing" : "Add New Listing"}</h5>
          <span className="badge bg-primary" id="stepCounter">Step {step} of {TOTAL_STEPS}</span>
        </div>
        <div className="progress-bar-container">
          <div className="progress-bar-fill" style={{ width: `${progressPercent}%` }} />
        </div>
        <div className="step-indicators">
          {STEP_LABELS.map((label, i) => {
            const s = i + 1;
            const isActive = step === s;
            const isCompleted = step > s;
            return (
              <div
                key={s}
                className={`step-indicator ${isActive ? "active" : ""} ${isCompleted ? "completed" : ""}`}
                data-step={s}
              >
                <div className="step-number">{s}</div>
                <div className="step-title">{label}</div>
              </div>
            );
          })}
        </div>
      </div>

      {error && (
        <div className="alert alert-danger py-2 mb-3" role="alert">
          {error}
        </div>
      )}

      {/* Step 1 */}
      <div className={`form-step ${step === 1 ? "active" : ""}`} id="step-1">
        <Step1Category form={form} update={update} />
        <div className="form-navigation">
          <div />
          <button type="button" className="btn btn-primary btn-step" onClick={goNext}>
            Next: Basic Info <i className="fas fa-arrow-right ms-2" />
          </button>
        </div>
      </div>

      {/* Step 2 */}
      <div className={`form-step ${step === 2 ? "active" : ""}`} id="step-2">
        <Step2BasicInfo form={form} update={update} />
        <div className="form-navigation">
          <button type="button" className="btn btn-outline-secondary btn-step" onClick={goPrev}>
            <i className="fas fa-arrow-left me-2" />Previous
          </button>
          <button type="button" className="btn btn-primary btn-step" onClick={goNext}>
            Next: Location <i className="fas fa-arrow-right ms-2" />
          </button>
        </div>
      </div>

      {/* Step 3 */}
      <div className={`form-step ${step === 3 ? "active" : ""}`} id="step-3">
        <Step3Location form={form} update={update} />
        <div className="form-navigation">
          <button type="button" className="btn btn-outline-secondary btn-step" onClick={goPrev}>
            <i className="fas fa-arrow-left me-2" />Previous
          </button>
          <button type="button" className="btn btn-primary btn-step" onClick={goNext}>
            Next: Contact <i className="fas fa-arrow-right ms-2" />
          </button>
        </div>
      </div>

      {/* Step 4 */}
      <div className={`form-step ${step === 4 ? "active" : ""}`} id="step-4">
        <Step4Contact form={form} update={update} />
        <div className="form-navigation">
          <button type="button" className="btn btn-outline-secondary btn-step" onClick={goPrev}>
            <i className="fas fa-arrow-left me-2" />Previous
          </button>
          <button type="button" className="btn btn-primary btn-step" onClick={goNext}>
            Next: Media <i className="fas fa-arrow-right ms-2" />
          </button>
        </div>
      </div>

      {/* Step 5 */}
      <div className={`form-step ${step === 5 ? "active" : ""}`} id="step-5">
        <Step5Media form={form} update={update} />
        <div className="form-navigation">
          <button type="button" className="btn btn-outline-secondary btn-step" onClick={goPrev}>
            <i className="fas fa-arrow-left me-2" />Previous
          </button>
          <button type="button" className="btn btn-primary btn-step" onClick={goNext}>
            Next: Features <i className="fas fa-arrow-right ms-2" />
          </button>
        </div>
      </div>

      {/* Step 6 */}
      <div className={`form-step ${step === 6 ? "active" : ""}`} id="step-6">
        <Step6Features form={form} update={update} />
        <div className="form-navigation">
          <button type="button" className="btn btn-outline-secondary btn-step" onClick={goPrev}>
            <i className="fas fa-arrow-left me-2" />Previous
          </button>
          <button type="button" className="btn btn-primary btn-step" onClick={goNext}>
            Next: Settings <i className="fas fa-arrow-right ms-2" />
          </button>
        </div>
      </div>

      {/* Step 7 */}
      <div className={`form-step ${step === 7 ? "active" : ""}`} id="step-7">
        <Step7Settings form={form} update={update} isAdmin={isAdmin} />
        <div className="form-navigation">
          <button type="button" className="btn btn-outline-secondary btn-step" onClick={goPrev}>
            <i className="fas fa-arrow-left me-2" />Previous
          </button>
          <button type="button" className="btn btn-primary btn-step" onClick={goNext}>
            Next: Review <i className="fas fa-arrow-right ms-2" />
          </button>
        </div>
      </div>

      {/* Step 8 */}
      <div className={`form-step ${step === 8 ? "active" : ""}`} id="step-8">
        <Step8Review form={form} update={update} isAdmin={isAdmin} />
        <div className="form-navigation">
          <button type="button" className="btn btn-outline-secondary btn-step" onClick={goPrev}>
            <i className="fas fa-arrow-left me-2" />Previous
          </button>
          <button
            type="button"
            className="btn btn-primary btn-step"
            onClick={handleSubmit}
            disabled={submitting}
          >
            {submitting ? (isEdit ? "Updating…" : "Submitting…") : isEdit ? "Update Listing" : "Submit for Review"}
            <i className="fas fa-paper-plane ms-2" />
          </button>
        </div>
      </div>
    </div>
  );
}
