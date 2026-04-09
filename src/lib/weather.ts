type WeatherDay = "saturday" | "sunday";

const CONDITIONS = [
  { code: "clear", iconId: 800 },
  { code: "partly_cloudy", iconId: 801 },
  { code: "light_rain", iconId: 500 },
  { code: "breezy", iconId: 741 },
];

function buildSeed(lat: number, lon: number, day: string) {
  const raw = Math.abs(Math.round(lat * 100) + Math.round(lon * 100) + day.length * 17);
  return raw % 100;
}

export function getWeatherSummary(lat: number, lon: number, day: WeatherDay) {
  const seed = buildSeed(lat, lon, day);
  const condition = CONDITIONS[seed % CONDITIONS.length];
  const baseTemp = day === "saturday" ? 12 : 14;
  const temp = baseTemp + (seed % 6);

  return {
    tempC: temp,
    tempMaxC: temp + 3,
    tempMinC: temp - 2,
    feelsLikeC: temp - 1,
    conditionCode: condition.code,
    iconId: condition.iconId,
    precipitationChance: condition.code.includes("rain") ? 55 : 18 + (seed % 22),
    windSpeedMph: 7 + (seed % 10),
    humidity: 55 + (seed % 25),
    uvIndex: 2 + (seed % 4),
    visibility: 8 + (seed % 4),
    sunrise: "06:21",
    sunset: "19:56",
    forecast_meta: {
      is_forecast: true,
      target_day: day,
      source: "demo-weather",
    },
  };
}

export function getHourlyWeather(lat: number, lon: number) {
  const days = [6, 0];
  const baseDate = new Date();
  const hours = [];

  for (const day of days) {
    for (let hour = 6; hour <= 12; hour += 1) {
      const date = new Date(baseDate);
      const currentDay = date.getDay();
      const offset = (day - currentDay + 7) % 7;
      date.setDate(date.getDate() + offset);
      date.setHours(hour, 0, 0, 0);

      const summary = getWeatherSummary(
        lat + hour / 100,
        lon - hour / 100,
        day === 6 ? "saturday" : "sunday",
      );

      hours.push({
        time: date.toISOString(),
        tempC: summary.tempC - (12 - hour) * 0.2,
        feelsLikeC: summary.feelsLikeC - (12 - hour) * 0.15,
        conditionCode: summary.conditionCode,
        iconId: summary.iconId,
        precipitationMm: summary.precipitationChance > 40 ? 0.5 : 0,
        precipitationChance: summary.precipitationChance,
        windMph: summary.windSpeedMph,
        humidity: summary.humidity,
        uvIndex: summary.uvIndex,
      });
    }
  }

  return {
    hours,
    meta: {
      source: "demo-weather",
      timezone: "Europe/London",
      count: hours.length,
    },
  };
}
