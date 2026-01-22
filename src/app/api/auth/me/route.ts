import { NextResponse } from 'next/server';

// Stub: Return 401 since no DB is connected yet
export async function GET() {
  return NextResponse.json(
    { message: 'Authentication not available yet' },
    { status: 401 }
  );
}
