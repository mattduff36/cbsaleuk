"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Layout from "@/components/layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/hooks/use-toast";
import { Crown, Check, AlertCircle } from "lucide-react";

export default function Subscribe() {
  const router = useRouter();
  const { isAuthenticated, isLoading, user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Login Required",
        description: "Please log in to upgrade to Premium.",
        variant: "default",
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
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 text-center">
          <p>Loading...</p>
        </div>
      </Layout>
    );
  }

  if (!isAuthenticated || user?.isPremium) {
    return null;
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center mb-8">
          <Crown className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
          <h1 className="font-heading text-3xl font-bold text-gray-900 mb-2">
            Upgrade to Premium
          </h1>
          <p className="text-gray-600">
            Unlock all features and grow your car boot sale
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Premium Features</CardTitle>
              <CardDescription>Everything you need for success</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                "Unlimited listings",
                "Up to 10 images per listing",
                "Featured placement in search",
                "Event announcements",
                "Priority support",
              ].map((feature) => (
                <div key={feature} className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-green-500" />
                  <span>{feature}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-3xl">£25/year</CardTitle>
              <CardDescription>Just £2.08 per month</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg mb-4">
                <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
                <div>
                  <p className="font-medium text-amber-800">Coming Soon</p>
                  <p className="text-sm text-amber-700">
                    Payment processing will be available once Stripe is connected.
                  </p>
                </div>
              </div>
              <Button className="w-full" disabled>
                Subscribe Now
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
