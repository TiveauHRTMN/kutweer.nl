import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kontakt | WEERZONE Deutschland",
  description: "Kontaktiere WEERZONE für Fragen, Feedback oder Kooperationen. Wir freuen uns von dir zu hören.",
  alternates: {
    canonical: "https://weerzone.nl/de/kontakt",
    languages: {
      "nl-NL": "https://weerzone.nl/contact",
      "de-DE": "https://weerzone.nl/de/kontakt",
      "x-default": "https://weerzone.nl/contact",
    },
  },
};

export default function KontaktPage() {
  return (
    <main className="max-w-xl mx-auto px-6 py-16 space-y-10">
      <section>
        <h1 className="text-4xl font-black tracking-tighter text-text-primary mb-2">Kontakt</h1>
        <p className="text-text-secondary">Fragen, Feedback oder einfach Hallo sagen? Wir freuen uns.</p>
      </section>

      <section className="space-y-4">
        <div className="p-5 rounded-2xl bg-white/5 border border-white/5">
          <p className="text-xs font-black uppercase tracking-widest text-white/30 mb-1">E-Mail</p>
          <a href="mailto:info@weerzone.nl" className="text-accent-orange font-semibold hover:underline">
            info@weerzone.nl
          </a>
        </div>

        <div className="p-5 rounded-2xl bg-white/5 border border-white/5">
          <p className="text-xs font-black uppercase tracking-widest text-white/30 mb-1">Reaktionszeit</p>
          <p className="text-sm text-text-secondary">Wir antworten in der Regel innerhalb von 24 Stunden.</p>
        </div>

        <div className="p-5 rounded-2xl bg-white/5 border border-white/5">
          <p className="text-xs font-black uppercase tracking-widest text-white/30 mb-1">Für Unternehmen</p>
          <p className="text-sm text-text-secondary">
            Interessiert an Steve oder einer maßgeschneiderten Wetterlösung?{" "}
            <a href="mailto:zakelijk@weerzone.nl" className="text-accent-orange hover:underline font-semibold">
              zakelijk@weerzone.nl
            </a>
          </p>
        </div>
      </section>

      <section className="text-center">
        <p className="text-xs text-white/25">
          WEERZONE · Niederlande · info@weerzone.nl
        </p>
      </section>
    </main>
  );
}
