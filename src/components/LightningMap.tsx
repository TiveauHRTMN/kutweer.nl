"use client";

import { useState, useEffect } from "react";
import { Zap } from "lucide-react";

interface Props {
  lat: number;
  lon: number;
}

export default function LightningMap({ lat, lon }: Props) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return <div className="h-[450px] bg-slate-100 animate-pulse rounded-2xl" />;

  const src = `https://www.lightningmaps.org/#m=oss;t=3;s=0;o=0;b=;ts=0;y=${lat};x=${lon};z=6;d=2;dl=2;dc=0;`;

  return (
    <div className="rounded-2xl bg-white border border-slate-100 shadow-sm overflow-hidden">
      <div className="px-5 pt-5 pb-3 flex items-center justify-between">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-0.5">
            Actuele en voorspelde ontladingen
          </p>
          <h3 className="text-sm font-black text-slate-800 leading-none flex items-center gap-2">
            Bliksemradar
          </h3>
        </div>
        <div className="flex items-center gap-1.5">
          <Zap className="w-4 h-4 text-rose-500 fill-rose-500" />
          <span className="text-[10px] font-bold text-slate-400 uppercase">Live Overlay</span>
        </div>
      </div>
      <div className="w-full h-[450px] bg-slate-50 relative">
        <iframe
          width="100%"
          height="100%"
          src={src}
          frameBorder="0"
          className="absolute inset-0"
        />
      </div>
    </div>
  );
}
