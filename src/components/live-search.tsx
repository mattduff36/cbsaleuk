"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LiveSearchInput } from './live-search-input';
import { Slider } from '@/components/ui/slider';

interface LiveSearchProps {
  onLocationChange?: (location: string) => void;
}

export function LiveSearch({ onLocationChange }: LiveSearchProps = {}) {
  const [location, setLocation] = useState('');
  const [radius, setRadius] = useState(10);
  const router = useRouter();

  const handleLocationChange = (newLocation: string) => {
    setLocation(newLocation);
    if (onLocationChange) {
      onLocationChange(newLocation);
    }
  };

  const handleSearch = (searchLocation: string, searchRadius: number) => {
    const searchParams = new URLSearchParams();
    searchParams.append("location", searchLocation);
    searchParams.append("radius", searchRadius.toString());
    
    router.push(`/search?${searchParams.toString()}`);
  };

  return (
    <div className="space-y-4">
      <LiveSearchInput 
        value={location}
        onChange={handleLocationChange}
        placeholder="Where would you like to go Car Boot?"
        onSearch={handleSearch}
        radius={radius}
      />
      
      <div className="pt-2">
        <Slider
          min={1}
          max={50}
          step={1}
          value={[radius]}
          onValueChange={(values) => setRadius(values[0])}
        />
        <div className="flex justify-between items-center text-xs text-gray-500 mt-1">
          <span>1 mile</span>
          <span className="text-sm font-bold text-gray-900 px-3 py-1 border border-red-400 rounded-md bg-white shadow-sm">
            {radius} miles
          </span>
          <span>50 miles</span>
        </div>
      </div>
    </div>
  );
}
