import type { Metadata } from "next";
import DashboardLayoutClient from "./DashboardLayoutClient";
import DashboardStyles from "./DashboardStyles";

export const metadata: Metadata = {
  title: "Dashboard - 360Nepal",
  description: "Admin dashboard for 360Nepal.",
  robots: {
    index: false,
    follow: false,
    googleBot: { index: false, follow: false },
  },
};

export default function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      {/* Load dashboard theme CSS in head so it applies before paint; path matches public/assets/css/dashboard.css */}
      <link rel="stylesheet" href="/assets/css/dashboard.css" />
      <DashboardStyles />
      <DashboardLayoutClient>{children}</DashboardLayoutClient>
    </>
  );
}
