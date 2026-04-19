import type { Metadata } from "next";
import PrijzenClient from "./PrijzenClient";

export const metadata: Metadata = {
  title: "Prijzen — Piet · Reed · Steve",
  description:
    "WEERZONE abonnementen. Drie persona's, één belofte: jouw locatie op de meter, dagelijks persoonlijk. Tijdelijk gratis.",
  alternates: { canonical: "https://weerzone.nl/prijzen" },
};

export default function PrijzenPage() {
  return <PrijzenClient />;
}
