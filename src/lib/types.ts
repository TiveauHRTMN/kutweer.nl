export interface WeatherData {
  current: {
    temperature: number;
    feelsLike: number;
    humidity: number;
    windSpeed: number;
    windDirection: string;
    windGusts: number;
    precipitation: number;
    weatherCode: number;
    isDay: boolean;
    cloudCover: number;
  };
  hourly: HourlyForecast[];
  daily: DailyForecast[];
  sunrise: string;
  sunset: string;
  uvIndex: number;
  models: ModelComparison;
}

export interface HourlyForecast {
  time: string;
  temperature: number;
  weatherCode: number;
  precipitation: number;
  confidence: "high" | "medium" | "low";
  models?: {
    harmonie?: { temperature: number; precipitation: number; weatherCode: number };
    icon?: { temperature: number; precipitation: number; weatherCode: number };
  };
}

export interface DailyForecast {
  date: string;
  tempMax: number;
  tempMin: number;
  weatherCode: number;
  precipitationSum: number;
  windSpeedMax: number;
}

export interface ModelComparison {
  agreement: number; // 0-100 percentage
  label: string;
  sources: string[];
}

export interface City {
  name: string;
  lat: number;
  lon: number;
}

export const DUTCH_CITIES: City[] = [
  // Top 20 grootste steden
  { name: "Amsterdam", lat: 52.3676, lon: 4.9041 },
  { name: "Rotterdam", lat: 51.9244, lon: 4.4777 },
  { name: "Den Haag", lat: 52.0705, lon: 4.3007 },
  { name: "Utrecht", lat: 52.0907, lon: 5.1214 },
  { name: "Eindhoven", lat: 51.4416, lon: 5.4697 },
  { name: "Groningen", lat: 53.2194, lon: 6.5665 },
  { name: "Tilburg", lat: 51.5555, lon: 5.0913 },
  { name: "Almere", lat: 52.3508, lon: 5.2647 },
  { name: "Breda", lat: 51.5719, lon: 4.7683 },
  { name: "Nijmegen", lat: 51.8126, lon: 5.8372 },
  { name: "Alkmaar", lat: 52.6324, lon: 4.7534 },
  { name: "Haarlem", lat: 52.3874, lon: 4.6462 },
  { name: "Arnhem", lat: 51.9851, lon: 5.8987 },
  { name: "Maastricht", lat: 50.8514, lon: 5.6910 },
  { name: "Leiden", lat: 52.1601, lon: 4.4970 },
  { name: "Zwolle", lat: 52.5168, lon: 6.0830 },
  { name: "Leeuwarden", lat: 53.2012, lon: 5.7999 },
  { name: "Den Bosch", lat: 51.6978, lon: 5.3037 },
  { name: "Apeldoorn", lat: 52.2112, lon: 5.9699 },
  { name: "Enschede", lat: 52.2215, lon: 6.8937 },
  // Belangrijke steden per provincie
  { name: "Amersfoort", lat: 52.1561, lon: 5.3878 },
  { name: "Dordrecht", lat: 51.8133, lon: 4.6901 },
  { name: "Zoetermeer", lat: 52.0575, lon: 4.4931 },
  { name: "Deventer", lat: 52.2550, lon: 6.1639 },
  { name: "Delft", lat: 52.0116, lon: 4.3571 },
  { name: "Venlo", lat: 51.3704, lon: 6.1724 },
  { name: "Assen", lat: 52.9925, lon: 6.5625 },
  { name: "Hilversum", lat: 52.2292, lon: 5.1669 },
  { name: "Middelburg", lat: 51.4988, lon: 3.6136 },
  { name: "Lelystad", lat: 52.5185, lon: 5.4714 },
  { name: "Roosendaal", lat: 51.5308, lon: 4.4656 },
  { name: "Heerlen", lat: 50.8882, lon: 5.9794 },
  { name: "Oss", lat: 51.7651, lon: 5.5183 },
  { name: "Sittard", lat: 51.0003, lon: 5.8695 },
  { name: "Gouda", lat: 52.0115, lon: 4.7104 },
  { name: "Zaandam", lat: 52.4389, lon: 4.8263 },
  { name: "Emmen", lat: 52.7792, lon: 6.8975 },
  { name: "Vlaardingen", lat: 51.9125, lon: 4.3420 },
  { name: "Schiedam", lat: 51.9175, lon: 4.3990 },
  { name: "Hoorn", lat: 52.6424, lon: 5.0594 },
  // Waddeneilanden & kust
  { name: "Texel", lat: 53.0594, lon: 4.7988 },
  { name: "Scheveningen", lat: 52.1082, lon: 4.2710 },
  { name: "Zandvoort", lat: 52.3759, lon: 4.5339 },
  { name: "Bergen op Zoom", lat: 51.4949, lon: 4.2911 },
];
