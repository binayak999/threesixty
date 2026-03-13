"use client";

import { useEffect, useRef } from "react";

declare global {
  interface Window {
    pannellum?: {
      viewer: (container: HTMLElement, config: { panorama: string; autoLoad?: boolean; autoRotate?: number }) => { destroy: () => void };
    };
  }
}

type PannellumViewerProps = {
  /** Panorama image URL (relative or absolute). Works with same-origin URLs when using local Pannellum. */
  panoramaUrl: string;
  className?: string;
  style?: React.CSSProperties;
};

/**
 * Renders a 360° panorama using the local Pannellum library (/assets/js/pannellum.js).
 * Pannellum is given a programmatically created div so it never mutates DOM that React
 * owns, avoiding "removeChild" conflicts on unmount.
 */
export default function PannellumViewer({ panoramaUrl, className, style }: PannellumViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<ReturnType<NonNullable<Window["pannellum"]>["viewer"]> | null>(null);

  useEffect(() => {
    if (!panoramaUrl || !containerRef.current) return;

    const reactContainer = containerRef.current;
    const pannellumContainer = document.createElement("div");
    pannellumContainer.style.width = "100%";
    pannellumContainer.style.height = "100%";
    reactContainer.appendChild(pannellumContainer);

    function init() {
      const p = window.pannellum;
      if (!p) return;
      try {
        viewerRef.current = p.viewer(pannellumContainer, {
          panorama: panoramaUrl,
          autoLoad: true,
          autoRotate: -2,
        });
      } catch (e) {
        console.warn("Pannellum init error:", e);
      }
    }

    let intervalId: ReturnType<typeof setInterval> | undefined;
    if (window.pannellum) {
      init();
    } else {
      intervalId = setInterval(() => {
        if (window.pannellum) {
          clearInterval(intervalId!);
          init();
        }
      }, 100);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
      try {
        viewerRef.current?.destroy?.();
      } catch (_) {}
      viewerRef.current = null;
      if (pannellumContainer.parentNode === reactContainer) {
        reactContainer.removeChild(pannellumContainer);
      }
    };
  }, [panoramaUrl]);

  return <div ref={containerRef} className={className} style={{ width: "100%", height: "100%", ...style }} />;
}
