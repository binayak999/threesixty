"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { UserRole } from "@/app/api/auth/session/route";

const ADMIN_ROLES: UserRole[] = ["admin", "superadmin"];

export default function DashboardGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [allowed, setAllowed] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/auth/session", { credentials: "include" })
      .then((res) => res.json())
      .then((data: { user: { role: UserRole } | null }) => {
        if (cancelled) return;
        const user = data?.user;
        if (!user) {
          router.replace("/sign-in?redirect=/dashboard");
          return;
        }
        if (!ADMIN_ROLES.includes(user.role)) {
          router.replace("/");
          return;
        }
        setAllowed(true);
      })
      .catch(() => {
        if (!cancelled) router.replace("/sign-in?redirect=/dashboard");
      });
    return () => {
      cancelled = true;
    };
  }, [router]);

  if (allowed === null) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading…</span>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
