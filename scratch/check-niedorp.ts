import { fetchWeatherData } from "./src/lib/weather";

async function checkNieuweNiedorp() {
  const lat = 52.7483;
  const lon = 4.8872;
  try {
    const data = await fetchWeatherData(lat, lon);
    console.log("Weather for Nieuwe Niedorp:");
    console.log(`Current Temp: ${data.current.temperature}°C`);
    console.log(`Current Precipitation: ${data.current.precipitation} mm`);
    console.log(`Weather Code: ${data.current.weatherCode}`);
    console.log(`Description: ${getWeatherDescription(data.current.weatherCode)}`);
    console.log("---");
    console.log("Minutely rain forecast (next hour):");
    console.log(data.minutely.slice(0, 4).map(m => `${m.time}: ${m.precipitation}mm`).join("\n"));
  } catch (e) {
    console.error(e);
  }
}

function getWeatherDescription(code: number): string {
  if (code === 0) return "Onbewolkt";
  if (code <= 2) return "Half bewolkt";
  if (code === 3) return "Bewolkt";
  if (code <= 48) return "Mistig";
  if (code <= 55) return "Motregen";
  if (code <= 57) return "IJzel motregen";
  if (code <= 65) return "Regen";
  if (code <= 67) return "IJzel regen";
  if (code <= 75) return "Sneeuw";
  if (code === 77) return "Korrelsneeuw";
  if (code <= 82) return "Regenbuien";
  if (code <= 86) return "Sneeuwbuien";
  if (code >= 95) return "Onweer";
  return "Wisselend";
}

checkNieuweNiedorp();
