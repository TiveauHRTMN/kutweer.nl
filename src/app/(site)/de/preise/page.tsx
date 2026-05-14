import type { Metadata } from "next";
import Link from "next/link";
import { PERSONAS, PERSONA_ORDER_DE, formatPrice, TRIAL_END } from "@/lib/personas";

export const metadata: Metadata = {
  title: "Preise | WEERZONE Deutschland",
  description:
    "Wähle deinen WEERZONE-Tarif: Karl, Reed oder Steve. Präzise Wetterdaten, lokale Warnungen und intelligente Wetterfunktionen.",
  alternates: {
    canonical: "https://weerzone.nl/de/preise",
    languages: {
      "nl-NL": "https://weerzone.nl/prijzen",
      "de-DE": "https://weerzone.nl/de/preise",
      "x-default": "https://weerzone.nl/prijzen",
    },
  },
};

// German copy voor elke tier (Karl/Reed/Steve)
const DE_COPY: Record<string, { subtitle: string; description: string; features: string[]; audience: string }> = {
  karl: {
    subtitle: "Dein lokaler Wetterassistent",
    description:
      "Zuverlässige Wetterinformationen für deinen Ort, klare Vorhersagen und wichtige Warnungen auf einen Blick.",
    features: [
      "Jeden Morgen vor 7 Uhr in deinem Posteingang",
      "Hyperlokal: 1 km Auflösung für deine genaue Adresse",
      "Du bestimmst den Inhalt: Fahrrad, Garten, Kinder, Hund",
      "Stündliches Dashboard",
      "Keine Werbung, kein Tracking",
    ],
    audience: "Für alle, die morgens in einer Minute wissen wollen, was der Tag bringt.",
  },
  reed: {
    subtitle: "Mehr Details, bessere Entscheidungen",
    description:
      "Erweiterte Wetterdaten, präzisere Prognosen und zusätzliche Einblicke für Nutzer, die mehr Kontrolle brauchen.",
    features: [
      "Alles aus Karl inklusive",
      "Persönliche Schwellenwarnungen: Wind, Regen, Frost, Gewitter",
      "Du definierst, was gefährdet ist: Keller, Flachdach, Tiere draußen",
      "E-Mail und Push — nach Kategorie wählbar",
      "Nachträgliche Genauigkeitsprüfung pro Warnung",
    ],
    audience: "Für Familien und Hauseigentümer, die nicht bei jedem Schauer benachrichtigt werden wollen.",
  },
  steve: {
    subtitle: "Premium-Wetterintelligenz",
    description:
      "Maximale Wetterintelligenz mit erweiterten Analysen, schnelleren Updates und priorisierten Funktionen.",
    features: [
      "Tägliche Business-Mail + Live-Dashboard",
      "48 Stunden voraus in 2-Stunden-Blöcken, pro Standort",
      "Schwellenwerte pro Filiale: Wind, Regen, Temperatur, Gewitter",
      "Einkaufs- und Personalvorschläge pro Tag",
      "Messbare Genauigkeit pro Standort",
      "Mehrere Adressen gleichzeitig",
    ],
    audience: "Strandbar, Gastronomie, Dachdecker, Gartenbauer, Bau, Events.",
  },
};

