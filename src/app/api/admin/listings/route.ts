import { NextResponse } from "next/server";
import { getCurrentUser, isAdminUser } from "@/lib/auth-service";
import { listMockAdminListings } from "@/lib/mock-db";

export async function GET() {
  const user = await getCurrentUser();

  if (!isAdminUser(user)) {
    return NextResponse.json({ message: "Admin access required." }, { status: 403 });
  }

  return NextResponse.json(listMockAdminListings());
}
