"use client";

import Link from "next/link";
import { Mail } from "lucide-react";
import { useSession } from "@/lib/session-context";
import type { City } from "@/lib/types";

interface Props {
  city: City;
}

/**
 * Promo-card bovenaan het dashboard. Was vroeger een nieuwsbrief-form voor
 * de generieke 48u-mail; die cron is uit. Nu een rechtstreekse CTA naar
 * het abonnement (Piet/Reed/Steve) — dat is de enige mail die we nog sturen.
 *
 * Abonnees zien deze card niet.
 */
export default function EmailSubscribe({ city }: Props) {
  const { tier, loading } = useSession();

  // Tijdens hydratie of voor abonnees: niks renderen.
  if (loading || tier) return null;

  return (
    <div className="card p-5 space-y-3 relative overflow-hidden">
      <div className="absolute top-0 right-0 bg-accent-orange text-white text-[9px] font-black uppercase tracking-wider px-3 py-1 rounded-bl-xl">
        Nu gratis
      </div>

      <div className="flex items-center gap-2">
        <Mail className="w-4 h-4 text-accent-orange" />
        <h3 className="text-sm font-black text-text-primary uppercase tracking-tight">
          Elke ochtend je weerbericht in de mail
        </h3>
      </div>

      <p className="text-xs text-text-secondary leading-snug">
        Piet schrijft, Reed waarschuwt, Steve beslist. Op jouw postcode,
        zonder reclame. Geen creditcard vooraf. Opzeggen kan altijd.
      </p>

      <Link
        href="/prijzen"
        className="inline-block w-full text-center px-4 py-2.5 rounded-xl bg-accent-orange text-white text-sm font-bold hover:brightness-90 transition-all active:scale-[0.98]"
      >
        Bekijk de drie abonnementen →
      </Link>
    </div>
  );
}
