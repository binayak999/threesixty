"use client";

import { useEffect } from "react";

/** Optional extra dashboard styles; main dashboard.css is loaded via <link> in layout for faster load. */
const STYLES: string[] = [];

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
