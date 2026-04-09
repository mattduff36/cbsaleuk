import { NextResponse } from "next/server";
import {
  SESSION_COOKIE_NAME,
  getSessionCookieOptions,
  loginDemoUser,
  registerDemoUser,
} from "@/lib/auth-service";

export async function POST(request: Request) {
  const body = await request.json();

  if (!body.username || !body.email || !body.phone || !body.password) {
    return NextResponse.json(
      { message: "Username, email, phone, and password are required." },
      { status: 400 },
    );
  }

  try {
    registerDemoUser(body);
    const { token, user } = loginDemoUser(body.email, body.password);
    const response = NextResponse.json(user, { status: 201 });
    response.cookies.set(SESSION_COOKIE_NAME, token, getSessionCookieOptions());
    return response;
  } catch (error) {
    return NextResponse.json(
      {
        message:
          error instanceof Error ? error.message : "Unable to create account.",
      },
      { status: 400 },
    );
  }
}
