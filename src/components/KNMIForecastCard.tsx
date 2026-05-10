"use client";

import { useEffect, useState } from "react";

interface Props {
  lat: number;
  lon: number;
  city: string;
}

export default function KNMIForecastCard({ lat, lon, city }: Props) {
  const [forecast, setForecast] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/piet-weerbericht?lat=${lat}&lon=${lon}&city=${encodeURIComponent(city)}`)
      .then(r => r.ok ? r.json() : null)
      .then(d => { setForecast(d); setLoading(false); })
      .catch(() => setLoading(false));
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

  const paragraphs = forecast.split(/\n+/).map(p => p.trim()).filter(Boolean);

  return (
    <div className="card p-5 sm:p-6">
      <div className="flex items-center gap-2 mb-4">
        <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600">
          Piet · weerbericht
        </span>
      </div>
      <div className="space-y-3">
        {paragraphs.map((p, i) => (
          <p key={i} className="text-sm text-slate-700 leading-relaxed">{p}</p>
        ))}
      </div>
      <p className="text-[9px] text-slate-400 mt-4">Gebaseerd op KNMI-data · elke 30 minuten bijgewerkt</p>
    </div>
  );
}
