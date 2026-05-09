"use client";

import { useEffect, useState, useCallback } from "react";

interface RadarFile {
  dataset: string;
  filename: string;
  lastModified: string;
  downloadUrl?: string;
}

export default function KNMIRadarCard() {
  const [data, setData] = useState<RadarFile | null>(null);
  const [error, setError] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  const fetchRadar = useCallback(() => {
    fetch("/api/knmi-radar")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d?.lastModified) {
          setData(d);
          setLastRefresh(new Date());
          setError(false);
        } else {
          setError(true);
        }
      })
      .catch(() => setError(true));
  }, []);

  useEffect(() => {
    fetchRadar();
    // Refresh every 5 minutes (matching KNMI radar cadence)
    const interval = setInterval(fetchRadar, 5 * 60_000);
    return () => clearInterval(interval);
  }, [fetchRadar]);

  if (error) return null;
  if (!data) {
    return (
      <div className="card p-5 animate-pulse">
        <div className="h-3 w-40 bg-slate-200 rounded mb-2" />
        <div className="h-4 w-56 bg-slate-100 rounded" />
      </div>
    );
  }

  const measuredAt = new Date(data.lastModified);
  const minutesAgo = Math.round((Date.now() - measuredAt.getTime()) / 60_000);
  const timeStr = measuredAt.toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" });

  return (
    <div className="card p-5 sm:p-6">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse shrink-0" />
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
            KNMI Radar
          </span>
        </div>
        <button
          onClick={fetchRadar}
          className="text-[9px] font-black uppercase tracking-widest text-blue-500 hover:text-blue-600 transition-colors"
        >
          Vernieuwen
        </button>
      </div>

      <div className="flex flex-col gap-1">
        <p className="text-sm font-black text-slate-900">
          Laatste meting: {timeStr}{" "}
          {minutesAgo <= 10 && (
            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full align-middle">
              {minutesAgo === 0 ? "Net nu" : `${minutesAgo} min geleden`}
            </span>
          )}
        </p>
        <p className="text-xs text-slate-400 truncate" title={data.filename}>
          {data.dataset} · {data.filename}
        </p>
      </div>

      {data.downloadUrl && (
        <a
          href={data.downloadUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-flex items-center text-[10px] font-black uppercase tracking-widest text-blue-500 hover:text-blue-600 transition-colors gap-1"
        >
          Radarbestand downloaden →
        </a>
      )}

      <p className="text-[9px] text-slate-400 mt-3">
        Bron: KNMI Open Data · {data.dataset}
      </p>
    </div>
  );
}
