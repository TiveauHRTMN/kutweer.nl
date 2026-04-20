import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

async function debugHarmonie() {
  const lat = 52.11;
  const lon = 5.18;
  const url = "https://api.open-meteo.com/v1/forecast";
  
  const params = new URLSearchParams({
    latitude: lat.toString(),
    longitude: lon.toString(),
    current: "temperature_2m,precipitation,weather_code",
    hourly: "temperature_2m,precipitation,weather_code",
    models: "knmi_seamless",
    timezone: "Europe/Amsterdam",
    forecast_days: "1"
  });

  console.log(`Fetching from: ${url}?${params}`);
  
  try {
    const res = await fetch(`${url}?${params}`);
    const data = await res.json();
    console.log("Result:", JSON.stringify(data, null, 2));
  } catch (e) {
    console.error("Error:", e);
  }
}

debugHarmonie();
