import type { User as SupabaseUser } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { env } from "@/lib/env";
import {
  clearMockSession,
  getMockUserBySession,
  loginMockUser,
  registerMockUser,
} from "@/lib/mock-db";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { User } from "@/types";

export const SESSION_COOKIE_NAME = "bootsale-session";

export function getSessionCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  };
}

function mapSupabaseUser(user: SupabaseUser): User {
  return {
    id: Number(user.user_metadata?.profile_id || user.id.replace(/\D/g, "").slice(0, 6) || "1"),
    username:
      user.user_metadata?.username ||
      user.email?.split("@")[0] ||
      "organiser",
    fullName: user.user_metadata?.full_name || null,
    email: user.email || "",
    phone: user.user_metadata?.phone || "",
    role: env.adminEmails.includes((user.email || "").toLowerCase())
      ? "admin"
      : "organiser",
    emailConfirmed: Boolean(user.email_confirmed_at),
    isPremium: Boolean(user.user_metadata?.is_premium),
    premiumUntil: user.user_metadata?.premium_until || null,
    stripeCustomerId: user.user_metadata?.stripe_customer_id || null,
    stripeSubscriptionId: user.user_metadata?.stripe_subscription_id || null,
    subscriptionStatus: user.user_metadata?.subscription_status || null,
    subscriptionRenewsAt: user.user_metadata?.subscription_renews_at || null,
    lastLogin: user.last_sign_in_at || null,
    createdAt: user.created_at,
  };
}

export async function getCurrentUser() {
  const supabase = await getSupabaseServerClient();

  if (supabase) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    return user ? mapSupabaseUser(user) : null;
  }

  const cookieStore = await cookies();
  return getMockUserBySession(cookieStore.get(SESSION_COOKIE_NAME)?.value);
}

export async function getCurrentSessionToken() {
  const cookieStore = await cookies();
  return cookieStore.get(SESSION_COOKIE_NAME)?.value ?? null;
}

export function loginDemoUser(identifier: string, password: string) {
  return loginMockUser(identifier, password);
}

export function registerDemoUser(input: {
  username: string;
  email: string;
  phone: string;
  password: string;
}) {
  return registerMockUser(input);
}

export async function logoutDemoUser() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  clearMockSession(sessionToken);
}

export function isAdminUser(user: User | null) {
  if (!user) {
    return false;
  }

  return user.role === "admin" || env.adminEmails.includes(user.email.toLowerCase());
}
