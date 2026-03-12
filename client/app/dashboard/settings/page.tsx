"use client";

import Link from "next/link";
import SettingsForm from "./SettingsForm";

export default function SettingsPage() {
  return (
    <div className="py-4">
      <div className="section-header mb-4">
        <div className="font-caveat fs-4 fw-bold text-primary">Settings</div>
        <h2 className="fw-semibold mb-0 h3">Application Setting</h2>
        <div className="sub-title fs-16 text-muted">
          <Link href="/dashboard" className="text-primary">
            ← Back to dashboard
          </Link>
        </div>
      </div>
      <SettingsForm />
    </div>
  );
}
