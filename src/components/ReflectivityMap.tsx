"use client";

import type { HourlyForecast } from "@/lib/types";

interface Props {
  hourly: HourlyForecast[];
}

// dBZ-like reflectivity scale derived from precipitation rate (mm/h)
// Marshall-Palmer: Z = 200 * R^1.6  →  dBZ = 10 * log10(Z)
function precipToDbz(mm: number): number {
  if (mm <= 0) return 0;
  const Z = 200 * Math.pow(mm, 1.6);
  return Math.max(0, Math.min(65, 10 * Math.log10(Z)));
}

function dbzColor(dbz: number): string {
  if (dbz <= 0)  return "transparent";
  if (dbz < 10)  return "#bfdbfe";  // very light blue
  if (dbz < 20)  return "#60a5fa";  // blue
  if (dbz < 30)  return "#2563eb";  // medium blue
  if (dbz < 35)  return "#16a34a";  // green
  if (dbz < 40)  return "#facc15";  // yellow
  if (dbz < 45)  return "#f97316";  // orange
  if (dbz < 50)  return "#dc2626";  // red
  if (dbz < 55)  return "#991b1b";  // dark red
  return "#7e22ce";                  // purple — extreme
}

function dbzLabel(dbz: number): string {
  if (dbz <= 0)  return "Droog";
  if (dbz < 15)  return "Motregen";
  if (dbz < 25)  return "Lichte regen";
  if (dbz < 35)  return "Matige regen";
  if (dbz < 40)  return "Zware regen";
  if (dbz < 50)  return "Felle buien";
  return "Extreem";
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

// Scale legend items
const SCALE = [
  { dbz: 5,  label: "<10" },
  { dbz: 15, label: "10-20" },
  { dbz: 25, label: "20-30" },
  { dbz: 35, label: "30-40" },
  { dbz: 45, label: "40-50" },
  { dbz: 55, label: "50+" },
];

export default function ReflectivityMap({ hourly }: Props) {
  const hours = hourly.slice(0, 48);
  if (hours.length === 0) return null;

  const dbzData = hours.map(h => ({
    time: h.time,
    precip: h.precipitation,
    dbz: precipToDbz(h.precipitation),
    cape: h.cape,
    wind: h.windSpeed ?? 0,
  }));

  // Group by day
  const dayGroups: { label: string; hours: typeof dbzData }[] = [];
  let currentDay = "";
  dbzData.forEach(h => {
    const d = new Date(h.time);
    const key = d.toDateString();
    if (key !== currentDay) {
      currentDay = key;
      dayGroups.push({ label: dateLabel(d), hours: [] });
    }
    dayGroups[dayGroups.length - 1].hours.push(h);
  });

  const maxDbz = Math.max(...dbzData.map(d => d.dbz));
  const hasActivity = maxDbz > 5;

  return (
    <div className="card overflow-hidden">
      {/* Header */}
      <div className="px-5 pt-5 pb-3 flex items-center justify-between">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-0.5">
            Radarreflectiviteit (geschat)
          </p>
          <h3 className="text-sm font-black text-slate-800 leading-none">
            Neerslagintensiteit — 48 uur
          </h3>
        </div>
        <div className="flex items-center gap-1.5">
          <div className={`w-2 h-2 rounded-full ${hasActivity ? "bg-blue-500 animate-pulse" : "bg-emerald-500"}`} />
          <span className="text-[10px] font-bold text-slate-400 uppercase">
            {hasActivity ? `Max ${maxDbz.toFixed(0)} dBZ` : "Geen echo's"}
          </span>
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
                const color = dbzColor(h.dbz);
                const hour = new Date(h.time).getHours();
                const showLabel = hour % 3 === 0;
                return (
                  <div key={h.time} className="flex-1 flex flex-col items-center group relative">
                    {/* Cell */}
                    <div
                      className="w-full rounded-[3px] transition-all duration-300 cursor-default"
                      style={{
                        height: 32,
                        background: h.dbz > 0 ? color : "#f8fafc",
                        border: h.dbz > 0 ? "none" : "1px solid #f1f5f9",
                      }}
                    />
                    {/* Hour label */}
                    {showLabel && (
                      <span className="text-[8px] font-bold text-slate-400 mt-1">
                        {formatHour(h.time)}
                      </span>
                    )}
                    {/* Tooltip */}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1.5 bg-slate-900 text-white text-[10px] font-bold rounded-lg opacity-0 group-hover:opacity-100 transition-all pointer-events-none z-30 shadow-xl whitespace-nowrap">
                      <div>{formatHour(h.time)} — {h.precip.toFixed(1)} mm/h</div>
                      <div className="text-slate-400">{h.dbz.toFixed(0)} dBZ · {dbzLabel(h.dbz)}</div>
                      {h.cape > 200 && <div className="text-amber-300">CAPE: {h.cape.toFixed(0)} J/kg</div>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* dBZ Scale */}
      <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
        <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">dBZ schaal</span>
        <div className="flex items-center gap-1">
          {SCALE.map(s => (
            <div key={s.label} className="flex items-center gap-1">
              <div className="w-4 h-3 rounded-[2px]" style={{ background: dbzColor(s.dbz) }} />
              <span className="text-[8px] font-bold text-slate-400">{s.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
