"use client";

import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { ListingEditor } from "@/components/listing-editor";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/hooks/use-toast";
import { CarBootSale } from "@/types";

export default function EditListing() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const id = params.id as string;

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Login Required",
        description: "Please log in to edit your listing.",
      });
      router.push("/login");
    }
  }, [isLoading, isAuthenticated, router, toast]);

  const { data: listing, isLoading: listingLoading } = useQuery<CarBootSale>({
    queryKey: [`/api/car-boot-sales/${id}`],
    queryFn: async () => {
      const response = await fetch(`/api/car-boot-sales/${id}`);
      if (!response.ok) {
        throw new Error("Unable to load listing.");
      }
      return response.json();
    },
    enabled: isAuthenticated && Boolean(id),
  });

  if (isLoading) {
    return <div className="px-4 py-16 text-center">Loading organiser workspace...</div>;
  }

  if (!isAuthenticated) {
    return null;
  }

  if (listingLoading || !listing) {
    return <div className="px-4 py-16 text-center">Loading listing...</div>;
  }

  return (
    <section className="px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl rounded-[2rem] border border-brand-brown/10 bg-white p-8 shadow-field">
        <ListingEditor mode="edit" listing={listing} />
      </div>
    </section>
  );
}
