"use client";

import { useState, useEffect } from "react";

interface Props {
  lat: number;
  lon: number;
}

export default function RainMap({ lat, lon, locale = "nl" }: Props & { locale?: "nl" | "de" | "fr" | "es" }) {
  const isDE = locale === "de";
  const isFR = locale === "fr";
  const isES = locale === "es";
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  // We mount after initial render to avoid hydration mismatch if needed,
  // but for iframe it's usually fine.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const rainviewerUrl = `https://www.rainviewer.com/map.html?loc=${lat},${lon},8&oFa=0&oC=1&oU=0&oCS=1&oF=0&oAP=1&rmt=1`;

  const headerSmall = isES ? "Lluvia en directo" : isFR ? "Précipitations en direct" : isDE ? "Live Niederschlag" : "Live neerslag";
  const headerLarge = isES ? "Radar interactivo" : isFR ? "Radar interactif" : isDE ? "Interaktives Regenradar" : "Interactieve Regenradar";

  if (!mounted) return <div className="card overflow-hidden h-[450px] bg-slate-900 animate-pulse" />;

  return (
    <div className="card overflow-hidden">
      {/* Header */}
      <div className="px-5 pt-4 pb-3 flex items-center justify-between">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-0.5">
            {headerSmall}
          </p>
          <h3 className="text-sm font-black text-slate-800 leading-none">{headerLarge}</h3>
        </div>
        <span className="flex items-center gap-1.5 text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse inline-block" />
          Live
        </span>
      </div>

      {/* Radar */}
      <div className="relative w-full overflow-hidden bg-slate-900" style={{ height: "450px" }}>
        {!loaded && !error && (
          <div className="absolute inset-0 bg-slate-800 animate-pulse" />
        )}
        <iframe
          src={rainviewerUrl}
          width="100%"
          height="100%"
          frameBorder="0"
          className={`absolute inset-0 transition-opacity duration-500 ${loaded ? "opacity-100" : "opacity-0"}`}
          onLoad={() => setLoaded(true)}
          onError={() => { setLoaded(true); setError(true); }}
          title="RainViewer Regenradar"
        />
      </div>
    </div>
  );
}
