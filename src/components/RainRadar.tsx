"use client";

import type { MinutelyPrecipitation } from "@/lib/types";
import { motion } from "framer-motion";
import { Umbrella, Sun } from "lucide-react";

interface RainRadarProps {
  data: MinutelyPrecipitation[];
  locale?: "nl" | "de" | "fr" | "es";
}

function getPrecipColor(mm: number): string {
  if (mm === 0)    return "rgba(255,255,255,0.10)";
  if (mm < 0.3)   return "#93c5fd";   // light blue
  if (mm < 1)     return "#3b82f6";   // blue
  if (mm < 2.5)   return "#1d4ed8";   // deep blue
  if (mm < 5)     return "#1e3a8a";   // navy
  return "#7f1d1d";                     // red-dark (heavy)
}

function getBarHeight(mm: number, maxMm: number): string {
  if (mm === 0) return "12%";
  return `${Math.max(22, Math.round((mm / Math.max(maxMm, 0.5)) * 100))}%`;
}

function getSummary(data: MinutelyPrecipitation[], locale: string): {
  icon: React.ReactNode;
  text: string;
  subtext: string;
  accent: string;
  tint: string;
} {
  const hasRainNow = data.length > 0 && data[0].precipitation > 0;
  const totalRain   = data.reduce((sum, d) => sum + d.precipitation, 0);
  const allDry      = totalRain === 0;

  const isDE = locale === "de";
  const isFR = locale === "fr";
  const lc = isFR ? "fr-FR" : (isDE ? "de-DE" : "nl-NL");

  const fmt = (time: string) =>
    new Date(time).toLocaleTimeString(lc, { hour: "2-digit", minute: "2-digit" });

  if (allDry) {
    return {
      icon:    <Sun className="w-5 h-5" style={{ color: "#f59e0b" }} />,
      text:    isFR ? "Sec dans les 2 prochaines heures" : isDE ? "Trocken in den nächsten 2 Stunden" : "Droog de komende 2 uur",
      subtext: isFR ? "Le parapluie peut rester à la maison." : isDE ? "Der Regenschirm kann zu Hause bleiben." : "Paraplu kan thuis blijven.",
      accent:  "#10b981",
      tint:    "rgba(16,185,129,0.10)",
    };
  }

  if (hasRainNow) {
    let dryStart: string | null = null;
    for (let i = 1; i < data.length - 1; i++) {
      if (data[i].precipitation === 0 && data[i + 1].precipitation === 0) {
        dryStart = data[i].time;
        break;
      }
    }
    if (dryStart) {
      return {
        icon:    <Umbrella className="w-5 h-5" style={{ color: "#64748b" }} />,
        text:    isFR ? `Sec à partir de ${fmt(dryStart)}` : isDE ? `Trocken ab ${fmt(dryStart)}` : `Droog vanaf ${fmt(dryStart)}`,
        subtext: isFR ? "C'est le moment de courir. Saisissez l'occasion." : isDE ? "Zeit für einen Sprint. Nutze die Chance." : "Sprint-moment. Pak je kans.",
        accent:  "#f59e0b",
        tint:    "rgba(245,158,11,0.09)",
      };
    }
    return {
      icon:    <Umbrella className="w-5 h-5" style={{ color: "#3b82f6" }} />,
      text:    isFR ? "Le temps restera humide pour le moment" : isDE ? "Es bleibt vorerst nass" : "Het blijft voorlopig nat",
      subtext: isFR ? "Attendez-vous à des précipitations continues." : isDE ? "Gehe von anhaltendem Niederschlag aus." : "Ga uit van aanhoudende neerslag.",
      accent:  "#3b82f6",
      tint:    "rgba(59,130,246,0.10)",
    };
  }

  const firstRain = data.find((d) => d.precipitation > 0.1);
  if (firstRain) {
    return {
      icon:    <Umbrella className="w-5 h-5 animate-bounce" style={{ color: "#ef4444" }} />,
      text:    isFR ? `Pluie à partir de ${fmt(firstRain.time)}` : isDE ? `Regen ab ${fmt(firstRain.time)}` : `Regen vanaf ${fmt(firstRain.time)}`,
      subtext: isFR ? "Partez maintenant si vous voulez rester au sec." : isDE ? "Geh jetzt, wenn du trocken bleiben willst." : "Ga nu als je droog wilt blijven.",
      accent:  "#ef4444",
      tint:    "rgba(239,68,68,0.09)",
    };
  }

  return {
    icon:    <Sun className="w-5 h-5" style={{ color: "#f59e0b", opacity: 0.6 }} />,
    text:    isFR ? "Généralement sec" : isDE ? "Weitgehend trocken" : "Grotendeels droog",
    subtext: isFR ? "Peut-être quelques gouttes, mais pas de quoi s'inquiéter." : isDE ? "Vielleicht ein Tropfen, aber kein Drama." : "Misschien een spatje, maar geen drama.",
    accent:  "#10b981",
    tint:    "rgba(16,185,129,0.07)",
  };
}

