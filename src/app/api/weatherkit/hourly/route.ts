import { NextResponse } from 'next/server';

// Stub: Return mock hourly weather since WeatherKit is not connected yet
export async function GET() {
  // Generate mock hourly data for the next 48 hours
  const hours = [];
  const now = new Date();
  
  for (let i = 0; i < 48; i++) {
    const time = new Date(now);
    time.setHours(now.getHours() + i);
    
    hours.push({
      time: time.toISOString(),
      tempC: 12 + Math.round(Math.random() * 8),
      feelsLikeC: 11 + Math.round(Math.random() * 8),
      conditionCode: 'partly_cloudy',
      iconId: 801,
      precipitationMm: Math.random() * 2,
      precipitationChance: Math.round(Math.random() * 40),
      windMph: 5 + Math.round(Math.random() * 10),
      humidity: 50 + Math.round(Math.random() * 30),
      uvIndex: Math.round(Math.random() * 5),
    });
  }

  return NextResponse.json({
    hours,
    meta: {
      source: 'stub',
      timezone: 'Europe/London',
      count: hours.length
    }
  });
}
