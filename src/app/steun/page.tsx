import { Metadata } from "next";
import Link from "next/link";
import SupportForm from "@/components/SupportForm";
import WeatherBackground from "@/components/WeatherBackground";
import { fetchWeatherData } from "@/lib/weather";
import { DUTCH_CITIES } from "@/lib/types";

export const metadata: Metadata = {
  title: "Laat ons groeien - Steun Weerzone",
  description: "Draag bij aan de groei van Weerzone met een vrijwillige bijdrage.",
};

export default async function SteunPage() {
  const amsterdam = DUTCH_CITIES.find(c => c.name === "Amsterdam") || DUTCH_CITIES[0];
  const weather = await fetchWeatherData(amsterdam.lat, amsterdam.lon).catch(() => null);

  const weatherCode = weather?.current.weatherCode ?? 0;
  const isDay = weather?.current.isDay ?? true;

  return (
    <div className="min-h-screen relative overflow-x-hidden">
      <WeatherBackground weatherCode={weatherCode} isDay={isDay} />
      
      <div className="relative z-10 max-w-2xl mx-auto p-4 pb-20 sm:p-6 flex flex-col items-center">
        <div className="text-center mt-12 mb-10">
          <Link href="/" className="inline-block mb-8 text-white/50 hover:text-white font-bold text-sm tracking-widest uppercase transition-colors">
            ← Terug naar Weerzone
          </Link>
          <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight mb-4 drop-shadow-md">
            Support voor een koekje 🍪
          </h1>
          <p className="text-lg text-white/70 leading-relaxed max-w-lg mx-auto font-medium">
            Weerzone is onafhankelijk. Jouw bijdrage houdt de servers draaiend en maakt nieuwe tools mogelijk.
          </p>
        </div>

        <SupportForm />
        
        <div className="mt-12 text-center">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-white/30">
            Groei jij mee?!
          </p>
        </div>
      </div>
    </div>
  );
}
