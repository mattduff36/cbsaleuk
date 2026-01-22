import { useRef, useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';

interface GoogleMapsAutocompleteProps {
  value: string;
  onChange: (value: string, placeId?: string, location?: { lat: number; lng: number }) => void;
  placeholder?: string;
  name?: string;
  required?: boolean;
  className?: string;
}

// Declare the Window interface with Google Maps globally
declare global {
  interface Window {
    google: any;
    initGoogleMapsCallback: () => void;
  }
}

export function GoogleMapsAutocomplete({
  value,
  onChange,
  placeholder = "Enter location",
  required = false,
  name,
  className
}: GoogleMapsAutocompleteProps) {
  // Refs
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<any>(null);
  const scriptLoadedRef = useRef<boolean>(false);
  
  // State
  const [inputValue, setInputValue] = useState(value || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [googleMapsLoaded, setGoogleMapsLoaded] = useState(false);
  
  // Function to initialize autocomplete - defined outside useEffect
  const initializeAutocomplete = () => {
    if (!window.google?.maps?.places || !inputRef.current) {
      console.error('Cannot initialize autocomplete: Google Maps not loaded or input ref not available');
      return;
    }
    
    try {
      console.log('Initializing autocomplete with Google Maps API - inputRef exists:', !!inputRef.current);
      
      // Create autocomplete instance
      autocompleteRef.current = new window.google.maps.places.Autocomplete(inputRef.current, {
        componentRestrictions: { country: 'uk' },
        fields: ['place_id', 'geometry', 'formatted_address', 'name'],
        types: ['geocode', 'establishment', 'address']
      });
      
      // Add place_changed listener
      autocompleteRef.current.addListener('place_changed', () => {
        const place = autocompleteRef.current.getPlace();
        console.log('Selected place:', place);
        
        if (!place.geometry) {
          console.warn('Place has no geometry');
          return;
        }
        
        const placeId = place.place_id;
        const location = {
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng()
        };
        
        const address = place.formatted_address || place.name || '';
        
        // Update state and notify parent
        setInputValue(address);
        onChange(address, placeId, location);
      });
    } catch (error) {
      console.error('Error initializing Google Autocomplete:', error);
      setError('Error initializing Google Places - see console for details');
    }
  };
  
  // Step 1: Load the Google Maps script
  useEffect(() => {
    if (scriptLoadedRef.current || window.google?.maps?.places) {
      console.log('Google Maps already loaded, skipping script load');
      setGoogleMapsLoaded(true);
      return;
    }
    
    const loadGoogleMapsScript = async () => {
      try {
        setLoading(true);
        
        // Get API key from backend
        const response = await fetch('/api/config');
        const data = await response.json();
        const apiKey = data.googleApiKey;
        
        console.log('API Key available:', !!apiKey);
        
        if (!apiKey) {
          console.error('Google API key is missing');
          setError('Google API key not available');
          setLoading(false);
          return;
        }
        
        // Remove any existing script (cleanup)
        const existingScript = document.getElementById('google-maps-script');
        if (existingScript) {
          console.log('Removing existing Google Maps script');
          existingScript.remove();
        }
        
        // Define callback function that will be called when script loads
        window.initGoogleMapsCallback = () => {
          console.log('Google Maps script loaded via callback!');
          scriptLoadedRef.current = true;
          setGoogleMapsLoaded(true);
          setLoading(false);
        };
        
        // Create new script element
        const script = document.createElement('script');
        script.id = 'google-maps-script';
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=initGoogleMapsCallback`;
        script.async = true;
        script.defer = true;
        
        // Error handler
        script.onerror = (event) => {
          console.error('Google Maps script failed to load:', event);
          setError('Failed to load Google Maps API');
          setLoading(false);
        };
        
        // Append script to document
        document.head.appendChild(script);
        console.log('Google Maps script appended to head');
      } catch (error) {
        console.error('Error in loadGoogleMapsScript:', error);
        setError('Error setting up Google Maps');
        setLoading(false);
      }
    };
    
    loadGoogleMapsScript();
    
    // Cleanup function
    return () => {
      if (window.initGoogleMapsCallback) {
        window.initGoogleMapsCallback = undefined as any;
      }
    };
  }, []);
  
  // Step 2: Initialize Autocomplete after script is loaded
  useEffect(() => {
    if (!googleMapsLoaded || !inputRef.current) {
      return;
    }
    
    console.log('Google Maps loaded, initializing autocomplete');
    initializeAutocomplete();
    
    // Cleanup function
    return () => {
      if (autocompleteRef.current && window.google?.maps?.event) {
        window.google.maps.event.clearInstanceListeners(autocompleteRef.current);
      }
    };
  }, [googleMapsLoaded, onChange]);
  
  // Update local state when prop changes
  useEffect(() => {
    if (value !== inputValue) {
      setInputValue(value);
    }
  }, [value, inputValue]);
  
  // Handle input change
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
      
      {error && (
        <div className="text-xs text-red-500 mt-1">{error}</div>
      )}
    </div>
  );
}