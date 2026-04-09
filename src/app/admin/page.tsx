"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ShieldCheck, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/hooks/use-toast";
import { CarBootSale } from "@/types";

export default function AdminPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user, isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || user?.role !== "admin")) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, isLoading, router, user]);

  const { data: listings, isLoading: listingsLoading } = useQuery<CarBootSale[]>({
    queryKey: ["/api/admin/listings"],
    queryFn: async () => {
      const response = await fetch("/api/admin/listings");
      if (!response.ok) {
        throw new Error("Unable to load admin listings.");
      }
      return response.json();
    },
    enabled: isAuthenticated && user?.role === "admin",
  });

  const updateMutation = useMutation({
    mutationFn: async ({
      id,
      payload,
    }: {
      id: number;
      payload: Partial<CarBootSale>;
    }) => {
      const response = await fetch(`/api/admin/listings/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Unable to update listing.");
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/listings"] });
      queryClient.invalidateQueries({ queryKey: ["/api/car-boot-sales/user"] });
      toast({
        title: "Listing updated",
        description: "Admin moderation changes have been applied.",
      });
    },
    onError: (error) => {
      toast({
        title: "Moderation failed",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    },
  });

  if (isLoading || listingsLoading) {
    return <div className="px-4 py-16 text-center">Loading admin panel...</div>;
  }

  if (!isAuthenticated || user?.role !== "admin") {
    return null;
  }

  return (
    <section className="px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <div className="glass-card flex flex-col gap-4 p-8 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="text-xs uppercase tracking-[0.18em] text-brand-brown/60">
              Admin panel
            </div>
            <h1 className="font-heading mt-3 text-5xl font-semibold text-brand-ink">
              Moderation and verification
            </h1>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-brand-green/30 bg-brand-green/10 px-4 py-2 text-xs uppercase tracking-[0.18em] text-brand-brown/80">
            <ShieldCheck className="h-4 w-4 text-brand-green" />
            Matt & Guy override access
          </div>
        </div>

        <div className="flex justify-end">
          <Link href="/admin/blog">
            <Button variant="outline" className="rounded-full border-brand-brown/20 bg-white">
              Blog assistant
            </Button>
          </Link>
        </div>

        <div className="space-y-4">
          {listings?.map((listing) => (
            <div
              key={listing.id}
              className="rounded-[1.5rem] border border-brand-brown/10 bg-white p-6 shadow-[0_16px_40px_rgba(35,23,16,0.06)]"
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <div className="font-heading text-2xl text-brand-ink">{listing.name}</div>
                  <div className="mt-1 text-sm text-brand-brown/70">
                    {listing.location} • {listing.status || "pending"} •{" "}
                    {listing.listingTier || "free"}
                  </div>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Button
                    variant="outline"
                    className="rounded-full border-brand-brown/20 bg-white"
                    onClick={() =>
                      updateMutation.mutate({
                        id: listing.id,
                        payload: {
                          isVerified: !listing.isVerified,
                          status: listing.status === "pending" ? "active" : listing.status,
                        },
                      })
                    }
                  >
                    {listing.isVerified ? "Remove verification" : "Verify listing"}
                  </Button>
                  <Button
                    variant="outline"
                    className="rounded-full border-brand-brown/20 bg-white"
                    onClick={() =>
                      updateMutation.mutate({
                        id: listing.id,
                        payload: { isFeatured: !listing.isFeatured },
                      })
                    }
                  >
                    <Sparkles className="mr-2 h-4 w-4" />
                    {listing.isFeatured ? "Unfeature" : "Feature"}
                  </Button>
                  <Button
                    variant="outline"
                    className="rounded-full border-brand-brown/20 bg-white"
                    onClick={() =>
                      updateMutation.mutate({
                        id: listing.id,
                        payload: {
                          status: listing.status === "paused" ? "active" : "paused",
                        },
                      })
                    }
                  >
                    {listing.status === "paused" ? "Resume" : "Pause"}
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
