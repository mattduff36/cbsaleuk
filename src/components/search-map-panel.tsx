"use client";

import { Compass, MapPinned } from "lucide-react";
import { CarBootSale } from "@/types";

export function SearchMapPanel({
  location,
  lat,
  lng,
  results,
}: {
  location: string;
  lat?: number;
  lng?: number;
  results: (CarBootSale & { distance?: number })[];
}) {
  return (
    <aside className="glass-card sticky top-24 overflow-hidden p-6">
      <div className="mb-5 flex items-center gap-3">
        <div className="rounded-2xl bg-brand-sky/30 p-3 text-brand-ink">
          <MapPinned className="h-5 w-5" />
        </div>
        <div>
          <div className="text-xs uppercase tracking-[0.18em] text-brand-brown/60">
            Search area
          </div>
          <div className="font-heading text-2xl text-brand-ink">{location}</div>
        </div>
      </div>

      <div className="rounded-[1.25rem] bg-brand-ink p-5 text-white">
        <div className="mb-3 text-xs uppercase tracking-[0.18em] text-white/60">
          Area overview
        </div>
        <p className="text-sm leading-7 text-white/80">
          {lat !== undefined && lng !== undefined
            ? `Google-backed location coordinates are attached to this search (${lat.toFixed(
                2,
              )}, ${lng.toFixed(2)}), so nearby listings are ranked by distance before anything else.`
            : "This search is using text matching because a precise map position was not supplied. Pick a Google suggestion for stronger distance ranking."}
        </p>
      </div>

      <div className="mt-5 space-y-3">
        {results.slice(0, 3).map((listing) => (
          <div
            key={listing.id}
            className="rounded-[1.25rem] border border-brand-brown/10 bg-brand-cream p-4"
          >
            <div className="text-sm font-semibold text-brand-ink">{listing.name}</div>
            <div className="mt-1 text-xs uppercase tracking-[0.16em] text-brand-brown/60">
              {listing.location}
            </div>
            <div className="mt-2 flex items-center gap-2 text-sm text-brand-brown/80">
              <Compass className="h-4 w-4" />
              <span>
                {listing.distance !== undefined
                  ? `${listing.distance.toFixed(1)} miles away`
                  : "Text-ranked result"}
              </span>
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}
