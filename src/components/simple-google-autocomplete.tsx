import { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SimpleGoogleAutocompleteProps {
  value: string;
  onChange: (value: string, placeId?: string, location?: { lat: number; lng: number }) => void;
  placeholder?: string;
  name?: string;
  required?: boolean;
  className?: string;
}

// Create a direct Google Places Autocomplete implementation
export function SimpleGoogleAutocomplete({
  value,
  onChange,
  placeholder = "Enter location",
  required = false,
  name,
  className
}: SimpleGoogleAutocompleteProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<any>(null);
  const [loading, setLoading] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Fetch the API key
  useEffect(() => {
    const fetchApiKey = async () => {
      try {
        const response = await fetch('/api/config');
        const data = await response.json();
        
        if (!data.googleApiKey) {
          console.error('Google API key not available');
          setError('Google API key not available');
          return;
        }
        
        setApiKey(data.googleApiKey);
      } catch (error) {
        console.error('Error fetching API key:', error);
        setError('Error fetching API key');
      }
    };
    
    fetchApiKey();
  }, []);

  // Function to initialize Google Autocomplete - defined at the top level before being used
  const initializeAutocomplete = () => {
    if (!inputRef.current) return;
    
    try {
      // Debug to verify script loaded
      console.log('Initializing Google Autocomplete. Script loaded:', !!window.google?.maps?.places);
      
      // Create the autocomplete instance directly on the input element
      autocompleteRef.current = new window.google.maps.places.Autocomplete(inputRef.current, {
        componentRestrictions: { country: 'uk' },
        fields: ['place_id', 'geometry', 'formatted_address', 'name', 'address_components'],
        types: ['geocode', 'establishment', 'address']
      });
      
      // Add listener for place selection
      autocompleteRef.current.addListener('place_changed', () => {
        const place = autocompleteRef.current.getPlace();
        
        console.log('Place selected:', place); // Debug log
        
        if (!place.geometry) {
          console.warn('Place selected has no geometry');
          return;
        }
        
        // Get place details
        const placeId = place.place_id;
        const location = {
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng()
        };
        
        // Use formatted_address to ensure we have the full address
        const address = place.formatted_address || place.name || '';
        
        // Update internal state and notify parent component
        setInputValue(address);
        onChange(address, placeId, location);
      });
      
      setLoading(false);
    } catch (error) {
      console.error('Error initializing Google Autocomplete:', error);
      setError('Error initializing Google Autocomplete');
      setLoading(false);
    }
  };

  // Load the Google Maps API script and initialize autocomplete
  useEffect(() => {
    if (!apiKey || !inputRef.current) return;
    
    // Only load if not already loaded
    if (window.google?.maps?.places) {
      initializeAutocomplete();
      return;
    }
    
    setLoading(true);

    // Setup callback function
    window.initGoogleMapsCallback = () => {
      console.log('Google Maps script loaded successfully');
      initializeAutocomplete();
    };
    
    // Create and append script tag
    const script = document.createElement('script');
    script.id = 'google-maps-script';
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=initGoogleMapsCallback`;
    script.async = true;
    script.defer = true;
    script.onerror = (error) => {
      console.error('Error loading Google Maps script:', error);
      setError('Error loading Google Maps script');
      setLoading(false);
    };
    
    // Remove any existing scripts first
    const existingScript = document.getElementById('google-maps-script');
    if (existingScript) {
      existingScript.remove();
    }
    
    document.head.appendChild(script);
    
    // Cleanup
    return () => {
      window.initGoogleMapsCallback = undefined as any;
      if (autocompleteRef.current) {
        // Clean up event listeners if possible
        window.google?.maps?.event?.clearInstanceListeners(autocompleteRef.current);
      }
    };
  }, [apiKey, onChange]);

  // Update input value when prop changes
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  // Handle direct input changes (without place selection)
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
        className={cn("pl-9 text-gray-900", className)}
        autoComplete="off"
        name={name}
        required={required}
      />
      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
        <MapPin className="h-4 w-4" />
      </div>
      
      {/* Loading indicator */}
      {loading && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          <svg className="animate-spin h-4 w-4 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      )}
      
      {/* Error message */}
      {error && (
        <div className="text-xs text-red-500 mt-1">{error}</div>
      )}
    </div>
  );
}

// Add this to the global namespace for TypeScript
declare global {
  interface Window {
    google: any;
    initGoogleMapsCallback: () => void;
  }
}