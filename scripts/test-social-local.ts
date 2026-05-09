import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import { generatePlatformCaption } from "../src/app/api/cron/social-post/route";
import { fetchWeatherData } from "../src/lib/weather";

async function main() {
  const REGIONS = [
    { name: "Midden", lat: 52.11, lon: 5.18 },
    { name: "Noord", lat: 53.22, lon: 6.57 },
    { name: "Zuid", lat: 51.44, lon: 5.48 },
  ];

  console.log("Weer ophalen...");
  const regionalData = await Promise.all(
    REGIONS.map(async (r) => ({
      region: r.name,
      weather: (await fetchWeatherData(r.lat, r.lon)) as any,
    }))
  );

  console.log("Caption genereren...");
  const result = await generatePlatformCaption(regionalData, "x");

  console.log("\n--- Caption (X) ---");
  console.log(result.caption);
  console.log("\n--- Affiliate URL ---");
  console.log(result.affiliateUrl);

  const base = process.env.NEXT_PUBLIC_BASE_URL || "https://weerzone.nl";
  const t = Date.now();
  console.log("\n--- Slide images (branded Weerzone) ---");
  console.log(`${base}/api/social/piet-v2?city=nederland&lat=52.11&lon=5.18&slide=1&format=x&persona=piet&t=${t}`);
  console.log(`${base}/api/social/piet-v2?city=nederland&lat=52.11&lon=5.18&slide=2&format=x&persona=piet&t=${t}`);
}

main().catch(console.error);
