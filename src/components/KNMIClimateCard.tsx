"use client";

import { useEffect, useState } from "react";

interface ClimateData {
  stationName: string;
  month: number;
  year: number;
  daysWithData: number;
  avgTemp: number | null;
  avgTempMax: number | null;
  avgTempMin: number | null;
  totalPrecipitation: number | null;
  totalSunHours: number | null;
  normal: { avgTemp: number; avgPrecipitation: number; avgSunHours: number };
  tempDiff: number | null;
  precipRatio: number | null;
  sunRatio: number | null;
}

const MAANDEN = [
  "januari", "februari", "maart", "april", "mei", "juni",
  "juli", "augustus", "september", "oktober", "november", "december",
];

function TempDiffLabel({ diff }: { diff: number }) {
  const abs = Math.abs(diff);
  const pos = diff > 0;
  if (abs < 0.5) return <span className="text-slate-500">Normaal voor {MAANDEN[new Date().getMonth()]}</span>;
  if (pos) {
    if (abs >= 5) return <span className="text-rose-600">{abs}° warmer dan normaal — opvallend zacht</span>;
    if (abs >= 2) return <span className="text-orange-500">{abs}° boven normaal</span>;
    return <span className="text-orange-400">{abs}° boven het gemiddelde</span>;
  } else {
    if (abs >= 5) return <span className="text-blue-700">{abs}° kouder dan normaal — opvallend fris</span>;
    if (abs >= 2) return <span className="text-blue-500">{abs}° onder normaal</span>;
    return <span className="text-blue-400">{abs}° onder het gemiddelde</span>;
  }
}

interface Props {
  lat: number;
  lon: number;
}

export default function KNMIClimateCard({ lat, lon }: Props) {
  const [data, setData] = useState<ClimateData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/knmi-climate?lat=${lat}&lon=${lon}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [lat, lon]);

  if (loading) {
    return (
      <div className="card p-5 animate-pulse">
        <div className="h-3 w-32 bg-slate-200 rounded mb-3" />
        <div className="h-6 w-48 bg-slate-100 rounded" />
      </div>
    );
  }

  if (!data || data.avgTemp === null) return null;

  const maand = MAANDEN[data.month];
  const today = new Date().getDate();

  return (
    <div className="card p-5 sm:p-6">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
          KNMI · {data.stationName}
        </span>
        <span className="text-[10px] font-black uppercase tracking-widest text-blue-500 ml-auto">
          {data.daysWithData} van {today} dagen
        </span>
      </div>

      <h3 className="text-base font-black text-slate-900 mb-1">
        {maand.charAt(0).toUpperCase() + maand.slice(1)} t.o.v. normaal
      </h3>

      {data.tempDiff !== null && (
        <p className="text-sm font-medium mb-4">
          <TempDiffLabel diff={data.tempDiff} />
        </p>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="flex flex-col">
          <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Gem. temp</span>
          <span className="text-xl font-black text-slate-900">{data.avgTemp?.toFixed(1)}°</span>
          <span className="text-[10px] text-slate-400">normaal {data.normal.avgTemp}°</span>
        </div>
        {data.avgTempMax !== null && (
          <div className="flex flex-col">
            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Max. temp</span>
            <span className="text-xl font-black text-slate-900">{data.avgTempMax?.toFixed(1)}°</span>
          </div>
        )}
        {data.totalPrecipitation !== null && (
          <div className="flex flex-col">
            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Neerslag</span>
            <span className="text-xl font-black text-slate-900">{data.totalPrecipitation?.toFixed(0)} mm</span>
            <span className="text-[10px] text-slate-400">normaal {data.normal.avgPrecipitation} mm/mnd</span>
          </div>
        )}
        {data.totalSunHours !== null && (
          <div className="flex flex-col">
            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Zonuren</span>
            <span className="text-xl font-black text-slate-900">{data.totalSunHours?.toFixed(0)} u</span>
            <span className="text-[10px] text-slate-400">
              {data.sunRatio !== null
                ? data.sunRatio >= 100
                  ? `${data.sunRatio - 100}% boven normaal`
                  : `${100 - data.sunRatio}% onder normaal`
                : `normaal ${data.normal.avgSunHours} u/mnd`}
            </span>
          </div>
        )}
      </div>

      <p className="text-[9px] text-slate-400 mt-4">
        Bron: KNMI · officiële klimaatdata (1991-2020 normaal)
      </p>
    </div>
  );
}
