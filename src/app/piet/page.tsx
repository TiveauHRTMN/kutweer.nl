import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import PietExtended from "@/components/PietExtended";
import PremiumGate from "@/components/PremiumGate";

export const metadata: Metadata = {
  title: "Piet’s Hyper-lokale Weer-Update — Snoeiharde 48-uurs data",
  description:
    "De enige weerdienst die niet gokt. Piet van WEERZONE gebruikt brute rekenkracht voor 1km-precisie op jouw adres. Geen 14-daagse ruis, maar de keiharde realiteit.",
  alternates: { canonical: "https://weerzone.nl/piet" },
  openGraph: {
    title: "Piet’s Hyper-lokale Update | WEERZONE",
    description: "48 uur vooruit op de vierkante meter. De rest is gokwerk.",
    images: ["/og-image.png"],
  }
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "Piet's Hyper-lokale 48-uurs Analyse",
  description: "Een vlijmscherpe, data-gedreven analyse van het weer in Nederland via de WEERZONE Intelligence Engine.",
  author: {
    "@type": "Person",
    name: "Piet",
    jobTitle: "Senior Meteoroloog bij WEERZONE",
  },
  publisher: {
    "@type": "Organization",
    name: "WEERZONE",
    logo: "https://weerzone.nl/favicon-icon.png",
  },
  datePublished: new Date().toISOString().split('T')[0],
};

export default function PietPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main className="min-h-screen bg-[#3b7ff0] text-white px-4 py-8 pb-20">
        <div className="max-w-2xl mx-auto">
          <header className="flex flex-col items-center mb-10 pt-2">
            <Link href="/" className="hover:opacity-90 transition-opacity">
              <LogoFull height={80} className="drop-shadow-lg" />
            </Link>
          </header>

          <header className="mb-8">
            <h1 className="text-4xl sm:text-5xl font-black leading-tight mb-3">
              Piet
            </h1>
            <p className="text-white/80 text-base leading-relaxed">
              De uitgebreide 48-uurs weer-update voor jouw locatie. Geen gokwerk, maar pure data op de vierkante meter.
            </p>
          </header>

          <PremiumGate>
            <PietExtended />
          </PremiumGate>
        </div>
      </main>
    </>
  );
}
