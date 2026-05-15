"use client";

import { usePathname } from "next/navigation";
import CookieBanner from "@/components/CookieBanner";
import InstallPrompt from "@/components/InstallPrompt";
import FounderBanner from "@/components/FounderBanner";
import GlobalPersonaModal from "@/components/GlobalPersonaModal";
import AffiliateBanner from "@/components/AffiliateBanner";
import GlobalNav from "@/components/wz/GlobalNav";
import Footer from "@/components/Footer";
import Script from "next/script";
import { detectLocale, type Locale } from "@/config/locales";

type SiteShellProps = {
  activeDeal: any;
  globalSchemasLd: unknown[];
  /** Server-side gedetecteerde locale uit root layout (via next/headers).
   *  Wordt gebruikt als initiële waarde tijdens SSR; client-side schakelt
   *  het indien nodig over via usePathname(). */
  serverLocale?: Locale;
  children: React.ReactNode;
};

export default function SiteShell({
  activeDeal,
  globalSchemasLd,
  serverLocale,
  children,
}: SiteShellProps) {
  const pathname = usePathname() ?? "/";
  // Prefereer de server-side gedetecteerde locale (uit root layout via headers())
  // boven usePathname, omdat usePathname tijdens SSR niet altijd betrouwbaar het
  // huidige pad teruggeeft in een Next.js 16 root-layout context.
  const locale: Locale = serverLocale ?? detectLocale(pathname);
  const isDE = locale === "de";

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(globalSchemasLd) }}
      />
      <Script
        id="adsense-loader"
        strategy="lazyOnload"
        src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6187487207780127"
        crossOrigin="anonymous"
      />

      {activeDeal && (
        <AffiliateBanner
          message={activeDeal.flash_deal_message}
          link={activeDeal.flash_deal_link}
          cta={isDE ? "Jetzt sichern" : "Profiteer nu"}
          type={activeDeal.flash_deal_type as any}
        />
      )}

      <GlobalNav serverLocale={serverLocale} />
      <div className="min-h-[60vh]">{children}</div>
      <Footer serverLocale={serverLocale} />
      <CookieBanner />
      <InstallPrompt />
      <FounderBanner />
      <GlobalPersonaModal />
    </>
  );
}
