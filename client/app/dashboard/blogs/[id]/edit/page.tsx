"use client";

import "../../../add-listing/add-listing.css";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import BlogForm from "../../BlogForm";
import type { BlogCategory } from "../../types";
import { apiClient } from "@/lib/apiClient";

export default function EditBlogPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string | undefined;
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

  if (!id) {
    return (
      <div className="py-4">
        <div className="alert alert-warning">Invalid blog ID.</div>
        <Link href="/dashboard/blogs">Back to list</Link>
      </div>
    );
  }

  return (
    <div className="py-4">
      <div className="section-header mb-4">
        <div className="font-caveat fs-4 fw-bold text-primary">Blog Management</div>
        <h2 className="fw-semibold mb-0 h3">Edit Blog</h2>
        <div className="sub-title fs-16 text-muted">
          <Link href="/dashboard/blogs" className="text-primary">
            ← Back to blog list
          </Link>
        </div>
      </div>
      <BlogForm mode="edit" blogId={id} categories={categories} onSuccess={onSuccess} />
    </div>
  );
}
