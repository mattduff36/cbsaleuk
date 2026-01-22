import { useState, useEffect } from 'react';
import { 
  Cloud, Sun, CloudRain, CloudSnow, CloudLightning, Wind, Loader2, 
  AlertTriangle, Clock, Thermometer, Droplets, 
  MapPin, ChevronDown, ChevronUp
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface ComprehensiveWeatherForecastProps {
  location: string;
  dayOfWeek: string;
  saleDate?: string;
  latitude?: number | null;
  longitude?: number | null;
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
    message?: string;
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
  windDirection: number;
  humidity: number;
  uvIndex: number;
}

interface HourlyResponse {
  hours: HourlyForecast[];
  meta: {
    source: string;
    timezone: string;
    count: number;
    message?: string;
  };
}

async function getCoordinatesFromLocation(location: string): Promise<{ lat: number; lon: number } | null> {
  try {
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
      'nottingham': { lat: 52.9548, lon: -1.1581 },
      'cardiff': { lat: 51.4816, lon: -3.1791 },
      'coventry': { lat: 52.4068, lon: -1.5197 },
      'leicester': { lat: 52.6369, lon: -1.1398 },
      'bradford': { lat: 53.7960, lon: -1.7594 },
      'belfast': { lat: 54.5973, lon: -5.9301 },
      'plymouth': { lat: 50.3755, lon: -4.1427 },
      'wakefield': { lat: 53.6833, lon: -1.5000 },
      'stoke': { lat: 53.0027, lon: -2.1794 },
      'derby': { lat: 52.9225, lon: -1.4746 }
    };

    const cityKey = location.toLowerCase().split(',')[0].trim();
    if (commonCities[cityKey]) {
      return commonCities[cityKey];
    }

    return { lat: 53.8008, lon: -1.5491 };
  } catch (error) {
    console.error('Error getting coordinates:', error);
    return { lat: 53.8008, lon: -1.5491 };
  }
}

