import { NextResponse } from "next/server";
import {
  deleteMockListing,
  getMockListing,
  updateMockListing,
} from "@/lib/mock-db";
import { getCurrentUser } from "@/lib/auth-service";

export async function GET(
  request: Request,
  { params }: { params: { id: string } },
) {
  const listing = getMockListing(params.id);

  if (!listing) {
    return NextResponse.json(
      { message: `Listing ${params.id} was not found.` },
      { status: 404 },
    );
  }

  return NextResponse.json(listing);
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } },
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ message: "Please sign in first." }, { status: 401 });
  }

  try {
    const listing = updateMockListing(
      Number(params.id),
      user.id,
      await request.json(),
    );
    return NextResponse.json(listing);
  } catch (error) {
    return NextResponse.json(
      {
        message:
          error instanceof Error ? error.message : "Unable to update listing.",
      },
      { status: 400 },
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } },
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ message: "Please sign in first." }, { status: 401 });
  }

  try {
    deleteMockListing(Number(params.id), user.id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      {
        message:
          error instanceof Error ? error.message : "Unable to delete listing.",
      },
      { status: 400 },
    );
  }
}
