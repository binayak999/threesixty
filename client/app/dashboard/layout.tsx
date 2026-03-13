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
      {/* Dashboard theme + scoped overrides so layout/sidebar aren't broken by main site CSS */}
      <link rel="stylesheet" href="/assets/css/dashboard.css" />
      <link rel="stylesheet" href="/assets/css/dashboard-overrides.css" />
      <DashboardStyles />
      <DashboardLayoutClient>{children}</DashboardLayoutClient>
    </>
  );
}
