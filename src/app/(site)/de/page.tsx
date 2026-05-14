import type { Metadata } from "next";
import Link from "next/link";
import { DE_BUNDESLAND_LABELS, DE_BUNDESLAND_SLUGS } from "@/config/locales";

export const metadata: Metadata = {
  title: "Wetter Deutschland heute | Lokale 48-Stunden Wettervorhersage | WEERZONE",
  description:
    "Aktuelles Wetter für Deutschland. Präzise lokale Wettervorhersagen, Temperaturen, Regenwahrscheinlichkeit, Wind und Warnungen für die nächsten 48 Stunden.",
  alternates: {
    canonical: "https://weerzone.nl/de",
    languages: {
      "nl-NL": "https://weerzone.nl",
      "de-DE": "https://weerzone.nl/de",
      "x-default": "https://weerzone.nl",
    },
  },
  openGraph: {
    title: "Wetter Deutschland | WEERZONE",
    description: "Hyperlokal, präzise, 48 Stunden voraus.",
    url: "https://weerzone.nl/de",
    locale: "de_DE",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "WEERZONE Deutschland",
  description: "Hyperlokal Wettervorhersage für alle Bundesländer und Orte in Deutschland.",
  url: "https://weerzone.nl/de",
  inLanguage: "de-DE",
};

export default function DeutschlandHomepage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main className="max-w-4xl mx-auto px-6 py-16 space-y-16">
        {/* Hero */}
        <section className="text-center space-y-6">
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-text-primary">
            Wetter Deutschland
          </h1>
          <p className="text-lg text-text-secondary max-w-xl mx-auto leading-relaxed">
            Hyperlokal, 48 Stunden voraus. Für dein Bundesland, deine Stadt, deine Straße.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/de/wetter" className="btn btn-primary">
              Wetter suchen
            </Link>
            <Link href="/de/preise" className="btn btn-ghost">
              Karl kennenlernen
            </Link>
          </div>
        </section>

        {/* Karl persona pitch */}
        <section className="card p-8 border border-white/10 bg-white/5 rounded-[32px]">
          <div className="flex gap-4 items-start">
            <div className="w-12 h-12 rounded-full bg-[#22c55e] flex items-center justify-center text-2xl font-black text-white shrink-0">
              K
            </div>
            <div>
              <h2 className="text-xl font-black text-text-primary mb-2">Karl — dein Wetterassistent</h2>
              <p className="text-text-secondary leading-relaxed">
                Jeden Morgen vor 7 Uhr in deinem Posteingang: Was das Wetter heute und morgen für
                deine genaue Adresse bedeutet. Klar, direkt, ohne Schnickschnack.
              </p>
              <Link href="/de/preise" className="inline-block mt-4 text-sm font-bold text-[#22c55e] hover:underline">
                Karl kostenlos testen →
              </Link>
            </div>
          </div>
        </section>

        {/* Bundesland overzicht */}
        <section>
          <h2 className="text-xs font-black uppercase tracking-[0.2em] text-white/40 mb-6">
            Alle Bundesländer
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {DE_BUNDESLAND_SLUGS.map((slug) => (
              <Link
                key={slug}
                href={`/de/wetter/${slug}`}
                className="card p-4 border border-white/5 hover:border-accent-orange/40 transition-all rounded-2xl text-sm font-bold text-text-primary"
              >
                {DE_BUNDESLAND_LABELS[slug] ?? slug}
              </Link>
            ))}
          </div>
        </section>

        {/* Schnellzugriff Großstädte */}
        <section>
          <h2 className="text-xs font-black uppercase tracking-[0.2em] text-white/40 mb-6">
            Schnellzugriff Großstädte
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {[
              { label: "Berlin", href: "/de/wetter/berlin/berlin" },
              { label: "Hamburg", href: "/de/wetter/hamburg/hamburg" },
              { label: "München", href: "/de/wetter/bayern/munchen" },
              { label: "Köln", href: "/de/wetter/nordrhein-westfalen/koln" },
              { label: "Frankfurt", href: "/de/wetter/hessen/frankfurt-am-main" },
              { label: "Stuttgart", href: "/de/wetter/baden-wuerttemberg/stuttgart" },
              { label: "Düsseldorf", href: "/de/wetter/nordrhein-westfalen/dusseldorf" },
              { label: "Leipzig", href: "/de/wetter/sachsen/leipzig" },
            ].map((city) => (
              <Link
                key={city.href}
                href={city.href}
                className="card p-4 border border-white/5 hover:border-accent-orange/40 transition-all rounded-2xl text-sm font-bold text-text-primary"
              >
                {city.label}
              </Link>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
