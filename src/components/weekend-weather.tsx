"use client";

import { useState, useEffect } from 'react';
import { Cloud, Sun, CloudRain, CloudSnow, CloudLightning, Wind, Loader2, ChevronDown, ChevronUp, MapPin, Thermometer, Droplets, Eye } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface WeekendWeatherProps {
  location: string;
}

interface WeatherKitSummary {
  tempC: number;
  tempMaxC?: number;
  tempMinC?: number;
  feelsLikeC?: number;
  conditionCode: string;
  iconId: number;
  precipitationChance?: number;
  windSpeedMph?: number;
  humidity?: number;
  uvIndex?: number;
  visibility?: number;
  sunrise?: string;
  sunset?: string;
  forecast_meta: {
    is_forecast: boolean;
    target_day?: string;
    source: string;
  };
}

interface HourlyForecast {
  time: string;
  tempC: number;
  feelsLikeC: number;
  conditionCode: string;
  iconId: number;
  precipitationMm: number;
  precipitationChance: number;
  windMph: number;
  humidity: number;
  uvIndex: number;
}

interface HourlyResponse {
  hours: HourlyForecast[];
  meta: {
    source: string;
    timezone: string;
    count: number;
  };
}

// Helper function to get the next Saturday and Sunday dates
function getUpcomingWeekendDates() {
  const today = new Date();
  const currentDay = today.getDay(); // 0 = Sunday, 6 = Saturday
  
  // Calculate days until next Saturday
  const daysUntilSaturday = currentDay === 6 ? 0 : (6 - currentDay);
  const nextSaturday = new Date(today);
  nextSaturday.setDate(today.getDate() + daysUntilSaturday);
  
  // Sunday is the day after Saturday
  const nextSunday = new Date(nextSaturday);
  nextSunday.setDate(nextSaturday.getDate() + 1);
  
  return { saturday: nextSaturday, sunday: nextSunday };
}

// Helper function to format date as "20th Oct 2025"
function formatDate(date: Date): string {
  const day = date.getDate();
  const month = date.toLocaleDateString('en-GB', { month: 'short' });
  const year = date.getFullYear().toString();
  
  // Add ordinal suffix
  const ordinal = (day: number) => {
    if (day > 3 && day < 21) return 'th';
    switch (day % 10) {
      case 1: return 'st';
      case 2: return 'nd';
      case 3: return 'rd';
      default: return 'th';
    }
  };
  
  return `${day}${ordinal(day)} ${month} ${year}`;
}

// Helper function to get coordinates from location name using Google Places
async function getCoordinatesFromLocation(location: string): Promise<{ lat: number; lon: number } | null> {
  try {
    // For now, use approximate coordinates for common UK cities
    const commonCities: { [key: string]: { lat: number; lon: number } } = {
      'london': { lat: 51.5074, lon: -0.1278 },
      'manchester': { lat: 53.4808, lon: -2.2426 },
      'birmingham': { lat: 52.4862, lon: -1.8904 },
      'leeds': { lat: 53.8008, lon: -1.5491 },
      'glasgow': { lat: 55.8642, lon: -4.2518 },
      'liverpool': { lat: 53.4084, lon: -2.9916 },
      'edinburgh': { lat: 55.9533, lon: -3.1883 },
      'bristol': { lat: 51.4545, lon: -2.5879 },
      'newcastle': { lat: 54.9783, lon: -1.6178 },
      'sheffield': { lat: 53.3811, lon: -1.4701 },
    };

    const cityKey = location.toLowerCase().split(',')[0].trim();
    if (commonCities[cityKey]) {
      return commonCities[cityKey];
    }

    // Default to Leeds if location not found
    return { lat: 53.8008, lon: -1.5491 };
  } catch (error) {
    console.error('Error getting coordinates:', error);
    return { lat: 53.8008, lon: -1.5491 }; // Default to Leeds
  }
}

