import { NextResponse } from 'next/server';

// Stub: Return empty suggestions since no DB is connected yet
export async function GET() {
  return NextResponse.json({
    listings: [],
    locations: []
  });
}
