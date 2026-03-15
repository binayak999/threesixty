"use client";

import { createContext, useContext, type ReactNode } from "react";

export interface BlogsPageData {
  bannerUrl: string;
  heroTitle: string;
}

const BlogsPageDataContext = createContext<BlogsPageData | null>(null);

export function BlogsPageDataProvider({
  bannerUrl,
  heroTitle,
  children,
}: BlogsPageData & { children: ReactNode }) {
  return (
    <BlogsPageDataContext.Provider value={{ bannerUrl, heroTitle }}>
      {children}
    </BlogsPageDataContext.Provider>
  );
}

export function useBlogsPageData(): BlogsPageData {
  const value = useContext(BlogsPageDataContext);
  const defaultBanner =
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1200' height='320'%3E%3Crect fill='%231e3a5f' width='1200' height='320'/%3E%3C/svg%3E";
  return (
    value ?? {
      bannerUrl: defaultBanner,
      heroTitle: "Blogs",
    }
  );
}
