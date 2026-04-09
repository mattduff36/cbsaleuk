import { NextResponse } from "next/server";
import { createMockListing, listMockListings } from "@/lib/mock-db";
import { getCurrentUser } from "@/lib/auth-service";

export async function GET() {
  const listings = listMockListings()
    .filter((listing) => listing.status !== "expired")
    .sort((a, b) => {
      const aFeatured = a.isFeatured ? 0 : 1;
      const bFeatured = b.isFeatured ? 0 : 1;
      return aFeatured - bFeatured;
    });

  return NextResponse.json(listings);
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ message: "Please sign in first." }, { status: 401 });
  }

  try {
    const body = await request.json();
    const listing = createMockListing(user.id, body);
    return NextResponse.json(listing, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      {
        message:
          error instanceof Error ? error.message : "Unable to create listing.",
      },
      { status: 400 },
    );
  }
}
