import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Mein Wetter | Karl — Dein lokaler Wetterassistent | WEERZONE",
  description:
    "Personalisierte Wettervorhersage für deine genaue Adresse. Karl schickt dir jeden Morgen das Wichtigste — klar, direkt, ohne Schnickschnack.",
  alternates: {
    canonical: "https://weerzone.nl/de/mein-wetter",
    languages: {
      "nl-NL": "https://weerzone.nl/mijnweer",
      "de-DE": "https://weerzone.nl/de/mein-wetter",
      "x-default": "https://weerzone.nl/mijnweer",
    },
  },
};

export default function MeinWetterPage() {
  return (
    <main className="max-w-2xl mx-auto px-6 py-16 space-y-10">
      {/* Karl persona */}
      <section className="card p-8 rounded-[40px] bg-white/5 border border-white/10">
        <div className="flex gap-4 items-start">
          <div className="w-14 h-14 rounded-full bg-[#22c55e] flex items-center justify-center text-2xl font-black text-white shrink-0">
            K
          </div>
          <div>
            <h1 className="text-2xl font-black text-text-primary mb-1">Karl</h1>
            <p className="text-sm font-semibold text-text-secondary mb-4">Dein lokaler Wetterassistent</p>
            <p className="text-text-secondary leading-relaxed text-sm">
              Jeden Morgen vor 7 Uhr bekommst du eine kurze Mail: Was das Wetter heute und morgen
              an deiner genauen Adresse macht. Kein Rauschen, keine Überraschungen — nur das, was
              du brauchst.
            </p>
          </div>
        </div>
      </section>

      {/* Feature list */}
      <section className="space-y-4">
        <h2 className="text-xs font-black uppercase tracking-[0.2em] text-white/40">Was Karl macht</h2>
        <ul className="space-y-3">
          {[
            ["Vor 7 Uhr in deinem Posteingang", "Jeden Morgen, bevor du den Tag planst."],
            ["Hyperlokal — 1 km Auflösung", "Nicht für deine Stadt. Für deine Straße."],
            ["Du bestimmst den Inhalt", "Fahrrad, Garten, Kinder, Hund — Karl fragt ab, was für dich zählt."],
            ["Stündliches Dashboard", "Schau selbst nach, wenn du willst — Karl erklärt."],
            ["Keine Werbung, kein Tracking", "Deine Wetterdaten gehören dir."],
          ].map(([title, desc]) => (
            <li key={title as string} className="flex gap-3 items-start p-4 rounded-2xl bg-white/5 border border-white/5">
              <span className="text-[#22c55e] font-black mt-0.5">✓</span>
              <div>
                <p className="text-sm font-bold text-text-primary">{title}</p>
                <p className="text-xs text-text-secondary mt-0.5">{desc}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* CTA */}
      <section className="text-center space-y-3">
        <Link href="/app/signup?tier=karl&lang=de" className="btn btn-primary btn-lg w-full max-w-sm">
          Karl kostenlos aktivieren
        </Link>
        <p className="text-xs text-white/30">Keine Kreditkarte, keine Bindung. Beta ist kostenlos.</p>
      </section>

      {/* Reed upgrade */}
      <section className="card p-6 rounded-[32px] bg-red-500/5 border border-red-500/20">
        <div className="flex gap-4 items-start">
          <div className="w-10 h-10 rounded-full bg-red-500 flex items-center justify-center text-lg font-black text-white shrink-0">
            R
          </div>
          <div>
            <h2 className="font-black text-text-primary mb-1">Upgrade auf Reed</h2>
            <p className="text-sm text-text-secondary leading-relaxed">
              Reed warnt dich aktiv, wenn Wetter über deine persönliche Schwelle geht — Wind, Regen,
              Frost, Gewitter. Du bestimmst, was für dich kritisch ist.
            </p>
            <Link href="/de/preise#reed" className="inline-block mt-3 text-sm font-bold text-red-400 hover:underline">
              Reed entdecken →
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
