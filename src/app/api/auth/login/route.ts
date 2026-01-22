import { NextResponse } from 'next/server';

// Stub: Return 501 since no DB is connected yet
export async function POST() {
  return NextResponse.json(
    { message: 'Login not available yet - database not connected' },
    { status: 501 }
  );
}
