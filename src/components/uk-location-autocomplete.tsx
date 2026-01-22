import { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Check, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';

// Enhanced comprehensive list of UK locations with additional details for autocomplete
// Format: Location name, optional descriptor
const UK_LOCATIONS_DATA = [
  // Major cities with variants
  { main: 'London', secondary: 'UK', type: 'city' },
  { main: 'London City Centre', secondary: 'London, UK', type: 'area' },
  { main: 'London Heathrow Airport (LHR)', secondary: 'London, UK', type: 'airport' },
  { main: 'London Gatwick Airport (LGW)', secondary: 'West Sussex, UK', type: 'airport' },
  { main: 'London Stansted Airport (STN)', secondary: 'Essex, UK', type: 'airport' },
  { main: 'Central London', secondary: 'London, UK', type: 'area' },
  { main: 'East London', secondary: 'London, UK', type: 'area' },
  { main: 'North London', secondary: 'London, UK', type: 'area' },
  { main: 'South London', secondary: 'London, UK', type: 'area' },
  { main: 'West London', secondary: 'London, UK', type: 'area' },
  
  { main: 'Birmingham', secondary: 'West Midlands, UK', type: 'city' },
  { main: 'Birmingham Airport (BHX)', secondary: 'West Midlands, UK', type: 'airport' },
  { main: 'Birmingham New Street', secondary: 'Train Station, Birmingham, UK', type: 'station' },
  
  { main: 'Manchester', secondary: 'Greater Manchester, UK', type: 'city' },
  { main: 'Manchester Airport (MAN)', secondary: 'Greater Manchester, UK', type: 'airport' },
  { main: 'Manchester Piccadilly', secondary: 'Train Station, Manchester, UK', type: 'station' },
  
  { main: 'Liverpool', secondary: 'Merseyside, UK', type: 'city' },
  { main: 'Liverpool Lime Street', secondary: 'Train Station, Liverpool, UK', type: 'station' },
  { main: 'Liverpool John Lennon Airport (LPL)', secondary: 'Merseyside, UK', type: 'airport' },
  
  { main: 'Leeds', secondary: 'West Yorkshire, UK', type: 'city' },
  { main: 'Leeds Train Station', secondary: 'New Station Street, Leeds, UK', type: 'station' },
  { main: 'Leeds Bradford Airport (LBA)', secondary: 'Whitehouse Lane, Yeadon, Leeds, UK', type: 'airport' },
  { main: 'Leeds City Centre', secondary: 'Leeds, UK', type: 'area' },
  { main: 'Leeds Castle', secondary: 'Broomfield, Maidstone, UK', type: 'landmark' },
  
  { main: 'Glasgow', secondary: 'Scotland, UK', type: 'city' },
  { main: 'Glasgow Central', secondary: 'Train Station, Glasgow, UK', type: 'station' },
  { main: 'Glasgow Airport (GLA)', secondary: 'Scotland, UK', type: 'airport' },
  
  { main: 'Edinburgh', secondary: 'Scotland, UK', type: 'city' },
  { main: 'Edinburgh Castle', secondary: 'Edinburgh, UK', type: 'landmark' },
  { main: 'Edinburgh Airport (EDI)', secondary: 'Scotland, UK', type: 'airport' },
  { main: 'Edinburgh Waverley', secondary: 'Train Station, Edinburgh, UK', type: 'station' },
  
  { main: 'Bristol', secondary: 'Somerset, UK', type: 'city' },
  { main: 'Bristol Airport (BRS)', secondary: 'Somerset, UK', type: 'airport' },
  { main: 'Bristol Temple Meads', secondary: 'Train Station, Bristol, UK', type: 'station' },
  
  { main: 'Cardiff', secondary: 'Wales, UK', type: 'city' },
  { main: 'Cardiff Central', secondary: 'Train Station, Cardiff, UK', type: 'station' },
  { main: 'Cardiff Airport (CWL)', secondary: 'Wales, UK', type: 'airport' },
  
  { main: 'Newcastle upon Tyne', secondary: 'Tyne and Wear, UK', type: 'city' },
  { main: 'Newcastle International Airport (NCL)', secondary: 'Tyne and Wear, UK', type: 'airport' },
  { main: 'Newcastle Central', secondary: 'Train Station, Newcastle, UK', type: 'station' },
  
  { main: 'Sheffield', secondary: 'South Yorkshire, UK', type: 'city' },
  { main: 'Sheffield Train Station', secondary: 'Sheffield, UK', type: 'station' },
  
  // Major shopping centers and landmarks
  { main: 'Bicester Village', secondary: 'Designer Outlet, Oxfordshire, UK', type: 'shopping' },
  { main: 'Bluewater Shopping Centre', secondary: 'Greenhithe, Kent, UK', type: 'shopping' },
  { main: 'Westfield London', secondary: 'Shepherd\'s Bush, London, UK', type: 'shopping' },
  { main: 'Westfield Stratford City', secondary: 'Stratford, London, UK', type: 'shopping' },
  { main: 'The Bullring', secondary: 'Shopping Centre, Birmingham, UK', type: 'shopping' },
  { main: 'Trafford Centre', secondary: 'Manchester, UK', type: 'shopping' },
  { main: 'Stonehenge', secondary: 'Wiltshire, UK', type: 'landmark' },
  { main: 'Windsor Castle', secondary: 'Windsor, UK', type: 'landmark' },
  { main: 'Tower of London', secondary: 'London, UK', type: 'landmark' },
  { main: 'Buckingham Palace', secondary: 'London, UK', type: 'landmark' },
  { main: 'British Museum', secondary: 'Great Russell St, London, UK', type: 'landmark' },
  
  // Car boot sale specific locations
  { main: 'Battersea Boot', secondary: 'Car Boot Sale, Harris Academy, London, UK', type: 'car boot sale' },
  { main: 'Wimbledon Car Boot Sale', secondary: 'Wimbledon Stadium, London, UK', type: 'car boot sale' },
  { main: 'Croydon Car Boot Sale', secondary: 'Oasis Academy, Croydon, UK', type: 'car boot sale' },
  { main: 'Peckham Car Boot Sale', secondary: 'Choumert Grove Car Park, London, UK', type: 'car boot sale' },
  
  // Add other major UK cities, towns and locations
  { main: 'Aberdeen', secondary: 'Scotland, UK', type: 'city' },
  { main: 'Bath', secondary: 'Somerset, UK', type: 'city' },
  { main: 'Belfast', secondary: 'Northern Ireland, UK', type: 'city' },
  { main: 'Brighton', secondary: 'East Sussex, UK', type: 'city' },
  { main: 'Cambridge', secondary: 'Cambridgeshire, UK', type: 'city' },
  { main: 'Canterbury', secondary: 'Kent, UK', type: 'city' },
  { main: 'Coventry', secondary: 'West Midlands, UK', type: 'city' },
  { main: 'Derby', secondary: 'Derbyshire, UK', type: 'city' },
  { main: 'Dundee', secondary: 'Scotland, UK', type: 'city' },
  { main: 'Durham', secondary: 'County Durham, UK', type: 'city' },
  { main: 'Exeter', secondary: 'Devon, UK', type: 'city' },
  { main: 'Hull', secondary: 'East Yorkshire, UK', type: 'city' },
  { main: 'Leicester', secondary: 'Leicestershire, UK', type: 'city' },
  { main: 'Lincoln', secondary: 'Lincolnshire, UK', type: 'city' },
  { main: 'Nottingham', secondary: 'Nottinghamshire, UK', type: 'city' },
  { main: 'Oxford', secondary: 'Oxfordshire, UK', type: 'city' },
  { main: 'Plymouth', secondary: 'Devon, UK', type: 'city' },
  { main: 'Portsmouth', secondary: 'Hampshire, UK', type: 'city' },
  { main: 'Southampton', secondary: 'Hampshire, UK', type: 'city' },
  { main: 'Swansea', secondary: 'Wales, UK', type: 'city' },
  { main: 'Swindon', secondary: 'Wiltshire, UK', type: 'city' },
  { main: 'York', secondary: 'North Yorkshire, UK', type: 'city' },
  
  // Common town and village types
  { main: 'Ashford', secondary: 'Kent, UK', type: 'town' },
  { main: 'Aylesbury', secondary: 'Buckinghamshire, UK', type: 'town' },
  { main: 'Banbury', secondary: 'Oxfordshire, UK', type: 'town' },
  { main: 'Barnsley', secondary: 'South Yorkshire, UK', type: 'town' },
  { main: 'Basildon', secondary: 'Essex, UK', type: 'town' },
  { main: 'Bedford', secondary: 'Bedfordshire, UK', type: 'town' },
  { main: 'Blackpool', secondary: 'Lancashire, UK', type: 'town' },
  { main: 'Bolton', secondary: 'Greater Manchester, UK', type: 'town' },
  { main: 'Bournemouth', secondary: 'Dorset, UK', type: 'town' },
  { main: 'Bradford', secondary: 'West Yorkshire, UK', type: 'town' },
  { main: 'Chelmsford', secondary: 'Essex, UK', type: 'town' },
  { main: 'Cheltenham', secondary: 'Gloucestershire, UK', type: 'town' },
  { main: 'Colchester', secondary: 'Essex, UK', type: 'town' },
  { main: 'Doncaster', secondary: 'South Yorkshire, UK', type: 'town' },
  { main: 'Guildford', secondary: 'Surrey, UK', type: 'town' },
  { main: 'Harrogate', secondary: 'North Yorkshire, UK', type: 'town' },
  { main: 'Ipswich', secondary: 'Suffolk, UK', type: 'town' },
  { main: 'Milton Keynes', secondary: 'Buckinghamshire, UK', type: 'town' },
  { main: 'Northampton', secondary: 'Northamptonshire, UK', type: 'town' },
  { main: 'Norwich', secondary: 'Norfolk, UK', type: 'town' },
  { main: 'Peterborough', secondary: 'Cambridgeshire, UK', type: 'town' },
  { main: 'Reading', secondary: 'Berkshire, UK', type: 'town' },
  { main: 'Slough', secondary: 'Berkshire, UK', type: 'town' },
  { main: 'Warrington', secondary: 'Cheshire, UK', type: 'town' },
  { main: 'Watford', secondary: 'Hertfordshire, UK', type: 'town' },
  { main: 'Whitby', secondary: 'North Yorkshire, UK', type: 'town' },
  { main: 'Whitby Harbour', secondary: 'North Yorkshire, UK', type: 'landmark' },
  { main: 'Whitby Abbey', secondary: 'North Yorkshire, UK', type: 'landmark' },
  { main: 'Whitby Pavilion', secondary: 'West Cliff, Whitby, UK', type: 'landmark' },
  { main: 'Whitby Car Boot Sale', secondary: 'Whitby, North Yorkshire, UK', type: 'car boot sale' },
  { main: 'Wigan', secondary: 'Greater Manchester, UK', type: 'town' },
  { main: 'Wolverhampton', secondary: 'West Midlands, UK', type: 'town' },
  { main: 'Worcester', secondary: 'Worcestershire, UK', type: 'town' },
  
  // Additional locations
  { main: 'Scarborough', secondary: 'North Yorkshire, UK', type: 'town' },
  { main: 'Skegness', secondary: 'Lincolnshire, UK', type: 'town' },
  { main: 'Southport', secondary: 'Merseyside, UK', type: 'town' },
  { main: 'Blackburn', secondary: 'Lancashire, UK', type: 'town' },
  { main: 'Carlisle', secondary: 'Cumbria, UK', type: 'town' },
  { main: 'Darlington', secondary: 'County Durham, UK', type: 'town' },
  { main: 'Hartlepool', secondary: 'County Durham, UK', type: 'town' },
  { main: 'Middlesbrough', secondary: 'North Yorkshire, UK', type: 'town' },
  { main: 'Redcar', secondary: 'North Yorkshire, UK', type: 'town' },
  { main: 'Stockton-on-Tees', secondary: 'County Durham, UK', type: 'town' },
  { main: 'Sunderland', secondary: 'Tyne and Wear, UK', type: 'town' },
  { main: 'Torquay', secondary: 'Devon, UK', type: 'town' },
  { main: 'Weymouth', secondary: 'Dorset, UK', type: 'town' },
  { main: 'Eastbourne', secondary: 'East Sussex, UK', type: 'town' },
  { main: 'Hastings', secondary: 'East Sussex, UK', type: 'town' },
  { main: 'Margate', secondary: 'Kent, UK', type: 'town' },
  { main: 'Ramsgate', secondary: 'Kent, UK', type: 'town' },
  { main: 'Dover', secondary: 'Kent, UK', type: 'town' },
  { main: 'Folkestone', secondary: 'Kent, UK', type: 'town' },
  { main: 'Rye', secondary: 'East Sussex, UK', type: 'town' },
  { main: 'Bognor Regis', secondary: 'West Sussex, UK', type: 'town' },
  { main: 'Worthing', secondary: 'West Sussex, UK', type: 'town' }
];

interface UKLocationAutocompleteProps {
  value: string;
  onChange: (value: string, location?: { lat: number; lng: number }) => void;
  placeholder?: string;
  name?: string;
  required?: boolean;
  className?: string;
}

export function UKLocationAutocomplete({
  value,
  onChange,
  placeholder = "Enter UK location",
  required = false,
  name,
  className
}: UKLocationAutocompleteProps) {
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const [filteredLocations, setFilteredLocations] = useState<typeof UK_LOCATIONS_DATA>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  // Update input value when prop changes
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  // Filter locations based on input
  useEffect(() => {
    const normalized = inputValue.toLowerCase().trim();
    if (normalized.length < 1) {
      setFilteredLocations([]);
      setOpen(false);
      return;
    }

    const filtered = UK_LOCATIONS_DATA.filter(location => 
      location.main.toLowerCase().includes(normalized) ||
      location.secondary.toLowerCase().includes(normalized)
    ).sort((a, b) => {
      const aMainLower = a.main.toLowerCase();
      const bMainLower = b.main.toLowerCase();
      
      // Sort exact matches first
      if (aMainLower === normalized && bMainLower !== normalized) return -1;
      if (aMainLower !== normalized && bMainLower === normalized) return 1;
      
      // Then by starts with
      const aStartsWith = aMainLower.startsWith(normalized);
      const bStartsWith = bMainLower.startsWith(normalized);
      
      if (aStartsWith && !bStartsWith) return -1;
      if (!aStartsWith && bStartsWith) return 1;
      
      // Then prioritize cities over other types
      if (a.type === 'city' && b.type !== 'city') return -1;
      if (a.type !== 'city' && b.type === 'city') return 1;
      
      // Then by type alphabetically
      if (a.type !== b.type) return a.type.localeCompare(b.type);
      
      // Finally by name
      return a.main.localeCompare(b.main);
    }).slice(0, 8); // Limit to 8 results for better UI
    
    setFilteredLocations(filtered);
    
    // Open the dropdown if we have filtered results
    if (filtered.length > 0 && normalized.length >= 1) {
      setOpen(true);
    } else {
      setOpen(false);
    }
  }, [inputValue]);

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    onChange(value);
  };

  // Handle location selection
  const handleSelect = (location: typeof UK_LOCATIONS_DATA[0]) => {
    const displayValue = location.main;
    setInputValue(displayValue);
    setOpen(false);
    
    // Generate sensible coordinates based on location type and known UK coordinates
    let coordinates;
    
    // Set approximate coordinates for different regions of the UK
    switch(true) {
      case location.main.includes('London') || location.secondary.includes('London'):
        coordinates = { lat: 51.509865 + (Math.random() * 0.1 - 0.05), lng: -0.118092 + (Math.random() * 0.1 - 0.05) };
        break;
      case location.main.includes('Manchester') || location.secondary.includes('Manchester'):
        coordinates = { lat: 53.483959 + (Math.random() * 0.1 - 0.05), lng: -2.244644 + (Math.random() * 0.1 - 0.05) };
        break;
      case location.main.includes('Birmingham') || location.secondary.includes('Birmingham'):
        coordinates = { lat: 52.480769 + (Math.random() * 0.1 - 0.05), lng: -1.898354 + (Math.random() * 0.1 - 0.05) };
        break;
      case location.main.includes('Edinburgh') || location.secondary.includes('Edinburgh'):
        coordinates = { lat: 55.953251 + (Math.random() * 0.1 - 0.05), lng: -3.188267 + (Math.random() * 0.1 - 0.05) };
        break;
      case location.main.includes('Cardiff') || location.secondary.includes('Cardiff'):
        coordinates = { lat: 51.481583 + (Math.random() * 0.1 - 0.05), lng: -3.179090 + (Math.random() * 0.1 - 0.05) };
        break;
      case location.main.includes('Belfast') || location.secondary.includes('Belfast'):
        coordinates = { lat: 54.596391 + (Math.random() * 0.1 - 0.05), lng: -5.930039 + (Math.random() * 0.1 - 0.05) };
        break;
      default:
        // Default UK coordinates with some randomization
        coordinates = { lat: 52.3555 + (Math.random() * 3 - 1.5), lng: -1.1743 + (Math.random() * 3 - 1.5) };
    }
    
    // Pass formatted location display and coordinates
    onChange(displayValue, coordinates);
    
    inputRef.current?.focus();
  };

  return (
    <div className="relative" ref={inputRef}>
      <Input
        value={inputValue}
        onChange={handleInputChange}
        placeholder={placeholder}
        className={cn("pl-9 text-gray-900", className)}
        autoComplete="off"
        name={name}
        required={required}
        onFocus={() => {
          if (inputValue.length >= 1 && filteredLocations.length > 0) {
            setOpen(true);
          }
        }}
      />
      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
        <MapPin className="h-4 w-4" />
      </div>
      
      {/* Predictions dropdown */}
      {open && filteredLocations.length > 0 && (
        <div className="absolute z-50 mt-1 w-full bg-white shadow-lg rounded-md border border-gray-200 max-h-60 overflow-auto">
          {filteredLocations.map((location) => (
            <div
              key={`${location.main}-${location.type}`}
              className="p-2 hover:bg-gray-100 cursor-pointer flex items-start"
              onClick={() => handleSelect(location)}
            >
              <MapPin className="h-4 w-4 mr-2 mt-0.5 shrink-0 text-gray-500" />
              <div>
                <div className="font-medium">{location.main}</div>
                <div className="text-sm text-gray-500">{location.secondary}</div>
              </div>
            </div>
          ))}
          <div className="p-1 text-right text-xs text-gray-400 border-t">
            powered by CarBootSale.com
          </div>
        </div>
      )}
      
      {/* Empty state */}
      {open && filteredLocations.length === 0 && inputValue.trim().length > 0 && (
        <div className="absolute z-50 mt-1 w-full bg-white shadow-lg rounded-md border border-gray-200 p-3">
          <div className="text-center text-gray-500">No locations found</div>
          <div className="p-1 text-right text-xs text-gray-400 border-t mt-2">
            powered by CarBootSale.com
          </div>
        </div>
      )}
    </div>
  );
}