"use client";

import { useState } from "react";
import Link from "next/link";
import { PERSONA_ORDER, FOUNDER_SLOTS, daysUntilLaunch, type PersonaTier } from "@/lib/personas";
import PersonaCard from "@/components/PersonaCard";

const FAQS = [
  {
    q: "Wat betekent 'founder'?",
    a: "Alle gebruikers die vóór 1 juni 2026 een abonnement claimen krijgen de founder-prijs voor altijd. Je blijft die prijs betalen zolang je abonnement doorloopt — ook als we de normale prijs later verhogen.",
  },
  {
    q: "Kan ik tussendoor wisselen van persona?",
    a: "Ja. Upgraden van Piet naar Reed of Steve kan maandelijks, vanuit je account-pagina. Je founder-lock verhuist mee: je betaalt de founder-prijs van de nieuwe tier.",
  },
  {
    q: "Waarom is het nu gratis?",
    a: "Tot 1 juni 2026 zijn we in een afrondingsfase. Gebruikers die nu instappen helpen ons het product scherpen. Als dank: gratis tot de launch, daarna levenslang korting.",
  },
  {
    q: "Hoe zit het met de 14-daagse voorspelling?",
    a: "Die verkopen we niet. Na 48 uur is elk weermodel wetenschappelijk gezien gokken — dus doen wij dat niet. We beperken ons tot wat bewezen klopt: 48 uur vooruit, op jouw GPS-coördinaat.",
  },
  {
    q: "Hoe gaat de betaling?",
    a: "Per 1 juni via Mollie — iDEAL, creditcard, Bancontact. Maandelijks of jaarlijks (jaar = 2 maanden korting op consumer-tiers). Opzeggen kan elk moment vanuit je account.",
  },
  {
    q: "Waarin verschilt dit van Buienradar of Weeronline?",
    a: "WEERZONE kent jou. Je hond, je fiets, je huis, je zaak. De mails schrijven alsof een slimme collega je een ochtendbriefje stuurt — niet alsof een app je data-braakt. Die personalisatie kan geen gratis dienst leveren, want ze kent jou niet.",
  },
];

export default function PrijzenClient() {
  const [selected, setSelected] = useState<PersonaTier | null>(null);
  const days = daysUntilLaunch();

  const handleSelect = (tier: PersonaTier) => {
    setSelected(tier);
    window.location.href = `/app/onboarding?tier=${tier}`;
  };

  return (
    <main className="min-h-screen py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Hero */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/90 backdrop-blur mb-6 shadow-sm">
            <span
              className="w-2 h-2 rounded-full animate-pulse"
              style={{ background: "#ef4444" }}
            />
            <span className="text-xs font-black text-text-primary uppercase tracking-wider">
              Tijdelijk gratis · nog {days} dagen
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-tight mb-4 drop-shadow">
            Drie persona's. <br />
            <span style={{ background: "linear-gradient(90deg, #22c55e, #ef4444, #3b82f6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              Eén WEERZONE.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-white/90 max-w-2xl mx-auto mb-3">
            Piet voor thuis. Reed voor waarschuwingen. Steve voor je bedrijf.
            Alle drie kennen je locatie, je leven en je drempels.
          </p>
          <p className="text-sm text-white/80 max-w-xl mx-auto">
            Founder-plekken: <strong>{FOUNDER_SLOTS}</strong> per persona. Founder-prijs is voor altijd.
          </p>
        </div>

        {/* Persona cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-16">
          {PERSONA_ORDER.map((tier) => (
            <PersonaCard
              key={tier}
              tier={tier}
              onSelect={handleSelect}
              highlighted={selected === tier}
            />
          ))}
        </div>

        {/* Hoe werkt het */}
        <div className="bg-white/90 backdrop-blur rounded-3xl p-6 sm:p-10 mb-12 shadow-xl">
          <h2 className="text-2xl sm:text-3xl font-black text-text-primary mb-6 text-center">
            Hoe werkt het?
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-accent-orange/15 text-accent-orange flex items-center justify-center mx-auto mb-3 font-black text-lg">
                1
              </div>
              <h3 className="font-black text-text-primary mb-1">Kies je persona</h3>
              <p className="text-sm text-text-secondary">
                Piet, Reed of Steve. Alle drie gratis tot 1 juni.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-accent-orange/15 text-accent-orange flex items-center justify-center mx-auto mb-3 font-black text-lg">
                2
              </div>
              <h3 className="font-black text-text-primary mb-1">Vul je profiel in</h3>
              <p className="text-sm text-text-secondary">
                Locatie, hobby's, huis, bedrijf — wat je wil delen, zo persoonlijker de brief.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-accent-orange/15 text-accent-orange flex items-center justify-center mx-auto mb-3 font-black text-lg">
                3
              </div>
              <h3 className="font-black text-text-primary mb-1">Morgen 07:00</h3>
              <p className="text-sm text-text-secondary">
                Je eerste brief in je inbox. Dashboard altijd beschikbaar.
              </p>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div className="bg-white/90 backdrop-blur rounded-3xl p-6 sm:p-10 mb-12 shadow-xl">
          <h2 className="text-2xl sm:text-3xl font-black text-text-primary mb-6 text-center">
            Veelgestelde vragen
          </h2>
          <div className="space-y-4 max-w-3xl mx-auto">
            {FAQS.map((f) => (
              <details
                key={f.q}
                className="group bg-black/[0.03] rounded-xl p-4 hover:bg-black/[0.05] transition-colors"
              >
                <summary className="cursor-pointer font-bold text-text-primary text-sm sm:text-base list-none flex justify-between items-center">
                  <span>{f.q}</span>
                  <span className="text-accent-orange group-open:rotate-45 transition-transform text-xl font-light">
                    +
                  </span>
                </summary>
                <p className="mt-3 text-sm text-text-secondary leading-relaxed">
                  {f.a}
                </p>
              </details>
            ))}
          </div>
        </div>

        {/* Footer-CTA */}
        <div className="text-center">
          <p className="text-white/80 text-sm mb-4">
            Nog niet zeker? <Link href="/" className="underline font-bold hover:text-white">Terug naar homepage</Link>
          </p>
        </div>
      </div>
    </main>
  );
}
