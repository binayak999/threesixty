"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { SessionUser, UserRole } from "@/app/api/auth/session/route";
import DashboardShell from "./DashboardShell";

const ADMIN_ROLES: UserRole[] = ["admin", "superadmin"];

export default function DashboardLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [user, setUser] = useState<SessionUser | null | "loading">("loading");

  useEffect(() => {
    let cancelled = false;
    fetch("/api/auth/session", { credentials: "include" })
      .then((res) => res.json())
      .then((data: { user: SessionUser | null }) => {
        if (cancelled) return;
        const u = data?.user;
        if (!u) {
          router.replace("/sign-in?redirect=/dashboard");
          return;
        }
        if (!ADMIN_ROLES.includes(u.role as UserRole)) {
          router.replace("/");
          return;
        }
        setUser(u);
      })
      .catch(() => {
        if (!cancelled) router.replace("/sign-in?redirect=/dashboard");
      });
    return () => {
      cancelled = true;
    };
  }, [router]);

  if (user === "loading") {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading…</span>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return <DashboardShell user={user}>{children}</DashboardShell>;
}
