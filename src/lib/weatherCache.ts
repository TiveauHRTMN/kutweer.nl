"use client";

import type { WeatherData } from "./types";
import { getWeather as fetchServer, getAiVerdict } from "@/app/actions";

/**
 * Slimme client-side weather cache.
 *
 * - Hyperintelligentie 1: sessionStorage (per-tab), TTL 10 min. Navigeren
 *   tussen /piet, /reed, homepage = geen extra API-call.
 * - Hyperintelligentie 2: in-flight dedup — als twee componenten tegelijk
 *   hetzelfde verzoek starten, krijgen ze dezelfde Promise.
 * - Hyperintelligentie 3: Gemini draait non-blocking op achtergrond. De
 *   caller krijgt base weather meteen; aiVerdict wordt apart geleverd.
 */

type CacheEntry = {
  weather: WeatherData;
  ts: number;
  aiFetching?: boolean;
};

const TTL_MS = 10 * 60 * 1000; // 10 min
const STORAGE_KEY_PREFIX = "wz_weather_v2_";
const inflight = new Map<string, Promise<WeatherData>>();

function key(lat: number, lon: number) {
  return `${lat.toFixed(3)},${lon.toFixed(3)}`;
}
function storageKey(lat: number, lon: number) {
  return STORAGE_KEY_PREFIX + key(lat, lon);
}

function readCache(lat: number, lon: number): CacheEntry | null {
  if (typeof sessionStorage === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(storageKey(lat, lon));
    if (!raw) return null;
    const entry: CacheEntry = JSON.parse(raw);
    if (Date.now() - entry.ts > TTL_MS) return null;
    return entry;
  } catch {
    return null;
  }
}
function writeCache(lat: number, lon: number, weather: WeatherData) {
  if (typeof sessionStorage === "undefined") return;
  try {
    const entry: CacheEntry = { weather, ts: Date.now() };
    sessionStorage.setItem(storageKey(lat, lon), JSON.stringify(entry));
  } catch {
    // quota / private mode — negeren
  }
}
function patchCacheVerdict(lat: number, lon: number, verdict: string) {
  const entry = readCache(lat, lon);
  if (!entry) return;
  entry.weather.aiVerdict = verdict;
  writeCache(lat, lon, entry.weather);
}

/**
 * Geef weather zo snel mogelijk terug.
 *
 * @param lat, lon coördinaten
 * @param onVerdict callback voor wanneer AI-verdict binnen komt (async)
 */
export async function loadWeather(
  lat: number,
  lon: number,
  onVerdict?: (verdict: string) => void
): Promise<WeatherData> {
  const k = key(lat, lon);

  // 1. cache hit?
  const cached = readCache(lat, lon);
  if (cached) {
    // Verdict ontbreekt? Fire-and-forget Gemini-call
    if (!cached.weather.aiVerdict && onVerdict) {
      getAiVerdict(cached.weather)
        .then((v) => {
          patchCacheVerdict(lat, lon, v);
          onVerdict(v);
        })
        .catch(() => {});
    }
    return cached.weather;
  }

  // 2. in-flight dedup
  const existing = inflight.get(k);
  if (existing) return existing;

  const promise = (async () => {
    const weather = await fetchServer(lat, lon);
    writeCache(lat, lon, weather);
    // AI async — niet blokkeren
    if (onVerdict) {
      getAiVerdict(weather)
        .then((v) => {
          patchCacheVerdict(lat, lon, v);
          onVerdict(v);
        })
        .catch(() => {});
    }
    return weather;
  })();

  inflight.set(k, promise);
  try {
    return await promise;
  } finally {
    inflight.delete(k);
  }
}

/** Handige helper: prefetch voor hover/focus op een link */
export function prefetchWeather(lat: number, lon: number) {
  if (readCache(lat, lon)) return;
  if (inflight.get(key(lat, lon))) return;
  loadWeather(lat, lon).catch(() => {});
}
