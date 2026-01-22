import { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

// UK cities/towns to include in autocomplete
const UK_LOCATIONS = [
  'London', 'Manchester', 'Birmingham', 'Glasgow', 'Edinburgh', 
  'Liverpool', 'Leeds', 'Sheffield', 'Bristol', 'Newcastle',
  'Cardiff', 'Belfast', 'York', 'Oxford', 'Cambridge',
  'Nottingham', 'Leicester', 'Southampton', 'Reading', 'Brighton',
  'Bradford', 'Coventry', 'Plymouth', 'Sunderland', 'Portsmouth',
  'Aberdeen', 'Norwich', 'Derby', 'Swansea', 'Exeter',
  'Hull', 'Luton', 'Blackpool', 'Preston', 'Middlesbrough',
  'Wakefield', 'Peterborough', 'Stoke-on-Trent', 'Wolverhampton', 'Bournemouth',
  'Southend-on-Sea', 'Colchester', 'Swindon', 'Huddersfield', 'Bolton',
  'Ipswich', 'Milton Keynes', 'Northampton', 'Warrington', 'Canterbury',
  'Dundee', 'Gloucester', 'Mansfield', 'Burnley', 'Grimsby'
];

interface LocationAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  name?: string;
  required?: boolean;
}

export function LocationAutocomplete({ 
  value, 
  onChange, 
  placeholder = "Enter location", 
  required = false,
  name 
}: LocationAutocompleteProps) {
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const [filteredLocations, setFilteredLocations] = useState<string[]>([]);
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

    const filtered = UK_LOCATIONS.filter(location => 
      location.toLowerCase().includes(normalized)
    ).sort((a, b) => {
      // Sort exact matches first, then by starts with, then alphabetically
      const aLower = a.toLowerCase();
      const bLower = b.toLowerCase();
      
      if (aLower === normalized && bLower !== normalized) return -1;
      if (aLower !== normalized && bLower === normalized) return 1;
      
      const aStartsWith = aLower.startsWith(normalized);
      const bStartsWith = bLower.startsWith(normalized);
      
      if (aStartsWith && !bStartsWith) return -1;
      if (!aStartsWith && bStartsWith) return 1;
      
      return a.localeCompare(b);
    });
    
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
    
    // Open dropdown if we have results and input is at least 2 chars
    if (value.length >= 2) {
      // Trigger filtering effect
      const normalized = value.toLowerCase().trim();
      const filtered = UK_LOCATIONS.filter(location => 
        location.toLowerCase().includes(normalized)
      );
      
      if (filtered.length > 0) {
        setOpen(true);
      }
    }
  };

  // Handle location selection
  const handleSelect = (location: string) => {
    setInputValue(location);
    onChange(location);
    setOpen(false);
    inputRef.current?.focus();
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div className="relative">
          <Input
            ref={inputRef}
            value={inputValue}
            onChange={handleInputChange}
            placeholder={placeholder}
            className="pl-9 text-gray-900" // Add left padding for the icon and ensure text is visible
            autoComplete="off" // Disable browser's native autocomplete
            name={name}
            required={required}
          />
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
          </div>
        </div>
      </PopoverTrigger>
      
      <PopoverContent className="p-0 w-full min-w-[300px] max-h-[300px] overflow-auto" align="start" sideOffset={4}>
        <Command>
          <CommandList>
            <CommandGroup>
              {filteredLocations.map((location) => (
                <CommandItem
                  key={location}
                  value={location}
                  onSelect={() => handleSelect(location)}
                  className="cursor-pointer"
                >
                  {location}
                  {location.toLowerCase() === inputValue.toLowerCase() && (
                    <Check className="ml-auto h-4 w-4 text-green-600" />
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
            {filteredLocations.length === 0 && inputValue.trim().length > 0 && (
              <CommandEmpty>No locations found</CommandEmpty>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}