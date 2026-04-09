import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { env, hasStripeEnv } from "@/lib/env";
import { activateMockPremiumForUser } from "@/lib/mock-db";

export async function POST(request: Request) {
  if (!hasStripeEnv()) {
    return NextResponse.json({ received: true, mode: "demo" });
  }

  const stripe = new Stripe(env.stripeSecretKey!);
  const signature = (await headers()).get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ message: "Missing signature." }, { status: 400 });
  }

  const payload = await request.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      payload,
      signature,
      env.stripeWebhookSecret!,
    );
  } catch (error) {
    return NextResponse.json(
      {
        message:
          error instanceof Error ? error.message : "Webhook signature failed.",
      },
      { status: 400 },
    );
  }

  if (
    event.type === "checkout.session.completed" ||
    event.type === "invoice.paid"
  ) {
    const session = event.data.object as Stripe.Checkout.Session;
    const userId = session.metadata?.userId;
    if (userId) {
      activateMockPremiumForUser(Number(userId));
    }
  }

  return NextResponse.json({ received: true });
}
