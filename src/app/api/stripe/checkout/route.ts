import { NextResponse } from "next/server";
import Stripe from "stripe";
import { env, hasStripeEnv } from "@/lib/env";
import { activateMockPremiumForUser } from "@/lib/mock-db";
import { getCurrentUser } from "@/lib/auth-service";

export async function POST() {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ message: "Please sign in first." }, { status: 401 });
  }

  if (!hasStripeEnv()) {
    activateMockPremiumForUser(user.id);
    return NextResponse.json({ url: "/dashboard?premium=activated" });
  }

  const stripe = new Stripe(env.stripeSecretKey!);
  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [
      {
        price: env.stripePremiumPriceId!,
        quantity: 1,
      },
    ],
    customer_email: user.email,
    metadata: {
      userId: String(user.id),
      tier: "premium",
    },
    success_url: `${env.siteUrl}/dashboard?premium=success`,
    cancel_url: `${env.siteUrl}/subscribe?premium=cancelled`,
  });

  return NextResponse.json({ url: session.url });
}
