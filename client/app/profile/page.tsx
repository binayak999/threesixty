"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface TierLimits {
  name: string;
  maxListings: number;
  maxBlogs: number;
  maxVideos: number;
}

interface ProfileLimitsData {
  tier: TierLimits | null;
  listingCount: number;
  blogCount: number;
  videoCount: number;
}

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<SessionUser | null>(null);
  const [limits, setLimits] = useState<ProfileLimitsData | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    fetch("/api/auth/session")
      .then((res) => res.json())
      .then((data: { user?: SessionUser }) => {
        if (data?.user) {
          setUser(data.user);
          if (data.user.role === "user") {
            return fetch("/api/profile/limits").then((r) => r.json());
          }
        } else {
          router.replace("/sign-in?redirect=/profile");
        }
      })
      .then((json: { success?: boolean; data?: ProfileLimitsData }) => {
        if (json?.success && json?.data) setLimits(json.data);
      })
      .catch(() => router.replace("/sign-in?redirect=/profile"))
      .finally(() => setChecking(false));
  }, [router]);

  if (checking) {
    return (
      <>
        <Navbar />
        <main className="min-vh-50 py-5">
          <div className="container py-5 text-center">
            <div className="spinner-border text-primary" role="status" />
            <p className="mt-2 text-muted">Loading…</p>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <>
      <Navbar />
      <main className="py-5">
        <div className="container">
          <div className="section-header mb-5">
            <h1 className="fw-semibold mb-1">Profile</h1>
            <p className="text-muted mb-0">Welcome back, {user.name || user.email}.</p>
            <p className="small text-muted mt-1">
              Content you submit as a user will be reviewed by an admin before it appears publicly.
            </p>
            {user.role === "user" && limits?.tier && (
              <div className="card border mt-4">
                <div className="card-body">
                  <h3 className="h6 fw-semibold mb-3">
                    <i className="fa-solid fa-layer-group me-2 text-primary" />
                    Your plan: {limits.tier.name}
                  </h3>
                  <p className="small text-muted mb-3">
                    Usage limits for listings, blogs, and videos. Content is reviewed before going live.
                  </p>
                  <div className="row g-3">
                    <div className="col-12 col-md-4">
                      <div className="d-flex align-items-center justify-content-between p-3 rounded bg-light">
                        <span className="small fw-medium">Listings</span>
                        <span className="small">
                          {limits.listingCount} / {limits.tier.maxListings}
                        </span>
                      </div>
                    </div>
                    <div className="col-12 col-md-4">
                      <div className="d-flex align-items-center justify-content-between p-3 rounded bg-light">
                        <span className="small fw-medium">Blogs</span>
                        <span className="small">
                          {limits.blogCount} / {limits.tier.maxBlogs}
                        </span>
                      </div>
                    </div>
                    <div className="col-12 col-md-4">
                      <div className="d-flex align-items-center justify-content-between p-3 rounded bg-light">
                        <span className="small fw-medium">Videos</span>
                        <span className="small">
                          {limits.videoCount} / {limits.tier.maxVideos}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="row g-4">
            <div className="col-md-6 col-lg-4">
              <Link
                href="/add-listing"
                className="card h-100 text-decoration-none text-dark border shadow-sm hover-shadow transition"
                style={{ transition: "box-shadow 0.2s" }}
              >
                <div className="card-body d-flex flex-column align-items-start">
                  <div className="rounded-circle bg-primary bg-opacity-10 p-3 mb-3">
                    <i className="fa-solid fa-location-dot fa-lg text-primary" />
                  </div>
                  <h3 className="h5 fw-semibold mb-2">Add Listing</h3>
                  <p className="text-muted small mb-0">
                    Submit a place, restaurant, or business to be listed on 360Nepal.
                  </p>
                  <span className="mt-3 btn btn-outline-primary btn-sm">Add listing →</span>
                </div>
              </Link>
            </div>
            <div className="col-md-6 col-lg-4">
              <Link
                href="/add-blog"
                className="card h-100 text-decoration-none text-dark border shadow-sm hover-shadow transition"
                style={{ transition: "box-shadow 0.2s" }}
              >
                <div className="card-body d-flex flex-column align-items-start">
                  <div className="rounded-circle bg-primary bg-opacity-10 p-3 mb-3">
                    <i className="fa-solid fa-pen-nib fa-lg text-primary" />
                  </div>
                  <h3 className="h5 fw-semibold mb-2">Write Blog</h3>
                  <p className="text-muted small mb-0">
                    Create a blog post. It will be reviewed before going live.
                  </p>
                  <span className="mt-3 btn btn-outline-primary btn-sm">Write blog →</span>
                </div>
              </Link>
            </div>
            <div className="col-md-6 col-lg-4">
              <Link
                href="/add-video"
                className="card h-100 text-decoration-none text-dark border shadow-sm hover-shadow transition"
                style={{ transition: "box-shadow 0.2s" }}
              >
                <div className="card-body d-flex flex-column align-items-start">
                  <div className="rounded-circle bg-primary bg-opacity-10 p-3 mb-3">
                    <i className="fa-solid fa-video fa-lg text-primary" />
                  </div>
                  <h3 className="h5 fw-semibold mb-2">Upload Video</h3>
                  <p className="text-muted small mb-0">
                    Add a video (YouTube link). It will be reviewed before going live.
                  </p>
                  <span className="mt-3 btn btn-outline-primary btn-sm">Upload video →</span>
                </div>
              </Link>
            </div>
          </div>

          {user.role === "admin" && (
            <div className="mt-5 pt-4 border-top">
              <Link href="/dashboard" className="btn btn-secondary">
                <i className="fa-solid fa-gauge-high me-2" />
                Open Dashboard
              </Link>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
