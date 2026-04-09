import { NextResponse } from "next/server";
import { getHourlyWeather } from "@/lib/weather";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lat = Number(searchParams.get("lat") || "53.8008");
  const lon = Number(searchParams.get("lon") || "-1.5491");

  return NextResponse.json(getHourlyWeather(lat, lon));
}
