import { useState, useEffect } from 'react';
import { Cloud, Sun, CloudRain, CloudSnow, CloudLightning, Wind, Loader2, MapPin, Droplets } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';

interface SearchWeatherCardProps {
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

// Helper function to get coordinates from location name
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

export function SearchWeatherCard({ location }: SearchWeatherCardProps) {
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

  // Weather condition styling and icons
  const getWeatherDisplay = (weather: WeatherKitSummary) => {
    const iconId = weather.iconId;
    let icon, bgClass, textClass, borderClass, description;

    if (iconId >= 200 && iconId < 300) {
      // Thunderstorm
      icon = <CloudLightning className="h-6 w-6" />;
      bgClass = "bg-purple-50";
      textClass = "text-purple-800";
      borderClass = "border-purple-200";
      description = "Thunderstorms";
    } else if (iconId >= 300 && iconId < 600) {
      // Rain
      icon = <CloudRain className="h-6 w-6" />;
      bgClass = "bg-blue-50";
      textClass = "text-blue-800";
      borderClass = "border-blue-200";
      description = "Rain";
    } else if (iconId >= 600 && iconId < 700) {
      // Snow
      icon = <CloudSnow className="h-6 w-6" />;
      bgClass = "bg-cyan-50";
      textClass = "text-cyan-800";
      borderClass = "border-cyan-200";
      description = "Snow";
    } else if (iconId >= 700 && iconId < 800) {
      // Atmosphere (mist, fog, etc.)
      icon = <Wind className="h-6 w-6" />;
      bgClass = "bg-gray-50";
      textClass = "text-gray-800";
      borderClass = "border-gray-200";
      description = "Mist/Fog";
    } else if (iconId === 800) {
      // Clear sky
      icon = <Sun className="h-6 w-6" />;
      bgClass = "bg-yellow-50";
      textClass = "text-yellow-800";
      borderClass = "border-yellow-200";
      description = "Clear";
    } else {
      // Clouds
      icon = <Cloud className="h-6 w-6" />;
      bgClass = "bg-gray-50";
      textClass = "text-gray-800";
      borderClass = "border-gray-200";
      description = "Cloudy";
    }

    return { icon, bgClass, textClass, borderClass, description };
  };

  // Clean up location display
  const displayLocation = location.replace(/, UK$/i, '').replace(/, United Kingdom$/i, '');

  if (!location) return null;

  const loading = satLoading || sunLoading;

  if (loading) {
    return (
      <Card className="mb-6 shadow-lg border border-gray-200" data-testid="search-weather-card-loading">
        <CardContent className="p-6">
          <div className="flex items-center justify-center text-gray-600">
            <Loader2 className="h-5 w-5 animate-spin mr-3" />
            <span className="text-sm">Loading weekend weather forecast...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Only show if we have at least one day of weather data
  if (!saturdayWeather && !sundayWeather) {
    return null;
  }

  return (
    <Card className="mb-6 shadow-lg border border-gray-200 overflow-hidden" data-testid="search-weekend-weather-card">
      <CardContent className="p-0">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-4">
          <div className="flex items-center">
            <MapPin className="h-5 w-5 mr-2" />
            <h3 className="text-lg font-semibold">Weekend Weather</h3>
          </div>
          <p className="text-blue-100 text-sm mt-1">{displayLocation}</p>
        </div>

        {/* Weather Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 divide-x divide-gray-200">
          {/* Saturday */}
          {saturdayWeather && (
            <div className="p-6" data-testid="saturday-weather">
              {(() => {
                const { icon, bgClass, textClass, borderClass, description } = getWeatherDisplay(saturdayWeather);
                return (
                  <div className={`${bgClass} ${borderClass} border-2 rounded-xl p-4 h-full`}>
                    <div className="flex items-center justify-between mb-4">
                      <h4 className={`text-lg font-bold ${textClass}`}>Saturday</h4>
                      <div className={textClass}>{icon}</div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className={`text-3xl font-bold ${textClass}`}>
                          {saturdayWeather.tempC}°C
                        </span>
                        <span className={`text-sm font-medium ${textClass}`}>
                          {description}
                        </span>
                      </div>
                      
                      {saturdayWeather.tempMaxC && saturdayWeather.tempMinC && (
                        <div className="flex items-center justify-between text-sm">
                          <span className={`${textClass} opacity-80`}>High/Low:</span>
                          <span className={`font-medium ${textClass}`}>
                            {saturdayWeather.tempMaxC}° / {saturdayWeather.tempMinC}°
                          </span>
                        </div>
                      )}
                      
                      {saturdayWeather.precipitationChance && (
                        <div className="flex items-center justify-between text-sm">
                          <span className={`${textClass} opacity-80 flex items-center`}>
                            <Droplets className="h-3 w-3 mr-1" />
                            Rain chance:
                          </span>
                          <span className={`font-medium ${textClass}`}>
                            {saturdayWeather.precipitationChance}%
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {/* Sunday */}
          {sundayWeather && (
            <div className="p-6" data-testid="sunday-weather">
              {(() => {
                const { icon, bgClass, textClass, borderClass, description } = getWeatherDisplay(sundayWeather);
                return (
                  <div className={`${bgClass} ${borderClass} border-2 rounded-xl p-4 h-full`}>
                    <div className="flex items-center justify-between mb-4">
                      <h4 className={`text-lg font-bold ${textClass}`}>Sunday</h4>
                      <div className={textClass}>{icon}</div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className={`text-3xl font-bold ${textClass}`}>
                          {sundayWeather.tempC}°C
                        </span>
                        <span className={`text-sm font-medium ${textClass}`}>
                          {description}
                        </span>
                      </div>
                      
                      {sundayWeather.tempMaxC && sundayWeather.tempMinC && (
                        <div className="flex items-center justify-between text-sm">
                          <span className={`${textClass} opacity-80`}>High/Low:</span>
                          <span className={`font-medium ${textClass}`}>
                            {sundayWeather.tempMaxC}° / {sundayWeather.tempMinC}°
                          </span>
                        </div>
                      )}
                      
                      {sundayWeather.precipitationChance && (
                        <div className="flex items-center justify-between text-sm">
                          <span className={`${textClass} opacity-80 flex items-center`}>
                            <Droplets className="h-3 w-3 mr-1" />
                            Rain chance:
                          </span>
                          <span className={`font-medium ${textClass}`}>
                            {sundayWeather.precipitationChance}%
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
        </div>

        {/* Footer with source info */}
        <div className="bg-gray-50 px-6 py-3 text-center">
          <p className="text-xs text-gray-500">
            Weather forecast • Updated every 5 minutes
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Weather data provided by <span className="font-medium">Apple Weather</span>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}