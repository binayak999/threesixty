"use client";

import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import CategoryForm from "../../CategoryForm";
import type { CategoryType } from "../../types";

export default function EditCategoryPage() {
  const router = useRouter();
  const params = useParams();
  const type = (params?.type as string)?.toLowerCase();
  const id = params?.id as string | undefined;
  const categoryType: CategoryType | null =
    type === "blog" || type === "listing" ? type : null;

  const onSuccess = () => {
    router.push(`/dashboard/categories/${categoryType}`);
  };

  if (!categoryType || !id) {
    return (
      <div className="py-4">
        <div className="alert alert-warning">Invalid category or ID.</div>
        <Link href="/dashboard">Back to Dashboard</Link>
      </div>
    );
  }

  const title = "Categories";

  return (
    <div className="py-4">
      <div className="section-header mb-4">
        <div className="font-caveat fs-4 fw-bold text-primary">Categories</div>
        <h2 className="fw-semibold mb-0 h3">Edit {title.slice(0, -1)}</h2>
        <div className="sub-title fs-16 text-muted">
          <Link href={`/dashboard/categories/${categoryType}`} className="text-primary">
            ← Back to {title}
          </Link>
        </div>
      </div>
      <CategoryForm
        mode="edit"
        categoryType={categoryType}
        categoryId={id}
        onSuccess={onSuccess}
      />
    </div>
  );
}
