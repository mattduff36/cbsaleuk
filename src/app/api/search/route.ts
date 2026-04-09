import { NextResponse } from "next/server";
import { searchListings } from "@/lib/data";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const location = searchParams.get("location") || "";
  const radius = Number(searchParams.get("radius") || "25");
  const dayOfWeek = searchParams.get("dayOfWeek") || undefined;
  const lat = searchParams.get("lat");
  const lng = searchParams.get("lng");

  const results = await searchListings({
    location,
    radius,
    dayOfWeek,
    lat: lat ? Number(lat) : undefined,
    lng: lng ? Number(lng) : undefined,
  });

  return NextResponse.json(results);
}
