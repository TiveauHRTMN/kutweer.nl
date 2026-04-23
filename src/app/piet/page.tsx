import type { Metadata } from "next";
import Link from "next/link";
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
      <main className="min-h-screen relative overflow-hidden text-white px-4 py-8 pb-20" style={{
        background: 'radial-gradient(80% 60% at 85% 15%, rgba(255,210,26,.15) 0%, transparent 55%), radial-gradient(120% 80% at 15% 110%, #5a96ff 0%, transparent 55%), linear-gradient(160deg, #0f172a 0%, #1e293b 100%)'
      }}>
        {/* Technical Grid Overlay */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }} />

        <div className="max-w-2xl mx-auto relative z-10">
          <nav className="flex items-center justify-between mb-10">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="bg-white/10 p-2 rounded-lg group-hover:bg-white/20 transition-colors">
                <img src="/favicon-icon.png" alt="WZ" className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 group-hover:text-white/80 transition-colors">WeerZone Intelligence</span>
            </Link>
            <div className="flex items-center gap-2 bg-white/5 px-3 py-1 rounded-full border border-white/10">
              <div className="w-1.5 h-1.5 rounded-full bg-accent-cyan animate-pulse" />
              <span className="text-[9px] font-black uppercase tracking-widest text-accent-cyan">Secure Terminal</span>
            </div>
          </nav>

          <header className="mb-10">
            <h1 className="text-5xl sm:text-6xl font-black leading-none mb-4 tracking-tighter">
              Piet<span className="text-accent-cyan">.</span>
            </h1>
            <div className="max-w-lg">
              <p className="text-white/60 text-sm sm:text-base leading-relaxed font-medium">
                Hyper-lokale 48-uurs analyse op de vierkante meter. Geactiveerd door de 
                <strong className="text-white"> WEERZONE Intelligence Engine</strong>. 
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
