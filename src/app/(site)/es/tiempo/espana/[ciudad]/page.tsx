import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ALL_PLACES, findPlace, placeRouteSlug, nearbyPlaces } from "@/lib/places-data";
import { fetchWeatherData, getWeatherDescription, getWeatherEmoji, getWindBeaufort } from "@/lib/weather";
import { getLocationSEOContent, getJuanWeatherVerdict } from "@/app/actions";

interface PageProps {
  params: Promise<{ ciudad: string }>;
}

function spanishCharacterLabel(character?: string): string {
  if (character === "mediterranean coastal") return "costa mediterranea";
  if (character === "atlantic coastal") return "costa atlantica";
  if (character === "mountain") return "montana";
  if (character === "urban") return "ciudad";
  if (character === "northern continental") return "interior norte";
  return "interior";
}

function spanishRegionLabel(character?: string): string {
  if (character === "mediterranean coastal") return "Espana mediterranea";
  if (character === "atlantic coastal") return "Espana atlantica e islas";
  if (character === "mountain") return "zonas de montana";
  if (character === "urban") return "ciudad espanola";
  if (character === "northern continental") return "interior norte";
  return "Espana interior";
}

export function generateStaticParams() {
  return ALL_PLACES
    .filter((place) => place.province === "spanje" && (place.population ?? 0) >= 100000)
    .map((place) => ({ ciudad: placeRouteSlug(place) }));
}

export const revalidate = 300;

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { ciudad } = await params;
  const place = findPlace("spanje", ciudad);
  if (!place) return {};

  return {
    title: `Tiempo en ${place.name} | Prevision 48 horas | WEERZONE`,
    description: `Consulta el tiempo en ${place.name}, Espana. Prevision local de 48 horas con temperatura, lluvia, viento y el comentario de Juan.`,
    robots: { index: true, follow: true },
    alternates: {
      canonical: `https://weerzone.nl/es/tiempo/espana/${ciudad}`,
      languages: {
        "es-ES": `https://weerzone.nl/es/tiempo/espana/${ciudad}`,
        "nl-NL": `https://weerzone.nl/weer/spanje/${ciudad}`,
        "x-default": `https://weerzone.nl/es/tiempo/espana/${ciudad}`,
      },
    },
    openGraph: {
      title: `Tiempo en ${place.name} | WEERZONE`,
      description: `Prevision local para ${place.name}: lluvia, viento, temperatura y ventanas secas.`,
      type: "website",
      locale: "es_ES",
      url: `https://weerzone.nl/es/tiempo/espana/${ciudad}`,
      siteName: "WEERZONE",
    },
  };
}

