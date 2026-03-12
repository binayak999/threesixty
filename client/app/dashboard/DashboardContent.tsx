"use client";

import Link from "next/link";

export default function DashboardContent() {
  return (
    <div className="py-4">
      <div className="row g-4">
        <div className="col-12">
          <div className="card border-0 shadow-sm">
            <div className="card-body p-4">
              <h2 className="h5 fw-semibold mb-3">Welcome to the Admin Dashboard</h2>
              <p className="text-body-secondary mb-0">
                This area is only visible to users with <strong>admin</strong> or{" "}
                <strong>superadmin</strong> roles. Use the sidebar to manage listings,
                reviews, bookings, and more.
              </p>
            </div>
          </div>
        </div>
        <div className="col-md-6 col-lg-4">
          <Link
            href="/dashboard/listings/add"
            className="card border-0 shadow-sm text-decoration-none text-dark h-100"
          >
            <div className="card-body p-4">
              <div className="d-flex align-items-center gap-3">
                <div className="rounded-3 bg-primary bg-opacity-10 p-3">
                  <i className="fa-solid fa-house-circle-plus text-primary" style={{ fontSize: "1.5rem" }} />
                </div>
                <div>
                  <h3 className="h6 fw-semibold mb-1">Add listing</h3>
                  <p className="small text-body-secondary mb-0">Create a new listing</p>
                </div>
              </div>
            </div>
          </Link>
        </div>
        <div className="col-md-6 col-lg-4">
          <Link
            href="/listings"
            className="card border-0 shadow-sm text-decoration-none text-dark h-100"
          >
            <div className="card-body p-4">
              <div className="d-flex align-items-center gap-3">
                <div className="rounded-3 bg-success bg-opacity-10 p-3">
                  <i className="fa-solid fa-list text-success" style={{ fontSize: "1.5rem" }} />
                </div>
                <div>
                  <h3 className="h6 fw-semibold mb-1">View Listings</h3>
                  <p className="small text-body-secondary mb-0">Browse all listings on the site</p>
                </div>
              </div>
            </div>
          </Link>
        </div>
        <div className="col-md-6 col-lg-4">
          <Link
            href="/"
            className="card border-0 shadow-sm text-decoration-none text-dark h-100"
          >
            <div className="card-body p-4">
              <div className="d-flex align-items-center gap-3">
                <div className="rounded-3 bg-secondary bg-opacity-10 p-3">
                  <i className="fa-solid fa-home text-secondary" style={{ fontSize: "1.5rem" }} />
                </div>
                <div>
                  <h3 className="h6 fw-semibold mb-1">Back to site</h3>
                  <p className="small text-body-secondary mb-0">Return to 360Nepal home</p>
                </div>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
