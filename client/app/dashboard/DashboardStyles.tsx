"use client";

import { useEffect } from "react";

const STYLES = [
  "/assets/dashboard/plugins/metisMenu/metisMenu.min.css",
  "/assets/dashboard/dist/css/app.min.css",
  "/assets/dashboard/dist/css/style.css",
];

export default function DashboardStyles() {
  useEffect(() => {
    const links: HTMLLinkElement[] = [];
    STYLES.forEach((href) => {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = href;
      document.head.appendChild(link);
      links.push(link);
    });
    return () => {
      links.forEach((link) => {
        if (document.head.contains(link)) document.head.removeChild(link);
      });
    };
  }, []);
  return null;
}