export default async function SpainCityWeatherPage({ params }: PageProps) {
  const { ciudad } = await params;
  const place = findPlace("spanje", ciudad);
  if (!place) notFound();

  const regionLabel = spanishRegionLabel(place.character);
  const characterLabel = spanishCharacterLabel(place.character);

  const weather = await fetchWeatherData(place.lat, place.lon, false, false, place, "es").catch(() => null);
  const [juanVerdict, seoText] = await Promise.all([
    weather ? getJuanWeatherVerdict(weather, place.name, regionLabel, place.character).catch(() => null) : null,
    getLocationSEOContent(place.name, regionLabel, place.character, "es").catch(() => null),
  ]);
  const nearby = nearbyPlaces(place, 10).filter((candidate) => candidate.province === "spanje");
  const wind = weather ? getWindBeaufort(weather.current.windSpeed, "es") : null;
  const now = weather?.current;
  const today = weather?.daily[0];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WeatherForecast",
    name: `Tiempo en ${place.name}`,
    areaServed: {
      "@type": "City",
      name: place.name,
      addressCountry: "ES",
    },
    url: `https://weerzone.nl/es/tiempo/espana/${ciudad}`,
    provider: {
      "@type": "Organization",
      name: "WEERZONE",
      url: "https://weerzone.nl",
    },
  };

  return (
    <main className="min-h-screen bg-[#f7f4ee] text-slate-950">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <section className="border-b border-slate-950/10 bg-[#fffaf0]">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
          <Link href="/es/tiempo/espana" className="text-sm font-black tracking-[0.18em] text-slate-950">
            WEERZONE ESPANA
          </Link>
          <Link href={`/weer/spanje/${ciudad}`} className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500 hover:text-slate-950">
            Version NL
          </Link>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-8 px-5 py-10 lg:grid-cols-[1.2fr_0.8fr] lg:py-14">
        <div>
          <p className="mb-3 text-xs font-black uppercase tracking-[0.22em] text-amber-700">
            {regionLabel} · 48 horas
          </p>
          <h1 className="max-w-3xl text-4xl font-black leading-none tracking-tight sm:text-6xl">
            Tiempo en {place.name}
          </h1>
          <p className="mt-5 max-w-2xl text-base font-medium leading-7 text-slate-700">
            Prevision hiperlocal para {place.name}: lluvia, viento, temperatura y ventanas secas para decidir si conviene salir, pasear, ir a la terraza o esperar.
          </p>
        </div>

        <div className="rounded-lg border border-slate-950/10 bg-white p-5 shadow-sm">
          {now ? (
            <>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">Ahora</p>
                  <p className="mt-2 text-5xl font-black leading-none">{Math.round(now.temperature)}°</p>
                </div>
                <div className="text-5xl">{getWeatherEmoji(now.weatherCode, now.isDay)}</div>
              </div>
              <p className="mt-4 text-lg font-black">{getWeatherDescription(now.weatherCode, "es")}</p>
              <p className="mt-1 text-sm font-semibold text-slate-600">
                Sensacion {Math.round(now.feelsLike)}° · lluvia {now.precipitation} mm · viento {Math.round(now.windSpeed)} km/h
              </p>
            </>
          ) : (
            <p className="text-sm font-semibold text-slate-600">
              La prevision se actualiza cada pocos minutos. Vuelve a cargar la pagina si los datos aun no aparecen.
            </p>
          )}
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-4 px-5 pb-10 md:grid-cols-4">
        <div className="rounded-lg border border-slate-950/10 bg-white p-5">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-500">Maxima hoy</p>
          <p className="mt-2 text-3xl font-black">{today ? `${Math.round(today.tempMax)}°` : "-"}</p>
        </div>
        <div className="rounded-lg border border-slate-950/10 bg-white p-5">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-500">Lluvia hoy</p>
          <p className="mt-2 text-3xl font-black">{today ? `${today.precipitationSum} mm` : "-"}</p>
        </div>
        <div className="rounded-lg border border-slate-950/10 bg-white p-5">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-500">Viento</p>
          <p className="mt-2 text-3xl font-black">{wind ? wind.label : "-"}</p>
        </div>
        <div className="rounded-lg border border-slate-950/10 bg-white p-5">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-500">Contexto local</p>
          <p className="mt-2 text-xl font-black capitalize">{characterLabel}</p>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-6 px-5 pb-16 lg:grid-cols-[0.85fr_1.15fr]">
        <div className="rounded-lg border border-amber-700/20 bg-amber-50 p-6">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-amber-600 text-lg font-black text-white">J</div>
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-amber-800">Juan</p>
              <h2 className="text-xl font-black">La lectura local</h2>
            </div>
          </div>
          <p className="text-sm font-semibold leading-7 text-slate-700">
            {juanVerdict || `Juan mira ${place.name} con contexto local: ${characterLabel}, viento, lluvia y temperatura de las proximas 48 horas.`}
          </p>
        </div>

        <div className="rounded-lg border border-slate-950/10 bg-white p-6">
          <h2 className="text-xl font-black">Por que el tiempo aqui cambia</h2>
          <p className="mt-3 text-sm font-semibold leading-7 text-slate-700">
            {seoText || `En ${place.name}, el tiempo depende del caracter local: ${characterLabel}. Mariana compara los modelos disponibles y prioriza la decision practica para las proximas 48 horas.`}
          </p>
          {weather?.hourly?.length ? (
            <div className="mt-6 grid gap-2 sm:grid-cols-4">
              {weather.hourly.slice(0, 8).map((hour) => (
                <div key={hour.time} className="rounded-md bg-slate-50 p-3">
                  <p className="text-xs font-black text-slate-500">{new Date(hour.time).getHours()}:00</p>
                  <p className="mt-1 text-lg font-black">{Math.round(hour.temperature)}°</p>
                  <p className="text-xs font-semibold text-slate-600">{hour.precipitation} mm</p>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </section>

      {nearby.length > 0 && (
        <section className="mx-auto max-w-6xl px-5 pb-20">
          <h2 className="mb-4 text-xs font-black uppercase tracking-[0.2em] text-slate-500">Cerca de {place.name}</h2>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
            {nearby.map((candidate) => (
              <Link
                key={`${candidate.province}/${placeRouteSlug(candidate)}`}
                href={`/es/tiempo/espana/${placeRouteSlug(candidate)}`}
                className="rounded-lg border border-slate-950/10 bg-white p-4 text-sm font-black hover:border-amber-600"
              >
                {candidate.name}
              </Link>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
