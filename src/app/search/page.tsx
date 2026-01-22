"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import Layout from "@/components/layout";
import ListingCard from "@/components/listing-card";
import { Card, CardContent } from "@/components/ui/card";
import { CarBootSale } from "@/types";

function SearchContent() {
  const searchParams = useSearchParams();
  const location = searchParams.get('location') || '';
  const radius = searchParams.get('radius') || '10';

  const { data: results, isLoading } = useQuery<CarBootSale[]>({
    queryKey: ['/api/search', { location, radius }],
    enabled: !!location,
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="font-heading text-3xl font-bold text-gray-900 mb-6">
        {location ? `Car Boot Sales near ${location}` : 'Search Car Boot Sales'}
      </h1>

      {!location && (
        <div className="text-center py-12">
          <p className="text-gray-600 mb-4">Enter a location to search for car boot sales near you.</p>
        </div>
      )}

      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <Card key={index} className="overflow-hidden">
              <div className="h-48 bg-gray-200 animate-pulse" />
              <CardContent className="p-4">
                <div className="h-6 bg-gray-200 rounded animate-pulse mb-2 w-3/4" />
                <div className="h-4 bg-gray-200 rounded animate-pulse w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {results && results.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {results.map((sale) => (
            <ListingCard key={sale.id} sale={sale} />
          ))}
        </div>
      ) : location && !isLoading ? (
        <div className="text-center py-12">
          <p className="text-gray-600">No car boot sales found in this area.</p>
        </div>
      ) : null}
    </div>
  );
}

export default function SearchResults() {
  return (
    <Layout>
      <Suspense fallback={
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-10 bg-gray-200 rounded w-1/3 mb-6" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-64 bg-gray-200 rounded" />
              ))}
            </div>
          </div>
        </div>
      }>
        <SearchContent />
      </Suspense>
    </Layout>
  );
}
