import { NextResponse } from 'next/server';

// Stub: Return 404 for specific listing
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  return NextResponse.json(
    { message: `Listing ${params.id} not found - database not connected` },
    { status: 404 }
  );
}

// Stub: Return 501 for updating listings
export async function PATCH() {
  return NextResponse.json(
    { message: 'Updating listings not available yet - database not connected' },
    { status: 501 }
  );
}

// Stub: Return 501 for deleting listings
export async function DELETE() {
  return NextResponse.json(
    { message: 'Deleting listings not available yet - database not connected' },
    { status: 501 }
  );
}
