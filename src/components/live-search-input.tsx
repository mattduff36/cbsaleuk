"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search, MapPin, Calendar } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { CarBootSale } from '@/types';
import { Button } from '@/components/ui/button';

interface LiveSearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  onSearch?: (location: string, radius: number) => void;
  radius?: number;
}

type SearchSuggestions = {
  listings: CarBootSale[];
  locations: string[];
};

// Add window type extension
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

export function LiveSearchInput({
  value,
  onChange,
  placeholder = "Where would you like to go Car Boot?",
  onSearch,
  radius = 10
}: LiveSearchInputProps) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [suggestions, setSuggestions] = useState<SearchSuggestions>({ listings: [], locations: [] });
  const [googlePlaces, setGooglePlaces] = useState<PlaceSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [inputValue, setInputValue] = useState(value);
  const placesServiceRef = useRef<any>(null);
  
  // Initialize Google Maps API
  useEffect(() => {
    if (!window.google?.maps?.places) {
      const loadGoogleMapsScript = async () => {
        try {
          const response = await fetch('/api/config');
          const data = await response.json();
          const apiKey = data.googleApiKey;
          
          if (!apiKey) return;
          
          window.initGoogleMapsCallback = () => {
            // API loaded
          };
          
          const script = document.createElement('script');
          script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=initGoogleMapsCallback`;
          script.async = true;
          document.head.appendChild(script);
        } catch (error) {
          console.error('Error loading Google Maps:', error);
        }
      };
      
      loadGoogleMapsScript();
    }
    
    return () => {
      window.initGoogleMapsCallback = undefined as any;
    };
  }, []);
  
  // Update input value when props change
  useEffect(() => {
    setInputValue(value);
  }, [value]);
  
  // Fetch Google Place predictions
  const fetchGooglePlacePredictions = (input: string) => {
    if (!window.google?.maps?.places || !input || input.length < 2) {
      setGooglePlaces([]);
      return;
    }
    
    try {
      const autocompleteService = new window.google.maps.places.AutocompleteService();
      const request = {
        input,
        componentRestrictions: { country: 'uk' },
        types: ['(cities)'],
      };
      
      autocompleteService.getPlacePredictions(request, (
        predictions: any[] | null,
        status: any
      ) => {
        if (status !== window.google.maps.places.PlacesServiceStatus.OK || !predictions) {
          setGooglePlaces([]);
          return;
        }
        
        const filteredPredictions = predictions.slice(0, 4).map(p => ({
          description: p.description,
          place_id: p.place_id
        }));
        
        setGooglePlaces(filteredPredictions);
      });
    } catch (error) {
      console.error('Error fetching Google Places predictions:', error);
      setGooglePlaces([]);
    }
  };
  
  // Fetch custom suggestions
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
      console.error('Error fetching search suggestions:', error);
      setSuggestions({ listings: [], locations: [] });
    }
  };
  
  // Fetch both types of suggestions simultaneously
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
  
  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    onChange(newValue);
    setShowDropdown(true);
  };
  
  // Handle click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [wrapperRef]);
  
  // Handle Google place selection
  const handlePlaceSelection = (place: PlaceSuggestion) => {
    setInputValue(place.description);
    onChange(place.description);
    setShowDropdown(false);
  };
  
  // Navigate to listing
  const navigateToListing = (listingId: number) => {
    setShowDropdown(false);
    router.push(`/sale/${listingId}`);
  };
  
  // Handle custom location selection
  const handleLocationSelected = (location: string) => {
    setInputValue(location);
    onChange(location);
    setShowDropdown(false);
  };
  
  // Handle search
  const handleSearch = () => {
    if (!inputValue) return;
    
    if (onSearch) {
      onSearch(inputValue, radius);
    } else {
      const searchParams = new URLSearchParams();
      searchParams.append("location", inputValue);
      searchParams.append("radius", radius.toString());
      router.push(`/search?${searchParams.toString()}`);
    }
    
    setShowDropdown(false);
  };
  
  // Check if we have any suggestions to show
  const hasAnySuggestions = 
    googlePlaces.length > 0 || 
    suggestions.listings.length > 0;
  
  return (
    <div className="relative w-full" ref={wrapperRef}>
      {/* Search Input with inline button */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Input
            ref={inputRef}
            value={inputValue}
            onChange={handleInputChange}
            onFocus={() => setShowDropdown(true)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleSearch();
              }
            }}
            placeholder={placeholder}
            className="pl-9"
            autoComplete="off"
            data-testid="input-search-location"
          />
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
            <MapPin className="h-4 w-4" />
          </div>
          {isLoading && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <svg className="animate-spin h-4 w-4 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
          )}
        </div>
        <Button 
          onClick={handleSearch}
          disabled={!inputValue || inputValue.length < 2}
          className="bg-primary hover:bg-primary/90 px-6"
          data-testid="button-search"
        >
          Search
        </Button>
      </div>
      
      {/* Combined Dropdown with all search suggestions */}
      {showDropdown && hasAnySuggestions && (
        <div className="absolute z-50 left-0 right-0 bg-white rounded-md shadow-lg border border-gray-100 overflow-hidden top-full">
          {/* Google Places */}
          {googlePlaces.length > 0 && (
            <div>
              {googlePlaces.map((place, index) => (
                <div
                  key={`place-${index}`}
                  className="px-3 py-2 hover:bg-gray-50 cursor-pointer border-b border-gray-100 flex items-center"
                  onClick={() => handlePlaceSelection(place)}
                >
                  <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                  <span className="text-sm text-gray-900">{place.description}</span>
                </div>
              ))}
            </div>
          )}
          
          {/* Car Boot Sale Listings */}
          {suggestions.listings.length > 0 && (
            <div>
              <div className="px-3 py-2 font-bold text-gray-900 border-b border-gray-200 bg-gray-50">
                LISTINGS
              </div>
              {suggestions.listings.map((listing) => (
                <div 
                  key={listing.id}
                  className="px-3 py-2 hover:bg-gray-50 cursor-pointer border-b border-gray-100 flex items-start"
                  onClick={() => navigateToListing(listing.id)}
                >
                  {/* Thumbnail - show image when available, calendar icon as fallback */}
                  <div className="flex-shrink-0 mr-3">
                    {listing.images && listing.images.length > 0 ? (
                      <img 
                        src={listing.images[0]} 
                        alt={listing.name}
                        className="w-12 h-12 object-cover rounded-md"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gray-100 rounded-md flex items-center justify-center">
                        <Calendar className="h-5 w-5 text-gray-500" />
                      </div>
                    )}
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900">{listing.name}</div>
                    <div className="text-xs text-gray-500">
                      {listing.daysOfWeek && listing.daysOfWeek[0]?.toLowerCase()}s in {listing.location}
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
