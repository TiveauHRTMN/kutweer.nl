import Link from "next/link";
import type { MarineData } from "@/lib/types";

function degreesToCompass(deg: number, locale: "nl" | "de" = "nl"): string {
  const dirs = locale === "de"
    ? ["Norden", "Nordnordosten", "Nordosten", "Ostnordosten", "Osten", "Ostsüdosten", "Südosten", "Südsüdosten", "Süden", "Südsüdwesten", "Südwesten", "Westsüdwesten", "Westen", "Westnordwesten", "Nordwesten", "Nordnordwesten"]
    : ["noorden", "noordnoordoosten", "noordoosten", "oostnoordoosten", "oosten", "oostzuidoosten", "zuidoosten", "zuidzuidoosten", "zuiden", "zuidzuidwesten", "zuidwesten", "westzuidwesten", "westen", "westnoordwesten", "noordwesten", "noordnoordwesten"];
  return dirs[Math.round(deg / 22.5) % 16];
}

function waveLabel(m: number, locale: "nl" | "de" = "nl"): string {
  if (locale === "de") {
    if (m < 0.1) return "Glatt";
    if (m < 0.5) return "Ruhig";
    if (m < 1.25) return "Leichter Seegang";
    if (m < 2.5) return "Mäßiger Seegang";
    if (m < 4) return "Raue See";
    return "Sehr raue See";
  }
  if (m < 0.1) return "Vlak";
  if (m < 0.5) return "Kalm";
  if (m < 1.25) return "Lichte golfslag";
  if (m < 2.5) return "Matige golfslag";
  if (m < 4) return "Ruwe zee";
  return "Zeer ruwe zee";
}

export default function MarineWidget({ data, locale = "nl" }: { data: MarineData; locale?: "nl" | "de" }) {
  const isDE = locale === "de";
  const nowStr = new Date().toLocaleString("sv-SE", { timeZone: "Europe/Amsterdam" }).slice(0, 16);
  const current = data.hourly.find((h) => h.time >= nowStr) ?? data.hourly[0];

  if (!current || current.waveHeight === null) return null;

  const waveH = current.waveHeight ?? 0;
  const sst = current.seaSurfaceTemperature;
  const dir = current.waveDirection !== null ? degreesToCompass(current.waveDirection, locale) : null;

  return (
    <div className="card p-5 sm:p-6">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-lg">🌊</span>
        <h2 className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">{isDE ? "Seebedingungen" : "Zeecondities"}</h2>
      </div>

      <div className="flex items-center gap-3 mb-4">
        <span className="text-2xl font-black text-slate-900">{waveH.toFixed(1)}m</span>
        <div>
          <p className="text-sm font-semibold text-slate-700">{waveLabel(waveH, locale)}</p>
          {dir && (
            <p className="text-xs text-slate-400">{isDE ? `aus ${dir}` : `vanuit het ${dir}`}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 text-center">
        {current.windWaveHeight !== null && (
          <div className="bg-slate-50 rounded-lg p-2.5">
            <p className="text-xs text-slate-400 mb-0.5">{isDE ? "Windwellen" : "Windgolven"}</p>
            <p className="text-sm font-bold text-slate-800">{current.windWaveHeight.toFixed(1)}m</p>
          </div>
        )}
        {current.swellWaveHeight !== null && (
          <div className="bg-slate-50 rounded-lg p-2.5">
            <p className="text-xs text-slate-400 mb-0.5">{isDE ? "Dünung" : "Deining"}</p>
            <p className="text-sm font-bold text-slate-800">{current.swellWaveHeight.toFixed(1)}m</p>
          </div>
        )}
        {sst !== null && (
          <div className="bg-slate-50 rounded-lg p-2.5">
            <p className="text-xs text-slate-400 mb-0.5">{isDE ? "Wassertemp." : "Zeewater"}</p>
            <p className="text-sm font-bold text-slate-800">{sst.toFixed(1)}°C</p>
          </div>
        )}
      </div>

      <p className="text-[11px] text-slate-400 mt-4">{isDE ? "Nächster Küstenpunkt · Quelle: Open-Meteo Marine" : "Dichtstbijzijnde kustpunt · Bron: Open-Meteo Marine"}</p>
    </div>
  );
}

