import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Warnungen | Reed — Persönliche Wetterwarnungen | WEERZONE",
  description:
    "Reed warnt dich, wenn das Wetter über deine persönliche Schwelle geht. Wind, Regen, Frost, Gewitter — du definierst, wann es für dich relevant wird.",
  alternates: {
    canonical: "https://weerzone.nl/de/warnungen",
    languages: {
      "nl-NL": "https://weerzone.nl/waarschuwingen",
      "de-DE": "https://weerzone.nl/de/warnungen",
      "x-default": "https://weerzone.nl/waarschuwingen",
    },
  },
};

export default function WarnungenPage() {
  return (
    <main className="max-w-2xl mx-auto px-6 py-16 space-y-10">
      {/* Reed persona */}
      <section className="card p-8 rounded-[40px] bg-white/5 border border-red-500/20">
        <div className="flex gap-4 items-start">
          <div className="w-14 h-14 rounded-full bg-red-500 flex items-center justify-center text-2xl font-black text-white shrink-0">
            R
          </div>
          <div>
            <h1 className="text-2xl font-black text-text-primary mb-1">Reed</h1>
            <p className="text-sm font-semibold text-text-secondary mb-4">Mehr Details, bessere Entscheidungen</p>
            <p className="text-text-secondary leading-relaxed text-sm">
              Reed warnt dich nur, wenn es wirklich relevant ist — wenn das Wetter über deine
              persönliche Schwelle geht. Alles andere lässt er dich in Ruhe.
            </p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="space-y-4">
        <h2 className="text-xs font-black uppercase tracking-[0.2em] text-white/40">Was Reed macht</h2>
        <ul className="space-y-3">
          {[
            ["Warnung auf deiner Schwelle", "Du gibst an, ab wann Wind, Regen, Frost oder Gewitter für dich problematisch wird."],
            ["Du definierst, was gefährdet ist", "Keller, Flachdach, Tiere im Freien — Reed fragt ab, was bei dir zählt."],
            ["E-Mail und Push — nach Kategorie", "Pro Warnung selbst wählen, wie du informiert wirst."],
            ["Nachträgliche Genauigkeit", "Hat die Warnung gestimmt? Pro Alert einsehbar."],
            ["Alles aus Karl inklusive", "Tägliche Morgenmail, stündliches Dashboard."],
          ].map(([title, desc]) => (
            <li key={title as string} className="flex gap-3 items-start p-4 rounded-2xl bg-white/5 border border-white/5">
              <span className="text-red-400 font-black mt-0.5">⚡</span>
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
        <Link href="/app/signup?tier=reed&lang=de" className="btn btn-block font-bold max-w-sm mx-auto" style={{ background: "#ef4444", color: "white" }}>
          Reed kostenlos testen
        </Link>
        <p className="text-xs text-white/30">Keine Kreditkarte. Beta ist kostenlos.</p>
      </section>

      <section className="text-center">
        <Link href="/de/preise" className="text-sm text-text-secondary hover:text-text-primary">
          Alle Tarife vergleichen →
        </Link>
      </section>
    </main>
  );
}
