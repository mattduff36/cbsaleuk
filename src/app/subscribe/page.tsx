"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/hooks/use-toast";
import { Check, Crown } from "lucide-react";

export default function Subscribe() {
  const router = useRouter();
  const { isAuthenticated, isLoading, user } = useAuth();
  const { toast } = useToast();
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Login Required",
        description: "Please log in to upgrade to Premium.",
      });
      router.push("/login");
    }
  }, [isLoading, isAuthenticated, router, toast]);

  useEffect(() => {
    if (user?.isPremium) {
      toast({
        title: "Already Premium!",
        description: "You already have a premium subscription.",
      });
      router.push("/dashboard");
    }
  }, [user, router, toast]);

  if (isLoading) {
    return <div className="px-4 py-16 text-center">Loading premium plan...</div>;
  }

  if (!isAuthenticated || user?.isPremium) {
    return null;
  }

  const handleCheckout = async () => {
    setIsCheckoutLoading(true);
    try {
      const response = await fetch("/api/stripe/checkout", { method: "POST" });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Unable to start checkout.");
      }
      window.location.href = data.url;
    } catch (error) {
      toast({
        title: "Checkout failed",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
      setIsCheckoutLoading(false);
    }
  };

  return (
    <section className="px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-8">
        <div className="glass-card p-8 text-center">
          <Crown className="mx-auto h-12 w-12 text-brand-green" />
          <h1 className="font-heading mt-4 text-5xl font-semibold text-brand-ink">
            Premium organiser listing
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-brand-brown/80">
            A £25 yearly upgrade that unlocks richer storytelling, organiser trust signals,
            event announcements, and stronger placement within the marketplace.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          <Card className="border-brand-brown/10 bg-white shadow-field">
            <CardContent className="space-y-4 p-8">
              <div className="text-xs uppercase tracking-[0.18em] text-brand-brown/60">
                Included
              </div>
              {[
                "Premium badge and richer profile design",
                "Multiple images and social links",
                "Event announcement module",
                "Subscription-backed upgrade path",
                "Admin review and verification workflow",
              ].map((feature) => (
                <div key={feature} className="flex items-center gap-3 text-sm text-brand-brown/85">
                  <Check className="h-4 w-4 text-brand-green" />
                  <span>{feature}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-brand-green/30 bg-brand-green/10 shadow-field">
            <CardContent className="space-y-4 p-8">
              <div className="text-xs uppercase tracking-[0.18em] text-brand-brown/60">
                Price
              </div>
              <div className="font-heading text-5xl text-brand-ink">£25</div>
              <p className="text-sm leading-7 text-brand-brown/80">
                Billed yearly per premium listing. In demo mode, checkout upgrades your
                account immediately so you can test the workflow end to end.
              </p>
              <Button
                className="w-full rounded-full bg-brand-ink text-white hover:bg-brand-brown"
                onClick={handleCheckout}
                disabled={isCheckoutLoading}
              >
                {isCheckoutLoading ? "Starting checkout..." : "Upgrade now"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
