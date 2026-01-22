import { useState, useEffect } from 'react';
import { 
  Cloud, Sun, CloudRain, CloudSnow, CloudLightning, Wind, Loader2, 
  AlertTriangle, Star, Calendar, Thermometer, Droplets, Eye, 
  MapPin, ChevronRight, TrendingUp, TrendingDown, Target, Clock
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';

interface DashboardWeatherForecastProps {
  userLocation?: string; // User's default location for planning
  className?: string;
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

interface DailyForecast {
  day: string;
  date: string;
  weather: WeatherKitSummary;
  suitabilityScore: number;
  conditions: string[];
}

interface WeatherRecommendation {
  bestDay: string;
  worstDay: string;
  bestTime: string;
  weeklyScore: number;
  insights: string[];
}

// Helper function to get coordinates from location name
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
      'belfast': { lat: 54.5973, lon: -5.9301 }
    };

    const cityKey = location.toLowerCase().split(',')[0].trim();
    if (commonCities[cityKey]) {
      return commonCities[cityKey];
    }

    // Default to Leeds if location not found
    return { lat: 53.8008, lon: -1.5491 };
  } catch (error) {
    console.error('Error getting coordinates:', error);
    return { lat: 53.8008, lon: -1.5491 };
  }
}

// Function to calculate weather suitability for car boot sales
function calculateSuitability(weather: WeatherKitSummary): { score: number; conditions: string[] } {
  let score = 100;
  const conditions: string[] = [];

  // Temperature factors (ideal: 10-20°C)
  const temp = weather.tempC;
  if (temp < 5) {
    score -= 30;
    conditions.push('Very cold');
  } else if (temp < 10) {
    score -= 15;
    conditions.push('Cold');
  } else if (temp > 25) {
    score -= 10;
    conditions.push('Hot');
  } else if (temp >= 10 && temp <= 20) {
    score += 10;
    conditions.push('Perfect temperature');
  }

  // Precipitation factors
  const rainChance = weather.precipitationChance || 0;
  if (rainChance > 70) {
    score -= 40;
    conditions.push('High rain chance');
  } else if (rainChance > 40) {
    score -= 20;
    conditions.push('Moderate rain chance');
  } else if (rainChance < 20) {
    score += 15;
    conditions.push('Dry conditions');
  }


  // Weather condition factors
  const conditionCode = weather.conditionCode.toLowerCase();
  if (conditionCode.includes('clear') || conditionCode.includes('sunny')) {
    score += 20;
    conditions.push('Clear skies');
  } else if (conditionCode.includes('partly') || conditionCode.includes('cloudy')) {
    score += 5;
    conditions.push('Partly cloudy');
  } else if (conditionCode.includes('rain') || conditionCode.includes('shower')) {
    score -= 30;
    conditions.push('Rainy');
  } else if (conditionCode.includes('snow')) {
    score -= 40;
    conditions.push('Snow');
  } else if (conditionCode.includes('fog') || conditionCode.includes('mist')) {
    score -= 15;
    conditions.push('Poor visibility');
  }

  return { score: Math.max(0, Math.min(100, score)), conditions };
}

