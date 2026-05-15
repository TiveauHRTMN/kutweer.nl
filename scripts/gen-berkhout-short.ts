import { config } from "dotenv";
config({ path: ".env.local" });
import { fetchWeatherData, getWeatherDescription, getWindBeaufort } from "../src/lib/weather";
import { hermesChat } from "../src/lib/hermes";
import fs from "fs";
import path from "path";

const BERKHOUT = { name: "Berkhout", lat: 52.6444, lon: 5.1803 };
const HISTORICAL_NOISE = {
  period: "Mei (t/m dag 14)",
  avgTemp: 11.9,
  diffNormal: -1.5,
  rain: 17,
  rainNormal: 60,
  zonuren: 124,
  zonDiff: -41
};

async function run() {
  console.log("🚀 Berkhout data-storyboard genereren (via Hermes)...");
  
  const data = await fetchWeatherData(BERKHOUT.lat, BERKHOUT.lon, false, true);
  if (!data) {
    console.error("❌ Kon geen data ophalen");
    process.exit(1);
  }

  const weatherContext = {
    location: BERKHOUT.name,
    noise_history: HISTORICAL_NOISE,
    truth_48h: {
      nu: {
        temp: data.current.temperature,
        gevoel: data.current.feelsLike,
        wind: getWindBeaufort(data.current.windSpeed).label
      },
      vandaag: {
        max: data.daily[0].tempMax,
        min: data.daily[0].tempMin,
        regen: data.daily[0].precipitationSum
      },
      morgen: {
        max: data.daily[1].tempMax,
        min: data.daily[1].tempMin,
        regen: data.daily[1].precipitationSum
      }
    }
  };

  const systemInstruction = `
Je bent de "Visual Data Director" van Weerzone.nl.
Je genereert een high-impact YouTube Storyboard.

THEMA: "De Rest is Ruis".
Contrast: De afgelopen 14 dagen (ruis/historie) vs. de komende 48 uur (de absolute waarheid).
Toon: Direct, nuchter, data-gedreven.

JSON STRUCTUUR:
{
  "metadata": { "focus": "Contrast tussen ruis en waarheid" },
  "scenes": [
    {
      "duration": number,
      "visual": "Gedetailleerde beschrijving",
      "narration": "Piet's tekst: Kort, krachtig."
    }
  ]
}
Lever UITSLUITEND JSON.
  `.trim();

  const prompt = `
Hier is de weermatrix voor Berkhout:
${JSON.stringify(weatherContext, null, 2)}

Genereer een storyboard dat de 14 dagen 'ruis' uit Berkhout fileert en focust op de 48 uur die er écht toe doen.
  `.trim();

  try {
    const script = await hermesChat([
      { role: "system", content: systemInstruction },
      { role: "user", content: prompt }
    ], { json: true });

    console.log("\n📡 STORYBOARD GEGENEREERD 📡\n");
    console.log(script);
    
    const outDir = path.join(process.cwd(), "youtube-storyboards");
    if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

    const outPath = path.join(outDir, "berkhout-ruis-vs-waarheid.json");
    fs.writeFileSync(outPath, script, "utf-8");
    console.log(`\n💾 Opgeslagen in: ${outPath}`);
  } catch (error) {
    console.error("❌ Error:", error);
  }
}

run();
