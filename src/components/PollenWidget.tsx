import Link from "next/link";
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

const SPECIES_NL: Species[] = [
  { key: "peakGrass", label: "Gras", type: "grass" },
  { key: "peakBirch", label: "Berk", type: "tree" },
  { key: "peakAlder", label: "Els", type: "tree" },
  { key: "peakMugwort", label: "Alsem", type: "tree" },
];

const SPECIES_DE: Species[] = [
  { key: "peakGrass", label: "Gräser", type: "grass" },
  { key: "peakBirch", label: "Birke", type: "tree" },
  { key: "peakAlder", label: "Erle", type: "tree" },
  { key: "peakMugwort", label: "Beifuß", type: "tree" },
];

const SPECIES_ES: Species[] = [
  { key: "peakGrass", label: "Gramineas", type: "grass" },
  { key: "peakBirch", label: "Abedul", type: "tree" },
  { key: "peakAlder", label: "Aliso", type: "tree" },
  { key: "peakMugwort", label: "Artemisia", type: "tree" },
];

function getTodayPeak(data: AirQualityData, speciesKey: "grass" | "birch" | "alder" | "mugwort"): number | null {
  const nowStr = new Date().toLocaleString("sv-SE", { timeZone: "Europe/Amsterdam" }).slice(0, 10);
  const dayHours = data.hourly.filter(
    (h) => h.time.startsWith(nowStr) && parseInt(h.time.slice(11, 13)) >= 7 && parseInt(h.time.slice(11, 13)) <= 20
  );
  const vals = dayHours.map((h) => h[speciesKey]).filter((v): v is number => v !== null);
  return vals.length ? Math.max(...vals) : null;
}

export default function PollenWidget({ data, locale = "nl" }: { data: AirQualityData; locale?: "nl" | "de" | "fr" | "es" }) {
  const speciesList = locale === "de" ? SPECIES_DE : locale === "es" ? SPECIES_ES : SPECIES_NL;
  const active = speciesList.map((s) => {
    const speciesKey = s.key.replace("peak", "").toLowerCase() as "grass" | "birch" | "alder" | "mugwort";
    const todayPeak = getTodayPeak(data, speciesKey);
    const info = getPollenLevel(todayPeak, s.type, locale);
    return { ...s, todayPeak, info };
  }).filter((s) => s.todayPeak !== null && s.todayPeak > 0);

  if (active.length === 0) return null;

  return (
    <div className="card p-5 sm:p-6">
      <div className="flex items-center gap-2 mb-6">
        <span className="text-lg">🌿</span>
        <h2 className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">{locale === "de" ? "Pollen-Index" : locale === "fr" ? "Indice pollinique" : locale === "es" ? "Indice polinico" : "Pollen-index"}</h2>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-2">
        {active.map((s) => (
          <div key={s.key} className="flex items-center gap-3">
            <span className={`w-3 h-3 rounded-full shrink-0 ${LEVEL_DOT[s.info.level]}`} />
            <div className="min-w-0">
              <p className="text-xs font-black text-slate-800 truncate uppercase tracking-wider">{s.label}</p>
              <p className="text-xs font-bold text-slate-400">{s.info.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="pt-4 mt-4 border-t border-slate-50">
        <p className="text-[9px] font-black uppercase tracking-widest text-slate-300">
          Data: CAMS Europa
        </p>
      </div>
    </div>
  );
}
