"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SignUpForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/sign-up", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.message || "Sign up failed. Please try again.");
        return;
      }
      router.push(data.redirectTo || "/sign-in");
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
        <label htmlFor="signup-name" className="form-label small fw-medium">
          Full name
        </label>
        <input
          id="signup-name"
          type="text"
          className="form-control form-control-lg rounded-3"
          placeholder="Your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          autoComplete="name"
        />
      </div>
      <div>
        <label htmlFor="signup-email" className="form-label small fw-medium">
          Email
        </label>
        <input
          id="signup-email"
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
        <label htmlFor="signup-password" className="form-label small fw-medium">
          Password
        </label>
        <input
          id="signup-password"
          type="password"
          className="form-control form-control-lg rounded-3"
          placeholder="At least 8 characters"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={8}
          autoComplete="new-password"
        />
      </div>
      <div>
        <label htmlFor="signup-confirm" className="form-label small fw-medium">
          Confirm password
        </label>
        <input
          id="signup-confirm"
          type="password"
          className="form-control form-control-lg rounded-3"
          placeholder="••••••••"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          minLength={8}
          autoComplete="new-password"
        />
      </div>
      <button
        type="submit"
        className="btn btn-primary btn-lg rounded-3 fw-medium mt-2"
        disabled={loading}
      >
        {loading ? "Creating account…" : "Sign Up"}
      </button>
    </form>
  );
}
