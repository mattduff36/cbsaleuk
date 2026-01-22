import { useRef, useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';

interface GooglePlacesAutocompleteProps {
  value: string;
  onChange: (value: string, placeId?: string, location?: { lat: number; lng: number }) => void;
  placeholder?: string;
  name?: string;
  required?: boolean;
  className?: string;
  searchMode?: 'locality' | 'address' | 'establishment';
}

declare global {
  interface Window {
    google: any;
    initAutocompleteCallback: () => void;
  }
}

export function GooglePlacesAutocomplete({
  value,
  onChange,
  placeholder = "Enter location",
  required = false,
  name,
  className,
  searchMode = 'establishment'
}: GooglePlacesAutocompleteProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<any>(null);
  const [inputValue, setInputValue] = useState(value || '');
  const [loading, setLoading] = useState(false);
  
  // Load Google Maps script
  useEffect(() => {
    if (window.google?.maps?.places) {
      console.log('Google Maps already loaded');
      return;
    }
    
    const loadGoogleMapsScript = async () => {
      try {
        console.log('Fetching API key and loading Google Maps script');
        setLoading(true);
        
        // Get API key from server
        const response = await fetch('/api/config');
        const data = await response.json();
        const apiKey = data.googleApiKey;
        
        console.log('API key available:', !!apiKey);
        
        if (!apiKey) {
          console.error('Google API key is missing');
          setLoading(false);
          return;
        }
        
        // Define callback function
        window.initAutocompleteCallback = () => {
          console.log('Google Maps script loaded successfully via callback');
          setLoading(false);
        };
        
        // Create script element with API key from server
        const script = document.createElement('script');
        script.id = 'google-maps-script';
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=initAutocompleteCallback`;
        script.async = true;
        script.defer = true;
        script.onerror = (error) => {
          console.error('Error loading Google Maps script:', error);
          setLoading(false);
        };
        
        // Remove any existing script
        const existingScript = document.getElementById('google-maps-script');
        if (existingScript) {
          existingScript.remove();
        }
        
        // Add to document
        document.head.appendChild(script);
        console.log('Google Maps script appended to document head');
      } catch (error) {
        console.error('Error setting up Google Maps:', error);
        setLoading(false);
      }
    };
    
    loadGoogleMapsScript();
    
    // Cleanup
    return () => {
      window.initAutocompleteCallback = undefined as any;
    };
  }, []);
  
  // Initialize autocomplete on input element
  useEffect(() => {
    // Only run once script is loaded and input is available
    if (!window.google?.maps?.places || !inputRef.current) {
      return;
    }
    
    try {
      console.log('Creating new Autocomplete instance');
      
      // Configure options based on searchMode
      let types: string[] = [];
      let options: any = {
        componentRestrictions: { country: 'uk' },
        fields: ['place_id', 'geometry', 'formatted_address', 'name', 'address_components', 'types']
      };
      
      // Set appropriate types based on search mode
      if (searchMode === 'locality') {
        // For homepage - prioritize cities, towns, and districts
        types = ['(cities)'];
        // Configure autocomplete to bias toward localities like Rightmove
        options.types = types;
        
        // Set autocomplete options to prioritize localities over smaller places
        const localityAutocompleteOptions = {
          strictBounds: false,
          // These types will prioritize higher-level geographic entities
          types: [
            'locality',             // Cities, towns
            'postal_town',          // UK postal towns
            'administrative_area_level_2', // Counties, districts
            'administrative_area_level_1'  // States, provinces, regions
          ]
        };
        
        // Merge with our base options
        options = { ...options, ...localityAutocompleteOptions };
      } else if (searchMode === 'address') {
        // For precise addresses, postcodes, and specific locations
        // Not setting types array to allow more flexible results
        // This allows postcodes, specific addresses, and more granular locations
        options = {
          ...options,
          componentRestrictions: { country: 'uk' },
          strictBounds: false
        };
      } else {
        // Default - establishments like venues, parks, etc.
        types = ['establishment'];
        options.types = types;
      }
      
      console.log(`Initializing autocomplete with searchMode: ${searchMode}, types:`, types);
      
      // Create autocomplete instance directly on input element
      autocompleteRef.current = new window.google.maps.places.Autocomplete(inputRef.current, options);
      
      // Add listener for place selection
      const listener = autocompleteRef.current.addListener('place_changed', () => {
        const place = autocompleteRef.current.getPlace();
        
        // Log place details for debugging including the types
        console.log('Place selected:', place);
        if (place.types) {
          console.log('Place types:', place.types);
        }
        
        if (!place.geometry) {
          console.error('No geometry found for selected place');
          return;
        }
        
        // Extract location data
        const placeId = place.place_id;
        const location = {
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng()
        };
        
        const address = place.formatted_address || place.name || '';
        
        // Detect locality/city for improved analytics
        let isLocality = false;
        if (place.types && Array.isArray(place.types)) {
          const localityTypes = ['locality', 'postal_town', 'administrative_area_level_2', 'administrative_area_level_1'];
          isLocality = place.types.some(function(type: string) {
            return localityTypes.includes(type);
          });
          console.log(`Is this place a locality/city/region? ${isLocality}`);
        }
        
        // Update internal state and parent component
        setInputValue(address);
        onChange(address, placeId, location);
      });
      
      // Return cleanup function
      return () => {
        if (listener && window.google?.maps?.event) {
          window.google.maps.event.removeListener(listener);
        }
      };
    } catch (error) {
      console.error('Error initializing Google Places Autocomplete:', error);
    }
  }, [onChange, searchMode]);
  
  // Update input value when prop changes
  useEffect(() => {
    if (value !== inputValue) {
      setInputValue(value);
    }
  }, [value, inputValue]);
  
  // Handle direct input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    onChange(e.target.value);
  };
  
  return (
    <div className="relative">
      <Input
        ref={inputRef}
        value={inputValue}
        onChange={handleInputChange}
        placeholder={placeholder}
        name={name}
        required={required}
        className={cn("pl-9 text-gray-900", className)}
        autoComplete="off"
      />
      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
        <MapPin className="h-4 w-4" />
      </div>
      
      {loading && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          <svg className="animate-spin h-4 w-4 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      )}
    </div>
  );
}