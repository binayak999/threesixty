"use client";

import React from "react";

export interface DataTableColumn<T> {
  key: string;
  label: string;
  render?: (item: T, index: number) => React.ReactNode;
  className?: string;
}

export interface PaginationState {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface DataTableProps<T extends { _id?: string; id?: string }> {
  columns: DataTableColumn<T>[];
  data: T[];
  keyField?: keyof T | "id";
  emptyMessage?: string;
  loading?: boolean;
  pagination?: PaginationState;
  onPageChange?: (page: number) => void;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
}

export default function DataTable<T extends { _id?: string; id?: string }>({
  columns,
  data,
  keyField = "id",
  emptyMessage = "No data yet.",
  loading = false,
  pagination,
  onPageChange,
  searchValue = "",
  onSearchChange,
  searchPlaceholder = "Search…",
}: DataTableProps<T>) {
  const getKey = (item: T, index: number) => {
    const id = item[keyField as keyof T];
    if (id != null) return String(id);
    return index.toString();
  };

  const searchRowAlways = onSearchChange != null && (
    <div className="row mb-3">
      <div className="col-sm-12 col-md-6" />
      <div className="col-sm-12 col-md-6">
        <div className="dataTables_filter d-flex justify-content-md-end">
          <div className="position-relative" style={{ width: "100%", minWidth: 200, maxWidth: 320 }}>
            <i
              className="fa-solid fa-search position-absolute text-muted top-50 translate-middle-y"
              style={{ left: 12, fontSize: "0.8rem" }}
              aria-hidden
            />
            <input
              type="search"
              className="form-control form-control-sm rounded ps-4"
              placeholder={searchPlaceholder}
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
              aria-label="Search table"
              style={{ height: "2rem" }}
            />
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="dataTables_wrapper dt-bootstrap5">
        {searchRowAlways}
        <div className="table-responsive">
          <table className="table table-striped table-borderless align-middle">
            <thead>
              <tr>
                {columns.map((col) => (
                  <th key={col.key} className={col.className}>
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={columns.length} className="text-center py-5 text-muted">
                  <div className="spinner-border spinner-border-sm me-2" role="status" />
                  Loading…
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  if (!data.length) {
    return (
      <div className="dataTables_wrapper dt-bootstrap5">
        {searchRowAlways}
        <div className="table-responsive">
          <table className="table table-striped table-borderless align-middle">
            <thead>
              <tr>
                {columns.map((col) => (
                  <th key={col.key} className={col.className}>
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={columns.length} className="text-center py-5 text-muted">
                  {emptyMessage}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  const showPagination = pagination && pagination.totalPages > 1 && onPageChange;
  const { page, totalPages, total, limit } = pagination || { page: 1, totalPages: 1, total: 0, limit: 10 };
  const start = total === 0 ? 0 : (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);

  const tableContent = (
    <div className="table-responsive">
      <table className="table table-striped table-borderless align-middle">
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.key} className={col.className}>
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr key={getKey(item, index)}>
              {columns.map((col) => (
                <td key={col.key} className={col.className}>
                  {col.render
                    ? col.render(item, index)
                    : String((item as Record<string, unknown>)[col.key] ?? "")}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const paginationRow = showPagination && (
    <div className="row align-items-center mt-3">
      <div className="col-sm-12 col-md-5">
        <div className="dataTables_info text-muted" role="status">
          Showing {start} to {end} of {total} entries
        </div>
      </div>
      <div className="col-sm-12 col-md-7">
        <div className="dataTables_paginate float-md-end">
          <ul className="pagination mb-0">
                  <li className={`page-item ${page <= 1 ? "disabled" : ""}`}>
                    <button
                      type="button"
                      className="page-link"
                      onClick={() => onPageChange(page - 1)}
                      disabled={page <= 1}
                      aria-label="Previous"
                    >
                      <i className="fa-solid fa-chevron-left" />
                    </button>
                  </li>
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter((p) => p === 1 || p === totalPages || (p >= page - 2 && p <= page + 2))
                    .map((p, i, arr) => (
                      <React.Fragment key={p}>
                        {i > 0 && arr[i - 1] !== p - 1 && (
                          <li className="page-item disabled">
                            <span className="page-link">…</span>
                          </li>
                        )}
                        <li className={`page-item ${p === page ? "active" : ""}`}>
                          <button
                            type="button"
                            className="page-link"
                            onClick={() => onPageChange(p)}
                          >
                            {p}
                          </button>
                        </li>
                      </React.Fragment>
                    ))}
                  <li className={`page-item ${page >= totalPages ? "disabled" : ""}`}>
                    <button
                      type="button"
                      className="page-link"
                      onClick={() => onPageChange(page + 1)}
                      disabled={page >= totalPages}
                      aria-label="Next"
                    >
                      <i className="fa-solid fa-chevron-right" />
                    </button>
                  </li>
                </ul>
              </div>
            </div>
          </div>
  );

  return (
    <div className="dataTables_wrapper dt-bootstrap5">
      {searchRowAlways}
      {tableContent}
      {paginationRow}
    </div>
  );
}
