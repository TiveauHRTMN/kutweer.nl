// ============================================================
// B2B outreach — weer-relevantie & snippet voor live-in-mail.
// ============================================================

import type { WeatherData } from "./types";
import type { B2BIndustry } from "./b2b-emails";

export interface WeatherSnippet {
  city: string;
  temp: number;        // huidige °C
  desc: string;        // human label
  windMax: number;     // km/u komende 48u
  rain48h: number;     // mm komende 48u
  tempMin: number;     // °C 48u min
  tempMax: number;     // °C 48u max
  // relevantie
  event: RelevantEvent | null;
}

export interface RelevantEvent {
  kind: "storm" | "heavy_rain" | "frost" | "heat" | "thunder" | "snow";
  label: string;       // "Woensdag 14u: 18mm regen"
  urgencyHours: number; // uren tot event
}

// ------------------------------------------------------------
// Industry → welke event-types zijn alarmerend?
// ------------------------------------------------------------
const INDUSTRY_TRIGGERS: Record<B2BIndustry, RelevantEvent["kind"][]> = {
  glazenwasser:     ["heavy_rain", "storm"],
  bouw:             ["frost", "storm", "heavy_rain"],
  horeca:           ["heavy_rain", "storm", "heat"],
  evenementen:      ["storm", "heavy_rain", "thunder"],
  agrarisch:        ["frost", "heavy_rain", "storm"],
  transport:        ["frost", "snow", "storm"],
  sport:            ["heavy_rain", "thunder", "frost"],
  schoonmaak:       ["heavy_rain", "storm"],
  schildersbedrijf: ["heavy_rain", "frost"],
  dakdekker:        ["storm", "heavy_rain", "frost"],
  tuinonderhoud:    ["heavy_rain", "storm", "frost"],
  bezorging:        ["frost", "snow", "storm"],
};

const DUTCH_DAY = ["zondag", "maandag", "dinsdag", "woensdag", "donderdag", "vrijdag", "zaterdag"];

function formatWhen(iso: string): { label: string; hoursFromNow: number } {
  const t = new Date(iso);
  const now = new Date();
  const hours = Math.max(0, Math.round((t.getTime() - now.getTime()) / 3_600_000));
  const sameDay = t.toDateString() === now.toDateString();
  const hh = t.getHours().toString().padStart(2, "0");
  const label = sameDay ? `vandaag ${hh}:00` : `${DUTCH_DAY[t.getDay()]} ${hh}:00`;
  return { label, hoursFromNow: hours };
}

// ------------------------------------------------------------
// Scan 48u hourly voor het zwaarste industry-relevante event
// ------------------------------------------------------------
function findEvent(weather: WeatherData, industry: B2BIndustry): RelevantEvent | null {
  const triggers = new Set(INDUSTRY_TRIGGERS[industry] ?? []);
  const hours = weather.hourly.slice(0, 48);

  // Prio-gesorteerd: we zoeken de eerste match met hoogste severity
  for (const h of hours) {
    const when = formatWhen(h.time);
    if (triggers.has("storm") && h.windSpeed >= 60) {
      return { kind: "storm", label: `${when.label}: windstoten tot ${Math.round(h.windSpeed)} km/u`, urgencyHours: when.hoursFromNow };
    }
    if (triggers.has("heavy_rain") && h.precipitation >= 8) {
      return { kind: "heavy_rain", label: `${when.label}: ${h.precipitation.toFixed(0)}mm regen in één uur`, urgencyHours: when.hoursFromNow };
    }
    if (triggers.has("thunder") && h.cape >= 1000) {
      return { kind: "thunder", label: `${when.label}: onweerskans`, urgencyHours: when.hoursFromNow };
    }
    if (triggers.has("snow") && (h.weatherCode === 71 || h.weatherCode === 73 || h.weatherCode === 75 || h.weatherCode === 77)) {
      return { kind: "snow", label: `${when.label}: sneeuwval`, urgencyHours: when.hoursFromNow };
    }
    if (triggers.has("frost") && h.temperature <= 0) {
      return { kind: "frost", label: `${when.label}: ${Math.round(h.temperature)}° — vorst`, urgencyHours: when.hoursFromNow };
    }
    if (triggers.has("heat") && h.temperature >= 28) {
      return { kind: "heat", label: `${when.label}: ${Math.round(h.temperature)}° — tropisch`, urgencyHours: when.hoursFromNow };
    }
  }

  // Zwakkere fallback: dagtotaal regen hoog?
  if (triggers.has("heavy_rain")) {
    const sum = hours.reduce((s, h) => s + (h.precipitation || 0), 0);
    if (sum >= 15) {
      return { kind: "heavy_rain", label: `komende 48u: ${sum.toFixed(0)}mm neerslag totaal`, urgencyHours: 12 };
    }
  }
  return null;
}

export function buildSnippet(weather: WeatherData, city: string, industry: B2BIndustry): WeatherSnippet {
  const hours = weather.hourly.slice(0, 48);
  const windMax = Math.max(0, ...hours.map(h => h.windSpeed));
  const rain48h = hours.reduce((s, h) => s + (h.precipitation || 0), 0);
  const tempMin = Math.min(...hours.map(h => h.temperature));
  const tempMax = Math.max(...hours.map(h => h.temperature));
  return {
    city,
    temp: weather.current.temperature,
    desc: descFromCode(weather.current.weatherCode),
    windMax,
    rain48h,
    tempMin,
    tempMax,
    event: findEvent(weather, industry),
  };
}

function descFromCode(c: number): string {
  if (c === 0) return "onbewolkt";
  if (c <= 3) return "bewolkt";
  if (c >= 45 && c <= 48) return "mist";
  if (c >= 51 && c <= 57) return "motregen";
  if (c >= 61 && c <= 67) return "regen";
  if (c >= 71 && c <= 77) return "sneeuw";
  if (c >= 80 && c <= 82) return "buien";
  if (c >= 95) return "onweer";
  return "wisselend";
}

// ------------------------------------------------------------
// Geocoding — Open-Meteo free, geen key nodig
// ------------------------------------------------------------
const geoCache = new Map<string, { lat: number; lon: number } | null>();

export async function geocodeCity(city: string): Promise<{ lat: number; lon: number } | null> {
  const key = city.trim().toLowerCase();
  if (geoCache.has(key)) return geoCache.get(key)!;
  try {
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=nl&country=NL`;
    const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
    const data = await res.json();
    const r = data?.results?.[0];
    if (r?.latitude && r?.longitude) {
      const coords = { lat: r.latitude, lon: r.longitude };
      geoCache.set(key, coords);
      return coords;
    }
  } catch {}
  geoCache.set(key, null);
  return null;
}

// ------------------------------------------------------------
// Beslis of we mail mogen sturen (stage 1)
// Stage 2/3 altijd doorsturen — thread is al warm.
// ------------------------------------------------------------
export function shouldSendStage1(snippet: WeatherSnippet, daysSinceLeadCreated: number): boolean {
  // Heeft event? Altijd sturen.
  if (snippet.event) return true;
  // Lead ligt al >14d stil? Stuur 'm alsnog, anders verdwijnt 'ie.
  if (daysSinceLeadCreated >= 14) return true;
  return false;
}
