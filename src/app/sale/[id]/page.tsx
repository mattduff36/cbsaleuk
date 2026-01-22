"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import Layout from "@/components/layout";
import { Card, CardContent } from "@/components/ui/card";
import { CarBootSale } from "@/types";

export default function SaleDetail() {
  const params = useParams();
  const id = params.id as string;

  const { data: sale, isLoading, error } = useQuery<CarBootSale>({
    queryKey: [`/api/car-boot-sales/${id}`],
    enabled: !!id,
  });

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {isLoading ? (
          <Card>
            <CardContent className="p-8">
              <div className="animate-pulse space-y-4">
                <div className="h-8 bg-gray-200 rounded w-3/4" />
                <div className="h-4 bg-gray-200 rounded w-1/2" />
                <div className="h-32 bg-gray-200 rounded" />
              </div>
            </CardContent>
          </Card>
        ) : error ? (
          <Card>
            <CardContent className="p-8 text-center">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Car Boot Sale Not Found
              </h2>
              <p className="text-gray-600">
                This listing doesn&apos;t exist or the database is not connected yet.
              </p>
            </CardContent>
          </Card>
        ) : sale ? (
          <Card>
            <CardContent className="p-8">
              <h1 className="font-heading text-3xl font-bold text-gray-900 mb-4">
                {sale.name}
              </h1>
              <p className="text-gray-600 mb-4">{sale.location}</p>
              <p className="text-gray-800">{sale.description}</p>
            </CardContent>
          </Card>
        ) : null}
      </div>
    </Layout>
  );
}
