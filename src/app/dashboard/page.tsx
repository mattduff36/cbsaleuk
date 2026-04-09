"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/contexts/auth-context";
import { CarBootSale } from "@/types";
import { Crown, PlusCircle, ShieldCheck } from "lucide-react";

export default function Dashboard() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [authLoading, isAuthenticated, router]);

  const { data: userListings, isLoading: listingsLoading } = useQuery<CarBootSale[]>({
    queryKey: ["/api/car-boot-sales/user"],
    queryFn: async () => {
      const response = await fetch("/api/car-boot-sales/user");
      if (!response.ok) {
        throw new Error("Unable to load your listings.");
      }
      return response.json();
    },
    enabled: isAuthenticated,
  });

  if (authLoading) {
    return (
      <div className="px-4 py-16 text-center">Loading dashboard...</div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <section className="px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <div className="glass-card flex flex-col justify-between gap-6 p-8 lg:flex-row lg:items-end">
          <div>
            <div className="text-xs uppercase tracking-[0.18em] text-brand-brown/60">
              Organiser dashboard
            </div>
            <h1 className="font-heading mt-3 text-5xl font-semibold text-brand-ink">
              Welcome back, {user?.fullName || user?.username}
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-brand-brown/80">
              Manage your listing portfolio, premium status, and moderation-ready event
              details from one place.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            {!user?.isPremium && (
              <Link href="/subscribe">
                <Button variant="outline" className="gap-2 rounded-full border-brand-brown/20 bg-white">
                  <Crown className="h-4 w-4" />
                  Upgrade to Premium
                </Button>
              </Link>
            )}
            <Link href="/list-sale">
              <Button className="gap-2 rounded-full bg-brand-ink text-white hover:bg-brand-brown">
                <PlusCircle className="h-4 w-4" />
                Add New Listing
              </Button>
            </Link>
            {user?.role === "admin" && (
              <Link href="/admin">
                <Button variant="outline" className="gap-2 rounded-full border-brand-brown/20 bg-white">
                  <ShieldCheck className="h-4 w-4" />
                  Admin panel
                </Button>
              </Link>
            )}
          </div>
        </div>

        {user?.isPremium && (
          <Card className="border-brand-green/30 bg-brand-green/10">
            <CardContent className="flex items-center gap-3 p-5">
              <Crown className="h-6 w-6 text-brand-ink" />
              <div>
                <p className="font-semibold text-brand-ink">Premium organiser active</p>
                <p className="text-sm text-brand-brown/75">
                  Your profile can use richer media, event announcements, and premium
                  trust signals.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="border-brand-brown/10 bg-white shadow-field">
          <CardContent className="p-8">
            <div className="mb-6">
              <div className="text-xs uppercase tracking-[0.18em] text-brand-brown/60">
                Your listings
              </div>
              <h2 className="font-heading mt-2 text-3xl text-brand-ink">
                Active portfolio
              </h2>
            </div>
            {listingsLoading ? (
              <p className="text-brand-brown/70">Loading your listings...</p>
            ) : userListings && userListings.length > 0 ? (
              <div className="space-y-4">
                {userListings.map((listing) => (
                  <div
                    key={listing.id}
                    className="flex flex-col gap-4 rounded-[1.5rem] border border-brand-brown/10 bg-brand-cream p-5 md:flex-row md:items-center md:justify-between"
                  >
                    <div>
                      <h3 className="font-heading text-2xl text-brand-ink">{listing.name}</h3>
                      <p className="mt-1 text-sm text-brand-brown/70">{listing.location}</p>
                    </div>
                    <div className="flex gap-2">
                      <Link href={`/sale/${listing.slug || listing.id}`}>
                        <Button variant="outline" size="sm" className="rounded-full border-brand-brown/20 bg-white">
                          View
                        </Button>
                      </Link>
                      <Link href={`/edit-listing/${listing.id}`}>
                        <Button variant="outline" size="sm" className="rounded-full border-brand-brown/20 bg-white">
                          Edit
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center">
                <p className="mb-4 text-brand-brown/75">
                  You haven&apos;t created any listings yet.
                </p>
                <Link href="/list-sale">
                  <Button className="rounded-full bg-brand-ink text-white hover:bg-brand-brown">
                    Create Your First Listing
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
