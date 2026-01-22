import { NextResponse } from 'next/server';

// Stub: Return mock weather data since no weather API is connected yet
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const location = searchParams.get('location');
  const dayOfWeek = searchParams.get('dayOfWeek');

  // Return mock weather data
  return NextResponse.json({
    tempC: 15,
    tempMaxC: 18,
    tempMinC: 12,
    feelsLikeC: 14,
    conditionCode: 'partly_cloudy',
    iconId: 801,
    precipitationChance: 20,
    windSpeedMph: 8,
    humidity: 65,
    forecast_meta: {
      is_forecast: true,
      target_day: dayOfWeek,
      source: 'stub'
    }
  });
}
