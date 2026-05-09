import type { AirQualityData } from "@/lib/types";
import { getPollenLevel } from "@/lib/weather";

const LEVEL_COLORS = [
  "bg-emerald-100 text-emerald-800",
  "bg-yellow-100 text-yellow-800",
  "bg-orange-100 text-orange-800",
  "bg-red-100 text-red-800",
];
const LEVEL_DOT = [
  "bg-emerald-500",
  "bg-yellow-500",
  "bg-orange-500",
  "bg-red-500",
];

interface Species {
  key: keyof Pick<AirQualityData, "peakGrass" | "peakBirch" | "peakAlder" | "peakMugwort">;
  label: string;
  type: "grass" | "tree";
}

const SPECIES: Species[] = [
  { key: "peakGrass", label: "Gras", type: "grass" },
  { key: "peakBirch", label: "Berk", type: "tree" },
  { key: "peakAlder", label: "Els", type: "tree" },
  { key: "peakMugwort", label: "Alsem", type: "tree" },
];

function getTodayPeak(data: AirQualityData, speciesKey: "grass" | "birch" | "alder" | "mugwort"): number | null {
  const nowStr = new Date().toLocaleString("sv-SE", { timeZone: "Europe/Amsterdam" }).slice(0, 10);
  const dayHours = data.hourly.filter(
    (h) => h.time.startsWith(nowStr) && parseInt(h.time.slice(11, 13)) >= 7 && parseInt(h.time.slice(11, 13)) <= 20
  );
  const vals = dayHours.map((h) => h[speciesKey]).filter((v): v is number => v !== null);
  return vals.length ? Math.max(...vals) : null;
}

export default function PollenWidget({ data }: { data: AirQualityData }) {
  const active = SPECIES.map((s) => {
    const speciesKey = s.key.replace("peak", "").toLowerCase() as "grass" | "birch" | "alder" | "mugwort";
    const todayPeak = getTodayPeak(data, speciesKey);
    const info = getPollenLevel(todayPeak, s.type);
    return { ...s, todayPeak, info };
  }).filter((s) => s.todayPeak !== null && s.todayPeak > 0);

  if (active.length === 0) return null;

  const dominant = active.reduce((a, b) => (b.info.level > a.info.level ? b : a));

  return (
    <div className="card p-5 sm:p-6">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-lg">🌿</span>
        <p className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">Pollenindex vandaag</p>
      </div>

      <div className="flex items-center gap-3 mb-4">
        <span className={`px-3 py-1 rounded-full text-sm font-bold ${LEVEL_COLORS[dominant.info.level]}`}>
          {dominant.info.label}
        </span>
        <span className="text-sm text-slate-500">
          {dominant.label} is nu dominant
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {active.map((s) => (
          <div key={s.key} className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${LEVEL_DOT[s.info.level]}`} />
            <div className="min-w-0">
              <p className="text-xs font-semibold text-slate-700 truncate">{s.label}</p>
              <p className="text-xs text-slate-400">{s.info.label}</p>
            </div>
          </div>
        ))}
      </div>

      <p className="text-[11px] text-slate-400 mt-4">
        Piekwaarden overdag (07:00–20:00) · Bron: CAMS Europa
      </p>
    </div>
  );
}