// Compact single-line version for homepage with expandable details
export function CompactWeekendWeather({ location }: WeekendWeatherProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [coordinates, setCoordinates] = useState<{ lat: number; lon: number } | null>(null);

  // Get coordinates when location changes
  useEffect(() => {
    if (location && location.length > 2) {
      getCoordinatesFromLocation(location).then(setCoordinates);
    }
  }, [location]);

  // Fetch weekend weather summary using WeatherKit
  const { data: saturdayWeather, isLoading: satLoading } = useQuery<WeatherKitSummary>({
    queryKey: ['/api/weatherkit/summary', coordinates?.lat, coordinates?.lon, 'saturday'],
    queryFn: async () => {
      if (!coordinates) throw new Error('No coordinates available');
      const response = await fetch(`/api/weatherkit/summary?lat=${coordinates.lat}&lon=${coordinates.lon}&dayOfWeek=saturday`);
      if (!response.ok) throw new Error('Failed to fetch Saturday weather');
      return response.json();
    },
    enabled: !!coordinates,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const { data: sundayWeather, isLoading: sunLoading } = useQuery<WeatherKitSummary>({
    queryKey: ['/api/weatherkit/summary', coordinates?.lat, coordinates?.lon, 'sunday'],
    queryFn: async () => {
      if (!coordinates) throw new Error('No coordinates available');
      const response = await fetch(`/api/weatherkit/summary?lat=${coordinates.lat}&lon=${coordinates.lon}&dayOfWeek=sunday`);
      if (!response.ok) throw new Error('Failed to fetch Sunday weather');
      return response.json();
    },
    enabled: !!coordinates,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch hourly weather for expanded view
  const { data: hourlyWeather, isLoading: hourlyLoading } = useQuery<HourlyResponse>({
    queryKey: ['/api/weatherkit/hourly', coordinates?.lat, coordinates?.lon],
    queryFn: async () => {
      if (!coordinates) throw new Error('No coordinates available');
      const response = await fetch(`/api/weatherkit/hourly?lat=${coordinates.lat}&lon=${coordinates.lon}`);
      if (!response.ok) throw new Error('Failed to fetch hourly weather');
      return response.json();
    },
    enabled: !!coordinates && isExpanded,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const getWeatherIcon = (weatherId: number) => {
    const iconClass = "h-5 w-5";
    if (weatherId >= 200 && weatherId < 300) {
      return <CloudLightning className={`${iconClass} text-blue-600`} />;
    } else if (weatherId >= 300 && weatherId < 600) {
      return <CloudRain className={`${iconClass} text-blue-600`} />;
    } else if (weatherId >= 600 && weatherId < 700) {
      return <CloudSnow className={`${iconClass} text-blue-600`} />;
    } else if (weatherId >= 700 && weatherId < 800) {
      return <Wind className={`${iconClass} text-blue-600`} />;
    } else if (weatherId === 800) {
      return <Sun className={`${iconClass} text-yellow-600`} />;
    } else {
      return <Cloud className={`${iconClass} text-blue-600`} />;
    }
  };

  const formatTime = (timeString: string) => {
    const date = new Date(timeString);
    return date.toLocaleTimeString('en-GB', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  };

  if (!location) return null;

  const loading = satLoading || sunLoading;

  if (loading) {
    return (
      <div className="flex items-center justify-center text-gray-600 text-sm mb-2" data-testid="weekend-weather-loading">
        <Loader2 className="h-4 w-4 animate-spin mr-2" />
        <span>Loading weekend weather...</span>
      </div>
    );
  }

  // Only show if we have at least one day of weather data
  if (!saturdayWeather && !sundayWeather) {
    return null;
  }

  return (
    <div className="mb-4" data-testid="compact-weekend-weather">
      {/* Compact Weather Summary */}
      <div className="flex items-center justify-center text-gray-800 text-base font-semibold mb-3 bg-gray-50 rounded-lg px-4 py-3 border border-gray-200 shadow-sm">
        <MapPin className="h-4 w-4 mr-2 text-gray-600" />
        <span className="mr-4 text-gray-700">Weekend weather: {location}</span>
        
        {saturdayWeather && (
          <div className="flex items-center mr-5" data-testid="compact-saturday-weather">
            {getWeatherIcon(saturdayWeather.iconId)}
            <span className="ml-2 font-bold">Sat {saturdayWeather.tempC}°C</span>
          </div>
        )}

        {sundayWeather && (
          <div className="flex items-center mr-3" data-testid="compact-sunday-weather">
            {getWeatherIcon(sundayWeather.iconId)}
            <span className="ml-2 font-bold">Sun {sundayWeather.tempC}°C</span>
          </div>
        )}

        {/* Expand/Collapse Button */}
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="ml-2 p-1 h-8 w-8 hover:bg-gray-200 transition-colors"
          data-testid="expand-weather-button"
          title={isExpanded ? "Collapse weather details" : "Expand weather details"}
        >
          {isExpanded ? (
            <ChevronUp className="h-4 w-4 text-gray-600" />
          ) : (
            <ChevronDown className="h-4 w-4 text-gray-600" />
          )}
        </Button>
      </div>

      {/* Expanded Weather Details */}
      {isExpanded && (
        <Card className="mt-4 bg-white shadow-lg border-gray-200 max-h-96 overflow-y-auto" data-testid="expanded-weekend-weather">
          <CardContent className="space-y-4 pt-6">

            {/* Saturday and Sunday Morning Hours */}
            {hourlyWeather && hourlyWeather.hours.length > 0 && (
              <div className="mt-4 space-y-6" data-testid="morning-hours">
                {hourlyLoading ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    <span className="text-sm text-gray-600">Loading hourly forecast...</span>
                  </div>
                ) : (
                  <>
                    {/* Saturday Section */}
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                        <Thermometer className="h-4 w-4 mr-2" />
                        Saturday {formatDate(getUpcomingWeekendDates().saturday)} - 6am - 12pm
                      </h4>
                      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <div className="text-xs text-gray-600 mb-4 flex items-center font-medium">
                          <span className="h-2 w-2 rounded-full bg-blue-500 mr-2"></span>
                          HOURLY FORECAST
                        </div>
                        <div className="grid grid-cols-4 md:grid-cols-8 gap-2 md:gap-3 overflow-x-auto">
                          {(() => {
                            // Get Saturday morning hours (6am-12pm)
                            const saturdayHours = hourlyWeather.hours.filter(hour => {
                              const hourTime = new Date(hour.time);
                              const dayOfWeek = hourTime.getDay(); // 0 = Sunday, 6 = Saturday
                              const hourOfDay = hourTime.getHours();
                              return dayOfWeek === 6 && hourOfDay >= 6 && hourOfDay <= 12;
                            });
                            
                            // Create 8 slots: 6am, 6:41am (sunrise), 7am, 8am, 9am, 10am, 11am, 12pm
                            const timeSlots = [6, 6.68, 7, 8, 9, 10, 11, 12]; // 6.68 ≈ 6:41am
                            
                            return timeSlots.map((targetHour, index) => {
                              if (targetHour === 6.68) {
                                // Special sunrise slot
                                return (
                                  <div key="sunrise" className="text-center min-w-0">
                                    <div className="text-xs md:text-sm font-medium mb-1 md:mb-2 text-gray-700">06:41</div>
                                    <div className="flex justify-center mb-1 md:mb-2">
                                      <Sun className="h-4 w-4 md:h-5 md:w-5 text-yellow-500" />
                                    </div>
                                    <div className="text-xs md:text-sm font-semibold text-gray-900">Sunrise</div>
                                  </div>
                                );
                              }
                              
                              // Find weather data for this hour or use closest available
                              const weatherData = saturdayHours.find(hour => new Date(hour.time).getHours() === Math.floor(targetHour)) 
                                || saturdayHours[Math.min(index, saturdayHours.length - 1)]
                                || hourlyWeather.hours[0]; // fallback
                              
                              const displayHour = targetHour === 12 ? '12' : String(Math.floor(targetHour)).padStart(2, '0');
                              
                              return (
                                <div key={`sat-${index}`} className="text-center min-w-0" data-testid={`saturday-hour-${index}`}>
                                  <div className="text-xs md:text-sm font-medium mb-1 md:mb-2 text-gray-700">{displayHour}</div>
                                  <div className="flex justify-center mb-1 md:mb-2">{getWeatherIcon(weatherData.iconId)}</div>
                                  <div className="text-xs md:text-sm font-semibold text-gray-900">{Math.round(weatherData.tempC)}°</div>
                                </div>
                              );
                            });
                          })()}
                        </div>
                      </div>
                    </div>
                    
                    {/* Sunday Section */}
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                        <Thermometer className="h-4 w-4 mr-2" />
                        Sunday {formatDate(getUpcomingWeekendDates().sunday)} - 6am - 12pm
                      </h4>
                      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <div className="text-xs text-gray-600 mb-4 flex items-center font-medium">
                          <span className="h-2 w-2 rounded-full bg-blue-500 mr-2"></span>
                          HOURLY FORECAST
                        </div>
                        <div className="grid grid-cols-4 md:grid-cols-8 gap-2 md:gap-3 overflow-x-auto">
                          {(() => {
                            // Get Sunday morning hours (6am-12pm)
                            const sundayHours = hourlyWeather.hours.filter(hour => {
                              const hourTime = new Date(hour.time);
                              const dayOfWeek = hourTime.getDay(); // 0 = Sunday, 6 = Saturday
                              const hourOfDay = hourTime.getHours();
                              return dayOfWeek === 0 && hourOfDay >= 6 && hourOfDay <= 12;
                            });
                            
                            // Create 8 slots: 6am, 6:41am (sunrise), 7am, 8am, 9am, 10am, 11am, 12pm
                            const timeSlots = [6, 6.68, 7, 8, 9, 10, 11, 12]; // 6.68 ≈ 6:41am
                            
                            return timeSlots.map((targetHour, index) => {
                              if (targetHour === 6.68) {
                                // Special sunrise slot
                                return (
                                  <div key="sunrise" className="text-center min-w-0">
                                    <div className="text-xs md:text-sm font-medium mb-1 md:mb-2 text-gray-700">06:41</div>
                                    <div className="flex justify-center mb-1 md:mb-2">
                                      <Sun className="h-4 w-4 md:h-5 md:w-5 text-yellow-500" />
                                    </div>
                                    <div className="text-xs md:text-sm font-semibold text-gray-900">Sunrise</div>
                                  </div>
                                );
                              }
                              
                              // Find weather data for this hour or use closest available
                              const weatherData = sundayHours.find(hour => new Date(hour.time).getHours() === Math.floor(targetHour)) 
                                || sundayHours[Math.min(index, sundayHours.length - 1)]
                                || hourlyWeather.hours[0]; // fallback
                              
                              const displayHour = targetHour === 12 ? '12' : String(Math.floor(targetHour)).padStart(2, '0');
                              
                              return (
                                <div key={`sun-${index}`} className="text-center min-w-0" data-testid={`sunday-hour-${index}`}>
                                  <div className="text-xs md:text-sm font-medium mb-1 md:mb-2 text-gray-700">{displayHour}</div>
                                  <div className="flex justify-center mb-1 md:mb-2">{getWeatherIcon(weatherData.iconId)}</div>
                                  <div className="text-xs md:text-sm font-semibold text-gray-900">{Math.round(weatherData.tempC)}°</div>
                                </div>
                              );
                            });
                          })()}
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Location Note and Attribution */}
            <div className="text-xs text-gray-500 text-center pt-2 border-t border-gray-100 space-y-1">
              <div>Car boot location weather shown in the event profile</div>
              <div>Weather data provided by <span className="font-medium">Apple Weather</span></div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Original card-based version for search results
export function WeekendWeather({ location }: WeekendWeatherProps) {
  const [saturdayWeather, setSaturdayWeather] = useState<WeatherKitSummary | null>(null);
  const [sundayWeather, setSundayWeather] = useState<WeatherKitSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWeekendWeather = async () => {
      if (!location) return;
      
      setLoading(true);
      setError(null);
      // Clear previous weather data to avoid stale data
      setSaturdayWeather(null);
      setSundayWeather(null);
      
      try {
        const [satResponse, sunResponse] = await Promise.all([
          fetch(`/api/weather?location=${encodeURIComponent(location)}&dayOfWeek=saturday`),
          fetch(`/api/weather?location=${encodeURIComponent(location)}&dayOfWeek=sunday`)
        ]);
        
        // Handle each day independently
        if (satResponse.ok) {
          const satData = await satResponse.json();
          setSaturdayWeather(satData);
        }
        
        if (sunResponse.ok) {
          const sunData = await sunResponse.json();
          setSundayWeather(sunData);
        }
      } catch (err) {
        console.error('Error fetching weekend weather:', err);
        setError('Could not load weekend weather');
      } finally {
        setLoading(false);
      }
    };

    fetchWeekendWeather();
  }, [location]);

  const getWeatherIcon = (weatherId: number) => {
    const iconClass = "h-6 w-6";
    if (weatherId >= 200 && weatherId < 300) {
      return <CloudLightning className={`${iconClass} text-blue-600`} />;
    } else if (weatherId >= 300 && weatherId < 600) {
      return <CloudRain className={`${iconClass} text-blue-600`} />;
    } else if (weatherId >= 600 && weatherId < 700) {
      return <CloudSnow className={`${iconClass} text-blue-600`} />;
    } else if (weatherId >= 700 && weatherId < 800) {
      return <Wind className={`${iconClass} text-blue-600`} />;
    } else if (weatherId === 800) {
      return <Sun className={`${iconClass} text-yellow-500`} />;
    } else {
      return <Cloud className={`${iconClass} text-blue-600`} />;
    }
  };

  if (!location) return null;

  if (loading) {
    return (
      <div className="mt-4 bg-gray-50 rounded-lg p-4 border border-gray-200">
        <div className="flex items-center justify-center">
          <Loader2 className="h-5 w-5 text-gray-500 animate-spin mr-2" />
          <p className="text-sm text-gray-600">Loading weekend weather...</p>
        </div>
      </div>
    );
  }

  // Only show if we have at least one day of weather data
  if (!saturdayWeather && !sundayWeather) {
    return null;
  }

  return (
    <div className="mt-4 bg-gray-50 rounded-lg p-4 border border-gray-200" data-testid="weekend-weather">
      <h3 className="text-sm font-medium text-gray-700 mb-3">Weekend Weather for {location}</h3>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Saturday */}
        {saturdayWeather && (
          <div className="flex items-center space-x-3 bg-white rounded-lg p-3 border border-gray-100" data-testid="saturday-weather">
            <div className="flex-shrink-0">
              {getWeatherIcon(saturdayWeather.iconId)}
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">Saturday</p>
              <p className="text-lg font-bold text-gray-900">{saturdayWeather.tempC}°C</p>
              <p className="text-xs text-gray-600 capitalize">{saturdayWeather.conditionCode}</p>
            </div>
          </div>
        )}

        {/* Sunday */}
        {sundayWeather && (
          <div className="flex items-center space-x-3 bg-white rounded-lg p-3 border border-gray-100" data-testid="sunday-weather">
            <div className="flex-shrink-0">
              {getWeatherIcon(sundayWeather.iconId)}
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">Sunday</p>
              <p className="text-lg font-bold text-gray-900">{sundayWeather.tempC}°C</p>
              <p className="text-xs text-gray-600 capitalize">{sundayWeather.conditionCode}</p>
            </div>
          </div>
        )}
      </div>
      
      {/* Apple Weather Attribution */}
      <div className="text-xs text-gray-500 text-center mt-3 pt-2 border-t border-gray-200">
        Weather data provided by <span className="font-medium">Apple Weather</span>
      </div>
    </div>
  );
}