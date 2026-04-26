"use client";

import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import Link from "next/link";
import { MapPin, Send, RefreshCw, Thermometer, CloudRain, Wind, AlertTriangle, Sun, Users, Terminal, Search, Zap } from "lucide-react";
import Logo from "./Logo";
import PersonaBadge from "./PersonaBadge";
import PremiumGate from "./PremiumGate";
import { useSession } from "@/lib/session-context";
import LoadingScreen from "./LoadingScreen";
import { loadWeather, loadWWS } from "@/lib/weatherCache";
import { DUTCH_CITIES, reverseGeocode, type City, type WeatherData, type WWSPayload } from "@/lib/types";
import {
  getFietsScore,
  getBbqScore,
  getStrandScore,
  getHooikoortsScore,
  getTerrasScore,
  getWandelScore,
} from "@/lib/commentary";
import { getWeatherEmoji, getWeatherDescription, getWindBeaufort } from "@/lib/weather";
import { motion, AnimatePresence } from "framer-motion";
import AffiliateCard from "./AffiliateCard";
import AmazonStickyBar from "./AmazonStickyBar";
import EmailSubscribe from "./EmailSubscribe";
import NavBar from "./NavBar";
import Footer from "./Footer";
import LocationSearch from "./LocationSearch";
import dynamic from "next/dynamic";

const WeatherBackground = dynamic(() => import("./WeatherBackground"));
const RainRadar = dynamic(() => import("./RainRadar"), {
  ssr: false,
  loading: () => <div className="card p-4 text-center text-xs text-text-secondary">Radar laadt…</div>,
});

interface DashboardProps {
  initialCity?: City;
  initialWeather?: WeatherData;
  beforeFooter?: React.ReactNode;
  titleOverride?: string;
}

function getSavedCity(): City | null {
  if (typeof window === "undefined") return null;
  try {
    const saved = localStorage.getItem("wz_city");
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.name && typeof parsed.lat === "number" && typeof parsed.lon === "number") {
        return { name: parsed.name, lat: parsed.lat, lon: parsed.lon };
      }
    }
  } catch {}
  return null;
}

