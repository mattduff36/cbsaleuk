import { NextResponse } from "next/server";
import { getWeatherSummary } from "@/lib/weather";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const dayOfWeek =
    (searchParams.get("dayOfWeek") as "saturday" | "sunday" | null) || "saturday";
  const location = (searchParams.get("location") || "").toLowerCase();

  const cityCoordinates: Record<string, { lat: number; lon: number }> = {
    london: { lat: 51.5074, lon: -0.1278 },
    leeds: { lat: 53.8008, lon: -1.5491 },
    bristol: { lat: 51.4545, lon: -2.5879 },
    newcastle: { lat: 54.9783, lon: -1.6178 },
  };

  const coordinates =
    cityCoordinates[location.split(",")[0].trim()] || cityCoordinates.leeds;

  return NextResponse.json(
    getWeatherSummary(coordinates.lat, coordinates.lon, dayOfWeek),
  );
}
