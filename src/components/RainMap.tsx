"use client";

import "leaflet/dist/leaflet.css";
import { useEffect, useRef, useState } from "react";

// Buienradar radar image geographic bounds (WGS84)
const NL_BOUNDS: [[number, number], [number, number]] = [[49.36, 0.14], [55.97, 10.26]];

interface RadarFrame {
  time: number;
  url: string;
}

function formatUTCTimestamp(d: Date): string {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getUTCFullYear()}${p(d.getUTCMonth() + 1)}${p(d.getUTCDate())}${p(d.getUTCHours())}${p(d.getUTCMinutes())}`;
}

function buildFrames(): RadarFrame[] {
  const interval = 5 * 60 * 1000;
  const now = Math.floor(Date.now() / interval) * interval;
  const frames: RadarFrame[] = [];
  // 24 past frames = 2 hours of radar history
  for (let i = -23; i <= 0; i++) {
    const t = now + i * interval;
    frames.push({
      time: t,
      url: `https://api.buienradar.nl/image/1.0/RadarMapNL?w=700&h=765&timestamp=${formatUTCTimestamp(new Date(t))}`,
    });
  }
  return frames;
}

interface Props {
  lat: number;
  lon: number;
}

export default function RainMap({ lat, lon }: Props) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const overlayRef = useRef<any>(null);
  const [frames] = useState<RadarFrame[]>(buildFrames);
  const [currentIdx, setCurrentIdx] = useState(frames.length - 1);
  const [isPlaying, setIsPlaying] = useState(true);
  const [mapReady, setMapReady] = useState(false);

  // Initialize Leaflet map
  useEffect(() => {
    const el = mapRef.current;
    if (!el || (el as any)._leaflet_id) return;

    let cancelled = false;
    import("leaflet").then(({ default: L }) => {
      if (cancelled) return;
      const container = mapRef.current;
      if (!container || (container as any)._leaflet_id) return;

      const map = L.map(container, {
        center: [lat, lon],
        zoom: 7,
        minZoom: 5,
        maxZoom: 10,
        zoomControl: true,
        attributionControl: false,
      });

      L.tileLayer("https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png", {
        maxZoom: 19,
      }).addTo(map);

      // Labels pane sits above radar overlay
      map.createPane("labels");
      const labelsEl = map.getPane("labels") as HTMLElement;
      labelsEl.style.zIndex = "650";
      labelsEl.style.pointerEvents = "none";
      L.tileLayer("https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}{r}.png", {
        maxZoom: 19,
        pane: "labels",
      }).addTo(map);

      // Location marker
      L.circleMarker([lat, lon], {
        radius: 7,
        fillColor: "#3b7ff0",
        color: "#ffffff",
        weight: 2.5,
        fillOpacity: 1,
        pane: "labels",
      }).addTo(map);

      mapInstance.current = map;
      setMapReady(true);
    });

    return () => {
      cancelled = true;
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
        overlayRef.current = null;
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Swap radar overlay on frame change
  useEffect(() => {
    if (!mapReady || !mapInstance.current || frames.length === 0) return;
    import("leaflet").then(({ default: L }) => {
      if (!mapInstance.current) return;
      if (overlayRef.current) {
        mapInstance.current.removeLayer(overlayRef.current);
      }
      const overlay = L.imageOverlay(frames[currentIdx].url, NL_BOUNDS, { opacity: 0.75 });
      overlay.addTo(mapInstance.current);
      overlayRef.current = overlay;
    });
  }, [currentIdx, frames, mapReady]);

  // Autoplay loop
  useEffect(() => {
    if (!isPlaying || frames.length === 0) return;
    const id = setInterval(
      () => setCurrentIdx(i => (i + 1) % frames.length),
      600,
    );
    return () => clearInterval(id);
  }, [isPlaying, frames.length]);

  const frame = frames[currentIdx];
  const timeStr = frame
    ? new Date(frame.time).toLocaleTimeString("nl-NL", {
        timeZone: "Europe/Amsterdam",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "--:--";
  const isLatest = currentIdx === frames.length - 1;

  return (
    <div className="card overflow-hidden">
      {/* Header */}
      <div className="px-5 pt-4 pb-3 flex items-center justify-between">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-0.5">
            Radar · 2 uur terugkijken
          </p>
          <h3 className="text-sm font-black text-slate-800 leading-none">Regenradar</h3>
        </div>
        <div className="flex items-center gap-2">
          {isLatest ? (
            <span className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse inline-block" />
              Nu
            </span>
          ) : (
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
              {timeStr}
            </span>
          )}
        </div>
      </div>

      {/* Map */}
      <div ref={mapRef} style={{ height: 380 }} className="w-full bg-slate-100" />

      {/* Controls */}
      <div className="px-4 py-3 flex items-center gap-3 border-t border-slate-100">
        <button
          onClick={() => setIsPlaying(p => !p)}
          className="text-[10px] font-black uppercase tracking-widest text-[#3b7ff0] hover:text-blue-700 transition-colors shrink-0 w-14"
        >
          {isPlaying ? "⏸ Stop" : "▶ Speel"}
        </button>
        <div className="flex-1">
          <input
            type="range"
            min={0}
            max={frames.length - 1}
            value={currentIdx}
            onChange={e => {
              setCurrentIdx(+e.target.value);
              setIsPlaying(false);
            }}
            className="w-full accent-[#3b7ff0]"
          />
          <div className="flex justify-between mt-0.5">
            <span className="text-[9px] text-slate-400">
              {new Date(frames[0]?.time).toLocaleTimeString("nl-NL", {
                timeZone: "Europe/Amsterdam",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
            <span className="text-[9px] text-slate-400 font-black text-emerald-600">Nu</span>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="px-4 pb-3 flex flex-wrap items-center gap-x-4 gap-y-1">
        {[
          { color: "#a5f3fc", label: "Licht" },
          { color: "#38bdf8", label: "Matig" },
          { color: "#0ea5e9", label: "Zwaar" },
          { color: "#0369a1", label: "Hevig" },
        ].map(({ color, label }) => (
          <span key={label} className="flex items-center gap-1 text-[9px] text-slate-400">
            <span className="w-2 h-2 rounded-sm inline-block" style={{ background: color }} />
            {label}
          </span>
        ))}
        <span className="ml-auto text-[9px] text-slate-400">Bron: Buienradar · © CARTO</span>
      </div>
    </div>
  );
}
