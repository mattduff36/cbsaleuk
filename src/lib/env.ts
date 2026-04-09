export const env = {
  siteName: "carbootsale.com",
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
  supabasePublishableKey:
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  stripeSecretKey: process.env.STRIPE_SECRET_KEY,
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
  stripePremiumPriceId: process.env.STRIPE_PREMIUM_PRICE_ID,
  googleMapsApiKey:
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ||
    process.env.NEXT_PUBLIC_GOOGLE_API_KEY,
  weatherKitUrl: process.env.WEATHERKIT_BASE_URL || "https://weatherkit.apple.com",
  weatherKitKeyId: process.env.WEATHERKIT_KEY_ID,
  weatherKitTeamId: process.env.WEATHERKIT_TEAM_ID,
  weatherKitServiceId: process.env.WEATHERKIT_SERVICE_ID,
  weatherKitPrivateKey: process.env.WEATHERKIT_PRIVATE_KEY,
  adminEmails:
    process.env.ADMIN_EMAILS?.split(",")
      .map((entry) => entry.trim().toLowerCase())
      .filter(Boolean) || ["matt@example.com", "guy@example.com"],
};

export function hasSupabaseEnv() {
  return Boolean(env.supabaseUrl && env.supabasePublishableKey);
}

export function hasSupabaseAdminEnv() {
  return Boolean(
    env.supabaseUrl && env.supabasePublishableKey && env.supabaseServiceRoleKey,
  );
}

export function hasStripeEnv() {
  return Boolean(
    env.stripeSecretKey &&
      env.stripeWebhookSecret &&
      env.stripePremiumPriceId,
  );
}

export function hasWeatherKitEnv() {
  return Boolean(
    env.weatherKitKeyId &&
      env.weatherKitTeamId &&
      env.weatherKitServiceId &&
      env.weatherKitPrivateKey,
  );
}
