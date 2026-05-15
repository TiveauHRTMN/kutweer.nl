"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import type { WeatherData } from "@/lib/types";
import { matchProducts, markSeen } from "@/lib/amazon-matcher";
import { productHref, parseEmojiImage, type CatalogProduct } from "@/lib/amazon-catalog";
import { getConditionTag } from "@/lib/affiliate-orchestrator";
import { useSession } from "@/lib/session-context";

type LiveShape = {
  title?: string;
  image?: string;
  price?: string;
  oldPrice?: string;
  savings?: string;
  url?: string;
  inStock?: boolean;
  primeEligible?: boolean;
};
type EnrichedProduct = CatalogProduct & { live?: LiveShape };

interface Props {
  weather: WeatherData;
  placeName?: string;
  locale?: "nl" | "de";
}

export default function AffiliateCard({ weather, placeName, locale = "nl" }: Props) {
  const [sessionId] = useState(() => Math.random().toString(36).slice(2));
  const impressionFired = useRef<Set<string>>(new Set());
  const tag = getConditionTag(weather);
  const { tier, loading } = useSession();

  const { products: deals } = useMemo(
    () => matchProducts(weather, 3, new Date(), tier as any),
    [weather, tier],
  );

  const [hero, ...minis] = deals;

  useEffect(() => {
    if (!hero) return;
    for (const d of deals) {
      if (impressionFired.current.has(d.id)) continue;
      impressionFired.current.add(d.id);
      fetch("/api/affiliate/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventType: "IMPRESSION",
          tag,
          productId: d.id,
          weatherContext: { temp: weather.current.temperature },
          platform: "SITE",
          sessionId,
        }),
      }).catch(() => {});
    }
    markSeen(deals.map((d) => d.id));
  }, [deals, hero, sessionId, tag, weather.current.temperature]);

  const handleProductClick = (productId: string) => {
    fetch("/api/affiliate/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        eventType: "CLICK",
        tag,
        productId,
        weatherContext: { temp: weather.current.temperature },
        platform: "SITE",
        sessionId,
      }),
    }).catch(() => {});

    fetch("/api/affiliate/click", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        place_name: placeName || (locale === "de" ? "Unbekannt" : "Onbekend"),
        weather_code: weather.current.weatherCode,
        temp: weather.current.temperature,
        product_id: productId,
      }),
    }).catch(() => {});
  };

  if (!hero) return null;
  if (loading || tier) return null;

  const t = {
    headline: locale === "de" ? "LIVE-DEALS · AUF BASIS VON WETTERDATEN" : "LIVE DEALS · GEBASEERD OP WEERDATA",
    stock: locale === "de" ? "Verfügbarkeit prüfen" : "Check voorraad",
    flash: locale === "de" ? "FLASH DEAL" : "FLASH DEAL",
    morgen: locale === "de" ? "Morgen geliefert" : "Morgen in huis",
    action: locale === "de" ? "JETZT ZUGREIFEN →" : "SLA JE SLAG →",
    bought:
      locale === "de"
        ? `+${Math.floor(Math.random() * 50) + 20} Personen haben das heute gekauft`
        : `+${Math.floor(Math.random() * 50) + 20} mensen kochten dit vandaag`,
    limited: locale === "de" ? "Begrenzter Vorrat" : "Beperkte Voorraad",
    deal: locale === "de" ? "ANGEBOT" : "DEAL",
    buyNow: locale === "de" ? "JETZT KAUFEN →" : "KOOP NU →",
    tip: locale === "de" ? "Tipp" : "tip",
  };

  return (
    <section aria-label={locale === "de" ? "Empfohlene Angebote" : "Aanbevolen deals"} className="space-y-3">
      <div className="flex items-center justify-between px-1">
        <p className="text-[10px] font-bold uppercase tracking-widest text-text-secondary">
          <span className="text-accent-orange">{t.headline.split(" · ")[0]}</span> · {t.headline.split(" · ")[1]}
        </p>
        <span className="text-[9px] text-text-muted italic underline">{t.stock}</span>
      </div>

      <a
        href={productHref(hero)}
        target="_blank"
        rel="noopener noreferrer sponsored"
        onClick={() => handleProductClick(hero.id)}
        className="block rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 relative group"
        style={{ background: "white", border: "2px solid #FF450015" }}
      >
        <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-red-600 to-orange-500 py-1 px-3 flex justify-between items-center z-20">
          <span className="text-[9px] font-black text-white uppercase tracking-tighter animate-pulse">{t.flash} ⚡</span>
          <span className="text-[9px] font-bold text-white/90 uppercase">{hero.badge || (locale === "de" ? "JETZT VERFÜGBAR" : "NU BESCHIKBAAR")}</span>
        </div>

        <div className="flex gap-4 p-4 pt-8">
          <div className="relative w-[110px] h-[110px] rounded-xl overflow-hidden bg-black/[0.02] shrink-0 border border-black/5">
            {(() => {
              const emoji = parseEmojiImage(hero.image);
              if (emoji) {
                return (
                  <div
                    className="w-full h-full flex items-center justify-center rounded-xl"
                    style={{ background: `linear-gradient(135deg, ${emoji.color}33, ${emoji.color}11)`, fontSize: 55 }}
                    aria-label={hero.title}
                    role="img"
                  >
                    <span style={{ filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.15))" }}>{emoji.emoji}</span>
                  </div>
                );
              }
              return (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={hero.image} alt={hero.title} loading="lazy" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              );
            })()}

            {hero.personas.length > 0 && (
              <div className="absolute -bottom-1 -left-1 bg-black text-white text-[9px] font-black px-2 py-1 rounded-tr-lg border-t border-r border-white/20">
                {hero.personas[0].toUpperCase()}'S {t.tip.toUpperCase()}
              </div>
            )}

            {!hero.oldPrice && (
              <div className="absolute -top-1 -right-1 bg-accent-orange text-white text-[11px] font-black px-2 py-1 rounded-bl-xl shadow-xl">
                {hero.priceHint}
              </div>
            )}

            {hero.oldPrice && (
              <div className="absolute -top-1 -right-1 bg-red-600 text-white text-[11px] font-black w-10 h-10 flex items-center justify-center rounded-bl-xl shadow-xl rotate-6 group-hover:rotate-0 transition-transform">
                SALE
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
            <div>
              <p className="text-[14px] font-black text-text-primary leading-tight line-clamp-2 uppercase tracking-tighter">
                {hero.title}
              </p>
              <p className="text-[11px] font-medium text-text-secondary italic mt-1.5 leading-tight">
                "{hero.subtitle}"
              </p>
            </div>

            <div className="mt-3 flex items-end justify-between">
              <div className="flex flex-col">
                {hero.oldPrice && <span className="text-[10px] text-text-muted line-through font-bold mb-[-4px]">{hero.oldPrice}</span>}
                <span className="text-[20px] font-black text-red-600 tracking-tighter">{hero.priceHint}</span>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-[8px] font-black text-emerald-600 uppercase mb-1">{t.morgen}</span>
                <div className="bg-black text-white text-[10px] font-black px-4 py-2 rounded-xl group-hover:bg-red-600 transition-colors">
                  {t.action}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 border-t border-black/5 py-1.5 px-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex -space-x-1.5">
              {[1, 2, 3].map((i) => <div key={i} className="w-3 h-3 rounded-full bg-gray-300 border border-white" />)}
            </div>
            <span className="text-[8px] font-bold text-text-muted">{t.bought}</span>
          </div>
          <span className="text-[8px] font-black text-orange-600 uppercase">{t.limited}</span>
        </div>
      </a>

      {minis.length > 0 && (
        <div className="grid grid-cols-2 gap-2">
          {minis.slice(0, 2).map((deal) => (
            <a
              key={deal.id}
              href={productHref(deal)}
              target="_blank"
              rel="noopener noreferrer sponsored"
              onClick={() => handleProductClick(deal.id)}
              className="card group flex flex-col p-3"
            >
              <div className="flex justify-between items-start mb-2">
                <span className="bg-red-100 text-red-600 text-[10px] font-black px-1.5 py-0.5 rounded shadow-sm">{t.deal}</span>
                <span className="text-[10px] font-black text-text-primary">{deal.priceHint}</span>
              </div>
              <p className="text-[10px] font-bold text-text-secondary leading-tight line-clamp-2 uppercase">
                {deal.title}
              </p>
              <div className="mt-2 text-[8px] font-black text-orange-600 opacity-0 group-hover:opacity-100 transition-opacity">
                {t.buyNow}
              </div>
            </a>
          ))}
        </div>
      )}
    </section>
  );
}
