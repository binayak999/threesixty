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
  return (
    value ?? {
      bannerUrl: "/assets/images/header/02.jpg",
      heroTitle: "Blogs",
    }
  );
}
