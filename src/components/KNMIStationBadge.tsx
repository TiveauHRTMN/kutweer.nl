"use client";

import { useEffect, useState } from "react";
import type { KNMIObservation } from "@/lib/knmi-edr";

interface Props {
  lat: number;
  lon: number;
}

export default function KNMIStationBadge({ lat, lon }: Props) {
  const [obs, setObs] = useState<KNMIObservation | null>(null);

  useEffect(() => {
    fetch(`/api/knmi-station?lat=${lat}&lon=${lon}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setObs(d))
      .catch(() => null);
  }, [lat, lon]);

  if (!obs || obs.temperature === null) return null;

  const time = new Date(obs.measuredAt).toLocaleTimeString("nl-NL", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div
      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-white/40 text-[10px] font-black uppercase tracking-widest"
      style={{ background: "rgba(59,130,246,0.10)", color: "#3b7ff0" }}
      title={`Gemeten door KNMI op ${obs.stationName} om ${time}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse shrink-0" />
      KNMI · {obs.temperature !== null ? `${obs.temperature.toFixed(1)}°` : "—"} · {time}
    </div>
  );
}
