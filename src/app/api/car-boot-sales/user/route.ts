import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth-service";
import { listMockUserListings } from "@/lib/mock-db";

export async function GET() {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ message: "Please sign in first." }, { status: 401 });
  }

  return NextResponse.json(listMockUserListings(user.id));
}
