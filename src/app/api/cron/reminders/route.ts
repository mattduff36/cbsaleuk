import { NextResponse } from "next/server";
import { listMockAdminListings, setMockListingStatus } from "@/lib/mock-db";

export async function GET() {
  const dueListings = listMockAdminListings().filter(
    (listing) =>
      listing.status === "active" &&
      !listing.confirmationSent &&
      Boolean(listing.confirmationDue),
  );

  const updated = dueListings.map((listing) =>
    setMockListingStatus(listing.id, {
      confirmationSent: true,
      confirmationSentAt: new Date().toISOString(),
      lastReminder: new Date().toISOString(),
    }),
  );

  return NextResponse.json({
    processed: updated.length,
    ids: updated.map((listing) => listing.id),
  });
}
