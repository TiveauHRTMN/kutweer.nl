import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";
import { PersonaTier } from "@/lib/personas";
import { matchProducts } from "@/lib/amazon-matcher";

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

    const w = await fetchWeather(52.11, 5.18);
    const temp = Math.round(w.current.temperature_2m);
    const code = w.current.weather_code;
    const emoji = getEmoji(code);
    const desc = getDesc(code);

    // Weather data for matchers
    const weatherData = {
      current: { temperature: temp, weatherCode: code, precipitation: w.current.precipitation, windSpeed: 10, humidity: 70 },
      daily: w.daily.time.map((_: any, i: number) => ({ tempMax: w.daily.temperature_2m_max[i], tempMin: w.daily.temperature_2m_min[i], precipitationSum: w.daily.precipitation_sum[i], windSpeedMax: 20 })),
      hourly: w.hourly.time.map((_: any, i: number) => ({ temperature: w.hourly.temperature_2m[i], weatherCode: w.hourly.weather_code[i], precipitation: w.hourly.precipitation[i] }))
    };
    const { products } = matchProducts(weatherData as any, 1, new Date(), personaParam);
    const deal = products[0];

    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            background: `linear-gradient(135deg, ${theme.bg} 0%, #000000 100%)`,
            fontFamily: "system-ui, sans-serif",
            color: "white",
            padding: "80px",
          }}
        >
          {/* Brand Header */}
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "80px" }}>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <div style={{ fontSize: "48px", fontWeight: 900, color: theme.accent }}>{cityName.toUpperCase()}</div>
              <div style={{ fontSize: "24px", fontWeight: 700, opacity: 0.8 }}>WEERZONE OFFICIAL</div>
            </div>
            <div style={{ fontSize: "60px", fontWeight: 900 }}>WEERZONE</div>
          </div>

          {/* Main Weather */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: 1, justifyContent: "center" }}>
            <div style={{ fontSize: "280px", display: "flex" }}>{emoji}</div>
            <div style={{ fontSize: "320px", fontWeight: 900, marginBottom: "20px", display: "flex" }}>{temp}°</div>
            <div style={{ 
              fontSize: "80px", fontWeight: 900, background: theme.accent, color: "black", 
              padding: "10px 60px", borderRadius: "12px", display: "flex"
            }}>{desc.toUpperCase()}</div>
          </div>

          {/* Deal Tip */}
          {deal && (
            <div style={{ 
              display: "flex", background: "rgba(255,255,255,0.1)", backdropFilter: "blur(20px)",
              padding: "40px", borderRadius: "32px", border: "1px solid rgba(255,255,255,0.2)"
            }}>
              <div style={{ fontSize: "100px", marginRight: "40px", display: "flex" }}>🛒</div>
              <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
                <div style={{ fontSize: "24px", fontWeight: 800, color: theme.accent }}>TIP VAN {personaParam.toUpperCase()}</div>
                <div style={{ fontSize: "40px", fontWeight: 900 }}>{deal.title}</div>
              </div>
            </div>
          )}

          {/* Footer */}
          <div style={{ marginTop: "80px", textAlign: "center", fontSize: "32px", opacity: 0.6, fontWeight: 700 }}>
            DE REST IS RUIS · WWW.WEERZONE.NL
          </div>
        </div>
      ),
      { ...SIZE }
    );
  } catch (e: any) {
    return new Response(`ERROR: ${e.message}`, { status: 500 });
  }
}
