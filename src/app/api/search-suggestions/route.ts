import { NextResponse } from "next/server";
import { getSearchSuggestions } from "@/lib/data";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q") || "";

  if (query.trim().length < 2) {
    return NextResponse.json({ listings: [], locations: [] });
  }

  return NextResponse.json(await getSearchSuggestions(query));
}
