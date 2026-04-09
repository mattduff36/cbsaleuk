import { NextResponse } from "next/server";
import { SESSION_COOKIE_NAME, logoutDemoUser } from "@/lib/auth-service";

export async function POST() {
  await logoutDemoUser();

  const response = NextResponse.json({ message: "Logged out" });
  response.cookies.delete(SESSION_COOKIE_NAME);
  return response;
}
