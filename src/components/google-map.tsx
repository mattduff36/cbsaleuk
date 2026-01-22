import React, { useEffect, useRef, useState } from 'react';
import { Loader2, MapPin, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface GoogleMapProps {
  address?: string;
  what3words?: string | null;
  latitude?: number;
  longitude?: number;
  className?: string;
  height?: string;
}

declare global {
  interface Window {
    google: any;
    initMapCallback: () => void;
  }
}

export function GoogleMap({ address, what3words, latitude, longitude, className = '', height = '300px' }: GoogleMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Helper to determine if we have location data
  const hasLocationData = (latitude && longitude) || !!address || !!(what3words && what3words.length > 0);

  // Load Google Maps API
  useEffect(() => {
    if (window.google?.maps) {
      setMapLoaded(true);
      setIsLoading(false);
      return;
    }

    // Check if script is already being loaded
    const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
    if (existingScript) {
      // Poll for Google Maps to be available
      const pollForGoogleMaps = () => {
        if (window.google?.maps) {
          setMapLoaded(true);
          setIsLoading(false);
        } else {
          setTimeout(pollForGoogleMaps, 100);
        }
      };
      pollForGoogleMaps();
      return;
    }

    const loadGoogleMapsAPI = async () => {
      try {
        // Get API key from server
        const response = await fetch('/api/config');
        const data = await response.json();
        const apiKey = data.googleApiKey;

        if (!apiKey) {
          setMapError('Google Maps API key is missing');
          setIsLoading(false);
          return;
        }

        // Use a unique callback name for this component instance
        const callbackName = `googleMapsCallback_${Date.now()}`;
        
        // Define callback for when API loads
        (window as any)[callbackName] = () => {
          setMapLoaded(true);
          setIsLoading(false);
          // Clean up the callback
          delete (window as any)[callbackName];
        };

        // Create script element
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=${callbackName}`;
        script.async = true;
        script.defer = true;
        script.onerror = () => {
          setMapError('Failed to load Google Maps API');
          setIsLoading(false);
          delete (window as any)[callbackName];
        };

        // Add to document
        document.head.appendChild(script);
        
        // Fallback timeout in case callback never fires
        setTimeout(() => {
          if (!window.google?.maps) {
            setMapError('Google Maps API failed to load within timeout');
            setIsLoading(false);
            delete (window as any)[callbackName];
          }
        }, 10000);
        
      } catch (error) {
        console.error('Error loading Google Maps API:', error);
        setMapError('Failed to load Google Maps API');
        setIsLoading(false);
      }
    };

    loadGoogleMapsAPI();
  }, []);

  // Initialize map when API is loaded
  useEffect(() => {
    if (!mapLoaded || !mapRef.current || !hasLocationData) {
      return;
    }

    if (!window.google?.maps) {
      console.error('Google Maps not available when trying to initialize');
      setMapError('Google Maps API not properly loaded');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    try {
      // Initialize map
      const map = new window.google.maps.Map(mapRef.current, {
        center: { lat: 54.7023545, lng: -3.2765753 }, // Default to center of UK
        zoom: 14,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: true,
      });

      // If we have coordinates, use them directly
      if (latitude && longitude) {
        const position = { lat: latitude, lng: longitude };
        
        map.setCenter(position);
        
        new window.google.maps.Marker({
          map,
          position,
          animation: window.google.maps.Animation.DROP,
        });
        
        setIsLoading(false);
        return;
      }

      // Otherwise, if we have an address, geocode it
      if (address) {
        const geocoder = new window.google.maps.Geocoder();
        
        // For UK addresses, append "UK" if it's not already included
        let searchAddress = address;
        if (!searchAddress.toLowerCase().includes('uk') && 
            !searchAddress.toLowerCase().includes('united kingdom')) {
          searchAddress = `${searchAddress}, UK`;
        }
        
        geocoder.geocode({ address: searchAddress }, (results: any, status: any) => {
          if (status === 'OK' && results && results.length > 0) {
            const location = results[0].geometry.location;
            
            map.setCenter(location);
            
            new window.google.maps.Marker({
              map,
              position: location,
              animation: window.google.maps.Animation.DROP,
            });
            
            // Success - stop loading
            setIsLoading(false);
          } else {
            // Try a more generic geocoding with just the city/town name
            const simplifiedAddress = address.split(',')[0];
            
            geocoder.geocode({ address: `${simplifiedAddress}, UK` }, (simpleResults: any, simpleStatus: any) => {
              if (simpleStatus === 'OK' && simpleResults && simpleResults.length > 0) {
                const location = simpleResults[0].geometry.location;
                
                map.setCenter(location);
                
                new window.google.maps.Marker({
                  map,
                  position: location,
                  animation: window.google.maps.Animation.DROP,
                });
              } else {
                if (what3words && what3words.length > 0) {
                  // We have a fallback to What3Words
                  setMapError('Could not find exact location on Google Maps. Try the What3Words link below.');
                } else {
                  setMapError('Could not find this location on the map. Please check the address.');
                }
              }
              setIsLoading(false);
            });
          }
        });
      } else {
        // If we only have What3Words
        if (what3words && what3words.length > 0) {
          setMapError('Map view unavailable for What3Words location. Use the button below to view on What3Words website.');
        } else {
          setMapError('No location information available to display on the map.');
        }
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Error initializing Google Map:', error);
      setMapError('Failed to initialize the map');
      setIsLoading(false);
    }
  }, [mapLoaded, address, what3words, latitude, longitude, hasLocationData]);

  // Show a timeout message if loading takes too long - MUST be before any returns
  useEffect(() => {
    if (!isLoading || !hasLocationData) {
      return;
    }
    
    const timeoutId = setTimeout(() => {
      if (isLoading) {
        setMapError('Map is taking longer than expected to load. Please try refreshing the page.');
        setIsLoading(false);
      }
    }, 10000); // 10 second timeout
    
    return () => clearTimeout(timeoutId);
  }, [isLoading, hasLocationData]);

  // Show loading state
  if (isLoading && hasLocationData) {
    return (
      <div 
        className={`flex items-center justify-center bg-gray-100 rounded-lg ${className}`} 
        style={{ height }}
      >
        <div className="text-center p-4">
          <Loader2 className="h-6 w-6 animate-spin text-primary mx-auto mb-2" />
          <p className="text-gray-600">Loading map...</p>
          <div className="mt-3 text-xs text-gray-500">
            {address && <p>Address: {address}</p>}
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (mapError) {
    return (
      <div 
        className={`flex items-center justify-center bg-gray-50 border border-gray-200 rounded-lg ${className}`} 
        style={{ height }}
      >
        <div className="text-center p-4 max-w-md">
          <AlertCircle className="h-8 w-8 text-amber-500 mx-auto mb-3" />
          <p className="text-gray-700 mb-3">{mapError}</p>
          
          <div className="mt-2 space-y-3">
            {/* Show Get Directions with Google Maps anyway */}
            {address && (
              <div>
                <a 
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block"
                >
                  <Button className="bg-blue-500 hover:bg-blue-600">
                    <MapPin className="h-4 w-4 mr-2" />
                    Get Directions in Google Maps
                  </Button>
                </a>
              </div>
            )}
            
            {/* What3Words link if available */}
            {what3words && what3words.length > 0 && (
              <div>
                <a 
                  href={`https://what3words.com/${what3words.replace(/^\/+/, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block"
                >
                  <Button className="bg-primary hover:bg-primary/90">
                    <MapPin className="h-4 w-4 mr-2" />
                    Open What3Words Location
                  </Button>
                </a>
              </div>
            )}
          </div>
          
          <div className="mt-4 text-xs text-gray-500">
            {address && <p>Address: {address}</p>}
          </div>
        </div>
      </div>
    );
  }

  // Show map
  return (
    <div className={`relative rounded-lg overflow-hidden ${className}`}>
      <div 
        ref={mapRef} 
        className="w-full" 
        style={{ height }}
      />
      
      {what3words && what3words.length > 0 && (
        <div className="absolute bottom-4 right-4">
          <a 
            href={`https://what3words.com/${what3words.replace(/^\/+/, '')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block"
          >
            <Button className="bg-white text-primary border border-primary hover:bg-gray-50 shadow-md">
              <MapPin className="h-4 w-4 mr-2" />
              View on What3Words
            </Button>
          </a>
        </div>
      )}
    </div>
  );
}