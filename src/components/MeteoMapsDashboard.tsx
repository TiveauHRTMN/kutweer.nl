"use client";

import { useState } from "react";
import { Layers, Zap, Wind, CloudRain } from "lucide-react";

interface Props {
  lat: number;
  lon: number;
  city: string;
}

export default function MeteoMapsDashboard({ lat, lon, city }: Props) {
  const [model, setModel] = useState<"harmonie" | "icon" | "arome">("harmonie");

  const embedBase = `https://embed.windy.com/embed.html?type=map&location=coordinates&metricRain=mm&metricTemp=%C2%B0C&metricWind=km%2Fh&zoom=7&level=surface&lat=${lat}&lon=${lon}&detailLat=${lat}&detailLon=${lon}&marker=true&message=true`;

  return (
    <div className="space-y-6">
      <div className="rounded-3xl bg-white/95 backdrop-blur-md p-6 shadow-xl border border-slate-200 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
            <Layers className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-sm font-black text-slate-900">Spatial Data Maps</h3>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest">Live Reflectivity & Thermodynamic grids</p>
          </div>
        </div>
        
        <div className="flex bg-slate-100 rounded-lg p-1 border border-slate-200">
          <button 
            onClick={() => setModel("harmonie")}
            className={`px-4 py-1.5 rounded-md text-[11px] font-black uppercase tracking-widest transition-all ${model === "harmonie" ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-900"}`}
          >
            HARMONIE
          </button>
          <button 
            onClick={() => setModel("icon")}
            className={`px-4 py-1.5 rounded-md text-[11px] font-black uppercase tracking-widest transition-all ${model === "icon" ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-900"}`}
          >
            ICON-D2
          </button>
          <button 
            onClick={() => setModel("arome")}
            className={`px-4 py-1.5 rounded-md text-[11px] font-black uppercase tracking-widest transition-all ${model === "arome" ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-900"}`}
          >
            AROME
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Radar / Reflectivity Map */}
        <div className="rounded-3xl bg-white/95 backdrop-blur-md shadow-xl border border-slate-200 overflow-hidden relative">
          <div className="absolute top-0 left-0 right-0 bg-white/90 p-3 z-10 flex items-center gap-2 pointer-events-none border-b border-slate-200">
            <CloudRain className="w-4 h-4 text-blue-500" />
            <span className="text-xs font-black text-slate-800 uppercase tracking-widest">Reflectivity (Regen & Onweer)</span>
          </div>
          <iframe 
            className="w-full h-[350px] border-0"
            src={`${embedBase}&overlay=rain&product=${model}`}
            title="Radar Reflectivity"
          />
        </div>

        {/* CAPE Map */}
        <div className="rounded-3xl bg-white/95 backdrop-blur-md shadow-xl border border-slate-200 overflow-hidden relative">
          <div className="absolute top-0 left-0 right-0 bg-white/90 p-3 z-10 flex items-center gap-2 pointer-events-none border-b border-slate-200">
            <Zap className="w-4 h-4 text-rose-500" />
            <span className="text-xs font-black text-slate-800 uppercase tracking-widest">CAPE (Convectieve Instabiliteit)</span>
          </div>
          <iframe 
            className="w-full h-[350px] border-0"
            src={`${embedBase}&overlay=cape&product=${model}`}
            title="CAPE Map"
          />
        </div>

        {/* Wind Gusts Map - Full width on bottom */}
        <div className="rounded-3xl bg-white/95 backdrop-blur-md shadow-xl border border-slate-200 overflow-hidden relative lg:col-span-2">
          <div className="absolute top-0 left-0 right-0 bg-white/90 p-3 z-10 flex items-center gap-2 pointer-events-none border-b border-slate-200">
            <Wind className="w-4 h-4 text-orange-500" />
            <span className="text-xs font-black text-slate-800 uppercase tracking-widest">Windvlagen (Storm Tracking)</span>
          </div>
          <iframe 
            className="w-full h-[400px] border-0"
            src={`${embedBase}&overlay=gust&product=${model}`}
            title="Wind Gusts"
          />
        </div>
      </div>
      
      <p className="text-right text-[9px] text-slate-400 uppercase tracking-widest mt-2">Data rendering via Windy API · ICON-D2 / AROME</p>
    </div>
  );
}
