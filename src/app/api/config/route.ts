import { NextResponse } from 'next/server';

// Return config with optional Google API key
export async function GET() {
  return NextResponse.json({
    googleApiKey: process.env.NEXT_PUBLIC_GOOGLE_API_KEY || null
  });
}
