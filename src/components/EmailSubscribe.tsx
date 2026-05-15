"use client";

import Link from "next/link";
import { Mail } from "lucide-react";
import { useSession } from "@/lib/session-context";
import type { City } from "@/lib/types";

interface Props {
  city: City;
  locale?: "nl" | "de";
}

/**
 * Promo-card bovenaan het dashboard. CTA naar /prijzen met duidelijke urgentie
 * gebaseerd op de eerstvolgende mail en de komende 48 uur.
 *
 * Abonnees zien deze card niet.
 */
export default function EmailSubscribe({ city: _city, locale = "nl" }: Props) {
  const { tier, loading } = useSession();

  if (loading || tier) return null;

  return (
    <div className="card p-5 space-y-3 relative overflow-hidden">
      <div className="absolute top-0 right-0 bg-accent-orange text-white text-[9px] font-black uppercase tracking-wider px-3 py-1 rounded-bl-xl">
        {locale === "de" ? "Jetzt gratis" : "Nu gratis"}
      </div>

      <div className="flex items-center gap-2">
        <Mail className="w-4 h-4 text-accent-orange" />
        <h3 className="text-sm font-black text-text-primary uppercase tracking-tight">
          {locale === "de" ? "Jeden Morgen dein Wetterbericht per Mail" : "Elke ochtend je weerbericht in de mail"}
        </h3>
      </div>

      <p className="text-xs text-text-secondary leading-snug">
        {locale === "de"
          ? "Karl schreibt, Reed warnt, Steve entscheidet. Für deinen Standort, ohne Werbung. Melde dich an und erhalte morgen die erste Ausgabe."
          : "Piet schrijft, Reed waarschuwt, Steve beslist. Op jouw postcode, zonder reclame. Meld je nu aan en ontvang morgen al de eerste update."}
      </p>

      <div className="flex items-center gap-1.5 text-[11px] text-text-secondary pt-1 border-t border-black/5">
        <Mail className="w-3.5 h-3.5 text-accent-orange" />
        <span>
          {locale === "de"
            ? "Jeden Morgen früh im Posteingang. Keine Kreditkarte nötig."
            : "Elke ochtend vroeg in je inbox. Geen creditcard vooraf."}
        </span>
      </div>

      <Link
        href={locale === "de" ? "/de/preise" : "/prijzen"}
        className="inline-block w-full text-center px-4 py-2.5 rounded-xl bg-accent-orange text-white text-sm font-bold hover:brightness-90 transition-all active:scale-[0.98]"
      >
        {locale === "de" ? "Drei Tarife ansehen →" : "Bekijk de drie abonnementen →"}
      </Link>
    </div>
  );
}
