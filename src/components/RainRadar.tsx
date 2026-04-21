"use client";

import type { MinutelyPrecipitation } from "@/lib/types";
import { motion } from "framer-motion";
import { Umbrella, Sun } from "lucide-react";

interface RainRadarProps {
  data: MinutelyPrecipitation[];
}

function getPrecipColor(mm: number): string {
  if (mm === 0) return "rgba(255, 255, 255, 0.08)";
  if (mm < 0.3) return "#60a5fa";    // sky-400
  if (mm < 1) return "#3b82f6";       // blue-500
  if (mm < 2.5) return "#2563eb";     // blue-600
  if (mm < 5) return "#1e40af";       // blue-800
  return "#7f1d1d";                     // red-dark
}

function getBarHeight(mm: number, maxMm: number): string {
  if (mm === 0) return "15%";
  const height = Math.max(25, Math.round((mm / Math.max(maxMm, 0.5)) * 100));
  return `${height}%`;
}

function getSummary(data: MinutelyPrecipitation[]): {
  emoji: React.ReactNode;
  text: string;
  subtext: string;
} {
  const hasRainNow = data.length > 0 && data[0].precipitation > 0;
  const totalRain = data.reduce((sum, d) => sum + d.precipitation, 0);
  const allDry = totalRain === 0;

  if (allDry) {
    return {
      emoji: <Sun className="w-5 h-5 text-accent-orange" />,
      text: "Droog de komende 2 uur",
      subtext: "Paraplu kan thuis blijven.",
    };
  }

  const fmt = (time: string) =>
    new Date(time).toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" });

  if (hasRainNow) {
    let dryStretchStart: string | null = null;
    for (let i = 1; i < data.length - 1; i++) {
      if (data[i].precipitation === 0 && data[i + 1].precipitation === 0) {
        dryStretchStart = data[i].time;
        break;
      }
    }

    if (dryStretchStart) {
      return {
        emoji: <Umbrella className="w-5 h-5 text-text-muted" />,
        text: `Droog vanaf ${fmt(dryStretchStart)}`,
        subtext: "Sprint-moment. Pak je kans.",
      };
    } else {
      return {
        emoji: <Umbrella className="w-5 h-5 text-accent-cyan" />,
        text: "Het blijft voorlopig nat",
        subtext: "Ga uit van aanhoudende neerslag.",
      };
    }
  } else {
    const firstRain = data.find((d) => d.precipitation > 0.1);
    if (firstRain) {
      return {
        emoji: <Umbrella className="w-5 h-5 text-accent-red animate-bounce" />,
        text: `Regen vanaf ${fmt(firstRain.time)}`,
        subtext: "Ga nu als je droog wilt blijven.",
      };
    }
    return {
      emoji: <Sun className="w-5 h-5 text-accent-orange/40" />,
      text: "Grotendeels droog",
      subtext: "Misschien een spatje, maar geen drama.",
    };
  }
}

export default function RainRadar({ data }: RainRadarProps) {
  if (data.length === 0) return null;

  const maxMm = Math.max(...data.map((d) => d.precipitation), 0.5);
  const summary = getSummary(data);

  return (
    <div className="space-y-6">
      {/* Immersive Summary Section */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-white/40 border border-white/60 shadow-sm flex items-center justify-center shrink-0">
            {summary.emoji}
          </div>
          <div className="min-w-0">
            <div className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-0.5">Focus: Neerslag</div>
            <div className="text-sm font-bold text-text-primary leading-tight">{summary.text}</div>
            <p className="text-[11px] text-text-secondary mt-0.5">{summary.subtext}</p>
          </div>
        </div>
      </div>

      {/* Visual Timeline Graph */}
      <div className="relative pt-2">
        {/* Time Anchor Lines */}
        <div className="absolute inset-0 flex justify-between px-0.5 pointer-events-none opacity-20">
          <div className="w-px h-full border-l border-dashed border-text-primary" />
          <div className="w-px h-full border-l border-dashed border-text-primary" />
          <div className="w-px h-full border-l border-dashed border-text-primary" />
        </div>

        {/* The Bars */}
        <div className="flex items-end justify-between gap-[2px] sm:gap-[3px] h-20 relative px-1">
          {data.map((point, idx) => {
            const h = getBarHeight(point.precipitation, maxMm);
            const color = getPrecipColor(point.precipitation);
            
            return (
              <motion.div
                key={point.time}
                initial={{ height: 2 }}
                animate={{ height: h }}
                transition={{ duration: 0.8, delay: idx * 0.015, ease: [0.16, 1, 0.3, 1] }}
                className="flex-1 rounded-t-lg group relative transition-colors"
                style={{ background: color, minWidth: '4px' }}
              >
                {/* Visual Glow for actual rain */}
                {point.precipitation > 0 && (
                   <div className="absolute inset-x-0 bottom-0 top-0 blur-[4px] opacity-10 rounded-t-lg" style={{ background: color }} />
                )}
                
                {/* Precise Tooltip */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-black text-white text-[9px] font-black rounded-lg opacity-0 group-hover:opacity-100 transition-all pointer-events-none z-30 shadow-xl whitespace-nowrap scale-90 group-hover:scale-100">
                  {new Date(point.time).toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" })} — {point.precipitation > 0 ? `${point.precipitation.toFixed(1)} mm` : "Droog"}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Time X-Axis */}
        <div className="flex justify-between mt-3 px-0.5">
           <span className="text-[9px] font-black text-accent-orange uppercase tracking-widest">Nu</span>
           <span className="text-[9px] font-bold text-text-muted uppercase tracking-widest">+1 uur</span>
           <span className="text-[9px] font-bold text-text-muted uppercase tracking-widest">+2 uur</span>
        </div>
      </div>

      {/* Modern Legend */}
      <div className="flex items-center justify-between text-[9px] font-black uppercase tracking-wider text-text-muted/60 pt-2 border-t border-black/5">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-sky-400" />
            <span>Licht</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-600" />
            <span>Matig</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-800" />
            <span>Zwaar</span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-1 h-1 rounded-full bg-accent-green" />
          <span>Live Radar</span>
        </div>
      </div>
    </div>
  );
}
