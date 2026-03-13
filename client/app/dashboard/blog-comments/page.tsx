"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import DataTable, { DataTableColumn } from "../components/DataTable";
import { apiClient } from "@/lib/apiClient";

interface BlogCommentBlogRef {
  _id: string;
  title?: string;
  slug?: string;
}

interface BlogCommentUserRef {
  _id: string;
  name?: string;
  email?: string;
}

export interface BlogCommentItem {
  _id: string;
  blog: BlogCommentBlogRef | string;
  user?: BlogCommentUserRef | string | null;
  authorName: string;
  authorEmail: string;
  content: string;
  isApproved: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function DashboardBlogCommentsPage() {
  const [comments, setComments] = useState<BlogCommentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchComments = async () => {
    try {
      const res = await apiClient.get<{ data?: BlogCommentItem[] }>("/api/blog-comments");
      if (res.data?.data) setComments(res.data.data);
      else setComments([]);
    } catch {
      setComments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, []);

  const handleApprove = async (id: string, isApproved: boolean) => {
    try {
      const res = await fetch(`/api/blog-comments/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isApproved }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.message || "Update failed");
      await fetchComments();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Update failed");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this comment?")) return;
    try {
      await apiClient.delete(`/api/blog-comments/${id}`);
      await fetchComments();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg || "Delete failed");
    }
  };

  const columns: DataTableColumn<BlogCommentItem>[] = [
    {
      key: "sl",
      label: "SL.",
      render: (_, index) => (index + 1).toString(),
    },
    {
      key: "blog",
      label: "Blog",
      render: (row) => {
        const blog = typeof row.blog === "object" && row.blog ? row.blog : null;
        const title = blog?.title || (blog as { slug?: string } | undefined)?.slug || "-";
        const slug = blog?.slug ?? null;
        return slug ? (
          <Link href={`/blogs/${slug}`} target="_blank" rel="noopener noreferrer" className="text-primary">
            {title}
          </Link>
        ) : (
          <span>{title}</span>
        );
      },
    },
    {
      key: "author",
      label: "Author",
      render: (row) => {
        if (typeof row.user === "object" && row.user) {
          return (row.user as BlogCommentUserRef).name || (row.user as BlogCommentUserRef).email || "-";
        }
        return row.authorName || "-";
      },
    },
    {
      key: "content",
      label: "Comment",
      render: (row) => (
        <span className="text-truncate d-inline-block" style={{ maxWidth: 280 }}>
          {row.content || "-"}
        </span>
      ),
    },
    {
      key: "isApproved",
      label: "Status",
      render: (row) => (
        <span className={`badge ${row.isApproved ? "bg-success" : "bg-secondary"}`}>
          {row.isApproved ? "Approved" : "Pending"}
        </span>
      ),
    },
    {
      key: "createdAt",
      label: "Created",
      render: (row) => new Date(row.createdAt).toLocaleDateString(),
    },
    {
      key: "actions",
      label: "Action",
      render: (row) => (
        <div className="d-flex gap-1 flex-wrap">
          {!row.isApproved && (
            <button
              type="button"
              className="btn btn-success btn-sm"
              title="Approve"
              onClick={() => handleApprove(row._id, true)}
            >
              <i className="fa-solid fa-check" />
            </button>
          )}
          {row.isApproved && (
            <button
              type="button"
              className="btn btn-warning btn-sm"
              title="Reject"
              onClick={() => handleApprove(row._id, false)}
            >
              <i className="fa-solid fa-times" />
            </button>
          )}
          <button
            type="button"
            className="btn btn-danger btn-sm"
            onClick={() => handleDelete(row._id)}
            title="Delete"
          >
            <i className="fa-solid fa-trash" />
          </button>
          {typeof row.blog === "object" && row.blog?.slug && (
            <Link
              href={`/blogs/${row.blog.slug}`}
              className="btn btn-outline-primary btn-sm"
              target="_blank"
              rel="noopener noreferrer"
              title="View post"
            >
              <i className="fa-solid fa-external-link-alt" />
            </Link>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="py-4">
      <div className="section-header mb-4">
        <div className="font-caveat fs-4 fw-bold text-primary">Blog Comments</div>
        <h2 className="fw-semibold mb-0 h3">Blog Comments</h2>
        <div className="sub-title fs-16 text-muted">
          Approve or reject comments. Only approved comments appear on the blog post.
        </div>
      </div>

      {error && (
        <div className="alert alert-danger py-2 mb-3" role="alert">
          {error}
        </div>
      )}

      <div className="card">
        <div className="card-header position-relative">
          <div className="d-flex justify-content-between align-items-center flex-wrap">
            <div>
              <h6 className="fs-17 fw-semi-bold my-1">All Comments</h6>
              <p className="mb-0 text-muted">Approve, reject, or delete comments.</p>
            </div>
          </div>
        </div>
        <div className="card-body">
          <DataTable
            columns={columns}
            data={comments}
            keyField="_id"
            loading={loading}
            emptyMessage="No blog comments yet."
          />
        </div>
      </div>
    </div>
  );
}
