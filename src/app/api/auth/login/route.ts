import { NextResponse } from "next/server";
import {
  SESSION_COOKIE_NAME,
  getSessionCookieOptions,
  loginDemoUser,
} from "@/lib/auth-service";

export async function POST(request: Request) {
  const body = await request.json();
  const identifier = body.username || body.email || body.identifier;
  const password = body.password;

  if (!identifier || !password) {
    return NextResponse.json(
      { message: "Email or username and password are required." },
      { status: 400 },
    );
  }

  try {
    const { token, user } = loginDemoUser(identifier, password);
    const response = NextResponse.json(user);
    response.cookies.set(SESSION_COOKIE_NAME, token, getSessionCookieOptions());
    return response;
  } catch (error) {
    return NextResponse.json(
      {
        message:
          error instanceof Error ? error.message : "Unable to sign you in.",
      },
      { status: 401 },
    );
  }
}
