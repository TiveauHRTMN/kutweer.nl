"use client";

import { useEffect, useState } from "react";
import type { WeatherData } from "@/lib/types";

interface Props {
  lat: number;
  lon: number;
  city: string;
  initialWeather?: WeatherData;
}

const WC_LABEL: Record<number, string> = {
  0: "sonnig",
  1: "überwiegend sonnig",
  2: "leicht bewölkt",
  3: "bewölkt",
  45: "neblig",
  48: "neblig mit Reif",
  51: "leichter Nieselregen",
  53: "Nieselregen",
  55: "dichter Nieselregen",
  61: "leichter Regen",
  63: "Regen",
  65: "starker Regen",
  71: "leichter Schneefall",
  73: "Schneefall",
  75: "starker Schneefall",
  80: "Schauer",
  81: "kräftige Schauer",
  82: "heftige Schauer",
  95: "Gewitter",
  96: "Gewitter mit Hagel",
  99: "schweres Gewitter mit Hagel",
};

const TAGE = ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"];

function dayName(offset = 0) {
  const date = new Date(new Date().toLocaleString("en-US", { timeZone: "Europe/Berlin" }));
  date.setDate(date.getDate() + offset);
  return TAGE[date.getDay()];
}

function dayPart() {
  const hour = new Date(new Date().toLocaleString("en-US", { timeZone: "Europe/Berlin" })).getHours();
  if (hour < 6) return "nacht";
  if (hour < 12) return "morgen";
  if (hour < 18) return "nachmittag";
  return "abend";
}

function label(code?: number) {
  return WC_LABEL[Number(code)] ?? "wechselhaft";
}

function quickKarlForecast(weather: WeatherData | undefined, city: string) {
  if (!weather) return null;
  const current = weather.current;
  const today = weather.daily?.[0];
  const tomorrow = weather.daily?.[1];
  const heute = dayName(0);
  const morgenName = dayName(1);
  const part = dayPart();
  const temp = Math.round(current.temperature);
  const wind = Math.round(current.windSpeed);
  const gusts = Math.round(current.windGusts || current.windSpeed);
  const rain = Number(current.precipitation || 0);
  const todayRain = Number(today?.precipitationSum || rain || 0);
  const weatherText = label(current.weatherCode);
  const windText = wind >= 35 ? "mit kräftigem Wind" : wind >= 20 ? "mit mäßigem Wind" : "mit wenig Wind";
  const rainText = todayRain >= 5
    ? "Rechne mit nassen Phasen; das ist kein Tag, um weit von einer Jacke entfernt zu sein."
    : todayRain >= 1
      ? "Ab und zu kann ein Schauer fallen, dazwischen gibt es auch trockene Abschnitte."
      : "Es bleibt überwiegend trocken, höchstens mit etwas lokalem Spritzer.";

  const tomorrowText = tomorrow
    ? ` ${morgenName} bleibt es um die ${Math.round(tomorrow.tempMax)} Grad mit ${label(tomorrow.weatherCode)}.`
    : "";

  return `${heute}${part} ist es in ${city} ${weatherText} und etwa ${temp} Grad, ${windText}. ${rainText} Die Windböen erreichen bis zu ${gusts} km/h, also fühlt es sich manchmal frischer an, als das Thermometer vermuten lässt.${tomorrowText}`;
}

export default function DwdForecastCard({ lat, lon, city, initialWeather }: Props) {
  const initialForecast = quickKarlForecast(initialWeather, city);
  const [forecast, setForecast] = useState<string | null>(initialForecast);
  const [loading, setLoading] = useState(!initialForecast);
  const [enhanced, setEnhanced] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 4500);

    fetch(`/api/karl-wetterbericht?lat=${lat}&lon=${lon}&city=${encodeURIComponent(city)}`, {
      signal: controller.signal,
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (typeof d === "string" && d.trim()) {
          setForecast(d);
          setEnhanced(true);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
    return () => {
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, [lat, lon, city]);

  if (loading) {
    return (
      <div className="card p-5 sm:p-6 animate-pulse">
        <div className="h-3 w-32 bg-slate-200 rounded mb-4" />
        <div className="space-y-2">
          <div className="h-3 w-full bg-slate-100 rounded" />
          <div className="h-3 w-5/6 bg-slate-100 rounded" />
          <div className="h-3 w-4/6 bg-slate-100 rounded" />
        </div>
      </div>
    );
  }

  if (!forecast) return null;

  const paragraphs = forecast.split(/\n+/).map((p) => p.trim()).filter(Boolean);

  return (
    <div className="card p-5 sm:p-6">
      <div className="flex items-center gap-2 mb-4">
        <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600">
          Karl · Wetterbericht
        </span>
      </div>
      <div className="space-y-3">
        {paragraphs.map((p, i) => (
          <p key={i} className="text-sm text-slate-700 leading-relaxed">{p}</p>
        ))}
      </div>
      <p className="text-[9px] text-slate-400 mt-4">
        Basiert auf DWD-Wetterbericht · {enhanced ? "KI-Version geladen" : "Schnellversion"} · alle 30 Minuten aktualisiert
      </p>
    </div>
  );
}
