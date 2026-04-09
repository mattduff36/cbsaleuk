import { NextResponse } from "next/server";
import { getWeatherSummary } from "@/lib/weather";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lat = Number(searchParams.get("lat") || "53.8008");
  const lon = Number(searchParams.get("lon") || "-1.5491");
  const dayOfWeek =
    (searchParams.get("dayOfWeek") as "saturday" | "sunday" | null) || "saturday";

  return NextResponse.json(getWeatherSummary(lat, lon, dayOfWeek));
}
