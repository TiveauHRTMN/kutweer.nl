"use client";

import { LogoFull } from "./Logo";

/**
 * Loading-scherm tijdens initieel weerfetch. Alleen het woord WEERZONE
 * krijgt de persona-gradient — rest blijft wit. Simpele claim, geen
 * beloftes die we niet waarmaken.
 */
export default function LoadingScreen() {
  const weerzoneStyle = {
    background: "linear-gradient(90deg, #22c55e, #ef4444, #3b82f6)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
  } as const;

  return (
    <div
      className="flex flex-col items-center justify-center min-h-screen px-8 text-center"
      style={{ background: "linear-gradient(160deg, #4a9ee8 0%, #5aafe8 40%, #3b8dd4 100%)" }}
    >
      <LogoFull
        height={180}
        className="animate-pulse drop-shadow-[0_4px_40px_rgba(255,255,255,0.3)]"
      />

      <h1 className="mt-8 text-white font-black text-2xl sm:text-3xl leading-tight max-w-md animate-[fadeInUp_0.8s_ease_0.2s_forwards] opacity-0 drop-shadow">
        Het weer,<br />op jouw postcode.
      </h1>
      <p className="mt-4 text-white/85 text-sm sm:text-base max-w-sm animate-[fadeInUp_0.8s_ease_0.5s_forwards] opacity-0">
        Eén mail per ochtend. <span style={weerzoneStyle} className="font-black">WEERZONE</span> — 48 uur vooruit.
      </p>

      <p className="mt-10 text-white/45 text-xs font-semibold tracking-[0.2em] uppercase animate-[fadeInUp_0.8s_ease_0.9s_forwards] opacity-0">
        Weer ophalen…
      </p>
    </div>
  );
}
