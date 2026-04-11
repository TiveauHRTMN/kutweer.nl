"use client";

import { LogoFull } from "./Logo";

export default function LoadingScreen() {
  return (
    <div
      className="flex flex-col items-center justify-center min-h-screen px-8"
      style={{ background: "linear-gradient(160deg, #4a9ee8 0%, #5aafe8 40%, #3b8dd4 100%)" }}
    >
      <LogoFull
        height={220}
        className="animate-pulse drop-shadow-[0_4px_40px_rgba(255,255,255,0.3)]"
      />
      <p className="mt-6 text-white/50 text-sm font-semibold tracking-wider uppercase animate-[fadeInUp_0.8s_ease_0.3s_forwards] opacity-0">
        Weer ophalen...
      </p>
    </div>
  );
}
