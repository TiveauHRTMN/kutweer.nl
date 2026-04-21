import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";
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
  if (!res.ok) throw new Error("Weather API unreachable");
  return res.json();
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const formatParam = (searchParams.get("format") || "x").toLowerCase() as Format;
    const format: Format = SIZES[formatParam] ? formatParam : "x";
    const SIZE = SIZES[format];
    
    const personaParam = (searchParams.get("persona") || "piet").toLowerCase();
    const theme = PERSONA_THEMES[personaParam] || PERSONA_THEMES.piet;

    const cityName = searchParams.get("city") || "Nederland";
    const lat = parseFloat(searchParams.get("lat") || "52.11");
    const lon = parseFloat(searchParams.get("lon") || "5.18");

    const w = await fetchWeather(lat, lon);
    const temp = Math.round(w?.current?.temperature_2m ?? 0);
    const code = w?.current?.weather_code ?? 0;
    const desc = getDesc(code).toUpperCase();
    const emoji = getEmoji(code);

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
                <div style={{ fontSize: 40, fontWeight: 700, color: theme.accent }}>{String(cityName).toUpperCase()}</div>
                <div style={{ fontSize: 30 }}>WEERZONE OFFICIAL</div>
             </div>
             <div style={{ fontSize: 50, fontWeight: 700 }}>WEERZONE</div>
          </div>

          {/* Main Body */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
             <div style={{ fontSize: 220 }}>{emoji}</div>
             <div style={{ fontSize: 300, fontWeight: 700, marginTop: 20 }}>{temp}°</div>
             <div style={{ 
               fontSize: 80, fontWeight: 700, marginTop: 40, padding: "20px 60px", 
               backgroundColor: "black", color: "white" 
             }}>
                {desc}
             </div>
          </div>

          {/* Deal Tip (Static fallback if matcher crashes edge) */}
          <div style={{ display: "flex", backgroundColor: "white", color: "black", padding: "40px", border: "8px solid black" }}>
             <div style={{ fontSize: 80, marginRight: 40 }}>🛍️</div>
             <div style={{ display: "flex", flexDirection: "column" }}>
                <div style={{ fontSize: 20, fontWeight: 700, color: "#666" }}>TIP VAN DE DAG</div>
                <div style={{ fontSize: 36, fontWeight: 700 }}>CHECK DE WEERZONE SHOP</div>
             </div>
          </div>

          {/* Footer */}
          <div style={{ marginTop: "60px", textAlign: "center", fontSize: "30px", opacity: 0.7 }}>
             WWW.WEERZONE.NL · DE REST IS RUIS
          </div>
        </div>
      ),
      { ...SIZE }
    );
  } catch (e: any) {
    return new Response(`TECHNICAL ERROR: ${e.message}`, { status: 500 });
  }
}
