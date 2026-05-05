"use client";

import { Cookie, X } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";

export default function SupportBanner() {
  const [isVisible, setIsVisible] = useState(false);

  // We delay the appearance slightly so it slides in nicely after load
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 1500);
    return () => clearTimeout(timer);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="sticky top-4 z-50 animate-fade-in px-4 sm:px-0">
      <div className="card mx-auto max-w-2xl bg-gradient-to-r from-slate-900 to-slate-800 border-amber-500/30 shadow-2xl p-4 flex items-center justify-between gap-4 overflow-hidden relative">
        <div className="absolute -left-2 -top-2 text-amber-500/10 rotate-12 pointer-events-none">
          <Cookie size={64} />
        </div>
        
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 shrink-0 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400">
            <Cookie className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-black text-white leading-tight mb-0.5">
              Support voor een koekje 🍪
            </h4>
            <p className="text-[11px] text-white/60 font-medium leading-tight">
              Weerzone blijft draaien dankzij jou.
            </p>
          </div>
        </div>

        <div className="relative z-10 flex items-center gap-3 shrink-0">
          <Link 
            href="/steun"
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-black text-xs transition-colors shadow-lg shadow-amber-500/20"
          >
            Trakteer
          </Link>
          <button 
            onClick={() => setIsVisible(false)}
            className="p-1.5 rounded-full hover:bg-white/10 text-white/40 hover:text-white transition-colors"
            aria-label="Sluiten"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
