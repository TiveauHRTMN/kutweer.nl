import * as dotenv from "dotenv";
import { Resend } from "resend";
import { fetchWeatherData } from "../src/lib/weather";
import { generatePersonaBrief, type WeatherSnapshot } from "../src/lib/persona-brief";
import { buildPersonaEmailHtml } from "../src/lib/persona-email";
import type { PersonaTier } from "../src/lib/personas";

dotenv.config({ path: ".env.local" });

const TIER: PersonaTier = "piet"; // wissel naar "reed" of "steve" om te testen
const TEST_EMAIL = "info@weerzone.nl";
const CITY = "Nieuwe-Niedorp";
const LAT = 52.7375;
const LON = 4.8926;

async function run() {
  console.log(`🧪 Test persona brief: ${TIER} → ${TEST_EMAIL}`);

  const weather = await fetchWeatherData(LAT, LON);
  const snap: WeatherSnapshot = {
    current: {
      temperature: weather.current.temperature,
      feelsLike: weather.current.feelsLike,
      windSpeed: weather.current.windSpeed,
      windGusts: weather.current.windGusts,
      precipitation: weather.current.precipitation,
      weatherCode: weather.current.weatherCode,
      humidity: weather.current.humidity,
    },
    daily: {
      tempMax: weather.daily[0].tempMax,
      tempMin: weather.daily[0].tempMin,
      precipitationSum: weather.daily[0].precipitationSum,
      weatherCode: weather.daily[0].weatherCode,
      windMax: weather.daily[0].windSpeedMax,
    },
    hourlySummary: weather.hourly
      .slice(0, 12)
      .filter((_, i) => i % 3 === 0)
      .map((h) => {
        const hh = new Date(h.time).toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" });
        return `${hh} ${h.temperature}° ${h.precipitation}mm wind ${h.windSpeed}km/u`;
      })
      .join(", "),
    tomorrow: weather.daily[1] ? {
      tempMax: weather.daily[1].tempMax,
      tempMin: weather.daily[1].tempMin,
      precipitationSum: weather.daily[1].precipitationSum,
      weatherCode: weather.daily[1].weatherCode,
    } : undefined,
  };

  console.log(`🌤️  Weer opgehaald: ${snap.current.temperature}°C, wind ${snap.current.windSpeed}km/u`);

  const brief = await generatePersonaBrief({
    tier: TIER,
    firstName: "Rowan",
    city: CITY,
    weather: snap,
    prefs: { fiets: true, tuin: true },
  });

  console.log(`✅ Brief gegenereerd:`);
  console.log(`   Subject: ${brief.subject}`);
  console.log(`   Tagline: ${brief.tagline}`);
  console.log(`   Greeting: ${brief.greeting}`);
  console.log(`   Local fact: ${brief.local_fact}`);
  console.log(`   Verdict: ${brief.verdict.slice(0, 80)}...`);

  const html = buildPersonaEmailHtml(
    TIER,
    brief,
    CITY,
    "https://weerzone.nl/api/unsubscribe?email=test",
    undefined,
    {
      current: { ...snap.current, windDirection: undefined, cloudCover: undefined, isDay: true },
      daily: { ...snap.daily, windSpeedMax: snap.daily.windMax, sunHours: undefined },
    }
  );

  const resend = new Resend(process.env.RESEND_API_KEY);
  const { data, error } = await resend.emails.send({
    from: `Piet van Weerzone <info@weerzone.nl>`,
    to: TEST_EMAIL,
    subject: `[TEST] ${brief.subject}`,
    html,
  });

  if (error) {
    console.error("❌ Versturen mislukt:", error);
  } else {
    console.log(`📬 Verstuurd! Resend ID: ${data?.id}`);
  }
}

run().catch(console.error);
