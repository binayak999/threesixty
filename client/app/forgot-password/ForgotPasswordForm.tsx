"use client";

import { useState } from "react";
import Link from "next/link";
import { apiClient } from "@/lib/apiClient";

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setLoading(true);
    try {
      await apiClient.post("/api/auth/forgot-password", { email });
      setSuccess(true);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg || "Request failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="alert alert-success mb-0" role="alert">
        <p className="mb-0">
          If an account exists for <strong>{email}</strong>, you will receive a
          password reset link shortly. Check your inbox and spam folder.
        </p>
        <Link href="/sign-in" className="btn btn-outline-success btn-sm mt-3">
          Back to Sign in
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="d-flex flex-column gap-3">
      {error && (
        <div className="alert alert-danger py-2 small mb-0" role="alert">
          {error}
        </div>
      )}
      <div>
        <label htmlFor="forgot-email" className="form-label small fw-medium">
          Email
        </label>
        <input
          id="forgot-email"
          type="email"
          className="form-control form-control-lg rounded-3"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
        />
      </div>
      <button
        type="submit"
        className="btn btn-primary btn-lg rounded-3 fw-medium mt-2"
        disabled={loading}
      >
        {loading ? "Sending…" : "Send reset link"}
      </button>
    </form>
  );
}
