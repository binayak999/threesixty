"use client";

import { useEffect } from "react";

/** Dashboard uses the same static assets as frontend; only one extra CSS for sidebar/navbar. */
const STYLES = ["/assets/css/dashboard.css"];

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
