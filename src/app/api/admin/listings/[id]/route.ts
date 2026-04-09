import { NextResponse } from "next/server";
import { getCurrentUser, isAdminUser } from "@/lib/auth-service";
import { setMockListingStatus } from "@/lib/mock-db";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } },
) {
  const user = await getCurrentUser();

  if (!isAdminUser(user)) {
    return NextResponse.json({ message: "Admin access required." }, { status: 403 });
  }

  try {
    const listing = setMockListingStatus(Number(params.id), await request.json());
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