export function ComprehensiveWeatherForecast({ location, dayOfWeek, saleDate, latitude, longitude }: ComprehensiveWeatherForecastProps) {
  const [coordinates, setCoordinates] = useState<{ lat: number; lon: number } | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    if (latitude != null && longitude != null) {
      setCoordinates({ lat: latitude, lon: longitude });
    } else if (location && location.length > 2) {
      getCoordinatesFromLocation(location).then(setCoordinates);
    }
  }, [location, latitude, longitude]);

  const { data: summary, isLoading: summaryLoading } = useQuery<WeatherKitSummary>({
    queryKey: ['/api/weatherkit/summary', coordinates?.lat, coordinates?.lon, dayOfWeek],
    queryFn: async () => {
      if (!coordinates) throw new Error('No coordinates available');
      const response = await fetch(`/api/weatherkit/summary?lat=${coordinates.lat}&lon=${coordinates.lon}&dayOfWeek=${dayOfWeek}`);
      if (!response.ok) throw new Error('Failed to fetch weather summary');
      return response.json();
    },
    enabled: !!coordinates && !!dayOfWeek,
    staleTime: 5 * 60 * 1000,
  });

  const { data: hourlyData, isLoading: hourlyLoading } = useQuery<HourlyResponse>({
    queryKey: ['/api/weatherkit/hourly', coordinates?.lat, coordinates?.lon],
    queryFn: async () => {
      if (!coordinates) throw new Error('No coordinates available');
      const response = await fetch(`/api/weatherkit/hourly?lat=${coordinates.lat}&lon=${coordinates.lon}`);
      if (!response.ok) throw new Error('Failed to fetch hourly weather');
      return response.json();
    },
    enabled: !!coordinates,
    staleTime: 5 * 60 * 1000,
  });

  const getWeatherIcon = (weatherId: number, size: string = "h-5 w-5") => {
    if (weatherId >= 200 && weatherId < 300) {
      return <CloudLightning className={`${size} text-yellow-500`} />;
    } else if (weatherId >= 300 && weatherId < 600) {
      return <CloudRain className={`${size} text-blue-500`} />;
    } else if (weatherId >= 600 && weatherId < 700) {
      return <CloudSnow className={`${size} text-blue-300`} />;
    } else if (weatherId >= 700 && weatherId < 800) {
      return <Wind className={`${size} text-gray-500`} />;
    } else if (weatherId === 800) {
      return <Sun className={`${size} text-yellow-500`} />;
    } else {
      return <Cloud className={`${size} text-gray-500`} />;
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

  const getWeatherConditionText = (iconId: number) => {
    if (iconId >= 200 && iconId < 300) return 'Thunderstorms';
    if (iconId >= 300 && iconId < 600) return 'Rain';
    if (iconId >= 600 && iconId < 700) return 'Snow';
    if (iconId >= 700 && iconId < 800) return 'Hazy';
    if (iconId === 800) return 'Clear';
    return 'Cloudy';
  };

  if (!location) return null;

  const loading = summaryLoading || hourlyLoading;

  if (loading) {
    return (
      <div className="bg-gradient-to-r from-blue-50 to-sky-50 rounded-lg p-4 border border-blue-100">
        <div className="flex items-center justify-center py-2">
          <Loader2 className="h-5 w-5 animate-spin text-primary mr-2" />
          <span className="text-sm text-gray-600">Loading weather...</span>
        </div>
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="bg-red-50 rounded-lg p-3 border border-red-100">
        <div className="flex items-center text-red-600 text-sm">
          <AlertTriangle className="h-4 w-4 mr-2" />
          <span>Weather unavailable</span>
        </div>
      </div>
    );
  }

  const dayLabel = dayOfWeek && dayOfWeek.charAt ? dayOfWeek.charAt(0).toUpperCase() + dayOfWeek.slice(1) : 'Today';

  return (
    <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
      <div className="bg-gradient-to-r from-blue-50 to-sky-50 rounded-lg border border-blue-100 overflow-hidden" data-testid="comprehensive-weather-forecast">
        {/* Compact Header - Always Visible */}
        <CollapsibleTrigger asChild>
          <button className="w-full p-4 flex items-center justify-between hover:bg-blue-100/50 transition-colors cursor-pointer">
            <div className="flex items-center gap-4">
              {/* Weather Icon */}
              <div className="flex-shrink-0">
                {getWeatherIcon(summary.iconId, "h-10 w-10")}
              </div>
              
              {/* Main Info */}
              <div className="text-left">
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-gray-900">{summary.tempC}°C</span>
                  <span className="text-sm text-gray-600">{getWeatherConditionText(summary.iconId)}</span>
                </div>
                <div className="text-xs text-gray-500 flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  Weather Forecast for {dayLabel}
                </div>
              </div>
            </div>
            
            {/* Quick Stats */}
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-4 text-sm text-gray-600">
                {summary.precipitationChance !== undefined && (
                  <div className="flex items-center gap-1">
                    <Droplets className="h-4 w-4 text-blue-500" />
                    <span>{summary.precipitationChance}%</span>
                  </div>
                )}
                {summary.windSpeedMph !== undefined && (
                  <div className="flex items-center gap-1">
                    <Wind className="h-4 w-4 text-gray-500" />
                    <span>{summary.windSpeedMph}mph</span>
                  </div>
                )}
                {summary.tempMaxC && summary.tempMinC && (
                  <div className="text-xs text-gray-500">
                    H:{summary.tempMaxC}° L:{summary.tempMinC}°
                  </div>
                )}
              </div>
              
              {/* Expand/Collapse Button */}
              <div className="flex items-center text-gray-400">
                {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
              </div>
            </div>
          </button>
        </CollapsibleTrigger>
        
        {/* Expandable Content */}
        <CollapsibleContent>
          <div className="border-t border-blue-100 p-4 space-y-4">
            {/* Hourly Forecast - Horizontal Scroll */}
            {hourlyData && hourlyData.hours.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  Hourly Forecast
                </h4>
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-blue-200 scrollbar-track-transparent">
                  {hourlyData.hours.slice(0, 12).map((hour, index) => (
                    <div 
                      key={index}
                      className="flex-shrink-0 w-16 bg-white rounded-lg p-2 text-center border border-gray-100 shadow-sm"
                    >
                      <div className="text-xs text-gray-500 font-medium">{formatTime(hour.time)}</div>
                      <div className="my-1 flex justify-center">{getWeatherIcon(hour.iconId, "h-5 w-5")}</div>
                      <div className="text-sm font-semibold">{hour.tempC}°</div>
                      <div className="text-xs text-blue-500">{hour.precipitationChance}%</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Detailed Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {summary.feelsLikeC !== undefined && (
                <div className="bg-white rounded-lg p-3 text-center border border-gray-100">
                  <Thermometer className="h-4 w-4 mx-auto text-orange-500 mb-1" />
                  <div className="text-sm font-medium">{summary.feelsLikeC}°C</div>
                  <div className="text-xs text-gray-500">Feels like</div>
                </div>
              )}
              {summary.humidity !== undefined && (
                <div className="bg-white rounded-lg p-3 text-center border border-gray-100">
                  <Droplets className="h-4 w-4 mx-auto text-blue-500 mb-1" />
                  <div className="text-sm font-medium">{summary.humidity}%</div>
                  <div className="text-xs text-gray-500">Humidity</div>
                </div>
              )}
              {summary.uvIndex !== undefined && (
                <div className="bg-white rounded-lg p-3 text-center border border-gray-100">
                  <Sun className="h-4 w-4 mx-auto text-yellow-500 mb-1" />
                  <div className="text-sm font-medium">{summary.uvIndex}</div>
                  <div className="text-xs text-gray-500">UV Index</div>
                </div>
              )}
              {summary.visibility !== undefined && (
                <div className="bg-white rounded-lg p-3 text-center border border-gray-100">
                  <Cloud className="h-4 w-4 mx-auto text-gray-500 mb-1" />
                  <div className="text-sm font-medium">{summary.visibility}km</div>
                  <div className="text-xs text-gray-500">Visibility</div>
                </div>
              )}
            </div>

            {/* Weather Alerts - Compact */}
            {summary.precipitationChance && summary.precipitationChance > 60 && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-orange-500 flex-shrink-0" />
                <span className="text-sm text-orange-700">High chance of rain - bring waterproof clothing</span>
              </div>
            )}
            
            {summary.tempC < 5 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center gap-2">
                <Thermometer className="h-4 w-4 text-blue-500 flex-shrink-0" />
                <span className="text-sm text-blue-700">Very cold conditions - dress warmly</span>
              </div>
            )}
            
            {summary.tempC > 25 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-center gap-2">
                <Sun className="h-4 w-4 text-yellow-500 flex-shrink-0" />
                <span className="text-sm text-yellow-700">Warm weather - bring sun protection and stay hydrated</span>
              </div>
            )}
            
            {/* Attribution */}
            <div className="text-xs text-gray-400 text-center pt-2 border-t border-gray-100">
              Weather data by Apple Weather
            </div>
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}
