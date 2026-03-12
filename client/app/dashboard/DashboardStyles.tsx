"use client";

import { useEffect } from "react";

const STYLES = [
  "/dashboard/assets/plugins/metisMenu/metisMenu.min.css",
  "/dashboard/assets/dist/css/app.min.css",
  "/dashboard/assets/dist/css/style.css",
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
