"use client";

import type { HourlyForecast } from "@/lib/types";

interface Props {
  hourly: HourlyForecast[];
}

function BarChart({ data, maxValue, label, unit, colorFn, threshold, textStyle }: { data: number[], maxValue: number, label: string, unit: string, colorFn: (val: number) => string, threshold?: number, textStyle?: { label: string, unit: string } }) {
  const W = 500;
  const H = 80;
  const PT = 10;
  const PB = 20;
  const n = data.length;
  const barW = Math.max(2, (W / n) - 2);

  const safeMax = Math.max(maxValue, ...data, 1);

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2">
        <span className={`text-[10px] font-black uppercase tracking-widest ${textStyle?.label || "text-text-muted"}`}>{label}</span>
        <span className={`text-[10px] font-bold ${textStyle?.unit || "text-white/40"}`}>{Math.max(...data).toFixed(0)} {unit} max</span>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto overflow-visible">
        {/* Threshold line */}
        {threshold && threshold < safeMax && (
          <line x1="0" y1={PT + (H - PT - PB) * (1 - threshold / safeMax)} x2={W} y2={PT + (H - PT - PB) * (1 - threshold / safeMax)} stroke="rgba(244,63,94,0.3)" strokeWidth="1" strokeDasharray="4,4" />
        )}
        
        {data.map((val, i) => {
          if (val <= 0.01) return null;
          const barH = Math.max(1, (val / safeMax) * (H - PT - PB));
          const x = (i / Math.max(n - 1, 1)) * W - (barW / 2);
          const y = H - PB - barH;
          return <rect key={i} x={x} y={y} width={barW} height={barH} fill={colorFn(val)} rx="1" />;
        })}
      </svg>
    </div>
  );
}

function LineChart({ data, maxValue, label, unit, colorFn, threshold, textStyle }: { data: number[], maxValue: number, label: string, unit: string, colorFn: (val: number) => string, threshold?: number, textStyle?: { label: string, unit: string } }) {
  const W = 500;
  const H = 80;
  const PT = 10;
  const PB = 20;
  const n = data.length;

  const safeMax = Math.max(maxValue, ...data, 1);

  const pts = data.map((val, i) => {
    const x = (i / Math.max(n - 1, 1)) * W;
    const y = PT + (H - PT - PB) * (1 - val / safeMax);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });
  
  const pathData = `M${pts.join(" L")}`;

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2">
        <span className={`text-[10px] font-black uppercase tracking-widest ${textStyle?.label || "text-text-muted"}`}>{label}</span>
        <span className={`text-[10px] font-bold ${textStyle?.unit || "text-white/40"}`}>{Math.max(...data).toFixed(0)} {unit} max</span>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto overflow-visible">
        {/* Threshold line */}
        {threshold && threshold < safeMax && (
          <line x1="0" y1={PT + (H - PT - PB) * (1 - threshold / safeMax)} x2={W} y2={PT + (H - PT - PB) * (1 - threshold / safeMax)} stroke="rgba(244,63,94,0.3)" strokeWidth="1" strokeDasharray="4,4" />
        )}
        
        <path d={pathData} fill="none" stroke="#60a5fa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        
        {/* Dots for high values */}
        {data.map((val, i) => {
          if (threshold && val < threshold) return null;
          if (!threshold && val < safeMax * 0.8) return null;
          const x = (i / Math.max(n - 1, 1)) * W;
          const y = PT + (H - PT - PB) * (1 - val / safeMax);
          return <circle key={i} cx={x} cy={y} r="3" fill={colorFn(val)} />;
        })}
      </svg>
    </div>
  );
}

export default function ReedExtremeCharts({ hourly }: Props) {
  const hours = hourly.slice(0, 48);
  if (hours.length === 0) return null;

  const capeData = hours.map(h => h.cape);
  const precipData = hours.map(h => h.precipitation);
  const windData = hours.map(h => h.windSpeed ?? 0);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 bg-white/95 backdrop-blur-md p-6 sm:p-8 rounded-3xl shadow-xl border border-white/60">
      
      {/* CAPE Chart */}
      <BarChart 
        data={capeData} 
        maxValue={2000} 
        label="CAPE (Onweer-Energie)" 
        unit="J/kg" 
        threshold={1000}
        colorFn={(val) => val > 1500 ? "#e11d48" : val > 500 ? "#ea580c" : "#d97706"} 
        textStyle={{ label: "text-slate-500", unit: "text-slate-400" }}
      />

      {/* Neerslag Chart */}
      <BarChart 
        data={precipData} 
        maxValue={10} 
        label="Neerslagintensiteit" 
        unit="mm/u" 
        threshold={5}
        colorFn={(val) => val > 5 ? "#e11d48" : val > 1 ? "#2563eb" : "#3b82f6"} 
        textStyle={{ label: "text-slate-500", unit: "text-slate-400" }}
      />

      {/* Windkracht Chart */}
      <LineChart 
        data={windData} 
        maxValue={80} 
        label="Windkracht" 
        unit="km/h" 
        threshold={50}
        colorFn={(val) => val > 75 ? "#e11d48" : val > 50 ? "#ea580c" : "#3b82f6"} 
        textStyle={{ label: "text-slate-500", unit: "text-slate-400" }}
      />

    </div>
  );
}
