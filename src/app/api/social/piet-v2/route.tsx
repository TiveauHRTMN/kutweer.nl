import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

import { PersonaTier } from "@/lib/personas";
import { matchProducts } from "@/lib/amazon-matcher";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Format = "tiktok" | "x";
const SIZES: Record<Format, { width: number; height: number }> = {
  tiktok: { width: 1080, height: 1920 },
  x: { width: 1600, height: 900 },
};

const getEmoji = (code: number) => {
  if (code === 0) return "☀️";
  if (code <= 3) return "🌤️";
  if (code >= 95) return "⛈️";
  if (code >= 71) return "❄️";
  if (code >= 51) return "🌧️";
  return "☁️";
};

const getDesc = (code: number) => {
  if (code === 0) return "Heerlijk Zonnig";
  if (code <= 3) return "Licht Bewolkt";
  if (code >= 51) return "Regenachtig";
  if (code >= 95) return "Zwaar Onweer";
  return "Bewolkt";
};

const PERSONA_THEMES: Record<string, { bg: string, accent: string, text: string, name: string }> = {
  piet: { bg: "#0ea5e9", accent: "#ffd60a", text: "#ffffff", name: "PIET REPORTER" },
  reed: { bg: "#b91c1c", accent: "#000000", text: "#ffffff", name: "REED STORMCHASER" },
  steve: { bg: "#1e3a8a", accent: "#3b82f6", text: "#ffffff", name: "STEVE PRO" },
};

async function fetchWeather(lat: number, lon: number) {
  const res = await fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
      `&current=temperature_2m,weather_code,wind_speed_10m,precipitation` +
      `&hourly=temperature_2m,weather_code,precipitation` +
      `&daily=temperature_2m_max,temperature_2m_min,precipitation_sum` +
      `&timezone=Europe/Amsterdam&forecast_days=2`,
    { cache: "no-store" }
  );
  return res.json();
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const formatParam = (searchParams.get("format") || "x").toLowerCase() as Format;
    const format: Format = SIZES[formatParam] ? formatParam : "x";
    const SIZE = SIZES[format];
    
    const personaParam = (searchParams.get("persona") || "piet").toLowerCase() as PersonaTier;
    const theme = PERSONA_THEMES[personaParam] || PERSONA_THEMES.piet;

    const cityName = searchParams.get("city") || "Nederland";
    const lat = parseFloat(searchParams.get("lat") || "52.11");
    const lon = parseFloat(searchParams.get("lon") || "5.18");

    const w = await fetchWeather(lat, lon);
    const temp = Math.round(w.current.temperature_2m);
    const code = w.current.weather_code;
    const desc = getDesc(code).toUpperCase();
    const emoji = getEmoji(code);

    const isLandscape = format === "x";
    const scale = isLandscape ? 0.7 : 1;

    // Minimal weatherData for matcher (needs hourly for slice() and daily for indices)
    const weatherData = {
      current: { 
        temperature: temp, 
        weatherCode: code, 
        precipitation: w.current.precipitation,
        windSpeed: w.current.wind_speed_10m || 0,
        humidity: 70 
      },
      daily: w.daily.time.map((_: any, i: number) => ({ 
        tempMax: w.daily.temperature_2m_max[i],
        tempMin: w.daily.temperature_2m_min[i],
        precipitationSum: w.daily.precipitation_sum[i],
        windSpeedMax: 20
      })),
      hourly: w.hourly.time.map((_: any, i: number) => ({
        temperature: w.hourly.temperature_2m[i],
        weatherCode: w.hourly.weather_code[i],
        precipitation: w.hourly.precipitation[i]
      }))
    };
    const { products } = matchProducts(weatherData as any, 1, new Date(), personaParam);
    const deal = products[0];

    return new ImageResponse(
      (
        <div style={{
          height: "100%", width: "100%", display: "flex", flexDirection: "column",
          backgroundColor: theme.bg, color: theme.text, padding: "80px",
          fontFamily: "sans-serif"
        }}>
          {/* Header */}
          <div style={{ display: "flex", width: "100%", justifyContent: "space-between", marginBottom: "60px" }}>
             <div style={{ display: "flex", flexDirection: "column" }}>
                <div style={{ fontSize: "40px", fontWeight: "bold", color: theme.accent }}>{cityName.toUpperCase()}</div>
                <div style={{ fontSize: "30px", opacity: 0.8 }}>WEERZONE OFFICIAL</div>
             </div>
             <div style={{ fontSize: "50px", fontWeight: "bold" }}>WEERZONE</div>
          </div>

          {/* Main Body */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
             <div style={{ fontSize: "200px" }}>{emoji}</div>
             <div style={{ fontSize: "300px", fontWeight: "bold", marginTop: "20px" }}>{temp}°</div>
             <div style={{ fontSize: "80px", fontWeight: "bold", marginTop: "40px", padding: "20px 60px", backgroundColor: "black" }}>
                {desc}
             </div>
          </div>

          {/* Bottom Deal Tip */}
          {deal && (
            <div style={{ display: "flex", backgroundColor: "white", color: "black", padding: "40px", border: "8px solid black" }}>
               <div style={{ fontSize: "80px", marginRight: "40px" }}>🛍️</div>
               <div style={{ display: "flex", flexDirection: "column" }}>
                  <div style={{ fontSize: "20px", fontWeight: "bold", color: "#666" }}>TIP: {deal.badge}</div>
                  <div style={{ fontSize: "36px", fontWeight: "bold" }}>{deal.title}</div>
               </div>
            </div>
          )}

          {/* Footer */}
          <div style={{ marginTop: "60px", textAlign: "center", fontSize: "30px", opacity: 0.7 }}>
             WWW.WEERZONE.NL · DE REST IS RUIS
          </div>
        </div>
      ),
      { ...SIZE }
    );
  } catch (e: any) {
    return new Response(`Er ging iets mis: ${e.message}`, { status: 500 });
  }
}



// Deployment sync: 2026-04-22 00:26
