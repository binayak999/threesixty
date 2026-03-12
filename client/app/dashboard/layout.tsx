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
      <DashboardStyles />
      <DashboardLayoutClient>{children}</DashboardLayoutClient>
    </>
  );
}
