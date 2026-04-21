
"use client";

import { useState } from "react";
import { Droplets, Zap, Home, Mail, ShieldCheck, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { WeatherData } from "@/lib/types";

interface Props {
  weather: WeatherData;
  city: string;
}

type RescueType = "FLOOD" | "STORM" | "THUNDER" | "NONE";

export default function LeadRescue({ weather, city }: Props) {
  const [status, setStatus] = useState<"idle" | "loading" | "success">("idle");
  const [email, setEmail] = useState("");

  // Bepaal het type 'misere'
  let type: RescueType = "NONE";
  if (weather.daily[0].precipitationSum > 15) type = "FLOOD";
  else if (weather.daily[0].windSpeedMax > 70) type = "STORM";
  else if (weather.hourly.some(h => h.weatherCode >= 95)) type = "THUNDER";

  if (type === "NONE") return null;

  const config = {
    FLOOD: {
      icon: <Droplets className="w-8 h-8 text-accent-cyan" />,
      title: "Wateroverlast verwacht",
      desc: `In ${city} valt er meer dan ${weather.daily[0].precipitationSum.toFixed(0)}mm regen. Heb je hulp nodig bij een ondergelopen kelder of lekkage?`,
      cta: "Vind een specialist",
      color: "border-accent-cyan bg-accent-cyan/10",
      accent: "bg-accent-cyan"
    },
    STORM: {
      icon: <Home className="w-8 h-8 text-accent-orange" />,
      title: "Stormschade Alarm",
      desc: `Windstoten tot ${weather.daily[0].windSpeedMax} km/h in ${city}. Voorkom dakschade of krijg direct hulp bij een noodsituatie.`,
      cta: "Bel noodnummer / Meld schade",
      color: "border-accent-orange bg-accent-orange/10",
      accent: "bg-accent-orange"
    },
    THUNDER: {
      icon: <Zap className="w-8 h-8 text-accent-amber" />,
      title: "Onweer & Bliksem",
      desc: "Zwaar onweer nadert jouw regio. Bescherm je apparatuur tegen overspanning of check je opstalverzekering direct.",
      cta: "Check bescherming",
      color: "border-accent-amber bg-accent-amber/10",
      accent: "bg-accent-amber"
    }
  }[type];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setStatus("loading");
    
    // Simulate lead capture
    try {
        await fetch("/api/leads/capture", {
            method: "POST",
            body: JSON.stringify({ email, city, type, timestamp: new Date() })
        });
        setTimeout(() => setStatus("success"), 1500);
    } catch {
        setStatus("idle");
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-3xl p-6 border-2 shadow-2xl relative overflow-hidden ${config.color}`}
    >
      <div className="absolute top-0 right-0 p-4 opacity-10">
        {config.icon}
      </div>

      <div className="relative z-10 flex flex-col items-center text-center">
        <div className="mb-4 bg-white/50 p-4 rounded-full shadow-inner">
           {config.icon}
        </div>
        
        <h3 className="text-xl font-black text-text-primary uppercase tracking-tight mb-2">
            {config.title}
        </h3>
        
        <p className="text-sm font-medium text-text-secondary leading-relaxed mb-6 max-w-sm">
            {config.desc}
        </p>

        <AnimatePresence mode="wait">
          {status !== "success" ? (
            <form onSubmit={handleSubmit} className="w-full space-y-3">
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input 
                  type="email" 
                  placeholder="Je e-mailadres voor direct contact"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white border border-black/5 focus:ring-2 focus:ring-black/10 outline-none text-sm font-bold transition-all"
                />
              </div>
              <button 
                type="submit"
                disabled={status === "loading"}
                className={`w-full py-4 rounded-2xl text-white font-black uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-2 ${config.accent} hover:shadow-lg active:scale-[0.98] shadow-md`}
              >
                {status === "loading" ? <Loader2 className="w-4 h-4 animate-spin" /> : config.cta}
              </button>
            </form>
          ) : (
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex flex-col items-center py-4"
            >
              <div className="w-12 h-12 bg-accent-green rounded-full flex items-center justify-center mb-3">
                <ShieldCheck className="w-6 h-6 text-white" />
              </div>
              <p className="font-black text-accent-green uppercase text-xs tracking-widest">Hulp is onderweg</p>
              <p className="text-[10px] text-text-muted mt-1 uppercase">We koppelen je direct aan een lokale specialist.</p>
            </motion.div>
          )}
        </AnimatePresence>

        <p className="mt-6 text-[9px] font-black uppercase tracking-[0.2em] text-text-muted opacity-50">
           WeerZone On-Demand Rescue · 24/7 Service
        </p>
      </div>
    </motion.div>
  );
}
