"use client";

import Image from "next/image";
import Link from "next/link";
import { BadgeCheck, CalendarDays, MapPin, Sparkles, TentTree } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { CarBootSale } from "@/types";
import { formatDate, getWeekendStatus } from "@/lib/utils";

interface ListingCardProps {
  sale: CarBootSale & { distance?: number };
}

export default function ListingCard({ sale }: ListingCardProps) {
  const image = sale.images?.[0] || "/car-boot-sale.jpg";
  const listingHref = `/sale/${sale.slug || sale.id}`;
  const weekendStatus = getWeekendStatus(sale.daysOfWeek?.[0] || "sunday");
  const nextEvent =
    sale.nextEventDate && typeof sale.nextEventDate === "string"
      ? formatDate(sale.nextEventDate)
      : null;

  return (
    <Card className="group h-full overflow-hidden rounded-[1.5rem] border border-brand-brown/10 bg-white/90 shadow-[0_20px_45px_rgba(35,23,16,0.08)] transition duration-300 hover:-translate-y-1 hover:shadow-field">
      <Link href={listingHref} className="relative block h-60 overflow-hidden">
        <Image
          src={image}
          alt={sale.imageAlt || sale.name}
          fill
          className="object-cover transition duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-ink/75 via-brand-ink/10 to-transparent" />
        <div className="absolute left-4 top-4 flex flex-wrap gap-2">
          {sale.isVerified && (
            <Badge className="border-0 bg-white/95 text-brand-ink">
              <BadgeCheck className="mr-1 h-3.5 w-3.5 text-brand-green" />
              Verified
            </Badge>
          )}
          {sale.isFeatured && (
            <Badge className="border-0 bg-brand-green text-brand-ink">
              <Sparkles className="mr-1 h-3.5 w-3.5" />
              Featured
            </Badge>
          )}
          <Badge className="border-0 bg-brand-ink/70 text-white">
            {sale.listingTier === "premium" ? "Premium" : "Free"}
          </Badge>
        </div>
        <div className="absolute bottom-4 left-4 right-4">
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-white/85 backdrop-blur">
            <TentTree className="h-3.5 w-3.5" />
            {sale.venueType || "Outdoor"} sale
          </div>
          <h3 className="font-heading text-2xl font-semibold text-white">
            {sale.name}
          </h3>
          <p className="mt-1 max-w-xl text-sm text-white/85">
            {sale.teaser || sale.description}
          </p>
        </div>
      </Link>

      <CardContent className="space-y-5 p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-brand-brown/70">
              <MapPin className="h-4 w-4 text-brand-brown" />
              <span>{sale.address || sale.location}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-brand-brown/70">
              <CalendarDays className="h-4 w-4 text-brand-brown" />
              <span>{nextEvent || weekendStatus.message || "Weekly listing"}</span>
            </div>
          </div>
          {"distance" in sale && sale.distance !== undefined ? (
            <div className="rounded-full border border-brand-brown/10 bg-brand-cream px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-brand-brown">
              {sale.distance.toFixed(1)} mi
            </div>
          ) : null}
        </div>

        <div className="grid grid-cols-2 gap-3 rounded-[1.25rem] bg-brand-cream p-4 text-sm text-brand-brown">
          <div>
            <div className="text-xs uppercase tracking-[0.16em] text-brand-brown/60">
              Seller entry
            </div>
            <div className="mt-1 font-semibold">£{sale.carPrice.toFixed(0)} car</div>
          </div>
          <div>
            <div className="text-xs uppercase tracking-[0.16em] text-brand-brown/60">
              Opening hours
            </div>
            <div className="mt-1 font-semibold">
              {sale.startTime} to {sale.endTime}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-brand-brown/10 pt-5">
          <div className="text-sm text-brand-brown/70">
            {sale.freeParking ? "Free parking" : `Parking £${sale.parkingFee || 0}`}
          </div>
          <Link
            href={listingHref}
            className="text-sm font-semibold uppercase tracking-[0.16em] text-brand-ink transition hover:text-brand-brown"
          >
            View profile
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
