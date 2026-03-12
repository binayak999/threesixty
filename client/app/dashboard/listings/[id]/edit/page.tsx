"use client";

import "../../../add-listing/add-listing.css";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import AddListingForm from "../../../add-listing/AddListingForm";

export default function EditListingPage() {
  const params = useParams();
  const router = useRouter();
  const id = typeof params.id === "string" ? params.id : "";

  const onSuccess = () => {
    router.push("/dashboard/listings");
  };

  return (
    <div className="py-4">
      <div className="section-header mb-4">
        <div className="font-caveat fs-4 fw-bold text-primary">Listings</div>
        <h2 className="fw-semibold mb-0 h3">Edit Listing</h2>
        <div className="sub-title fs-16 text-muted">
          <Link href="/dashboard/listings" className="text-primary">
            ← Back to listings
          </Link>
        </div>
      </div>
      <AddListingForm mode="edit" listingId={id} onSuccess={onSuccess} />
    </div>
  );
}
