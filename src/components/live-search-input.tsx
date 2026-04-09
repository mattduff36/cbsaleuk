"use client";

import Image from "next/image";
import React, { useEffect, useRef, useState } from "react";
import { Loader2, MapPin, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CarBootSale } from "@/types";

interface LiveSearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  onSearch?: (payload: SearchPayload) => void;
  radius?: number;
  dayOfWeek?: string;
}

type SearchSuggestions = {
  listings: CarBootSale[];
  locations: string[];
};

declare global {
  interface Window {
    google: any;
    initGoogleMapsCallback: () => void;
  }
}

interface PlaceSuggestion {
  description: string;
  place_id: string;
}

type Coordinates = {
  lat: number;
  lng: number;
};

export interface SearchPayload {
  location: string;
  radius: number;
  dayOfWeek?: string;
  lat?: number;
  lng?: number;
}

export function LiveSearchInput({
  value,
  onChange,
  placeholder = "Where would you like to go car boot?",
  onSearch,
  radius = 10,
  dayOfWeek = "all",
}: LiveSearchInputProps) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [suggestions, setSuggestions] = useState<SearchSuggestions>({ listings: [], locations: [] });
  const [googlePlaces, setGooglePlaces] = useState<PlaceSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCoordinates, setSelectedCoordinates] = useState<Coordinates | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [inputValue, setInputValue] = useState(value);

  useEffect(() => {
    if (!window.google?.maps?.places) {
      const loadGoogleMapsScript = async () => {
        try {
          const response = await fetch("/api/config");
          const data = await response.json();
          const apiKey = data.googleApiKey;

          if (!apiKey) return;

          window.initGoogleMapsCallback = () => {
            return;
          };

          const script = document.createElement("script");
          script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=initGoogleMapsCallback`;
          script.async = true;
          document.head.appendChild(script);
        } catch (error) {
          console.error("Error loading Google Maps:", error);
        }
      };

      loadGoogleMapsScript();
    }

    return () => {
      window.initGoogleMapsCallback = undefined as any;
    };
  }, []);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  const fetchGooglePlacePredictions = (input: string) => {
    if (!window.google?.maps?.places || !input || input.length < 2) {
      setGooglePlaces([]);
      return;
    }

    try {
      const autocompleteService = new window.google.maps.places.AutocompleteService();
      const request = {
        input,
        componentRestrictions: { country: "uk" },
        types: ["(cities)"],
      };

      autocompleteService.getPlacePredictions(request, (
        predictions: any[] | null,
        status: any,
      ) => {
        if (status !== window.google.maps.places.PlacesServiceStatus.OK || !predictions) {
          setGooglePlaces([]);
          return;
        }

        const filteredPredictions = predictions.slice(0, 4).map(p => ({
          description: p.description,
          place_id: p.place_id,
        }));

        setGooglePlaces(filteredPredictions);
      });
    } catch (error) {
      console.error("Error fetching Google Places predictions:", error);
      setGooglePlaces([]);
    }
  };

  const fetchCustomSuggestions = async (query: string) => {
    if (!query || query.length < 2) {
      setSuggestions({ listings: [], locations: [] });
      return;
    }

    try {
      const response = await fetch(`/api/search-suggestions?q=${encodeURIComponent(query)}`);
      if (response.ok) {
        const data = await response.json();
        setSuggestions(data);
      } else {
        setSuggestions({ listings: [], locations: [] });
      }
    } catch (error) {
      console.error("Error fetching search suggestions:", error);
      setSuggestions({ listings: [], locations: [] });
    }
  };

  useEffect(() => {
    if (!inputValue || inputValue.length < 2) {
      setGooglePlaces([]);
      setSuggestions({ listings: [], locations: [] });
      return;
    }

    setIsLoading(true);

    const timer = setTimeout(() => {
      fetchGooglePlacePredictions(inputValue);
      fetchCustomSuggestions(inputValue);
      setIsLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [inputValue]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    onChange(newValue);
    setSelectedCoordinates(null);
    setShowDropdown(true);
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [wrapperRef]);

  const lookupCoordinates = (placeId: string) =>
    new Promise<Coordinates | null>((resolve) => {
      if (!window.google?.maps?.Geocoder) {
        resolve(null);
        return;
      }

      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ placeId }, (results: any[], status: string) => {
        if (status !== "OK" || !results?.[0]?.geometry?.location) {
          resolve(null);
          return;
        }

        const location = results[0].geometry.location;
        resolve({ lat: location.lat(), lng: location.lng() });
      });
    });

  const handlePlaceSelection = async (place: PlaceSuggestion) => {
    setInputValue(place.description);
    onChange(place.description);
    setSelectedCoordinates(await lookupCoordinates(place.place_id));
    setShowDropdown(false);
  };

  const navigateToListing = (slug: string | number) => {
    setShowDropdown(false);
    window.location.href = `/sale/${slug}`;
  };

  const handleLocationSelected = (location: string) => {
    setInputValue(location);
    onChange(location);
    setSelectedCoordinates(null);
    setShowDropdown(false);
  };

  const handleSearch = () => {
    if (!inputValue) return;

    if (onSearch) {
      onSearch({
        location: inputValue,
        radius,
        dayOfWeek,
        lat: selectedCoordinates?.lat,
        lng: selectedCoordinates?.lng,
      });
    }

    setShowDropdown(false);
  };

  const hasAnySuggestions =
    googlePlaces.length > 0 ||
    suggestions.locations.length > 0 ||
    suggestions.listings.length > 0;
  
  return (
    <div className="relative w-full" ref={wrapperRef}>
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Input
            ref={inputRef}
            value={inputValue}
            onChange={handleInputChange}
            onFocus={() => setShowDropdown(true)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleSearch();
              }
            }}
            placeholder={placeholder}
            className="h-14 rounded-2xl border-brand-brown/10 bg-white px-12 text-base text-brand-ink shadow-sm"
            autoComplete="off"
            data-testid="input-search-location"
          />
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-brown/60">
            <MapPin className="h-4 w-4" />
          </div>
          {isLoading && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2">
              <Loader2 className="h-4 w-4 animate-spin text-brand-brown/60" />
            </div>
          )}
        </div>
        <Button
          onClick={handleSearch}
          disabled={!inputValue || inputValue.length < 2}
          className="h-14 rounded-2xl bg-brand-ink px-6 text-white hover:bg-brand-brown"
          data-testid="button-search"
        >
          <Search className="mr-2 h-4 w-4" />
          Search
        </Button>
      </div>

      {showDropdown && hasAnySuggestions && (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-[1.5rem] border border-brand-brown/10 bg-white shadow-field">
          {googlePlaces.length > 0 && (
            <div>
              <div className="border-b border-brand-brown/10 px-4 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-brand-brown/50">
                Places
              </div>
              {googlePlaces.map((place, index) => (
                <div
                  key={`place-${index}`}
                  className="flex cursor-pointer items-center border-b border-brand-brown/10 px-4 py-3 hover:bg-brand-cream/70"
                  onClick={async () => handlePlaceSelection(place)}
                >
                  <MapPin className="mr-2 h-4 w-4 text-brand-brown/60" />
                  <span className="text-sm text-brand-ink">{place.description}</span>
                </div>
              ))}
            </div>
          )}

          {suggestions.locations.length > 0 && (
            <div>
              <div className="border-b border-brand-brown/10 px-4 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-brand-brown/50">
                Popular areas
              </div>
              {suggestions.locations.map((location) => (
                <div
                  key={location}
                  className="flex cursor-pointer items-center border-b border-brand-brown/10 px-4 py-3 hover:bg-brand-cream/70"
                  onClick={() => handleLocationSelected(location)}
                >
                  <MapPin className="mr-2 h-4 w-4 text-brand-brown/60" />
                  <span className="text-sm text-brand-ink">{location}</span>
                </div>
              ))}
            </div>
          )}

          {suggestions.listings.length > 0 && (
            <div>
              <div className="border-b border-brand-brown/10 px-4 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-brand-brown/50">
                Featured matches
              </div>
              {suggestions.listings.map((listing) => (
                <div
                  key={listing.id}
                  className="flex cursor-pointer items-start gap-3 border-b border-brand-brown/10 px-4 py-3 hover:bg-brand-cream/70"
                  onClick={() => navigateToListing(listing.slug || listing.id)}
                >
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center overflow-hidden rounded-xl bg-brand-cream">
                    <Image
                      src={listing.images?.[0] || "/car-boot-sale.jpg"}
                      alt={listing.name}
                      width={48}
                      height={48}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-brand-ink">{listing.name}</div>
                    <div className="text-xs text-brand-brown/70">
                      {(listing.daysOfWeek?.[0] || "Weekend").toLowerCase()} in {listing.location}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
