"use client";

import { useEffect, useState } from "react";
import { getStationsWeather } from "@/app/actions";

export default function NLPulse() {
  const [stations, setStations] = useState<Array<{ name: string; temp: number }>>([]);

  useEffect(() => {
    getStationsWeather().then(setStations);
    const interval = setInterval(() => {
      getStationsWeather().then(setStations);
    }, 10 * 60000); // 10 min refresh
    return () => clearInterval(interval);
  }, []);

  if (stations.length === 0) return null;

  return (
    <div className="overflow-hidden whitespace-nowrap py-1.5 bg-[#4a9ee8]/90 backdrop-blur-sm relative border-b border-white/10" style={{ isolation: "isolate" }}>
      <div className="flex gap-10 text-[9px] font-black uppercase tracking-widest text-white px-4 animate-marquee hover:pause-marquee">
        {/* Render stations twice for seamless loop */}
        {[...stations, ...stations].map((s, i) => (
          <span key={`${s.name}-${i}`} className="flex items-center gap-1.5 shrink-0">
            <span 
              className={`w-1 h-1 rounded-full ${s.name === "De Bilt" ? "bg-white shadow-[0_0_8px_rgba(255,255,255,1)]" : "bg-white/40"}`} 
            />
            {s.name} {s.temp}°
          </span>
        ))}
      </div>

      <style jsx>{`
        .animate-marquee {
          display: flex;
          width: max-content;
          animation: marquee 60s linear infinite;
        }
        .hover\:pause-marquee:hover {
          animation-play-state: paused;
        }
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}
