export type ISODateValue = string | Date | null;

export type ListingTier = "free" | "premium";
export type ListingStatus = "pending" | "active" | "expired" | "paused";
export type UserRole = "organiser" | "admin";

export interface User {
  id: number;
  username: string;
  email: string;
  phone: string;
  fullName?: string | null;
  role?: UserRole;
  emailConfirmed: boolean;
  isPremium: boolean | null;
  premiumUntil: ISODateValue;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  subscriptionStatus: string | null;
  subscriptionRenewsAt: ISODateValue;
  lastLogin: ISODateValue;
  createdAt: ISODateValue;
}

export interface SocialLinks {
  facebook?: string | null;
  instagram?: string | null;
  website?: string | null;
}

export interface CarBootSale {
  id: number;
  slug?: string;
  name: string;
  teaser?: string | null;
  location: string;
  county?: string | null;
  region?: string | null;
  postcode?: string | null;
  address: string;
  description: string;
  daysOfWeek: string[];
  nextEventDate?: ISODateValue;
  startTime: string;
  endTime: string;
  carPrice: number;
  vanPrice: number;
  freeParking: boolean;
  parkingFee: number | null;
  hasCatering: boolean | null;
  petsAllowed: boolean | null;
  venueType: string | null;
  hasToilets: boolean | null;
  hasHotFood: boolean | null;
  hasColdDrinks: boolean | null;
  hasPicnicTables: boolean | null;
  hasIndoorStalls: boolean | null;
  hasDisabledAccess: boolean | null;
  hasRubbishBins: boolean | null;
  hasFirstAid: boolean | null;
  hasKidsActivities: boolean | null;
  otherInfo: string | null;
  socialLink: string | null;
  socialLinks?: SocialLinks | null;
  images: string[] | null;
  imageAlt?: string | null;
  isPremium: boolean | null;
  listingTier?: ListingTier;
  organiserEmail: string;
  organiserPhone: string;
  organiserName?: string | null;
  showEmail: boolean | null;
  showPhone: boolean | null;
  latitude: number | null;
  longitude: number | null;
  lastReminder: ISODateValue;
  isConfirmed: boolean | null;
  confirmationSent: boolean | null;
  confirmationSentAt: ISODateValue;
  confirmationDue: ISODateValue;
  isFeatured: boolean | null;
  isVerified?: boolean | null;
  featuredRank?: number | null;
  viewCount: number | null;
  what3words: string | null;
  eventAnnouncement: string | null;
  status?: ListingStatus;
  userId: number | null;
  createdAt: ISODateValue;
  updatedAt: ISODateValue;
}

export interface SearchParams {
  location: string;
  radius: number;
  dayOfWeek?: string;
  date?: string;
  lat?: number;
  lng?: number;
}

export interface SearchFilters extends SearchParams {
  verifiedOnly?: boolean;
  featuredOnly?: boolean;
}

export interface BlogPost {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  readingTime: string;
  publishedAt: string;
  seoDescription: string;
  heroImage: string;
  relatedListingSlugs?: string[];
  content: string[];
}
