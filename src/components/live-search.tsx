"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LiveSearchInput, SearchPayload } from "./live-search-input";

interface LiveSearchProps {
  onLocationChange?: (location: string) => void;
}

export function LiveSearch({ onLocationChange }: LiveSearchProps = {}) {
  const [location, setLocation] = useState("");
  const [radius, setRadius] = useState(10);
  const [dayOfWeek, setDayOfWeek] = useState("all");
  const router = useRouter();

  const handleLocationChange = (newLocation: string) => {
    setLocation(newLocation);
    if (onLocationChange) {
      onLocationChange(newLocation);
    }
  };

  const handleSearch = (payload: SearchPayload) => {
    const searchParams = new URLSearchParams();
    searchParams.append("location", payload.location);
    searchParams.append("radius", String(payload.radius));
    if (payload.dayOfWeek && payload.dayOfWeek !== "all") {
      searchParams.append("dayOfWeek", payload.dayOfWeek);
    }
    if (payload.lat !== undefined && payload.lng !== undefined) {
      searchParams.append("lat", String(payload.lat));
      searchParams.append("lng", String(payload.lng));
    }

    router.push(`/search?${searchParams.toString()}`);
  };

  return (
    <div className="space-y-5">
      <LiveSearchInput
        value={location}
        onChange={handleLocationChange}
        placeholder="Where are you looking to car boot?"
        onSearch={handleSearch}
        radius={radius}
        dayOfWeek={dayOfWeek}
      />

      <div className="grid gap-4 md:grid-cols-[1.4fr_1fr]">
        <div className="rounded-[1.25rem] border border-brand-brown/10 bg-white/70 p-4">
          <div className="mb-3 flex items-center justify-between text-xs font-semibold uppercase tracking-[0.18em] text-brand-brown/60">
            <span>Search radius</span>
            <span>{radius} miles</span>
          </div>
          <Slider
            min={5}
            max={60}
            step={5}
            value={[radius]}
            onValueChange={(values) => setRadius(values[0])}
          />
          <div className="mt-2 flex justify-between text-xs text-brand-brown/50">
            <span>5 mi</span>
            <span>60 mi</span>
          </div>
        </div>

        <div className="rounded-[1.25rem] border border-brand-brown/10 bg-white/70 p-4">
          <div className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-brand-brown/60">
            Best day to browse
          </div>
          <Select value={dayOfWeek} onValueChange={setDayOfWeek}>
            <SelectTrigger className="h-12 rounded-2xl border-brand-brown/10 bg-white">
              <SelectValue placeholder="Choose a day" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Any day</SelectItem>
              <SelectItem value="saturday">Saturday</SelectItem>
              <SelectItem value="sunday">Sunday</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="rounded-[1.25rem] border border-brand-brown/10 bg-brand-cream p-4 text-sm text-brand-brown/75">
        Use Google-backed place search when you know the area, or type a town name to browse the nearest verified and featured sales.
      </div>
    </div>
  );
}
