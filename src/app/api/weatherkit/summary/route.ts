import { NextResponse } from 'next/server';

// Stub: Return mock weather summary since WeatherKit is not connected yet
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const dayOfWeek = searchParams.get('dayOfWeek');

  // Return mock weather data
  return NextResponse.json({
    tempC: dayOfWeek === 'saturday' ? 14 : 16,
    tempMaxC: dayOfWeek === 'saturday' ? 17 : 19,
    tempMinC: dayOfWeek === 'saturday' ? 11 : 13,
    feelsLikeC: dayOfWeek === 'saturday' ? 13 : 15,
    conditionCode: 'partly_cloudy',
    iconId: 801,
    precipitationChance: 25,
    windSpeedMph: 10,
    humidity: 60,
    forecast_meta: {
      is_forecast: true,
      target_day: dayOfWeek,
      source: 'stub'
    }
  });
}
