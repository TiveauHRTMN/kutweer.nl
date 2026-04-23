"use client";

import { motion } from "framer-motion";
import { Zap, Shield, Target, Info, BrainCircuit } from "lucide-react";
import type { WeatherData } from "@/lib/types";
import type { PersonaTier } from "@/lib/personas";

interface NeuralInsightsProps {
  weather: WeatherData;
  tier?: PersonaTier | null;
}

export default function NeuralInsights({ weather, tier }: NeuralInsightsProps) {
  if (!weather.neuralData) return null;

  const { metNetNowcast, seedScenario, neuralGcmImpact } = weather.neuralData;

  // Configuration per tier
  const config = {
    piet: {
      title: "MetNet-3 Nowcast",
      icon: <Zap className="w-4 h-4 text-accent-cyan" />,
      content: metNetNowcast,
      label: "Hyper-lokale Precisie",
      color: "border-accent-cyan/30 bg-accent-cyan/5"
    },
    reed: {
      title: "SEED AI Simulatie",
      icon: <Shield className="w-4 h-4 text-accent-red" />,
      content: seedScenario,
      label: "Extreme Kansberekening",
      color: "border-accent-red/30 bg-accent-red/5"
    },
    steve: {
      title: "NeuralGCM Impact",
      icon: <Target className="w-4 h-4 text-accent-blue" />,
      content: neuralGcmImpact,
      label: "Strategische Analyse",
      color: "border-accent-blue/30 bg-accent-blue/5"
    }
  };

  // Determine which insights to show based on tier (hierarchy)
  const showPiet = tier === "piet" || tier === "reed" || tier === "steve";
  const showReed = tier === "reed" || tier === "steve";
  const showSteve = tier === "steve";

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2 px-1">
        <BrainCircuit className="w-3 h-3 text-text-muted" />
        <span className="text-[10px] font-black uppercase tracking-widest text-text-muted">Google Neural Weather Engine</span>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {showPiet && config.piet.content && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`card p-4 border ${config.piet.color} flex gap-4`}
          >
            <div className="mt-1">{config.piet.icon}</div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-[10px] font-black uppercase tracking-wider text-text-primary">{config.piet.title}</h4>
                <span className="text-[8px] font-bold px-1.5 py-0.5 rounded-full bg-accent-cyan/20 text-accent-cyan uppercase">{config.piet.label}</span>
              </div>
              <p className="text-sm font-bold text-text-primary mt-1 leading-relaxed">{config.piet.content}</p>
            </div>
          </motion.div>
        )}

        {showReed && config.reed.content && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className={`card p-4 border ${config.reed.color} flex gap-4`}
          >
            <div className="mt-1">{config.reed.icon}</div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-[10px] font-black uppercase tracking-wider text-text-primary">{config.reed.title}</h4>
                <span className="text-[8px] font-bold px-1.5 py-0.5 rounded-full bg-accent-red/20 text-accent-red uppercase">{config.reed.label}</span>
              </div>
              <p className="text-sm font-bold text-text-primary mt-1 leading-relaxed">{config.reed.content}</p>
            </div>
          </motion.div>
        )}

        {showSteve && config.steve.content && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className={`card p-4 border ${config.steve.color} flex gap-4`}
          >
            <div className="mt-1">{config.steve.icon}</div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-[10px] font-black uppercase tracking-wider text-text-primary">{config.steve.title}</h4>
                <span className="text-[8px] font-bold px-1.5 py-0.5 rounded-full bg-accent-blue/20 text-accent-blue uppercase">{config.steve.label}</span>
              </div>
              <p className="text-sm font-bold text-text-primary mt-1 leading-relaxed">{config.steve.content}</p>
            </div>
          </motion.div>
        )}

        {!tier && (
          <div className="card p-4 border-dashed border-white/40 bg-white/5 flex items-center justify-between group cursor-pointer" onClick={() => window.dispatchEvent(new CustomEvent("wz:open-persona-modal"))}>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-text-muted">
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-text-muted">Neural Insights Vergrendeld</p>
                <p className="text-xs font-bold text-text-secondary">Word Piet, Reed of Steve voor AI-precisie.</p>
              </div>
            </div>
            <Info className="w-4 h-4 text-text-muted group-hover:text-accent-orange transition-colors" />
          </div>
        )}
      </div>
    </div>
  );
}
