"use client";

import { createContext, useContext, type ReactNode } from "react";

export interface AboutPageData {
  bannerUrl: string;
  heroTitle: string;
  heroSubtitle: string;
}

const AboutPageDataContext = createContext<AboutPageData | null>(null);

export function AboutPageDataProvider({
  bannerUrl,
  heroTitle,
  heroSubtitle,
  children,
}: AboutPageData & { children: ReactNode }) {
  return (
    <AboutPageDataContext.Provider value={{ bannerUrl, heroTitle, heroSubtitle }}>
      {children}
    </AboutPageDataContext.Provider>
  );
}

const DEFAULT_ABOUT: AboutPageData = {
  bannerUrl: "/assets/images/header/01.jpg",
  heroTitle: "360Nepal was founded with a vision to your original vision or inspiration.",
  heroSubtitle: "7+ YEARS EXPERIENCED IN FIELD",
};

export function useAboutPageData(): AboutPageData {
  const value = useContext(AboutPageDataContext);
  return value ?? DEFAULT_ABOUT;
}
