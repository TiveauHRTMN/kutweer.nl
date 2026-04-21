
import { matchProducts } from '../src/lib/amazon-matcher';
import { type WeatherData } from '../src/lib/types';

const mockWeather: WeatherData = {
  current: {
    temperature: 12,
    feelsLike: 10,
    humidity: 85,
    windSpeed: 25,
    windDirection: "ZW",
    windGusts: 40,
    precipitation: 5.5, // Regen!
    weatherCode: 61,
    isDay: true,
    cloudCover: 100,
  },
  minutely: [],
  hourly: [],
  daily: [
    { date: "2026-04-21", tempMax: 15, tempMin: 8, weatherCode: 61, precipitationSum: 12, windSpeedMax: 45, sunHours: 2 }
  ],
  sunrise: "",
  sunset: "",
  uvIndex: 1,
  models: { agreement: 90, label: "High", sources: ["KNMI"] }
};

console.log("\n🧪 TESTING MATCH ENGINE...\n");

console.log("--- TEST 1: REGEN + PIET (Basis) ---");
const pietMatch = matchProducts(mockWeather, 3, new Date(), "piet");
pietMatch.products.forEach(p => console.log(`[${p.personas.join(',')}] ${p.title} (${p.id})`));

console.log("\n--- TEST 2: REGEN + REED (Stormchaser) ---");
const reedMatch = matchProducts(mockWeather, 3, new Date(), "reed");
reedMatch.products.forEach(p => console.log(`[${p.personas.join(',')}] ${p.title} (${p.id})`));

const mockHotWeather: any = {
    ...mockWeather,
    current: { ...mockWeather.current, temperature: 28, precipitation: 0, weatherCode: 0 },
    daily: [{ ...mockWeather.daily[0], tempMax: 30, precipitationSum: 0 }]
};

console.log("\n--- TEST 3: HOT + STEVE (Pro) ---");
const steveMatch = matchProducts(mockHotWeather, 3, new Date(), "steve");
steveMatch.products.forEach(p => console.log(`[${p.personas.join(',')}] ${p.title} (${p.id})`));

const mockStormWeather: any = {
    ...mockWeather,
    current: { ...mockWeather.current, windSpeed: 75, weatherCode: 95 },
    daily: [{ ...mockWeather.daily[0], windSpeedMax: 80 }], // Storm!
    hourly: Array(24).fill({ temperature: 12, weatherCode: 95, precipitation: 1, cape: 1200 }) // Thunder!
};

console.log("\n--- TEST 4: STORM + REED (Stormchaser) ---");
const stormMatch = matchProducts(mockStormWeather, 3, new Date(), "reed");
stormMatch.products.forEach(p => console.log(`[${p.personas.join(',')}] ${p.title} (${p.id})`));



