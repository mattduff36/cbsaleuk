import { seedBlogPosts, seedListings, seedUsers } from "@/lib/demo-data";
import { calculateDistance } from "@/lib/utils";
import { BlogPost, CarBootSale, SearchFilters, User } from "@/types";

type MockUser = User & {
  password: string;
};

type MockSession = {
  token: string;
  userId: number;
  createdAt: string;
};

type Store = {
  users: MockUser[];
  listings: CarBootSale[];
  blogPosts: BlogPost[];
  sessions: MockSession[];
};

declare global {
  // eslint-disable-next-line no-var
  var __BOOTSALEFINDER_STORE__: Store | undefined;
}

function buildInitialStore(): Store {
  return {
    users: structuredClone(seedUsers),
    listings: structuredClone(seedListings),
    blogPosts: structuredClone(seedBlogPosts),
    sessions: [],
  };
}

function getStore() {
  if (!globalThis.__BOOTSALEFINDER_STORE__) {
    globalThis.__BOOTSALEFINDER_STORE__ = buildInitialStore();
  }

  return globalThis.__BOOTSALEFINDER_STORE__;
}

function sanitizeUser(user: MockUser): User {
  const { password, ...rest } = user;
  return rest;
}

function normaliseSearchValue(value: string) {
  return value.trim().toLowerCase();
}

function createSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function createListingId() {
  const store = getStore();
  return Math.max(...store.listings.map((listing) => listing.id), 100) + 1;
}

function createUserId() {
  const store = getStore();
  return Math.max(...store.users.map((user) => user.id), 0) + 1;
}

export function listMockListings() {
  return [...getStore().listings];
}

export function getMockListing(idOrSlug: string) {
  return (
    getStore().listings.find(
      (listing) =>
        String(listing.id) === idOrSlug ||
        listing.slug === idOrSlug,
    ) || null
  );
}

export function getMockFeaturedListings() {
  return [...getStore().listings]
    .filter((listing) => listing.status !== "expired")
    .sort((a, b) => {
      const aRank = a.featuredRank ?? 99;
      const bRank = b.featuredRank ?? 99;
      return aRank - bRank;
    })
    .slice(0, 6);
}

