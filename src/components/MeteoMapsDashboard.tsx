"use client";

import { useState } from "react";
import { Layers, Zap, Wind, CloudRain } from "lucide-react";

interface Props {
  lat: number;
  lon: number;
  city: string;
}

export default function MeteoMapsDashboard({ lat, lon, city }: Props) {
  const [model, setModel] = useState<"icon" | "ecmwf">("icon");

  const embedBase = `https://embed.windy.com/embed.html?type=map&location=coordinates&metricRain=mm&metricTemp=%C2%B0C&metricWind=km%2Fh&zoom=7&level=surface&lat=${lat}&lon=${lon}&detailLat=${lat}&detailLon=${lon}&marker=true&message=true`;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4 bg-black/20 p-4 rounded-2xl border border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center">
            <Layers className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h3 className="text-sm font-black text-white">Spatial Data Maps</h3>
            <p className="text-[10px] text-white/50 uppercase tracking-widest">Live Reflectivity & Thermodynamic grids</p>
          </div>
        </div>
        
        <div className="flex bg-slate-900 rounded-lg p-1 border border-white/10">
          <button 
            onClick={() => setModel("icon")}
            className={`px-4 py-1.5 rounded-md text-[11px] font-black uppercase tracking-widest transition-all ${model === "icon" ? "bg-emerald-500/20 text-emerald-400" : "text-white/40 hover:text-white"}`}
          >
            ICON-D2
          </button>
          <button 
            onClick={() => setModel("ecmwf")}
            className={`px-4 py-1.5 rounded-md text-[11px] font-black uppercase tracking-widest transition-all ${model === "ecmwf" ? "bg-emerald-500/20 text-emerald-400" : "text-white/40 hover:text-white"}`}
          >
            ECMWF
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Radar / Reflectivity Map */}
        <div className="card !p-0 overflow-hidden border border-white/10 bg-slate-900 relative">
          <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/80 to-transparent p-4 z-10 flex items-center gap-2 pointer-events-none">
            <CloudRain className="w-4 h-4 text-blue-400" />
            <span className="text-xs font-black text-white uppercase tracking-widest shadow-black drop-shadow-md">Reflectivity (Regen & Onweer)</span>
          </div>
          <iframe 
            className="w-full h-[350px] border-0 grayscale-[20%] contrast-125"
            src={`${embedBase}&overlay=rain&product=${model}`}
            title="Radar Reflectivity"
          />
        </div>

        {/* CAPE Map */}
        <div className="card !p-0 overflow-hidden border border-white/10 bg-slate-900 relative">
          <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/80 to-transparent p-4 z-10 flex items-center gap-2 pointer-events-none">
            <Zap className="w-4 h-4 text-rose-500" />
            <span className="text-xs font-black text-white uppercase tracking-widest shadow-black drop-shadow-md">CAPE (Convectieve Instabiliteit)</span>
          </div>
          <iframe 
            className="w-full h-[350px] border-0 grayscale-[20%] contrast-125"
            src={`${embedBase}&overlay=cape&product=${model}`}
            title="CAPE Map"
          />
        </div>

        {/* Wind Gusts Map - Full width on bottom */}
        <div className="card !p-0 overflow-hidden border border-white/10 bg-slate-900 relative lg:col-span-2">
          <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/80 to-transparent p-4 z-10 flex items-center gap-2 pointer-events-none">
            <Wind className="w-4 h-4 text-orange-400" />
            <span className="text-xs font-black text-white uppercase tracking-widest shadow-black drop-shadow-md">Windvlagen (Storm Tracking)</span>
          </div>
          <iframe 
            className="w-full h-[400px] border-0 grayscale-[20%] contrast-125"
            src={`${embedBase}&overlay=gust&product=${model}`}
            title="Wind Gusts"
          />
        </div>
      </div>
      
      <p className="text-right text-[9px] text-white/30 uppercase tracking-widest mt-2">Data rendering via Windy.com API · ICON-D2 / ECMWF</p>
    </div>
  );
}
