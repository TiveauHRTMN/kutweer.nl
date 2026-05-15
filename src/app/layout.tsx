import type { Metadata } from "next";
import { Suspense } from "react";
import { Providers } from "./providers";
import PostHogPageView from "@/components/PostHogPageView";
import SiteShell from "@/components/SiteShell";
import { getSupabase } from "@/lib/supabase";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://weerzone.nl"),
  title: {
    default: "WEERZONE | Weerkeuzes voor vandaag en morgen",
    template: "%s | WEERZONE",
  },
  description:
    "WEERZONE helpt je beslissen wat je vandaag en morgen met het weer doet. Hyperlokaal, tot 48 uur vooruit.",
};

const globalSchemasLd = [
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "WEERZONE",
    url: "https://weerzone.nl",
    logo: "https://weerzone.nl/weerzone-icon.png",
    description:
      "Nederlandse hyperlocale weerdienst voor 48-uur weersverwachtingen per stad en provincie.",
    areaServed: { "@type": "Country", name: "Nederland" },
    inLanguage: "nl-NL",
    sameAs: [
      "https://www.youtube.com/@weerzone",
      "https://x.com/weerzone",
      "https://www.instagram.com/weerzone",
      "https://www.tiktok.com/@weerzone",
      "https://www.reddit.com/r/weerzone",
      "https://www.wikidata.org/wiki/Q139675943",
    ],
  },
  {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "WEERZONE",
    url: "https://weerzone.nl",
    applicationCategory: "WeatherApplication",
    operatingSystem: "Web, iOS, Android",
    inLanguage: "nl-NL",
    description:
      "Hyperlokale 48-uur weersverwachting voor alle Nederlandse steden en provincies, vertaald naar praktische keuzes.",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "EUR",
      description: "Gratis 48-uurs weerbericht op weerzone.nl",
    },
    publisher: { "@type": "Organization", name: "WEERZONE", url: "https://weerzone.nl" },
  },
];

// Root layout wraps alle pagina's met SiteShell. Eerder zat SiteShell in
// (site)/layout.tsx maar dat veroorzaakte een dubbele render in Next.js 16
// (twee identieke <header>+<footer>-paren in de HTML output). Door SiteShell
// hier te renderen wordt de async layer geëlimineerd en is er gegarandeerd
// maar één instance van de chrome.
export const dynamic = "force-dynamic";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let activeDeal = null;
  const supabase = getSupabase();
  if (supabase) {
    try {
      const { data: state } = await supabase
        .from("system_state")
        .select("*")
        .eq("id", "global")
        .single();
      if (state?.is_active) {
        activeDeal = state;
      }
    } catch {
      // Stil falen — activeDeal blijft null, banner verschijnt niet
    }
  }

  return (
    <html lang="nl" className="antialiased">
      <head>
        <meta name="theme-color" content="#0f172a" />
      </head>
      <body className="min-h-screen">
        <Providers>
          <Suspense fallback={null}>
            <PostHogPageView />
          </Suspense>
          <SiteShell activeDeal={activeDeal} globalSchemasLd={globalSchemasLd}>
            {children}
          </SiteShell>
        </Providers>
      </body>
    </html>
  );
}
