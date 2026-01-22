"use client";

import React, { useEffect, useRef, useState } from 'react';
import { Loader2, MapPin, AlertCircle, Car } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CarBootSale } from '@/types';
import { useRouter } from 'next/navigation';

interface SearchResultsMapProps {
  searchLocation: string;
  searchRadius: number;
  results: CarBootSale[];
  className?: string;
  height?: string;
}

declare global {
  interface Window {
    google: any;
    initMapCallback: () => void;
  }
}

export function SearchResultsMap({ 
  searchLocation, 
  searchRadius, 
  results = [], 
  className = '', 
  height = '400px' 
}: SearchResultsMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  
  // State management
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Refs for map instances to avoid re-initialization
  const mapInstanceRef = useRef<any>(null);
  const geocoderRef = useRef<any>(null);
  const infoWindowRef = useRef<any>(null);
  const centerMarkerRef = useRef<any>(null);
  const radiusCircleRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  
  // Concurrency control refs
  const geocodeRequestIdRef = useRef<number>(0);
  const markerRequestIdRef = useRef<number>(0);
  
  // Helper to determine if we have location data
  const hasLocationData = !!searchLocation;

  // Load Google Maps API only once
  useEffect(() => {
    if (window.google?.maps) {
      setMapLoaded(true);
      return;
    }

    const loadGoogleMapsAPI = async () => {
      try {
        // Get API key from server
        const response = await fetch('/api/config');
        const data = await response.json();
        const apiKey = data.googleApiKey;

        if (!apiKey) {
          setMapError('Google Maps API key is not configured');
          setIsLoading(false);
          return;
        }

        // Define callback for when API loads
        window.initMapCallback = () => {
          setMapLoaded(true);
        };

        // Create script element
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=initMapCallback`;
        script.async = true;
        script.onerror = () => {
          setMapError('Failed to load Google Maps API');
          setIsLoading(false);
        };

        // Add to document
        document.head.appendChild(script);
      } catch (error) {
        console.error('Error loading Google Maps API:', error);
        setMapError('Failed to load Google Maps API');
        setIsLoading(false);
      }
    };

    loadGoogleMapsAPI();

    return () => {
      window.initMapCallback = () => {};
    };
  }, []);

  // Initialize map only once when API is loaded and ref is available
  useEffect(() => {
    if (!mapLoaded || !mapRef.current || mapInstanceRef.current) {
      return;
    }

    try {
      // Initialize map
      const map = new window.google.maps.Map(mapRef.current, {
        center: { lat: 54.7023545, lng: -3.2765753 }, // Default to center of UK
        zoom: 6,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: true,
        zoomControl: true,
        clickableIcons: false,
        styles: [
          { featureType: 'poi', stylers: [{ visibility: 'off' }] },
          { featureType: 'poi.business', stylers: [{ visibility: 'off' }] },
          { featureType: 'transit.station', stylers: [{ visibility: 'off' }] }
        ]
      });

      mapInstanceRef.current = map;
      geocoderRef.current = new window.google.maps.Geocoder();
      infoWindowRef.current = new window.google.maps.InfoWindow();

      map.addListener('click', () => {
        if (infoWindowRef.current) {
          infoWindowRef.current.close();
        }
      });
      
    } catch (error) {
      console.error('Error initializing Google Map:', error);
      setMapError('Failed to initialize map');
    }
  }, [mapLoaded]);

  // Handle search location updates
  useEffect(() => {
    if (!mapLoaded || !mapInstanceRef.current || !geocoderRef.current || !searchLocation) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const requestId = ++geocodeRequestIdRef.current;

    if (centerMarkerRef.current) {
      centerMarkerRef.current.setMap(null);
      centerMarkerRef.current = null;
    }

    let searchAddress = searchLocation;
    if (!searchAddress.toLowerCase().includes('uk') && 
        !searchAddress.toLowerCase().includes('united kingdom')) {
      searchAddress = `${searchAddress}, UK`;
    }

    geocoderRef.current.geocode({ address: searchAddress }, (results: any, status: any) => {
      if (geocodeRequestIdRef.current !== requestId) return;

      if (status === 'OK' && results && results.length > 0) {
        const location = results[0].geometry.location;
        
        mapInstanceRef.current.setCenter(location);
        
        centerMarkerRef.current = new window.google.maps.Marker({
          map: mapInstanceRef.current,
          position: location,
          title: `Search Center: ${searchLocation}`,
        });

        if (searchRadius && searchRadius > 0) {
          if (radiusCircleRef.current) {
            radiusCircleRef.current.setMap(null);
          }

          radiusCircleRef.current = new window.google.maps.Circle({
            strokeColor: '#dc2626',
            strokeOpacity: 0.8,
            strokeWeight: 2,
            fillColor: '#dc2626',
            fillOpacity: 0.1,
            map: mapInstanceRef.current,
            center: location,
            radius: searchRadius * 1609.344,
            clickable: false,
          });

          const circleBounds = radiusCircleRef.current.getBounds();
          if (circleBounds) {
            mapInstanceRef.current.fitBounds(circleBounds);
          }
        }

        setIsLoading(false);
      } else {
        setMapError('Could not find the search location');
        setIsLoading(false);
      }
    });

  }, [searchLocation, mapLoaded, searchRadius]);

  // Handle marker updates
  useEffect(() => {
    if (!mapInstanceRef.current || !infoWindowRef.current || !results || !geocoderRef.current) {
      return;
    }

    const requestId = ++markerRequestIdRef.current;

    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];

    if (results.length === 0) return;

    results.forEach((sale) => {
      if (!sale.address) return;

      let saleAddress = sale.address;
      if (!saleAddress.toLowerCase().includes('uk')) {
        saleAddress = `${saleAddress}, UK`;
      }

      geocoderRef.current.geocode({ address: saleAddress }, (geocodeResults: any, status: any) => {
        if (markerRequestIdRef.current !== requestId) return;

        if (status === 'OK' && geocodeResults && geocodeResults.length > 0) {
          const location = geocodeResults[0].geometry.location;
          
          const marker = new window.google.maps.Marker({
            map: mapInstanceRef.current,
            position: location,
            title: sale.name,
          });

          marker.addListener('click', () => {
            const content = `
              <div class="p-3 max-w-sm">
                <h3 class="font-bold text-lg mb-2">${sale.name}</h3>
                <p class="text-sm text-gray-600 mb-2">${sale.address}</p>
                <p class="text-sm mb-2"><strong>Time:</strong> ${sale.startTime} - ${sale.endTime}</p>
                <p class="text-sm"><strong>Car:</strong> £${sale.carPrice} | <strong>Van:</strong> £${sale.vanPrice}</p>
              </div>
            `;
            
            infoWindowRef.current.setContent(content);
            infoWindowRef.current.open(mapInstanceRef.current, marker);
          });

          markersRef.current.push(marker);
        }
      });
    });

  }, [results, router]);

  if (isLoading && hasLocationData) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 rounded-lg ${className}`} style={{ height }}>
        <div className="text-center p-4">
          <Loader2 className="h-6 w-6 animate-spin text-primary mx-auto mb-2" />
          <p className="text-gray-600">Loading map...</p>
        </div>
      </div>
    );
  }

  if (mapError) {
    return (
      <div className={`flex items-center justify-center bg-gray-50 border border-gray-200 rounded-lg ${className}`} style={{ height }}>
        <div className="text-center p-4">
          <AlertCircle className="h-8 w-8 text-amber-500 mx-auto mb-3" />
          <p className="text-gray-700">{mapError}</p>
        </div>
      </div>
    );
  }

  if (!hasLocationData) {
    return (
      <div className={`flex items-center justify-center bg-gray-50 border border-gray-200 rounded-lg ${className}`} style={{ height }}>
        <div className="text-center p-4">
          <MapPin className="h-8 w-8 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600">Enter a search location to view the map</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative rounded-lg overflow-hidden border border-gray-200 ${className}`}>
      <div ref={mapRef} className="w-full" style={{ height }} />
      
      <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-md">
        <div className="text-sm font-medium text-gray-700">
          {results.length} {results.length === 1 ? 'sale' : 'sales'} found
        </div>
        <div className="text-xs text-gray-500">
          within {searchRadius} miles
        </div>
      </div>
    </div>
  );
}
