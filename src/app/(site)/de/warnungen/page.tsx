import type { Metadata } from "next";
import WeatherDashboard from "@/components/WeatherDashboard";
import ReedExtended from "@/components/ReedExtended";
import PremiumGate from "@/components/PremiumGate";
import { getSavedLocationServer } from "@/lib/location-cookies";
import { ALL_PLACES } from "@/lib/places-data";
import { fetchWeatherData } from "@/lib/weather";
import { fetchEstofexBeneluxSummary, summarizeEstofexNL } from "@/lib/estofex";
import LocateButton from "@/components/LocateButton";
import { Check, AlertTriangle } from "lucide-react";

export const metadata: Metadata = {
  title: "Warnungen — Extremwetter-Alarme",
  description:
    "Weerzone warnt vor Sturm, Gewitter, Hitze, Frost und schwerem Niederschlag. Nur wenn wirklich etwas im Anmarsch ist — kein Rauschen.",
  alternates: {
    canonical: "https://weerzone.nl/de/warnungen",
    languages: {
      "nl-NL": "https://weerzone.nl/waarschuwingen",
      "de-DE": "https://weerzone.nl/de/warnungen",
      "x-default": "https://weerzone.nl/waarschuwingen",
    },
  },
  keywords: [
    "wetterwarnungen",
    "DWD warnungen",
    "unwetterwarnung",
    "sturmwarnung",
    "gewitterwarnung",
    "hitzewarnung",
    "frostwarnung",
  ],
  openGraph: {
    title: "Warnungen vor Extremwetter | WEERZONE",
    description:
      "Aktuelle Warnungen vor Sturm, Gewitter, Hitze, Frost und schwerem Niederschlag. Nur Meldungen, die wirklich zählen.",
    type: "website",
    locale: "de_DE",
    url: "https://weerzone.nl/de/warnungen",
    siteName: "WEERZONE",
  },
  twitter: {
    card: "summary_large_image",
    title: "Warnungen vor Extremwetter",
    description: "Aktuelle Warnungen für dein Bundesland, ohne Rauschen.",
  },
};

const berlin = ALL_PLACES.find((p) => p.name === "Berlin") ?? ALL_PLACES[0];

export default async function WarnungenPage() {
  const loc = await getSavedLocationServer().catch(() => null);
  const activeLoc = loc || berlin;
  const lat = activeLoc.lat;
  const lon = activeLoc.lon;

  const [initialWeather, estofex] = await Promise.all([
    fetchWeatherData(lat, lon, false, false, undefined, "de").catch(() => undefined),
    fetchEstofexBeneluxSummary(2).catch(() => null),
  ]);

  const estofexSummary = estofex ? summarizeEstofexNL(estofex) : null;
  const provinceVal = ("province" in activeLoc ? (activeLoc as { province?: string }).province : undefined);
  const regionLabel: string = provinceVal || "Deutschland";

  return (
    <main>
      <WeatherDashboard
        initialCity={activeLoc}
        initialWeather={initialWeather}
        initialWeatherCode={initialWeather?.current.weatherCode}
        initialIsDay={initialWeather?.current.isDay}
        hideWeatherInfo={true}
        locale="de"
        beforeFooter={
          <div className="space-y-6">
            <div className="card p-6 sm:p-8">
              <div className="flex items-center gap-2 mb-3">
                <span className="w-3 h-3 rounded-full bg-emerald-500" />
                <span className="text-xs font-black uppercase tracking-widest text-emerald-700 px-2 py-0.5 rounded bg-emerald-50">
                  Code grün
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight mb-2">
                Warnungen für {regionLabel}
              </h1>
              <p className="text-sm text-slate-600 leading-relaxed mb-5">
                Aktuell ruhig — keine aktiven Warnungen.{" "}
                <span className="text-slate-400">
                  Wir melden nur Sturm, Gewitter, Hitze, Frost oder schweren Niederschlag — kein Rauschen.
                </span>
              </p>
              <div className="flex items-center gap-3 flex-wrap">
                <LocateButton
                  compact
                  label="Anderes Bundesland? Nutze GPS"
                  className="!text-slate-900 !bg-slate-100 !border-slate-200 hover:!bg-slate-200"
                />
                <span className="text-[11px] text-slate-400 font-medium">
                  Standort: <strong className="text-slate-700">{activeLoc.name}</strong>
                </span>
              </div>
            </div>

            <div className="rounded-3xl bg-emerald-500/10 border border-emerald-400/30 p-6 flex items-start gap-4">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 flex items-center justify-center flex-none">
                <Check className="w-5 h-5 text-emerald-300" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-black text-emerald-100 mb-1">Keine aktiven Warnungen</p>
                <p className="text-xs text-emerald-200/80 leading-relaxed">
                  Aktuell liegen keine offiziellen Warnungen vor. Sobald sich das ändert, bekommst
                  du (falls aktiviert) direkt eine Meldung.
                </p>
              </div>
            </div>

            {estofex && estofexSummary && (
              <div className="rounded-3xl bg-white/5 backdrop-blur-md border border-white/10 p-5">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-3.5 h-3.5 text-white/50" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-white/50">
                    Europäische Aussicht
                  </span>
                  <span
                    className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${
                      estofex.maxLevel >= 3
                        ? "bg-rose-500/30 text-rose-100"
                        : estofex.maxLevel >= 2
                        ? "bg-orange-500/30 text-orange-100"
                        : "bg-yellow-500/30 text-yellow-100"
                    }`}
                  >
                    Level {estofex.maxLevel}
                  </span>
                </div>
                <p className="text-sm text-white/85 leading-relaxed">{estofexSummary}</p>
                <p className="text-[10px] text-white/40 mt-3">
                  Quelle: ESTOFEX (Europäische Gewitter-Aussicht) · aktualisiert 1–2× pro Tag
                </p>
              </div>
            )}

            <PremiumGate tierRequired="reed">
              <ReedExtended initialCity={loc || undefined} />
            </PremiumGate>
          </div>
        }
      />
    </main>
  );
}