export function DashboardWeatherForecast({ userLocation = "Leeds, UK", className = "" }: DashboardWeatherForecastProps) {
  const [coordinates, setCoordinates] = useState<{ lat: number; lon: number } | null>(null);
  const [forecasts, setForecasts] = useState<DailyForecast[]>([]);
  const [recommendation, setRecommendation] = useState<WeatherRecommendation | null>(null);

  // Get coordinates when location changes
  useEffect(() => {
    if (userLocation && userLocation.length > 2) {
      getCoordinatesFromLocation(userLocation).then(setCoordinates);
    }
  }, [userLocation]);

  // Get the next 5 days of weather data
  const days = ['saturday', 'sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
  
  // Fetch weather data for each day
  const weatherQueries = days.slice(0, 5).map(day => {
    return useQuery<WeatherKitSummary>({
      queryKey: ['/api/weatherkit/summary', coordinates?.lat, coordinates?.lon, day],
      queryFn: async () => {
        if (!coordinates) throw new Error('No coordinates available');
        const response = await fetch(`/api/weatherkit/summary?lat=${coordinates.lat}&lon=${coordinates.lon}&dayOfWeek=${day}`);
        if (!response.ok) throw new Error(`Failed to fetch ${day} weather`);
        return response.json();
      },
      enabled: !!coordinates,
      staleTime: 10 * 60 * 1000, // 10 minutes
    });
  });

  const isLoading = weatherQueries.some(query => query.isLoading);
  const hasError = weatherQueries.some(query => query.error);

  // Process weather data and calculate recommendations
  useEffect(() => {
    if (weatherQueries.every(query => query.data) && !isLoading) {
      const processedForecasts: DailyForecast[] = weatherQueries.map((query, index) => {
        const day = days[index];
        const weather = query.data!;
        const { score, conditions } = calculateSuitability(weather);
        
        const date = new Date();
        date.setDate(date.getDate() + index);
        
        return {
          day: day.charAt(0).toUpperCase() + day.slice(1),
          date: date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
          weather,
          suitabilityScore: score,
          conditions
        };
      });

      setForecasts(processedForecasts);

      // Calculate recommendations
      const bestForecast = processedForecasts.reduce((best, current) => 
        current.suitabilityScore > best.suitabilityScore ? current : best
      );
      
      const worstForecast = processedForecasts.reduce((worst, current) => 
        current.suitabilityScore < worst.suitabilityScore ? current : worst
      );

      const weeklyScore = Math.round(
        processedForecasts.reduce((sum, forecast) => sum + forecast.suitabilityScore, 0) / processedForecasts.length
      );

      const insights: string[] = [];
      
      // Generate insights
      if (weeklyScore > 75) {
        insights.push('Excellent week for car boot sale visits');
      } else if (weeklyScore > 50) {
        insights.push('Generally good conditions this week');
      } else {
        insights.push('Mixed conditions - choose your days carefully');
      }

      const rainDays = processedForecasts.filter(f => (f.weather.precipitationChance || 0) > 40).length;
      if (rainDays > 2) {
        insights.push(`${rainDays} days with rain expected`);
      }

      const coldDays = processedForecasts.filter(f => f.weather.tempC < 10).length;
      if (coldDays > 2) {
        insights.push('Pack warm clothes for several cold days');
      }


      setRecommendation({
        bestDay: bestForecast.day,
        worstDay: worstForecast.day,
        bestTime: 'Morning (9am-12pm)',
        weeklyScore,
        insights
      });
    }
  }, [weatherQueries.map(q => q.data), isLoading]);

  const getWeatherIcon = (weatherId: number) => {
    const iconClass = "h-5 w-5";
    if (weatherId >= 200 && weatherId < 300) {
      return <CloudLightning className={`${iconClass} text-amber-600`} />;
    } else if (weatherId >= 300 && weatherId < 600) {
      return <CloudRain className={`${iconClass} text-blue-600`} />;
    } else if (weatherId >= 600 && weatherId < 700) {
      return <CloudSnow className={`${iconClass} text-blue-400`} />;
    } else if (weatherId >= 700 && weatherId < 800) {
      return <Wind className={`${iconClass} text-gray-600`} />;
    } else if (weatherId === 800) {
      return <Sun className={`${iconClass} text-yellow-500`} />;
    } else {
      return <Cloud className={`${iconClass} text-gray-500`} />;
    }
  };

  const getSuitabilityColor = (score: number) => {
    if (score >= 75) return 'text-green-600 bg-green-50 border-green-200';
    if (score >= 50) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const getSuitabilityLabel = (score: number) => {
    if (score >= 75) return 'Excellent';
    if (score >= 50) return 'Good';
    if (score >= 25) return 'Fair';
    return 'Poor';
  };

  if (hasError) {
    return (
      <Card className={`${className}`} data-testid="weather-forecast-card">
        <CardHeader>
          <CardTitle className="flex items-center">
            <AlertTriangle className="h-5 w-5 mr-2 text-amber-500" />
            Weather Forecast
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertDescription>
              Unable to load weather data. Please try again later.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`${className}`} data-testid="weather-forecast-card">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <Calendar className="h-5 w-5 mr-2 text-blue-600" />
            5-Day Car Boot Sale Weather
          </div>
          <div className="flex items-center text-sm text-gray-500">
            <MapPin className="h-4 w-4 mr-1" />
            {userLocation}
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-blue-600 mr-2" />
            <span>Loading weather forecast...</span>
          </div>
        ) : (
          <>
            {/* Best Day Recommendation */}
            {recommendation && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center">
                    <Target className="h-5 w-5 text-blue-600 mr-2" />
                    <h3 className="font-semibold text-blue-900">This Week's Recommendations</h3>
                  </div>
                  <Badge className={`${getSuitabilityColor(recommendation.weeklyScore)} border`}>
                    {recommendation.weeklyScore}% Weekly Score
                  </Badge>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                  <div className="bg-white rounded p-3 border border-blue-100">
                    <div className="flex items-center text-green-700 mb-1">
                      <Star className="h-4 w-4 mr-1" />
                      <span className="font-medium">Best Day</span>
                    </div>
                    <p className="text-sm text-gray-600">{recommendation.bestDay}</p>
                  </div>
                  
                  <div className="bg-white rounded p-3 border border-blue-100">
                    <div className="flex items-center text-blue-700 mb-1">
                      <Clock className="h-4 w-4 mr-1" />
                      <span className="font-medium">Best Time</span>
                    </div>
                    <p className="text-sm text-gray-600">{recommendation.bestTime}</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  {recommendation.insights.map((insight, index) => (
                    <div key={index} className="flex items-center text-sm text-blue-800">
                      <ChevronRight className="h-4 w-4 mr-1 text-blue-600" />
                      {insight}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Daily Forecasts */}
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-900 flex items-center">
                <Thermometer className="h-4 w-4 mr-2 text-gray-600" />
                Daily Breakdown
              </h3>
              
              <div className="grid gap-3">
                {forecasts.map((forecast, index) => (
                  <div 
                    key={index} 
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    data-testid={`forecast-day-${forecast.day.toLowerCase()}`}
                  >
                    <div className="flex items-center space-x-4">
                      <div className="text-center min-w-[60px]">
                        <div className="font-medium text-gray-900">{forecast.day}</div>
                        <div className="text-xs text-gray-500">{forecast.date}</div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {getWeatherIcon(forecast.weather.iconId)}
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-medium">{Math.round(forecast.weather.tempC)}°C</span>
                            {forecast.weather.tempMaxC && (
                              <span className="text-sm text-gray-500">
                                {Math.round(forecast.weather.tempMaxC)}°/{Math.round(forecast.weather.tempMinC || 0)}°
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-gray-500 capitalize">
                            {forecast.weather.conditionCode.replace(/-/g, ' ')}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <div className="text-right text-xs text-gray-500">
                        <div className="flex items-center">
                          <Droplets className="h-3 w-3 mr-1" />
                          {forecast.weather.precipitationChance || 0}%
                        </div>
                      </div>
                      
                      <Badge className={`${getSuitabilityColor(forecast.suitabilityScore)} border text-xs px-2 py-1`}>
                        {getSuitabilityLabel(forecast.suitabilityScore)}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Weather Conditions Key */}
            <div className="bg-gray-50 rounded-lg p-3">
              <h4 className="font-medium text-gray-900 mb-2 text-sm">Rating Guide</h4>
              <div className="flex flex-wrap gap-2 text-xs">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded mr-2"></div>
                  <span>Excellent (75%+)</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-yellow-500 rounded mr-2"></div>
                  <span>Good (50-74%)</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-red-500 rounded mr-2"></div>
                  <span>Poor (&lt;50%)</span>
                </div>
              </div>
            </div>

            {/* Apple Weather Attribution */}
            <div className="text-xs text-gray-500 text-center mt-4 pt-3 border-t border-gray-200">
              Weather data provided by <span className="font-medium">Apple Weather</span>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}