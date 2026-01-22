import { NextResponse } from 'next/server';

// Stub: Return success even though no session exists
export async function POST() {
  return NextResponse.json({ message: 'Logged out' });
}
