export interface SettingsFormState {
  applicationTitle: string;
  address: string;
  emailAddress: string;
  phone: string;
  /** Media library id */
  faviconMediaId: string;
  faviconMediaUrl: string;
  dashboardLogoMediaId: string;
  dashboardLogoMediaUrl: string;
  websiteLogoMediaId: string;
  websiteLogoMediaUrl: string;
  headerBgMediaId: string;
  headerBgMediaUrl: string;
  footerBgMediaId: string;
  footerBgMediaUrl: string;
  language: string;
  timeZone: string;
  adminAlign: string;
  officeTime: string;
  latitudeLongitude: string;
  footerText: string;
}

export const INITIAL_SETTINGS: SettingsFormState = {
  applicationTitle: "360Nepal",
  address: "",
  emailAddress: "",
  phone: "",
  faviconMediaId: "",
  faviconMediaUrl: "",
  dashboardLogoMediaId: "",
  dashboardLogoMediaUrl: "",
  websiteLogoMediaId: "",
  websiteLogoMediaUrl: "",
  headerBgMediaId: "",
  headerBgMediaUrl: "",
  footerBgMediaId: "",
  footerBgMediaUrl: "",
  language: "en",
  timeZone: "Asia/Kathmandu",
  adminAlign: "ltr",
  officeTime: "",
  latitudeLongitude: "",
  footerText: "© 2024 360Nepal. All rights reserved.",
};

export const LANGUAGES = [
  { value: "en", label: "English" },
  { value: "ne", label: "नेपाली" },
];

export const TIME_ZONES = [
  { value: "Asia/Kathmandu", label: "Asia/Kathmandu" },
  { value: "Africa/Abidjan", label: "Africa/Abidjan" },
  { value: "America/New_York", label: "America/New York" },
  { value: "Europe/London", label: "Europe/London" },
  { value: "UTC", label: "UTC" },
];

export const ADMIN_ALIGN = [
  { value: "ltr", label: "Left to Right" },
  { value: "rtl", label: "Right to Left" },
];
