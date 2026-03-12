"use client";

import "../../add-listing/add-listing.css";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AddListingForm from "../../add-listing/AddListingForm";

export default function AddListingPage() {
  const router = useRouter();

  const onSuccess = () => {
    router.push("/dashboard/listings");
  };

  return (
    <div className="py-4">
      <div className="section-header mb-4">
        <div className="font-caveat fs-4 fw-bold text-primary">Listings</div>
        <h2 className="fw-semibold mb-0 h3">Add New Listing</h2>
        <div className="sub-title fs-16 text-muted">
          <Link href="/dashboard/listings" className="text-primary">
            ← Back to listings
          </Link>
        </div>
      </div>
      <AddListingForm mode="create" onSuccess={onSuccess} />
    </div>
  );
}
