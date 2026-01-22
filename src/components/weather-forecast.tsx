import { useState, useEffect } from 'react';
import { Cloud, Sun, CloudRain, CloudSnow, CloudLightning, Wind, Loader2 } from 'lucide-react';
import { capitalizeFirstLetter } from '@/lib/utils';

interface WeatherForecastProps {
  location: string;
  dayOfWeek: string;
}

interface WeatherData {
  main: {
    temp: number;
    feels_like: number;
    humidity: number;
  };
  weather: Array<{
    id: number;
    main: string;
    description: string;
    icon: string;
  }>;
  wind: {
    speed: number;
  };
  name: string;
  // Forecast metadata fields (added by our server)
  forecast_meta?: {
    is_forecast: boolean;
    target_day?: string;
    target_date?: string;
    message: string;
  };
  // For 5-day forecast data
  dt_txt?: string;
}

export function WeatherForecast({ location, dayOfWeek }: WeatherForecastProps) {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWeather = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Get weather for the specific day of the week if provided
        const url = `/api/weather?location=${encodeURIComponent(location)}${
          dayOfWeek ? `&dayOfWeek=${encodeURIComponent(dayOfWeek)}` : ''
        }`;
        
        console.log('Fetching weather for:', location, dayOfWeek ? `on ${dayOfWeek}` : '');
        
        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error(`Weather API error: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Weather data received:', data);
        setWeatherData(data);
      } catch (err) {
        console.error('Error fetching weather data:', err);
        setError('Could not load weather data');
      } finally {
        setLoading(false);
      }
    };

    if (location) {
      fetchWeather();
    }
  }, [location, dayOfWeek]);

  const getWeatherIcon = (weatherId: number) => {
    // Weather condition codes: https://openweathermap.org/weather-conditions
    if (weatherId >= 200 && weatherId < 300) {
      return <CloudLightning className="h-7 w-7 text-white" />;
    } else if (weatherId >= 300 && weatherId < 600) {
      return <CloudRain className="h-7 w-7 text-white" />;
    } else if (weatherId >= 600 && weatherId < 700) {
      return <CloudSnow className="h-7 w-7 text-white" />;
    } else if (weatherId >= 700 && weatherId < 800) {
      return <Wind className="h-7 w-7 text-white" />;
    } else if (weatherId === 800) {
      return <Sun className="h-7 w-7 text-yellow-300" />;
    } else {
      return <Cloud className="h-7 w-7 text-white" />;
    }
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-3 border border-blue-400 shadow-lg flex flex-col items-center justify-center min-h-[80px]">
        <Loader2 className="h-6 w-6 text-white animate-spin mb-1" />
        <p className="text-blue-100 text-xs">Loading weather...</p>
      </div>
    );
  }

  if (error || !weatherData) {
    return (
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-3 border border-blue-400 shadow-lg">
        <div className="flex items-center mb-1">
          <Cloud className="h-5 w-5 mr-2 text-white" />
          <h2 className="font-heading text-sm font-semibold text-white">Weather</h2>
        </div>
        <p className="text-xs text-blue-100">
          Weather data unavailable
        </p>
      </div>
    );
  }

  // Convert temperature from Kelvin to Celsius
  const tempInCelsius = Math.round(weatherData.main.temp - 273.15);
  const feelsLike = Math.round(weatherData.main.feels_like - 273.15);

  const weather = weatherData.weather[0];

  // Format date if we have one from forecast
  let formattedDate = '';
  if (weatherData.forecast_meta?.target_date) {
    const dateParts = weatherData.forecast_meta.target_date.split('-');
    if (dateParts.length === 3) {
      const date = new Date(
        parseInt(dateParts[0]), 
        parseInt(dateParts[1]) - 1, // Month is 0-indexed
        parseInt(dateParts[2])
      );
      formattedDate = date.toLocaleDateString('en-GB', { 
        weekday: 'long',
        day: 'numeric', 
        month: 'long' 
      });
    }
  }
  
  // Determine if this is an actual forecast or current weather
  const isForecast = weatherData.forecast_meta?.is_forecast === true;
  
  // Determine the title of the weather card
  const weatherTitle = isForecast 
    ? `Weather Forecast for ${capitalizeFirstLetter(dayOfWeek)}`
    : `Current Weather in ${weatherData.name}`;
    
  return (
    <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-3 border border-blue-400 shadow-lg">
      <div className="flex justify-between items-center">
        {/* Left side - weather icon and temperature */}
        <div className="flex items-center">
          <div className="mr-2 text-white" style={{ width: '28px', height: '28px' }}>
            {getWeatherIcon(weather.id)}
          </div>
          <div>
            <p className="text-lg font-bold text-white leading-tight">{tempInCelsius}°C</p>
            <p className="text-xs text-blue-100 capitalize leading-tight">{weather.description}</p>
          </div>
        </div>
        
        {/* Right side - compact details */}
        <div className="text-right text-xs text-blue-100 leading-tight space-y-0">
          <p><span className="font-medium text-white">Feels:</span> {feelsLike}°C</p>
          <p><span className="font-medium text-white">Wind:</span> {Math.round(weatherData.wind.speed * 3.6)} km/h</p>
          <p><span className="font-medium text-white">Humidity:</span> {weatherData.main.humidity}%</p>
        </div>
      </div>
      
      {/* Date indicator and forecast info - single line if possible */}
      <div className="flex justify-between items-center text-xs mt-1">
        {isForecast && formattedDate && (
          <span className="font-medium text-white">{formattedDate}</span>
        )}
        <span className="text-blue-200 text-xs">
          {weatherData.forecast_meta?.is_forecast ? 'Forecast' : 'Current weather'}
        </span>
      </div>
      
      {/* Apple Weather Attribution */}
      <div className="text-xs text-blue-200 text-center mt-1 pt-1 border-t border-blue-400">
        Weather data by <span className="font-medium text-blue-100">Apple Weather</span>
      </div>
    </div>
  );
}