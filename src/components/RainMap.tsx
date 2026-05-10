"use client";

import { useState, useEffect, useRef } from "react";

// Buienradar RadarMapNL geographic bounds (WGS84)
const BOUNDS = { minLat: 49.36, maxLat: 55.97, minLon: 0.14, maxLon: 10.26 };

interface Props {
  lat: number;
  lon: number;
}

export default function RainMap({ lat, lon }: Props) {
  const [refreshKey, setRefreshKey] = useState(0);
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);
  const [loaded, setLoaded] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    setUpdatedAt(new Date());
    timerRef.current = setInterval(() => {
      setRefreshKey(k => k + 1);
      setUpdatedAt(new Date());
      setLoaded(false);
    }, 5 * 60 * 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  const leftPct = ((lon - BOUNDS.minLon) / (BOUNDS.maxLon - BOUNDS.minLon) * 100).toFixed(2);
  const topPct = ((BOUNDS.maxLat - lat) / (BOUNDS.maxLat - BOUNDS.minLat) * 100).toFixed(2);

  const radarUrl = `https://api.buienradar.nl/image/1.0/RadarMapNL?w=700&h=765&r=${refreshKey}`;

  const timeStr = updatedAt
    ? updatedAt.toLocaleTimeString("nl-NL", {
        timeZone: "Europe/Amsterdam",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "--:--";

  return (
    <div className="card overflow-hidden">
      {/* Header */}
      <div className="px-5 pt-4 pb-3 flex items-center justify-between">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-0.5">
            Live neerslag
          </p>
          <h3 className="text-sm font-black text-slate-800 leading-none">Regenradar</h3>
        </div>
        <span className="flex items-center gap-1.5 text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse inline-block" />
          Live
        </span>
      </div>

      {/* Radar image with location dot */}
      <div
        className="relative w-full overflow-hidden bg-slate-900"
        style={{ aspectRatio: "700 / 765" }}
      >
        {/* Loading shimmer */}
        {!loaded && (
          <div className="absolute inset-0 bg-slate-800 animate-pulse" />
        )}

        <img
          key={refreshKey}
          src={radarUrl}
          alt="Regenradar Nederland"
          className={`w-full h-full object-cover transition-opacity duration-300 ${loaded ? "opacity-100" : "opacity-0"}`}
          onLoad={() => setLoaded(true)}
        />

        {/* Location marker */}
        {loaded && (
          <div
            className="absolute pointer-events-none"
            style={{ left: `${leftPct}%`, top: `${topPct}%`, transform: "translate(-50%, -50%)" }}
          >
            <span className="absolute inset-0 rounded-full bg-[#3b7ff0] opacity-40 animate-ping" />
            <span className="relative block w-3.5 h-3.5 rounded-full bg-[#3b7ff0] border-2 border-white shadow-md" />
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-3 flex items-center justify-between border-t border-slate-100">
        <span className="text-[9px] text-slate-400 tabular-nums">
          Bijgewerkt {timeStr}
        </span>
        <button
          onClick={() => {
            setRefreshKey(k => k + 1);
            setUpdatedAt(new Date());
            setLoaded(false);
          }}
          className="text-[9px] font-black uppercase tracking-widest text-[#3b7ff0] hover:text-blue-700 transition-colors"
        >
          Vernieuwen
        </button>
        <span className="text-[9px] text-slate-400">Bron: Buienradar</span>
      </div>
    </div>
  );
}