export default function WeatherDashboard({ initialCity, initialWeather, beforeFooter, titleOverride }: DashboardProps) {
  const [city, setCity] = useState<City>(initialCity || getSavedCity() || DUTCH_CITIES.find(c => c.name === "De Bilt") || DUTCH_CITIES[0]);
  const [weather, setWeather] = useState<WeatherData | null>(initialWeather || null);
  const [wws, setWWS] = useState<WWSPayload | null>(null);
  const [loading, setLoading] = useState(!initialWeather);
  const [hourlyMetric, setHourlyMetric] = useState<"temp" | "rain" | "wind">("temp");
  const [isLocating, setIsLocating] = useState(false);
  const { tier } = useSession();

  const handleCityChange = useCallback((newCity: City) => {
    setCity(newCity);
    localStorage.setItem("wz_city", JSON.stringify(newCity));
  }, []);

  const loadData = useCallback(async (targetCity: City) => {
    let cancelled = false;
    
    loadWeather(
      targetCity.lat,
      targetCity.lon,
      (verdict) => {
        if (!cancelled) setWeather((prev) => (prev ? { ...prev, summaryVerdict: verdict } : prev));
      },
      (fresh) => {
        if (!cancelled) {
          setWeather(fresh);
          setLoading(false);
        }
      },
      () => {}
    ).then(data => {
      if (!cancelled) {
          setWeather(data);
          setLoading(false);
      }
    });

    loadWWS(targetCity.lat, targetCity.lon).then(wwsPayload => {
      if (!cancelled) setWWS(wwsPayload);
    });

    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    const cleanup = loadData(city);
    const interval = setInterval(() => loadData(city), 15 * 60000);
    return () => {
      cleanup.then(fn => fn && fn());
      clearInterval(interval);
    };
  }, [city, loadData]);

  const locate = () => {
    if (!("geolocation" in navigator)) return;
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude: lat, longitude: lon } = pos.coords;
        reverseGeocode(lat, lon).then((geoCity) => {
          handleCityChange(geoCity);
          setIsLocating(false);
        }).catch(() => {
          handleCityChange({ name: "Mijn locatie", lat, lon });
          setIsLocating(false);
        });
      },
      () => setIsLocating(false),
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 60 * 60000 }
    );
  };

  if (loading || !weather) return <LoadingScreen />;

  return (
    <div className="min-h-screen relative overflow-x-hidden">
      <WeatherBackground weatherCode={weather.current.weatherCode} isDay={weather.current.isDay} />
      
      <div className="relative z-10 max-w-2xl mx-auto px-4 pb-20 pt-6 space-y-6">
        
        {/* COMPACT HEADER */}
        <div className="flex items-center justify-between gap-4 mb-2">
          <Link href="/" className="flex-none transition-transform active:scale-95">
            <Logo size={32} />
          </Link>
          <div className="flex-1 max-w-xs">
            <LocationSearch currentCity={city} onCityChange={handleCityChange} />
          </div>
          <button 
            onClick={locate}
            disabled={isLocating}
            className={`w-10 h-10 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white transition-all active:scale-90 ${isLocating ? 'animate-spin' : ''}`}
          >
            <MapPin className="w-5 h-5" />
          </button>
        </div>

        <NavBar activeCity={city.name} isLocating={isLocating} />

        <div className="flex flex-col gap-6 animate-fade-in">
          
          {/* HERO CARD: FOCUS ON ACTIONABLE ADVICE */}
          <div className="card overflow-hidden relative group shadow-2xl border-white/40">
            <div className="p-6 sm:p-8 relative z-[2]">
              
              {/* Main Numbers */}
              <div className="flex items-center justify-between gap-6">
                <div className="flex flex-col">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-black uppercase tracking-widest text-black bg-black/5 px-2 py-0.5 rounded">Nu</span>
                    {wws && (
                        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                            <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-[8px] font-black text-emerald-700 uppercase tracking-widest">Synthese</span>
                        </div>
                    )}
                  </div>
                  <div className="flex items-start">
                    <span className="text-7xl sm:text-8xl font-black tracking-tighter leading-none text-text-primary">{weather.current.temperature}</span>
                    <span className="text-3xl sm:text-4xl font-black mt-2 ml-0.5 text-text-primary leading-none">°</span>
                  </div>
                  <span className="text-lg font-bold text-text-secondary mt-1">{getWeatherDescription(weather.current.weatherCode)}</span>
                </div>
                
                <div className="text-7xl sm:text-8xl flex items-center justify-center drop-shadow-2xl animate-float">
                  {getWeatherEmoji(weather.current.weatherCode, weather.current.isDay)}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 mt-8 pt-6 border-t border-black/5 text-center">
                 <div className="flex flex-col gap-1">
                   <span className="text-[9px] font-black text-text-muted uppercase tracking-widest">Wind</span>
                   <span className="text-sm font-black text-text-primary">{weather.current.windSpeed} km/h</span>
                 </div>
                 <div className="flex flex-col gap-1">
                   <span className="text-[9px] font-black text-text-muted uppercase tracking-widest">Gevoel</span>
                   <span className="text-sm font-black text-text-primary">{weather.current.feelsLike}°</span>
                 </div>
                 <div className="flex flex-col gap-1">
                   <span className="text-[9px] font-black text-text-muted uppercase tracking-widest">Regen</span>
                   <span className="text-sm font-black text-text-primary">{weather.current.precipitation} mm</span>
                 </div>
              </div>
            </div>
          </div>

          {/* QUICK SCAN: ACTIVITEITEN */}
          <div className="card p-5 border-white/40 shadow-xl">
            <h3 className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] mb-5 px-1">Nu te doen?</h3>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "BBQ", score: getBbqScore(weather), icon: "🍖" },
                { label: "Terras", score: getTerrasScore(weather), icon: "🍻" },
                { label: "Fietsen", score: getFietsScore(weather).score, icon: "🚲" },
                { label: "Wandelen", score: getWandelScore(weather), icon: "🥾" },
                { label: "Strand", score: getStrandScore(weather), icon: "🏖️" },
                { label: "Hooikoorts", score: getHooikoortsScore(weather), icon: "🤧", invert: true },
              ].map((item) => (
                <div key={item.label} className="bg-white/10 border border-white/40 rounded-xl p-3 flex flex-col items-center gap-2">
                  <span className="text-2xl">{item.icon}</span>
                  <div className="w-full bg-black/5 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-1000 ${item.invert ? (item.score < 4 ? 'bg-accent-green' : 'bg-accent-red') : (item.score > 7 ? 'bg-accent-green' : item.score > 4 ? 'bg-accent-amber' : 'bg-accent-red')}`} 
                      style={{ width: `${item.score * 10}%` }} 
                    />
                  </div>
                  <span className="text-[8px] font-black text-text-muted uppercase tracking-tighter">{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
             {/* KORTE TERMIJN */}
             <div className="card p-5 border-white/40">
                <h3 className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-4">Morgen</h3>
                <div className="flex items-center justify-between">
                   <div className="flex items-center gap-4">
                      <span className="text-4xl">{getWeatherEmoji(weather.daily[1].weatherCode, true)}</span>
                      <div className="flex flex-col">
                         <span className="text-xl font-black">{weather.daily[1].tempMax}°</span>
                         <span className="text-[10px] font-bold text-text-muted uppercase">{getWeatherDescription(weather.daily[1].weatherCode)}</span>
                      </div>
                   </div>
                   <div className="text-right">
                      <span className="text-[10px] font-black text-accent-cyan uppercase">{weather.daily[1].precipitationSum.toFixed(1)} mm</span>
                   </div>
                </div>
             </div>
             
             {/* UV / ZON */}
             <div className="card p-5 border-white/40">
                <h3 className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-4">Zon & UV</h3>
                <div className="flex items-center justify-between">
                   <div className="flex items-center gap-4">
                      <Sun className="w-8 h-8 text-wz-sun" />
                      <div className="flex flex-col">
                         <span className="text-xl font-black">UV {weather.uvIndex.toFixed(0)}</span>
                         <span className="text-[10px] font-bold text-text-muted uppercase">Factor {Math.round(weather.uvIndex)}</span>
                      </div>
                   </div>
                   <div className="text-right">
                      <span className="text-[10px] font-black text-wz-sun uppercase">{weather.daily[0].sunHours.toFixed(1)} uur zon</span>
                   </div>
                </div>
             </div>
          </div>

          <EmailSubscribe city={city} />
          <AffiliateCard weather={weather} placeName={city.name} />

          <PremiumGate>
            <div className="card p-6">
              {weather.minutely && weather.minutely.length > 0 && (
                <div className="mb-8 pb-8 border-b border-black/5">
                  <RainRadar data={weather.minutely} />
                </div>
              )}
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-[10px] font-black text-text-muted uppercase tracking-widest">48-uurs verloop</h3>
                <div className="flex items-center gap-1 bg-black/5 rounded-full p-0.5">
                  {[{ k: "temp", i: <Thermometer className="w-3.5 h-3.5" /> }, { k: "rain", i: <CloudRain className="w-3.5 h-3.5" /> }, { k: "wind", i: <Wind className="w-3.5 h-3.5" /> }].map(m => (
                    <button key={m.k} onClick={() => setHourlyMetric(m.k as any)} className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${hourlyMetric === m.k ? 'bg-white shadow-md text-text-primary' : 'text-text-muted hover:text-text-primary'}`}>{m.i}</button>
                  ))}
                </div>
              </div>
              <div className="horizontal-scroll no-scrollbar py-2 -mx-2 px-2 flex gap-3 overflow-x-auto snap-x">
                {weather.hourly.slice(0, 24).map((hour, idx) => {
                  const h = new Date(hour.time).getHours();
                  const isDay = h > 6 && h < 21;
                  return (
                    <div key={hour.time} className={`border rounded-2xl p-4 flex flex-col items-center justify-between min-w-[80px] h-[130px] snap-start transition-colors ${idx === 0 ? 'bg-accent-orange/10 border-accent-orange/40' : 'bg-white/40 border-white/60 hover:bg-white/60'}`}>
                      <div className="text-[9px] font-black text-text-muted uppercase">{idx === 0 ? 'Nu' : `${h}:00`}</div>
                      <div className="text-3xl drop-shadow-sm">{getWeatherEmoji(hour.weatherCode, isDay)}</div>
                      <div className="text-sm font-black">{hourlyMetric === "temp" ? hour.temperature + "°" : hourlyMetric === "rain" ? hour.precipitation.toFixed(1) + "mm" : hour.windSpeed + "km"}</div>
                      <div className="w-full h-1 bg-black/5 rounded-full overflow-hidden"><div className={`h-full ${hour.confidence === "high" ? "bg-accent-green" : "bg-accent-amber"}`} style={{ width: '100%' }} /></div>
                    </div>
                  );
                })}
              </div>
            </div>
          </PremiumGate>
        </div>
        {beforeFooter}
        <Footer />
        <AmazonStickyBar weather={weather} />
      </div>
    </div>
  );
}