export default function PreisePage() {
  const isFounderPhase = Date.now() < TRIAL_END.getTime();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "WEERZONE Deutschland Tarife",
    itemListElement: PERSONA_ORDER_DE.map((tier, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: PERSONAS[tier].name,
      url: `https://weerzone.nl/de/preise#${tier}`,
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main className="max-w-5xl mx-auto px-6 py-16 space-y-16">
        {/* Header */}
        <section className="text-center space-y-4">
          <h1 className="text-4xl font-black tracking-tighter text-text-primary">Preise</h1>
          <p className="text-text-secondary text-lg max-w-xl mx-auto">
            Wähle deinen WEERZONE-Tarif. Jetzt in der Beta-Phase kostenlos ausprobieren.
          </p>
          {isFounderPhase && (
            <div className="inline-block bg-accent-orange/10 border border-accent-orange/30 text-accent-orange text-sm font-bold px-4 py-2 rounded-full">
              Gründer-Phase aktiv — dauerhaft günstigere Preise sichern
            </div>
          )}
        </section>

        {/* Tier cards */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PERSONA_ORDER_DE.map((tier) => {
            const persona = PERSONAS[tier];
            const deCopy = DE_COPY[tier];
            const isEntry = tier === "karl";

            return (
              <div
                key={tier}
                id={tier}
                className={`card p-8 rounded-[32px] border flex flex-col gap-6 ${isEntry ? "border-[#22c55e]/40 bg-[#22c55e]/5" : "border-white/10 bg-white/5"}`}
              >
                <div>
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center text-2xl font-black text-white mb-4"
                    style={{ background: persona.color }}
                  >
                    {persona.name[0]}
                  </div>
                  <h2 className="text-2xl font-black text-text-primary">{persona.name}</h2>
                  <p className="text-sm font-semibold text-text-secondary mt-1">{deCopy.subtitle}</p>
                </div>

                <p className="text-sm text-text-secondary leading-relaxed">{deCopy.description}</p>

                <ul className="space-y-2 flex-1">
                  {deCopy.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-text-secondary">
                      <span className="text-[#22c55e] mt-0.5 shrink-0">✓</span>
                      {f}
                    </li>
                  ))}
                </ul>

                <div>
                  {persona.priceCents ? (
                    <div className="mb-4">
                      <span className="text-3xl font-black text-text-primary">
                        {formatPrice(isFounderPhase && persona.founderPriceCents ? persona.founderPriceCents : persona.priceCents)}
                      </span>
                      <span className="text-text-secondary text-sm"> / Monat</span>
                      {isFounderPhase && persona.founderPriceCents && (
                        <p className="text-xs text-accent-orange mt-1">
                          Gründerpreis — dauerhaft gesichert
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="mb-4">
                      <span className="text-3xl font-black text-text-primary">Kostenlos</span>
                      <span className="text-text-secondary text-sm"> in der Beta</span>
                    </div>
                  )}

                  <Link
                    href={`/app/signup?tier=${tier}&lang=de`}
                    className={`btn btn-block font-bold ${isEntry ? "btn-primary" : "btn-ghost"}`}
                  >
                    {tier === "karl" ? "Karl kostenlos testen" : tier === "reed" ? "Reed testen" : "Steve anfragen"}
                  </Link>
                </div>

                <p className="text-xs text-white/30 text-center">{deCopy.audience}</p>
              </div>
            );
          })}
        </section>

        {/* FAQ */}
        <section className="max-w-2xl mx-auto space-y-6">
          <h2 className="text-xl font-black text-text-primary">Häufige Fragen</h2>
          {[
            ["Warum ist es jetzt kostenlos?", "WEERZONE ist in der Beta-Phase. Du kannst Karl und Reed ohne Kreditkarte testen, damit wir das Produkt mit echten Nutzern verbessern können."],
            ["Was ist der Unterschied zwischen Karl und Reed?", "Karl liefert die tägliche Wetteranalyse. Reed ergänzt persönliche Warnungen, wenn Wind, Regen, Gewitter, Hitze oder Frost über deine Schwelle geht."],
            ["Kann ich später wechseln?", "Ja. Du kannst jederzeit upgraden oder downgraden. In der Beta bist du an nichts gebunden."],
            ["Warum 48 Stunden voraus?", "Weil dieser Zeitraum für echte Entscheidungen geeignet ist. Weiter in die Zukunft ist oft Richtung, keine Planung."],
          ].map(([q, a]) => (
            <div key={q} className="border-b border-white/10 pb-6">
              <h3 className="font-bold text-text-primary mb-2">{q}</h3>
              <p className="text-sm text-text-secondary leading-relaxed">{a}</p>
            </div>
          ))}
        </section>
      </main>
    </>
  );
}
