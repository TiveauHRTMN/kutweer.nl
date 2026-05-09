"use client";

import { Cookie, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function SupportBanner() {
  const [isVisible, setIsVisible] = useState(true);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div 
          initial={{ x: 120, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 120, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 120 }}
          className="fixed bottom-20 right-0 z-[100] pl-4"
        >
          <div className="bg-slate-900/95 backdrop-blur-xl border-l border-y border-white/10 rounded-l-2xl shadow-2xl p-2.5 flex items-center gap-3 relative overflow-hidden group">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 shrink-0 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400">
                <Cookie className="w-4 h-4" />
              </div>
              <h4 className="text-[10px] font-black text-white uppercase tracking-tighter whitespace-nowrap">
                Support 🍪
              </h4>
            </div>

            <div className="flex items-center gap-2">
              <Link 
                href="/steun"
                className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-black text-[10px] transition-colors shadow-lg shadow-amber-500/20 uppercase"
              >
                Steun
              </Link>
              <button 
                onClick={() => setIsVisible(false)}
                className="p-1 rounded-full hover:bg-white/10 text-white/30 hover:text-white transition-colors"
                aria-label="Sluiten"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
