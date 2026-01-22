import { NextResponse } from 'next/server';

// Stub: Return empty array since no DB is connected yet
export async function GET() {
  return NextResponse.json([]);
}

// Stub: Return 501 for creating new listings
export async function POST() {
  return NextResponse.json(
    { message: 'Creating listings not available yet - database not connected' },
    { status: 501 }
  );
}
