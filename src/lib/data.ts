import { BRAND } from "@/lib/brand";
import {
  getMockBlogPost,
  getMockFeaturedListings,
  getMockListing,
  getMockRelatedBlogPosts,
  getMockSearchSuggestions,
  listMockBlogPosts,
  listMockListings,
  searchMockListings,
} from "@/lib/mock-db";
import { SearchFilters } from "@/types";

export async function getFeaturedListings() {
  return getMockFeaturedListings();
}

export async function getLatestListings() {
  return listMockListings()
    .sort((a, b) => Number(b.id) - Number(a.id))
    .slice(0, 8);
}

export async function getListingByIdOrSlug(idOrSlug: string) {
  return getMockListing(idOrSlug);
}

export async function searchListings(filters: SearchFilters) {
  return searchMockListings(filters);
}

export async function getSearchSuggestions(query: string) {
  return getMockSearchSuggestions(query);
}

export async function getBlogPosts() {
  return listMockBlogPosts().sort((a, b) =>
    a.publishedAt < b.publishedAt ? 1 : -1,
  );
}

export async function getBlogPostBySlug(slug: string) {
  return getMockBlogPost(slug);
}

export async function getRelatedBlogPosts(listingSlug?: string) {
  return getMockRelatedBlogPosts(listingSlug);
}

export async function getHomepageStats() {
  const listings = listMockListings();
  const verified = listings.filter((listing) => listing.isVerified).length;
  const premium = listings.filter((listing) => listing.listingTier === "premium").length;

  return [
    { label: "Live listings", value: String(listings.length).padStart(2, "0") },
    { label: "Verified organisers", value: String(verified).padStart(2, "0") },
    { label: "Premium profiles", value: String(premium).padStart(2, "0") },
    { label: "Ad clutter", value: "0" },
  ];
}

export function buildAbsoluteUrl(pathname = "") {
  return new URL(pathname || "/", BRAND.domain.startsWith("http") ? BRAND.domain : `https://${BRAND.domain}`).toString();
}