export default function RainRadar({ data, locale = "nl" }: RainRadarProps) {
  if (data.length === 0) return null;

  const isDE = locale === "de";
  const isFR = locale === "fr";
  const lc = isFR ? "fr-FR" : (isDE ? "de-DE" : "nl-NL");

  const maxMm   = Math.max(...data.map((d) => d.precipitation), 0.5);
  const summary = getSummary(data, locale);

  return (
    <div className="space-y-4">
      {/* Summary tile */}
      <div
        className="flex items-center gap-3 rounded-2xl border border-white/60 px-4 py-3"
        style={{ background: summary.tint, backdropFilter: "blur(8px)" }}
      >
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border border-white/60"
          style={{ background: `${summary.accent}18` }}
        >
          {summary.icon}
        </div>
        <div className="min-w-0">
          <div className="text-[9px] font-black uppercase tracking-[0.2em] mb-0.5" style={{ color: summary.accent }}>
            {isFR ? "Focus : Précipitations" : isDE ? "Fokus: Niederschlag" : "Focus: Neerslag"}
          </div>
          <div className="text-sm font-black text-slate-950 leading-tight">{summary.text}</div>
          <div className="text-[11px] text-slate-700 font-medium mt-0.5">{summary.subtext}</div>
        </div>
      </div>

      {/* Bar chart */}
      <div className="relative">
        <span className="sr-only">{isFR ? "Graphique des précipitations pour les 2 prochaines heures" : isDE ? "Niederschlagsdiagramm für die nächsten 2 Stunden" : "Neerslaggrafiek voor de komende 2 uur"}</span>
        {/* Dashed anchor lines */}
        <div className="absolute inset-0 flex justify-between px-0.5 pointer-events-none">
          {[0, 1, 2].map((i) => (
            <div key={i} className="w-px h-full border-l border-dashed border-text-primary opacity-[0.07]" />
          ))}
        </div>

        <div className="flex items-end justify-between gap-[2px] sm:gap-[3px] h-16 px-1">
          {data.map((point, idx) => {
            const h     = getBarHeight(point.precipitation, maxMm);
            const color = getPrecipColor(point.precipitation);
            return (
              <motion.div
                key={point.time}
                initial={{ height: 2 }}
                animate={{ height: h }}
                transition={{ duration: 0.8, delay: idx * 0.012, ease: [0.16, 1, 0.3, 1] }}
                className="flex-1 rounded-sm group relative"
                style={{ background: color, minWidth: "3px" }}
              >
                <div
                  className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2 py-1 bg-slate-900 text-white text-[9px] font-black rounded-lg opacity-0 group-hover:opacity-100 transition-all pointer-events-none z-30 shadow-xl whitespace-nowrap"
                >
                  {new Date(point.time).toLocaleTimeString(lc, { hour: "2-digit", minute: "2-digit" })}
                  {" — "}
                  {point.precipitation > 0 ? `${point.precipitation.toFixed(1)} mm` : (isFR ? "Sec" : isDE ? "Trocken" : "Droog")}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* X-axis */}
        <div className="flex justify-between mt-2 px-0.5">
          <span className="text-[9px] font-black uppercase tracking-widest" style={{ color: "#f59e0b" }}>{isFR ? "Maint." : isDE ? "Jetzt" : "Nu"}</span>
          <span className="text-[9px] font-bold text-text-muted uppercase tracking-widest">{isFR ? "+1 h" : isDE ? "+1 Std" : "+1 uur"}</span>
          <span className="text-[9px] font-bold text-text-muted uppercase tracking-widest">{isFR ? "+2 h" : isDE ? "+2 Std" : "+2 uur"}</span>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-between text-[9px] font-black uppercase tracking-wider text-text-muted/50 pt-2 border-t border-black/5">
        <div className="flex items-center gap-3">
          {[
            { color: "#93c5fd", label: isFR ? "Léger" : isDE ? "Leicht" : "Licht" },
            { color: "#3b82f6", label: isFR ? "Modéré" : isDE ? "Mäßig" : "Matig" },
            { color: "#1e3a8a", label: isFR ? "Fort" : isDE ? "Stark" : "Zwaar" },
          ].map(({ color, label }) => (
            <div key={label} className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full" style={{ background: color }} />
              <span>{label}</span>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>Live Radar</span>
        </div>
      </div>
    </div>
  );
}
