"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BlogForm from "@/app/dashboard/blogs/BlogForm";
import type { BlogCategory } from "@/app/dashboard/blogs/types";
import { apiClient } from "@/lib/apiClient";
import "@/app/dashboard/add-listing/add-listing.css";

export default function AddBlogPublicPage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [allowed, setAllowed] = useState(false);
  const [categories, setCategories] = useState<BlogCategory[]>([]);

  useEffect(() => {
    Promise.all([
      apiClient.get<{ user?: unknown }>("/api/auth/session"),
      apiClient.get<{ data?: BlogCategory[] }>("/api/categories?type=blog"),
    ])
      .then(([sessionRes, catsRes]) => {
        if (sessionRes.data?.user) setAllowed(true);
        if (catsRes.data?.data) setCategories(catsRes.data.data);
      })
      .catch(() => {})
      .finally(() => setChecking(false));
  }, []);

  useEffect(() => {
    if (!checking && !allowed) {
      router.replace("/sign-in?redirect=/add-blog");
    }
  }, [checking, allowed, router]);

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
            <Link href="/profile" className="text-primary mb-2 d-inline-block">
              ← Back to Profile
            </Link>
            <h1 className="fw-semibold mb-0 h3">Write a Blog Post</h1>
            <p className="text-muted mb-0 mt-1">
              Your post will be reviewed by an admin before it appears on the site.
            </p>
          </div>
          <BlogForm
            mode="create"
            categories={categories}
            onSuccess={() => router.push("/profile")}
          />
        </div>
      </main>
      <Footer />
    </>
  );
}
