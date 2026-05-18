interface ExternalAiWeatherPoint {
  time: string;
  temperature: number;
  precipitation: number;
  weatherCode: number;
  windSpeed: number;
}

interface ExternalAiWeatherForecast {
  modelKey: string;
  modelName: string;
  points: ExternalAiWeatherPoint[];
}

export async function fetchExternalAiWeatherForecast(_args: {
  lat: number;
  lon: number;
  timezone: string;
  hours: number;
  validTimes?: string[];
}): Promise<ExternalAiWeatherForecast | null> {
  return null;
}

export function externalAiPointForTime(
  forecast: ExternalAiWeatherForecast | null,
  time: string,
  index: number,
): Omit<ExternalAiWeatherPoint, "time"> | null {
  if (!forecast?.points?.length) return null;
  const point = forecast.points.find((candidate) => candidate.time === time) ?? forecast.points[index];
  if (!point) return null;
  return {
    temperature: point.temperature,
    precipitation: point.precipitation,
    weatherCode: point.weatherCode,
    windSpeed: point.windSpeed,
  };
}
