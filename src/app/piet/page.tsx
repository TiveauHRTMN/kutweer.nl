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
      <main className="min-h-screen relative overflow-hidden text-white px-4 py-12 pb-24" style={{
        background: 'radial-gradient(80% 60% at 85% 15%, rgba(255,210,26,.35) 0%, transparent 55%), radial-gradient(120% 80% at 15% 110%, #5a96ff 0%, transparent 55%), linear-gradient(160deg, #3b7ff0 0%, #2a5fc4 55%, #1f3f78 100%)'
      }}>
        {/* Exact dot pattern from design system */}
        <div className="absolute inset-0 pointer-events-none opacity-40" style={{ 
          backgroundImage: 'radial-gradient(rgba(255,255,255,.06) 1px, transparent 1px)',
          backgroundSize: '3px 3px',
          mixBlendMode: 'overlay'
        }} />

        <div className="max-w-3xl mx-auto relative z-10">
          <nav className="flex items-center justify-between mb-12">
            <Link href="/" className="brand-pill !bg-white/15 no-underline group hover:bg-white/20 transition-all">
              <Image 
                src="/logo-white.png" 
                alt="Weerzone" 
                width={90} 
                height={18} 
                className="opacity-90 group-hover:opacity-100 transition-opacity"
              />
            </Link>
            <div className="flex items-center gap-2 bg-white/10 px-4 py-1.5 rounded-xl border border-white/20 backdrop-blur-md">
              <div className="w-1.5 h-1.5 rounded-full bg-accent-cyan animate-pulse shadow-[0_0_8px_#06b6d4]" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white">Intelligence Terminal</span>
            </div>
          </nav>

          <header className="mb-12">
            <h1 className="text-6xl sm:text-7xl font-black leading-none mb-6 tracking-tighter drop-shadow-2xl">
              Piet<span className="text-wz-sun">.</span>
            </h1>
            <div className="max-w-xl">
              <p className="text-white/80 text-base sm:text-lg leading-relaxed font-medium">
                Hyper-lokale 48-uurs analyse op de vierkante meter. Geactiveerd door de 
                <strong className="text-white"> Intelligence Engine</strong>. 
                De rest is ruis.
              </p>
            </div>
          </header>

          <PremiumGate>
            <PietExtended />
          </PremiumGate>
        </div>
      </main>
    </>
  );
}
