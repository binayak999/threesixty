export interface SeoFormState {
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;
  ogImage: string;
  noIndex: boolean;
}

export interface AddListingFormState {
  // Step 1: Category
  category: string;

  // Step 2: Basic
  title: string;
  subcategory: string;
  brandName: string;
  establishmentYear: string;
  ownerName: string;
  licenseNumber: string;
  taxId: string;
  description: string;
  shortDescription: string;
  tags: string;
  priceRangeGeneral: string;
  capacity: string;
  languages: string;
  accessType: string;

  // Step 3: Location (use locationId to reference existing, or fill address for new)
  locationId: string; // existing location _id, or "" for new
  countryRefId: string; // Country _id when creating new location
  country: string;
  state: string;
  city: string;
  zipcode: string;
  address: string;
  latitude: string;
  longitude: string;

  // Step 4: Contact
  phone: string;
  email: string;
  website: string;
  facebook: string;
  instagram: string;
  twitter: string;
  linkedin: string;

  // Step 5: Media (ids from MediaGalleryManager or upload)
  mediaIds: string[]; // feature first, then gallery, then video
  media360Ids: string[];
  videoIds: string[];

  // Step 6: Amenities (ids)
  amenityIds: string[];

  // Step 7: Opening hours, SEO, status
  openingHours: Array<{ dayOfWeek: string; openTime: string; closeTime: string; isClosed: boolean }>;
  seo: SeoFormState;
  status: 'draft' | 'pending' | 'published';

  // Step 8: Terms
  agreeTerms: boolean;
  agreeListingPolicy: boolean;
  agreeAccuracy: boolean;
  agreeMarketing: boolean;
}

export const CATEGORIES = [
  { id: "restaurant", name: "Restaurants & Cafes", icon: "fa-utensils", description: "Dining establishments, cafes, bars, food courts" },
  { id: "accommodation", name: "Hotels & Lodging", icon: "fa-bed", description: "Hotels, resorts, hostels, guesthouses" },
  { id: "religious", name: "Religious Places", icon: "fa-place-of-worship", description: "Temples, churches, mosques, monasteries" },
  { id: "historical", name: "Historical Sites", icon: "fa-landmark", description: "Monuments, museums, heritage sites" },
  { id: "public", name: "Public Facilities", icon: "fa-restroom", description: "Public toilets, parks, libraries, hospitals" },
  { id: "entertainment", name: "Entertainment", icon: "fa-theater-masks", description: "Cinemas, theaters, clubs, gaming centers" },
  { id: "shopping", name: "Shopping", icon: "fa-shopping-bag", description: "Malls, markets, stores, boutiques" },
  { id: "services", name: "Services", icon: "fa-tools", description: "Banks, salons, repair shops, offices" },
] as const;

export const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export const INITIAL_FORM_STATE: AddListingFormState = {
  category: "",
  title: "",
  subcategory: "",
  brandName: "",
  establishmentYear: "",
  ownerName: "",
  licenseNumber: "",
  taxId: "",
  description: "",
  shortDescription: "",
  tags: "",
  priceRangeGeneral: "",
  capacity: "",
  languages: "",
  accessType: "",
  locationId: "",
  countryRefId: "",
  country: "",
  state: "",
  city: "",
  zipcode: "",
  address: "",
  latitude: "",
  longitude: "",
  phone: "",
  email: "",
  website: "",
  facebook: "",
  instagram: "",
  twitter: "",
  linkedin: "",
  mediaIds: [],
  media360Ids: [],
  videoIds: [],
  amenityIds: [],
  openingHours: DAYS.map((day) => ({ dayOfWeek: day, openTime: "09:00", closeTime: "18:00", isClosed: false })),
  seo: {
    metaTitle: "",
    metaDescription: "",
    metaKeywords: "",
    ogImage: "",
    noIndex: false,
  },
  status: "draft",
  agreeTerms: false,
  agreeListingPolicy: false,
  agreeAccuracy: false,
  agreeMarketing: false,
};
