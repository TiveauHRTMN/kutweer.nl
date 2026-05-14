import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Über uns | WEERZONE Deutschland",
  description:
    "WEERZONE ist ein niederländischer Wetterdienst, der hyperlokal und präzise Wettervorhersagen für Deutschland liefert — 48 Stunden voraus, bis auf 1 km genau.",
  alternates: {
    canonical: "https://weerzone.nl/de/uber-uns",
    languages: {
      "nl-NL": "https://weerzone.nl/over",
      "de-DE": "https://weerzone.nl/de/uber-uns",
      "x-default": "https://weerzone.nl/over",
    },
  },
};

export default function UberUnsPage() {
  return (
    <main className="max-w-2xl mx-auto px-6 py-16 space-y-12">
      <section>
        <h1 className="text-4xl font-black tracking-tighter text-text-primary mb-4">Über WEERZONE</h1>
        <p className="text-text-secondary leading-relaxed">
          WEERZONE ist ein niederländischer Wetterdienst mit einem klaren Ziel: Wetterdaten so
          präzise und lokal aufbereiten, dass sie für konkrete Entscheidungen nutzbar sind — nicht
          nur als allgemeine Information.
        </p>
      </section>

      <section className="space-y-6">
        <h2 className="text-xl font-black text-text-primary">Was uns unterscheidet</h2>
        <div className="space-y-4">
          {[
            ["Hyperlokal", "1 km Auflösung. Nicht für deine Stadt — für deine Straße."],
            ["48 Stunden voraus", "Der Zeitraum, der für echte Entscheidungen nützlich ist."],
            ["KI-gestützte Analyse", "Unser eigenes Modell kombiniert meteorologische Daten mit lokalem Wissen für präzisere Prognosen."],
            ["Kein Rauschen", "Nur das, was für dich relevant ist. Keine endlosen Daten, keine Prozentzahlen ohne Kontext."],
          ].map(([title, desc]) => (
            <div key={title as string} className="p-5 rounded-2xl bg-white/5 border border-white/5">
              <h3 className="font-bold text-text-primary mb-1">{title}</h3>
              <p className="text-sm text-text-secondary">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-black text-text-primary">Die Assistenten</h2>
        <div className="space-y-3">
          {[
            { name: "Karl", color: "#22c55e", desc: "Dein täglicher Wetterassistent für Deutschland. Morgens vor 7 Uhr in deinem Posteingang.", href: "/de/mein-wetter" },
            { name: "Reed", color: "#ef4444", desc: "Persönliche Warnungen, wenn Wetter über deine Schwelle geht.", href: "/de/warnungen" },
            { name: "Steve", color: "#3b82f6", desc: "Wetterintelligenz für Unternehmen — 48 Stunden voraus, pro Standort.", href: "/de/preise#steve" },
          ].map((p) => (
            <Link key={p.name} href={p.href} className="flex gap-3 items-center p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-white/20 transition-colors">
              <div className="w-9 h-9 rounded-full flex items-center justify-center text-base font-black text-white shrink-0" style={{ background: p.color }}>
                {p.name[0]}
              </div>
              <div>
                <p className="text-sm font-bold text-text-primary">{p.name}</p>
                <p className="text-xs text-text-secondary">{p.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-xl font-black text-text-primary mb-3">Kontakt</h2>
        <p className="text-text-secondary text-sm">
          Fragen oder Feedback?{" "}
          <Link href="/de/kontakt" className="text-accent-orange hover:underline font-semibold">
            Schreib uns
          </Link>{" "}
          oder per E-Mail:{" "}
          <a href="mailto:info@weerzone.nl" className="text-accent-orange hover:underline">
            info@weerzone.nl
          </a>
        </p>
      </section>
    </main>
  );
}
