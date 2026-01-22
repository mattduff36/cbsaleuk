"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import Layout from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/auth-context";
import { CarBootSale } from "@/types";
import { PlusCircle, Settings, Crown } from "lucide-react";

export default function Dashboard() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [authLoading, isAuthenticated, router]);

  const { data: userListings, isLoading: listingsLoading } = useQuery<CarBootSale[]>({
    queryKey: ['/api/car-boot-sales/user'],
    enabled: isAuthenticated,
  });

  if (authLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 text-center">
          <p>Loading...</p>
        </div>
      </Layout>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="font-heading text-3xl font-bold text-gray-900">
              Welcome, {user?.username}!
            </h1>
            <p className="text-gray-600 mt-1">Manage your car boot sale listings</p>
          </div>
          <div className="flex gap-4">
            {!user?.isPremium && (
              <Link href="/subscribe">
                <Button variant="outline" className="gap-2">
                  <Crown className="h-4 w-4" />
                  Upgrade to Premium
                </Button>
              </Link>
            )}
            <Link href="/list-sale">
              <Button className="gap-2">
                <PlusCircle className="h-4 w-4" />
                Add New Listing
              </Button>
            </Link>
          </div>
        </div>

        {user?.isPremium && (
          <Card className="mb-8 bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
            <CardContent className="p-4 flex items-center gap-3">
              <Crown className="h-6 w-6 text-yellow-600" />
              <div>
                <p className="font-semibold text-yellow-800">Premium Member</p>
                <p className="text-sm text-yellow-700">You have access to all premium features</p>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Your Listings</CardTitle>
          </CardHeader>
          <CardContent>
            {listingsLoading ? (
              <p className="text-gray-600">Loading your listings...</p>
            ) : userListings && userListings.length > 0 ? (
              <div className="space-y-4">
                {userListings.map((listing) => (
                  <div key={listing.id} className="flex justify-between items-center p-4 border rounded-lg">
                    <div>
                      <h3 className="font-semibold">{listing.name}</h3>
                      <p className="text-sm text-gray-600">{listing.location}</p>
                    </div>
                    <div className="flex gap-2">
                      <Link href={`/sale/${listing.id}`}>
                        <Button variant="outline" size="sm">View</Button>
                      </Link>
                      <Link href={`/edit-listing/${listing.id}`}>
                        <Button variant="outline" size="sm">
                          <Settings className="h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-600 mb-4">You haven&apos;t created any listings yet.</p>
                <Link href="/list-sale">
                  <Button>Create Your First Listing</Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
