"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ListingEditor } from "@/components/listing-editor";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/hooks/use-toast";

export default function ListSale() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Login Required",
        description: "Please log in to list your car boot sale.",
      });
      router.push("/login");
    }
  }, [isLoading, isAuthenticated, router, toast]);

  if (isLoading) {
    return <div className="px-4 py-16 text-center">Loading organiser workspace...</div>;
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <section className="px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl rounded-[2rem] border border-brand-brown/10 bg-white p-8 shadow-field">
        <ListingEditor mode="create" />
      </div>
    </section>
  );
}
