import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ALL_PLACES, findPlace, placeSlug, nearbyPlaces } from "@/lib/places-data";
import WeatherDashboard from "@/components/WeatherDashboard";
import { getLocationSEOContent } from "@/app/actions";
import { fetchWeatherData } from "@/lib/weather";
import Link from "next/link";
import { getLocationWeatherProfile } from "@/lib/location-profile";
import {
  FR_REGION_TO_PROVINCE,
  FR_REGION_LABELS,
  PROVINCE_TO_FR_REGION,
} from "@/config/locales";

interface PageProps {
  params: Promise<{ region: string; ville: string }>;
}

export function generateStaticParams() {
  return ALL_PLACES.filter((p) => {
    const reg = PROVINCE_TO_FR_REGION[p.province as keyof typeof PROVINCE_TO_FR_REGION];
    return reg && p.population && p.population >= 20000;
  }).map((p) => ({
    region: PROVINCE_TO_FR_REGION[p.province as keyof typeof PROVINCE_TO_FR_REGION]!,
    ville: placeSlug(p.name),
  }));
}

export const revalidate = 300;

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { region, ville } = await params;
  const province = FR_REGION_TO_PROVINCE[region];
  if (!province) return {};
  const place = findPlace(province, ville);
  if (!place) return {};
  const label = FR_REGION_LABELS[region] ?? region;

  return {
    title: `Météo ${place.name} | Prévisions 48h ${label} | WEERZONE`,
    description: `Météo actuelle à ${place.name} (${label}). Prévisions horaires pour la température, la pluie et le vent — 48 heures à l'avance, avec une précision de 1 km.`,
    robots: { index: true, follow: true },
    alternates: {
      canonical: `https://weerzone.nl/fr/meteo/${region}/${ville}`,
      languages: {
        "fr-FR": `https://weerzone.nl/fr/meteo/${region}/${ville}`,
        "x-default": `https://weerzone.nl/fr/meteo/${region}/${ville}`,
      },
    },
    openGraph: {
      title: `Météo ${place.name} — WEERZONE`,
      description: `Prévisions météo à 48h pour ${place.name} en ${label}.`,
      type: "website",
      locale: "fr_FR",
      url: `https://weerzone.nl/fr/meteo/${region}/${ville}`,
      siteName: "WEERZONE",
    },
  };
}

export default async function VilleWeatherPage({ params }: PageProps) {
  const { region, ville } = await params;
  const province = FR_REGION_TO_PROVINCE[region];
  if (!province) notFound();

  const place = findPlace(province, ville);
  if (!place) notFound();

  const label = FR_REGION_LABELS[region] ?? region;

  const [initialWeather, marianaSeoText] = await Promise.all([
    fetchWeatherData(place.lat, place.lon, false, false, undefined, "fr"),
    // @ts-ignore
    getLocationSEOContent(place.name, label, place.character, "fr").catch(() => null),
  ]);

  const nearby = nearbyPlaces(place, 8).filter((p) =>
    PROVINCE_TO_FR_REGION[p.province as keyof typeof PROVINCE_TO_FR_REGION],
  );

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "WEERZONE", item: "https://weerzone.nl/fr" },
      { "@type": "ListItem", position: 2, name: "Météo", item: "https://weerzone.nl/fr/meteo" },
      { "@type": "ListItem", position: 3, name: label, item: `https://weerzone.nl/fr/meteo/${region}` },
      {
        "@type": "ListItem",
        position: 4,
        name: place.name,
        item: `https://weerzone.nl/fr/meteo/${region}/${ville}`,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main>
        <WeatherDashboard
          initialCity={place}
          initialWeather={initialWeather}
          locale="fr"
          beforeFooter={
            <div className="space-y-6 pt-10">
              {/* CTAs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Link
                  href={`/app/signup?tier=piet&lang=fr&city=${encodeURIComponent(place.name)}`}
                  className="group flex flex-col items-center justify-center p-8 rounded-[32px] bg-[#10b981] text-white shadow-xl hover:scale-[1.02] transition-all text-center border border-white/20"
                >
                  <span className="text-3xl mb-3">📬</span>
                  <span className="font-black text-sm uppercase tracking-tight leading-none mb-1">
                    Activer Piet tous les jours
                  </span>
                  <span className="text-[10px] opacity-60 font-bold uppercase tracking-widest italic">
                    Gratuit pour {place.name}
                  </span>
                </Link>
                <Link
                  href="/fr/tarifs#reed"
                  className="group flex flex-col items-center justify-center p-8 rounded-[32px] bg-white/5 border border-white/10 text-white shadow-xl hover:scale-[1.02] transition-all text-center backdrop-blur-sm"
                >
                  <span className="text-3xl mb-3">⚡</span>
                  <span className="font-black text-sm uppercase tracking-tight leading-none mb-1">
                    Alertes Reed
                  </span>
                  <span className="text-[10px] text-white/40 font-bold uppercase tracking-widest italic">
                    Limites météo personnelles
                  </span>
                </Link>
              </div>

              {/* Lokales Profil */}
              <div className="bg-white/5 backdrop-blur-md rounded-[40px] p-8 border border-white/10 shadow-2xl">
                <h2 className="text-sm font-black text-white uppercase tracking-widest mb-4">
                  Météo à {place.name} — Profil local
                </h2>
                <p className="text-white/65 text-xs leading-relaxed italic" data-speakable>
                  {marianaSeoText ||
                    `${place.name} est situé en ${label}. WEERZONE fournit des prévisions mises à jour toutes les heures avec une résolution de 1 km — directement pour votre rue, pas seulement pour la ville.`}
                </p>
              </div>

              {/* Back to Region */}
              <div className="text-center">
                <Link
                  href={`/fr/meteo/${region}`}
                  className="text-sm text-text-secondary hover:text-text-primary transition-colors"
                >
                  ← Tous les lieux en {label}
                </Link>
              </div>

              {/* Nearby FR cities */}
              {nearby.length > 0 && (
                <div>
                  <h2 className="text-xs font-black uppercase tracking-[0.2em] text-white/40 mb-4">
                    À proximité
                  </h2>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {nearby.map((p) => {
                      const pReg =
                        PROVINCE_TO_FR_REGION[
                          p.province as keyof typeof PROVINCE_TO_FR_REGION
                        ];
                      if (!pReg) return null;
                      return (
                        <Link
                          key={p.name}
                          href={`/fr/meteo/${pReg}/${placeSlug(p.name)}`}
                          className="card p-3 hover:border-[#10b981]/50 transition-all border border-white/5 text-center"
                        >
                          <span className="text-sm font-bold text-text-primary">{p.name}</span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          }
        />
      </main>
    </>
  );
}
