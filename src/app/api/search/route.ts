import { NextResponse } from 'next/server';

// Stub: Return empty array since no DB is connected yet
export async function GET() {
  return NextResponse.json([]);
}
