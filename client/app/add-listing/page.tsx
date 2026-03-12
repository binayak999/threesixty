"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AddListingForm from "@/app/dashboard/add-listing/AddListingForm";
import "@/app/dashboard/add-listing/add-listing.css";

export default function AddListingPublicPage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    fetch("/api/auth/session")
      .then((res) => res.json())
      .then((data: { user: unknown }) => {
        if (data?.user) {
          setAllowed(true);
        } else {
          router.replace("/sign-in?redirect=/add-listing");
        }
      })
      .catch(() => router.replace("/sign-in?redirect=/add-listing"))
      .finally(() => setChecking(false));
  }, [router]);

  if (checking) {
    return (
      <>
        <Navbar />
        <main className="min-vh-50 py-5">
          <div className="container py-4 text-center">
            <div className="spinner-border text-primary" role="status" />
            <p className="mt-2 text-muted">Checking login…</p>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (!allowed) {
    return null;
  }

  return (
    <>
      <Navbar />
      <main className="py-4">
        <div className="container">
          <div className="section-header mb-4">
            <Link href="/" className="text-primary mb-2 d-inline-block">
              ← Back to Home
            </Link>
            <h1 className="fw-semibold mb-0 h3">Add Listing</h1>
            <p className="text-muted mb-0 mt-1">Submit your place or business to 360Nepal.</p>
          </div>
          <AddListingForm
            mode="create"
            onSuccess={() => {
              // Form handles its own success state; optional redirect can be done there
            }}
          />
        </div>
      </main>
      <Footer />
    </>
  );
}
