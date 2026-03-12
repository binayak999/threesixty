"use client";

import { createContext, useContext, type ReactNode } from "react";

export interface VideosPageData {
  bannerUrl: string;
  heroTitle: string;
  heroLead: string;
}

const VideosPageDataContext = createContext<VideosPageData | null>(null);

export function VideosPageDataProvider({
  bannerUrl,
  heroTitle,
  heroLead,
  children,
}: VideosPageData & { children: ReactNode }) {
  return (
    <VideosPageDataContext.Provider value={{ bannerUrl, heroTitle, heroLead }}>
      {children}
    </VideosPageDataContext.Provider>
  );
}

const DEFAULT_VIDEOS: VideosPageData = {
  bannerUrl: "/assets/images/header/02.jpg",
  heroTitle: "Videos",
  heroLead: "Watch our curated collection of videos. Experience Nepal from every angle.",
};

export function useVideosPageData(): VideosPageData {
  const value = useContext(VideosPageDataContext);
  return value ?? DEFAULT_VIDEOS;
}
