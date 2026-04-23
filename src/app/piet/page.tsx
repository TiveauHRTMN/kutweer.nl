import type { Metadata } from "next";
import Link from "next/link";
import PietExtended from "@/components/PietExtended";
import PremiumGate from "@/components/PremiumGate";

export const metadata: Metadata = {
  title: "Piet’s Neurale Weer-Update — Snoeiharde 48-uurs data",
  description:
    "De enige weerdienst die niet gokt. Piet van WEERZONE gebruikt Google MetNet-3 voor 1km-precisie op jouw adres. Geen 14-daagse ruis, maar de keiharde realiteit.",
  alternates: { canonical: "https://weerzone.nl/piet" },
  openGraph: {
    title: "Piet’s Neurale Update | WEERZONE",
    description: "48 uur vooruit op de vierkante meter. De rest is gokwerk.",
    images: ["/og-image.png"],
  }
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "Piet's Neurale 48-uurs Analyse",
  description: "Een vlijmscherpe, data-gedreven analyse van het weer in Nederland via de Google Neural Engine.",
  author: {
    "@type": "Person",
    name: "Piet",
    jobTitle: "Senior Analist bij WEERZONE",
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
      <main className="min-h-screen bg-[#4a9ee8] text-white px-4 py-8 pb-20">
      <div className="max-w-2xl mx-auto">
        <nav className="text-xs text-white/50 mb-5">
          <Link href="/" className="hover:text-white">WEERZONE</Link>
          <span className="mx-2">/</span>
          <span className="text-white/80">Piet</span>
        </nav>

        <header className="mb-6">
          <h1 className="text-4xl sm:text-5xl font-black leading-tight mb-3 flex items-center gap-3">
            <span>💬</span> Piet
          </h1>
          <p className="text-white/70 text-base leading-relaxed">
            De enige meteorologische analyse van Nederland die niet gokt. Piet gebruikt de 
            brute rekenkracht van de <strong>Google Neural Engine</strong> om 48 uur vooruit te kijken op de vierkante meter. 
            Elke ochtend vlijmscherp in je inbox? Regel het op de{" "}
            <Link href="/" className="text-accent-orange font-bold hover:underline">homepage</Link>.
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
