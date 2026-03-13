"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

export default function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/sign-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: "include",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.message || "Sign in failed. Please try again.");
        return;
      }
      const target =
        redirect && redirect.startsWith("/")
          ? redirect
          : (data.redirectTo ?? "/");
      router.push(target);
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="d-flex flex-column gap-3">
      {error && (
        <div className="alert alert-danger py-2 small mb-0" role="alert">
          {error}
        </div>
      )}
      <div>
        <label htmlFor="signin-email" className="form-label small fw-medium">
          Email
        </label>
        <input
          id="signin-email"
          type="email"
          className="form-control form-control-lg rounded-3"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
        />
      </div>
      <div>
        <div className="d-flex justify-content-between align-items-center mb-1">
          <label htmlFor="signin-password" className="form-label small fw-medium mb-0">
            Password
          </label>
          <Link
            href="/forgot-password"
            className="small text-body-secondary text-decoration-none"
          >
            Forgot password?
          </Link>
        </div>
        <input
          id="signin-password"
          type="password"
          className="form-control form-control-lg rounded-3"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
        />
      </div>
      <button
        type="submit"
        className="btn btn-primary btn-lg rounded-3 fw-medium mt-2"
        disabled={loading}
      >
        {loading ? "Signing in…" : "Sign In"}
      </button>
    </form>
  );
}
