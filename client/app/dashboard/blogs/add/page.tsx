"use client";

import "../../add-listing/add-listing.css";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import BlogForm from "../BlogForm";
import type { BlogCategory } from "../types";
import { apiClient } from "@/lib/apiClient";

export default function AddBlogPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<BlogCategory[]>([]);

  useEffect(() => {
    apiClient
      .get<{ data?: BlogCategory[] }>("/api/categories?type=blog")
      .then((res) => res.data?.data && setCategories(res.data.data))
      .catch(() => {});
  }, []);

  const onSuccess = () => {
    router.push("/dashboard/blogs");
  };

  return (
    <div className="py-4">
      <div className="section-header mb-4">
        <div className="font-caveat fs-4 fw-bold text-primary">Blog Management</div>
        <h2 className="fw-semibold mb-0 h3">Add New Blog</h2>
        <div className="sub-title fs-16 text-muted">
          <Link href="/dashboard/blogs" className="text-primary">
            ← Back to blog list
          </Link>
        </div>
      </div>
      <BlogForm mode="create" categories={categories} onSuccess={onSuccess} />
    </div>
  );
}
