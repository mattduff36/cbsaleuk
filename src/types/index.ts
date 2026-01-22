// User type for authentication
export interface User {
  id: number;
  username: string;
  email: string;
  phone: string;
  emailConfirmed: boolean;
  isPremium: boolean | null;
  premiumUntil: Date | null;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  subscriptionStatus: string | null;
  subscriptionRenewsAt: Date | null;
  lastLogin: Date | null;
  createdAt: Date;
}

// Car Boot Sale type
export interface CarBootSale {
  id: number;
  name: string;
  location: string;
  address: string;
  description: string;
  daysOfWeek: string[];
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
  images: string[] | null;
  isPremium: boolean | null;
  organiserEmail: string;
  organiserPhone: string;
  showEmail: boolean | null;
  showPhone: boolean | null;
  latitude: number | null;
  longitude: number | null;
  lastReminder: Date | null;
  isConfirmed: boolean | null;
  confirmationSent: boolean | null;
  confirmationSentAt: Date | null;
  confirmationDue: Date | null;
  isFeatured: boolean | null;
  viewCount: number | null;
  what3words: string | null;
  eventAnnouncement: string | null;
  userId: number | null;
  createdAt: Date;
  updatedAt: Date;
}

// Search params type
export interface SearchParams {
  location: string;
  radius: number;
  dayOfWeek?: string;
  date?: string;
}
