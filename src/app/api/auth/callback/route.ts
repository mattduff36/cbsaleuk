import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { env, hasSupabaseEnv } from "@/lib/env";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next") || "/dashboard";

  if (!hasSupabaseEnv() || !code) {
    return NextResponse.redirect(new URL(next, env.siteUrl));
  }

  let response = NextResponse.redirect(new URL(next, env.siteUrl));
  const requestCookies = request.headers.get("cookie") || "";

  const supabase = createServerClient(env.supabaseUrl!, env.supabasePublishableKey!, {
    cookies: {
      getAll() {
        return requestCookies
          .split(";")
          .map((item) => item.trim())
          .filter(Boolean)
          .map((item) => {
            const [name, ...rest] = item.split("=");
            return { name, value: rest.join("=") };
          });
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  await supabase.auth.exchangeCodeForSession(code);
  return response;
}
