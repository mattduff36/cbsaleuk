import type { MetadataRoute } from "next";
import { getBlogPosts, getFeaturedListings } from "@/lib/data";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [posts, listings] = await Promise.all([getBlogPosts(), getFeaturedListings()]);

  const staticRoutes = [
    "",
    "/search",
    "/subscribe",
    "/car-boot-tips",
    "/contact",
    "/privacy",
    "/terms",
  ].map((path) => ({
    url: `https://carbootsale.com${path}`,
    lastModified: new Date(),
  }));

  const listingRoutes = listings.map((listing) => ({
    url: `https://carbootsale.com/sale/${listing.slug || listing.id}`,
    lastModified: new Date(String(listing.updatedAt || listing.createdAt)),
  }));

  const blogRoutes = posts.map((post) => ({
    url: `https://carbootsale.com/car-boot-tips/${post.slug}`,
    lastModified: new Date(post.publishedAt),
  }));

  return [...staticRoutes, ...listingRoutes, ...blogRoutes];
}
