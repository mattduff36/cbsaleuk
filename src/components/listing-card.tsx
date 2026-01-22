"use client";

import { CarBootSale } from "@/types";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Car, Truck, ParkingMeter, Clock, Edit } from "lucide-react";
import { capitalizeFirstLetter } from "@/lib/utils";
import { useAuth } from "@/contexts/auth-context";

interface ListingCardProps {
  sale: CarBootSale & { distance?: number };
}

export default function ListingCard({ sale }: ListingCardProps) {
  // Get the current user to check if they own this listing
  const { user } = useAuth();
  const isOwner = user && user.id === sale.userId;
  
  // Convert day name to proper case
  const dayName = sale.daysOfWeek && sale.daysOfWeek.length > 0 
    ? capitalizeFirstLetter(sale.daysOfWeek[0]) 
    : "Daily";
  
  // Get the image for this listing - either uploaded by user or fallback
  const getListingImage = () => {
    // If the sale has images, use the first one
    if (sale.images && sale.images.length > 0) {
      return sale.images[0];
    }
    
    // Otherwise, use a default/fallback image of a car boot sale
    const defaultImageUrl = "/car-boot-sale.jpg";
    
    // Return the same car boot sale image regardless of venue type for consistency
    return defaultImageUrl;
  };

  return (
    <Card className="h-full overflow-hidden border-0 hover:shadow-lg transition-all group rounded-xl">
      <Link href={`/sale/${sale.id}`} className="block h-52 bg-gray-200 relative cursor-pointer">
        <img 
          src={getListingImage()}
          alt={sale.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ease-in-out"
        />
        <div className="absolute top-3 right-3 flex space-x-2">
          <Badge className="bg-white text-primary px-3 py-1 font-medium shadow-sm">
            {dayName}
          </Badge>
          {isOwner && (
            <Link href={`/edit-listing/${sale.id}`}>
              <Badge className="bg-green-600 text-white px-3 py-1 font-medium shadow-sm cursor-pointer hover:bg-green-700 flex items-center">
                <Edit className="w-3 h-3 mr-1" />
                Edit
              </Badge>
            </Link>
          )}
        </div>
      </Link>
      
      <CardContent className="p-5">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-heading font-semibold text-lg text-gray-900">{sale.name}</h3>
        </div>
        
        <div className="flex items-center text-gray-500 mb-4">
          <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
          <span className="text-sm truncate">{sale.address || sale.location}</span>
        </div>
        
        <div className="grid grid-cols-2 gap-3 mb-5">
          <div className="flex items-center text-sm">
            <Car className="h-4 w-4 mr-2 text-primary flex-shrink-0" />
            <span>£{sale.carPrice.toFixed(2)} per car</span>
          </div>
          <div className="flex items-center text-sm">
            <Truck className="h-4 w-4 mr-2 text-primary flex-shrink-0" />
            <span>£{sale.vanPrice.toFixed(2)} per van</span>
          </div>
          <div className="flex items-center text-sm">
            <ParkingMeter className="h-4 w-4 mr-2 text-primary flex-shrink-0" />
            <span>{sale.freeParking ? "Free parking" : "Paid parking"}</span>
          </div>
          <div className="flex items-center text-sm">
            <Clock className="h-4 w-4 mr-2 text-primary flex-shrink-0" />
            <span>{sale.startTime} - {sale.endTime}</span>
          </div>
        </div>
        
        <div className="flex justify-between items-center pt-3 border-t border-gray-100">
          {sale.distance !== undefined ? (
            <span className="text-sm text-gray-500">{sale.distance} miles away</span>
          ) : (
            <span className="text-sm text-gray-500">{sale.location}</span>
          )}
          
          <Link href={`/sale/${sale.id}`}>
            <Button variant="link" className="text-primary p-0 h-auto font-medium">
              View details
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
