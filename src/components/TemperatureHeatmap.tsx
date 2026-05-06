"use client";

import type { HourlyForecast } from "@/lib/types";
import { getWeatherEmoji } from "@/lib/weather";

interface Props {
  hourly: HourlyForecast[];
  sunrise?: string;
  sunset?: string;
}

function tempColor(t: number): string {
  if (t <= -5)  return "#6366f1";  // indigo — vrieskou
  if (t <= 0)   return "#818cf8";  // light indigo
  if (t <= 5)   return "#93c5fd";  // light blue
  if (t <= 10)  return "#67e8f9";  // cyan
  if (t <= 15)  return "#86efac";  // green
  if (t <= 20)  return "#fde047";  // yellow
  if (t <= 25)  return "#fb923c";  // orange
  if (t <= 30)  return "#ef4444";  // red
  if (t <= 35)  return "#dc2626";  // deep red
  return "#991b1b";                // dark red — hittegolf
}

function formatHour(iso: string): string {
  return `${new Date(iso).getHours()}u`;
}

function dateLabel(d: Date): string {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(d);
  target.setHours(0, 0, 0, 0);
  const diff = Math.round((target.getTime() - today.getTime()) / 86400000);
  if (diff === 0) return "Vandaag";
  if (diff === 1) return "Morgen";
  return target.toLocaleDateString("nl-NL", { weekday: "short" }).toUpperCase();
}

const SCALE = [
  { t: -5,  label: "≤-5°" },
  { t: 2,   label: "0°" },
  { t: 8,   label: "5-10°" },
  { t: 15,  label: "15°" },
  { t: 22,  label: "20°" },
  { t: 28,  label: "25-30°" },
  { t: 33,  label: "30°+" },
];

export default function TemperatureHeatmap({ hourly, sunrise, sunset }: Props) {
  const hours = hourly.slice(0, 48);
  if (hours.length === 0) return null;

  const tMin = Math.min(...hours.map(h => h.temperature));
  const tMax = Math.max(...hours.map(h => h.temperature));

  // Group by day
  const dayGroups: { label: string; hours: HourlyForecast[] }[] = [];
  let currentDay = "";
  hours.forEach(h => {
    const d = new Date(h.time);
    const key = d.toDateString();
    if (key !== currentDay) {
      currentDay = key;
      dayGroups.push({ label: dateLabel(d), hours: [] });
    }
    dayGroups[dayGroups.length - 1].hours.push(h);
  });

  return (
    <div className="card overflow-hidden">
      {/* Header */}
      <div className="px-5 pt-5 pb-3 flex items-center justify-between">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-0.5">
            Temperatuurverloop
          </p>
          <h3 className="text-sm font-black text-slate-800 leading-none">
            48-uurs heatmap
          </h3>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[11px] font-bold text-blue-500">{tMin}°</span>
          <span className="text-[10px] text-slate-300">→</span>
          <span className="text-[11px] font-bold text-orange-500">{tMax}°</span>
        </div>
      </div>

      {/* Heatmap grid */}
      <div className="px-5 pb-3">
        {dayGroups.map((group) => (
          <div key={group.label} className="mb-3 last:mb-0">
            <div className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1.5">
              {group.label}
            </div>
            <div className="flex gap-[2px]">
              {group.hours.map((h) => {
                const color = tempColor(h.temperature);
                const hour = new Date(h.time).getHours();
                const showLabel = hour % 3 === 0;
                const isNight = sunrise && sunset
                  ? new Date(h.time).getTime() < new Date(sunrise).getTime() || new Date(h.time).getTime() > new Date(sunset).getTime()
                  : hour < 6 || hour >= 21;

                return (
                  <div key={h.time} className="flex-1 flex flex-col items-center group relative">
                    {/* Cell */}
                    <div
                      className="w-full rounded-[3px] flex items-center justify-center transition-all"
                      style={{
                        height: 36,
                        background: color,
                        opacity: isNight ? 0.6 : 1,
                      }}
                    >
                      <span className="text-[9px] font-black text-white drop-shadow-sm">
                        {h.temperature}°
                      </span>
                    </div>
                    {/* Hour label */}
                    {showLabel && (
                      <span className="text-[8px] font-bold text-slate-400 mt-1">
                        {formatHour(h.time)}
                      </span>
                    )}
                    {/* Tooltip */}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1.5 bg-slate-900 text-white text-[10px] font-bold rounded-lg opacity-0 group-hover:opacity-100 transition-all pointer-events-none z-30 shadow-xl whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <span className="text-lg">{getWeatherEmoji(h.weatherCode, !isNight)}</span>
                        <span>{h.temperature}° (voelt {h.apparentTemperature}°)</span>
                      </div>
                      <div className="text-slate-400 mt-0.5">
                        {h.precipitation > 0 ? `${h.precipitation.toFixed(1)}mm` : "Droog"} · {h.windSpeed} km/h · {h.humidity}%
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Temperature Scale */}
      <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
        <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Schaal</span>
        <div className="flex items-center gap-1">
          {SCALE.map(s => (
            <div key={s.label} className="flex items-center gap-1">
              <div className="w-4 h-3 rounded-[2px]" style={{ background: tempColor(s.t) }} />
              <span className="text-[8px] font-bold text-slate-400">{s.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