export function searchMockListings(filters: SearchFilters) {
  const query = normaliseSearchValue(filters.location || "");

  return getStore().listings
    .filter((listing) => listing.status !== "expired")
    .filter((listing) => {
      const haystack = [
        listing.name,
        listing.location,
        listing.address,
        listing.county,
        listing.region,
        listing.teaser,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      if (query && !haystack.includes(query)) {
        return false;
      }

      if (
        filters.dayOfWeek &&
        !listing.daysOfWeek.some(
          (value) => value.toLowerCase() === filters.dayOfWeek?.toLowerCase(),
        )
      ) {
        return false;
      }

      if (filters.verifiedOnly && !listing.isVerified) {
        return false;
      }

      if (filters.featuredOnly && !listing.isFeatured) {
        return false;
      }

      if (
        filters.lat !== undefined &&
        filters.lng !== undefined &&
        listing.latitude !== null &&
        listing.longitude !== null
      ) {
        const distance = calculateDistance(
          filters.lat,
          filters.lng,
          listing.latitude,
          listing.longitude,
        );

        return distance <= filters.radius;
      }

      return true;
    })
    .map((listing) => {
      if (
        filters.lat !== undefined &&
        filters.lng !== undefined &&
        listing.latitude !== null &&
        listing.longitude !== null
      ) {
        return {
          ...listing,
          distance: calculateDistance(
            filters.lat,
            filters.lng,
            listing.latitude,
            listing.longitude,
          ),
        };
      }

      return listing;
    })
    .sort((a, b) => {
      const aFeatured = a.isFeatured ? 0 : 1;
      const bFeatured = b.isFeatured ? 0 : 1;

      if (aFeatured !== bFeatured) {
        return aFeatured - bFeatured;
      }

      const aDistance = "distance" in a ? a.distance ?? 999 : 999;
      const bDistance = "distance" in b ? b.distance ?? 999 : 999;
      return aDistance - bDistance;
    });
}

export function getMockSearchSuggestions(query: string) {
  const value = normaliseSearchValue(query);
  const listings = getStore().listings
    .filter((listing) => {
      return [listing.name, listing.location, listing.address]
        .join(" ")
        .toLowerCase()
        .includes(value);
    })
    .slice(0, 4);

  const locations = Array.from(
    new Set(
      getStore().listings
        .map((listing) => listing.location)
        .filter((location) => location.toLowerCase().includes(value)),
    ),
  ).slice(0, 6);

  return { listings, locations };
}

export function listMockBlogPosts() {
  return [...getStore().blogPosts];
}

export function getMockBlogPost(slug: string) {
  return getStore().blogPosts.find((post) => post.slug === slug) || null;
}

export function getMockRelatedBlogPosts(listingSlug?: string) {
  return getStore().blogPosts.filter((post) =>
    post.relatedListingSlugs?.includes(listingSlug || ""),
  );
}

export function listMockUsers() {
  return getStore().users.map(sanitizeUser);
}

export function registerMockUser(input: {
  username: string;
  email: string;
  phone: string;
  password: string;
}) {
  const store = getStore();

  const email = input.email.trim().toLowerCase();
  const username = input.username.trim().toLowerCase();
  const existing = store.users.find(
    (user) => user.email.toLowerCase() === email || user.username === username,
  );

  if (existing) {
    throw new Error("An account with that email or username already exists.");
  }

  const user: MockUser = {
    id: createUserId(),
    username,
    fullName: input.username.trim(),
    email,
    phone: input.phone.trim(),
    role: "organiser",
    emailConfirmed: true,
    isPremium: false,
    premiumUntil: null,
    stripeCustomerId: null,
    stripeSubscriptionId: null,
    subscriptionStatus: null,
    subscriptionRenewsAt: null,
    lastLogin: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    password: input.password,
  };

  store.users.push(user);
  return sanitizeUser(user);
}

export function loginMockUser(identifier: string, password: string) {
  const store = getStore();
  const value = identifier.trim().toLowerCase();
  const user = store.users.find(
    (entry) =>
      entry.email.toLowerCase() === value || entry.username.toLowerCase() === value,
  );

  if (!user || user.password !== password) {
    throw new Error("Incorrect email, username, or password.");
  }

  user.lastLogin = new Date().toISOString();

  const token = crypto.randomUUID();
  store.sessions = store.sessions.filter((session) => session.userId !== user.id);
  store.sessions.push({
    token,
    userId: user.id,
    createdAt: new Date().toISOString(),
  });

  return {
    token,
    user: sanitizeUser(user),
  };
}

export function getMockUserBySession(token?: string | null) {
  if (!token) {
    return null;
  }

  const session = getStore().sessions.find((entry) => entry.token === token);
  if (!session) {
    return null;
  }

  const user = getStore().users.find((entry) => entry.id === session.userId);
  return user ? sanitizeUser(user) : null;
}

export function clearMockSession(token?: string | null) {
  if (!token) {
    return;
  }

  getStore().sessions = getStore().sessions.filter(
    (session) => session.token !== token,
  );
}

export function listMockUserListings(userId: number) {
  return getStore().listings.filter((listing) => listing.userId === userId);
}

export function createMockListing(
  userId: number,
  payload: Partial<CarBootSale> & Pick<CarBootSale, "name" | "location" | "address" | "description">,
) {
  const store = getStore();
  const user = store.users.find((entry) => entry.id === userId);

  if (!user) {
    throw new Error("You must be signed in to create a listing.");
  }

  const listing: CarBootSale = {
    id: createListingId(),
    slug: createSlug(payload.name),
    name: payload.name,
    teaser: payload.teaser || payload.description.slice(0, 120),
    location: payload.location,
    county: payload.county || null,
    region: payload.region || null,
    postcode: payload.postcode || null,
    address: payload.address,
    description: payload.description,
    daysOfWeek: payload.daysOfWeek || ["sunday"],
    nextEventDate: payload.nextEventDate || null,
    startTime: payload.startTime || "07:00",
    endTime: payload.endTime || "13:00",
    carPrice: payload.carPrice ?? 10,
    vanPrice: payload.vanPrice ?? 16,
    freeParking: payload.freeParking ?? true,
    parkingFee: payload.parkingFee ?? null,
    hasCatering: payload.hasCatering ?? true,
    petsAllowed: payload.petsAllowed ?? true,
    venueType: payload.venueType || "outdoor",
    hasToilets: payload.hasToilets ?? true,
    hasHotFood: payload.hasHotFood ?? true,
    hasColdDrinks: payload.hasColdDrinks ?? true,
    hasPicnicTables: payload.hasPicnicTables ?? false,
    hasIndoorStalls: payload.hasIndoorStalls ?? false,
    hasDisabledAccess: payload.hasDisabledAccess ?? false,
    hasRubbishBins: payload.hasRubbishBins ?? true,
    hasFirstAid: payload.hasFirstAid ?? false,
    hasKidsActivities: payload.hasKidsActivities ?? false,
    otherInfo: payload.otherInfo || null,
    socialLink: payload.socialLink || null,
    socialLinks: payload.socialLinks || null,
    images: payload.images || ["/car-boot-sale.jpg"],
    imageAlt: payload.imageAlt || `${payload.name} listing photo`,
    isPremium: user.isPremium,
    listingTier: user.isPremium ? "premium" : "free",
    organiserEmail: payload.organiserEmail || user.email,
    organiserPhone: payload.organiserPhone || user.phone,
    organiserName: payload.organiserName || user.fullName || user.username,
    showEmail: payload.showEmail ?? true,
    showPhone: payload.showPhone ?? true,
    latitude: payload.latitude ?? null,
    longitude: payload.longitude ?? null,
    lastReminder: null,
    isConfirmed: true,
    confirmationSent: false,
    confirmationSentAt: null,
    confirmationDue: payload.confirmationDue || null,
    isFeatured: user.isPremium ? payload.isFeatured ?? true : false,
    isVerified: payload.isVerified ?? false,
    featuredRank: payload.featuredRank ?? null,
    viewCount: 0,
    what3words: payload.what3words || null,
    eventAnnouncement: payload.eventAnnouncement || null,
    status: payload.status || "pending",
    userId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  store.listings.unshift(listing);
  return listing;
}

export function updateMockListing(
  listingId: number,
  userId: number,
  payload: Partial<CarBootSale>,
) {
  const store = getStore();
  const index = store.listings.findIndex((listing) => listing.id === listingId);

  if (index === -1) {
    throw new Error("Listing not found.");
  }

  const current = store.listings[index];
  if (current.userId !== userId) {
    throw new Error("You do not have permission to edit this listing.");
  }

  const updated = {
    ...current,
    ...payload,
    slug: payload.name ? createSlug(payload.name) : current.slug,
    updatedAt: new Date().toISOString(),
  };

  store.listings[index] = updated;
  return updated;
}

export function deleteMockListing(listingId: number, userId: number) {
  const store = getStore();
  const current = store.listings.find((listing) => listing.id === listingId);

  if (!current) {
    throw new Error("Listing not found.");
  }

  if (current.userId !== userId) {
    throw new Error("You do not have permission to delete this listing.");
  }

  store.listings = store.listings.filter((listing) => listing.id !== listingId);
}

export function listMockAdminListings() {
  return [...getStore().listings].sort((a, b) => Number(b.id) - Number(a.id));
}

export function setMockListingStatus(listingId: number, payload: Partial<CarBootSale>) {
  const store = getStore();
  const index = store.listings.findIndex((listing) => listing.id === listingId);
  if (index === -1) {
    throw new Error("Listing not found.");
  }

  store.listings[index] = {
    ...store.listings[index],
    ...payload,
    updatedAt: new Date().toISOString(),
  };

  return store.listings[index];
}

export function activateMockPremiumForUser(userId: number) {
  const store = getStore();
  const user = store.users.find((entry) => entry.id === userId);

  if (!user) {
    throw new Error("User not found.");
  }

  user.isPremium = true;
  user.subscriptionStatus = "active";
  user.premiumUntil = new Date(
    Date.now() + 1000 * 60 * 60 * 24 * 365,
  ).toISOString();
  user.subscriptionRenewsAt = user.premiumUntil;

  store.listings = store.listings.map((listing) =>
    listing.userId === userId
      ? {
          ...listing,
          isPremium: true,
          listingTier: "premium",
          status: listing.status === "pending" ? "active" : listing.status,
        }
      : listing,
  );

  return sanitizeUser(user);
}
