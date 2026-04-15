"use client";

import { useState, useRef, useEffect } from "react";
import type { WeatherData } from "@/lib/types";
import { amazonProductUrl, amazonUrl, bookingUrl } from "@/lib/affiliates";
import { getConditionTag } from "@/lib/affiliate-orchestrator";

interface Props {
  weather: WeatherData;
}

interface HeroProduct {
  image: string;
  title: string;
  price: string;
  oldPrice?: string;
  brand: string;
  href: string;
  tag?: string;
  reason: string; // waarom dit product, gekoppeld aan weer
}

// ============================================================
// 48-uurs analyse → scenario
// ============================================================

type WeatherScenario =
  | "rain_now"
  | "rain_coming"
  | "cold_snap"
  | "freezing"
  | "heatwave"
  | "warm"
  | "windy"
  | "mixed"
  | "perfect";

function analyze48h(w: WeatherData): {
  scenario: WeatherScenario;
  rainTotal48h: number;
  rainHoursCount: number;
  tempMin48h: number;
  tempMax48h: number;
  windMax48h: number;
} {
  const rainTotal48h = w.daily[0].precipitationSum + (w.daily[1]?.precipitationSum ?? 0);
  const rainHoursCount = w.hourly.filter(h => h.precipitation > 0.3).length;
  const tempMin48h = Math.min(w.daily[0].tempMin, w.daily[1]?.tempMin ?? w.daily[0].tempMin);
  const tempMax48h = Math.max(w.daily[0].tempMax, w.daily[1]?.tempMax ?? w.daily[0].tempMax);
  const windMax48h = Math.max(w.daily[0].windSpeedMax, w.daily[1]?.windSpeedMax ?? 0);

  const isRainingNow = w.current.precipitation > 0;
  const rainComing = w.hourly.some(h => h.precipitation > 0.5);

  let scenario: WeatherScenario;
  if (isRainingNow) scenario = "rain_now";
  else if (tempMin48h <= 0) scenario = "freezing";
  else if (tempMax48h >= 28) scenario = "heatwave";
  else if (windMax48h >= 40) scenario = "windy";
  else if (tempMin48h < 5) scenario = "cold_snap";
  else if (rainComing || rainTotal48h > 2) scenario = "rain_coming";
  else if (tempMax48h >= 22 && rainTotal48h < 1) scenario = "warm";
  else if (rainTotal48h < 1 && tempMax48h >= 15 && windMax48h < 25) scenario = "perfect";
  else scenario = "mixed";

  return { scenario, rainTotal48h, rainHoursCount, tempMin48h, tempMax48h, windMax48h };
}

// ============================================================
// 1 hero product — precies wat je nodig hebt bij dit weer
// ============================================================

function getHeroProduct(weather: WeatherData): HeroProduct {
  const a = analyze48h(weather);
  const uv = weather.uvIndex;
  const temp = weather.current.temperature;
  const month = new Date().getMonth();
  const isSummer = month >= 4 && month <= 8;

  switch (a.scenario) {
    case "rain_now":
      // Het regent nu — meest urgente regenproduct
      if (a.windMax48h > 30) {
        return {
          image: "https://m.media-amazon.com/images/I/61zPZGagoSL._AC_UL320_.jpg",
          title: "Senz stormparaplu — windproof tot 100 km/u",
          price: "€29,95",
          brand: "Amazon.nl",
          href: amazonProductUrl("B07B8K47M2"),
          tag: "Anti-storm",
          reason: `Het regent én waait ${Math.round(a.windMax48h)} km/u. Een normale paraplu overleeft dit niet.`,
        };
      }
      return {
        image: "https://m.media-amazon.com/images/I/71W-kisuJRL._AC_UL320_.jpg",
        title: "Waterdichte regenjas — ademend & lichtgewicht",
        price: "€49,99",
        oldPrice: "€69,99",
        brand: "Amazon.nl",
        href: amazonProductUrl("B0DLH9WJSG"),
        tag: "Bestseller",
        reason: `${a.rainTotal48h.toFixed(0)}mm regen verwacht. Een paraplu vergeet je, een jas niet.`,
      };

    case "rain_coming":
      return {
        image: "https://m.media-amazon.com/images/I/61zPZGagoSL._AC_UL320_.jpg",
        title: "Compacte stormparaplu — automatisch open/dicht",
        price: "€24,95",
        brand: "Amazon.nl",
        href: amazonProductUrl("B07B8K47M2"),
        tag: "Neem mee",
        reason: `Nu droog, maar ${a.rainHoursCount} uur regen op komst. Stop deze in je tas.`,
      };

    case "freezing":
      if (temp < -5) {
        return {
          image: "https://m.media-amazon.com/images/I/61m1v4fm5wL._AC_UL320_.jpg",
          title: "Thermo ondergoed set — merino wol",
          price: "€29,99",
          oldPrice: "€39,99",
          brand: "Amazon.nl",
          href: amazonProductUrl("B0DB2TYZ3W"),
          tag: "Must-have",
          reason: `${Math.round(a.tempMin48h)}° verwacht. Zonder thermolaag voel je het tot op het bot.`,
        };
      }
      return {
        image: "https://m.media-amazon.com/images/I/71Zccm+HmPL._AC_UL320_.jpg",
        title: "IJskrabber met verwarmde handschoen",
        price: "€9,99",
        brand: "Amazon.nl",
        href: amazonProductUrl("B09QGWXRY9"),
        tag: `${Math.round(a.tempMin48h)}°`,
        reason: `Bij ${Math.round(a.tempMin48h)}° bevriest alles. Je autoruit ook.`,
      };

    case "cold_snap":
      return {
        image: "https://m.media-amazon.com/images/I/61B7yOCdstL._AC_UL320_.jpg",
        title: "Softshell jas — wind- en waterdicht",
        price: "€49,99",
        oldPrice: "€64,99",
        brand: "Amazon.nl",
        href: amazonProductUrl("B0836GND15"),
        tag: "Deal",
        reason: `${Math.round(a.tempMin48h)}° tot ${Math.round(a.tempMax48h)}°. Warm genoeg voor binnen, sterk genoeg voor buiten.`,
      };

    case "heatwave":
      if (uv >= 7) {
        return {
          image: "https://m.media-amazon.com/images/I/714aS4VLtjL._AC_UL320_.jpg",
          title: "Zonnebrand SPF 50+ — waterproof",
          price: "€12,99",
          brand: "Amazon.nl",
          href: amazonUrl("zonnebrand spf 50 waterproof"),
          tag: "UV " + Math.round(uv),
          reason: `${Math.round(a.tempMax48h)}° en UV-index ${Math.round(uv)}. Zonder smeren ben je binnen 20 minuten verbrand.`,
        };
      }
      return {
        image: "https://m.media-amazon.com/images/I/41Hyv0IGKpL._AC_UL320_.jpg",
        title: "Geïsoleerde waterfles 1L — 24u koud",
        price: "€16,99",
        brand: "Amazon.nl",
        href: amazonProductUrl("B092W7W5BB"),
        tag: `${Math.round(a.tempMax48h)}°`,
        reason: `Bij ${Math.round(a.tempMax48h)}° verlies je meer vocht dan je denkt. Koud water is geen luxe.`,
      };

    case "warm":
      if (isSummer) {
        return {
          image: "https://m.media-amazon.com/images/I/71tONXZG4VL._AC_UL320_.jpg",
          title: "Koelbox 24L — houdt 48u koud",
          price: "€34,95",
          brand: "Amazon.nl",
          href: amazonProductUrl("B0GLFFKWT4"),
          tag: "Zomer",
          reason: `${Math.round(a.tempMax48h)}° en droog. Perfect barbecue- of strandweer. Drankjes koud houden.`,
        };
      }
      return {
        image: "https://m.media-amazon.com/images/I/71Zccm+HmPL._AC_UL320_.jpg",
        title: "Gepolariseerde zonnebril — UV400",
        price: "€24,95",
        oldPrice: "€39,95",
        brand: "Amazon.nl",
        href: amazonUrl("zonnebril gepolariseerd UV400"),
        tag: "Deal",
        reason: `${Math.round(a.tempMax48h)}° en zon. Bescherm je ogen, zie er goed uit.`,
      };

    case "perfect":
      return {
        image: "https://m.media-amazon.com/images/I/71tONXZG4VL._AC_UL320_.jpg",
        title: "Picknickdeken XL — waterdichte onderkant",
        price: "€24,99",
        brand: "Amazon.nl",
        href: amazonProductUrl("B0GLFFKWT4"),
        tag: "Prachtweer",
        reason: `${Math.round(a.tempMax48h)}°, droog, weinig wind. Dit is zeldzaam in Nederland. Ga naar buiten.`,
      };

    case "windy":
      return {
        image: "https://m.media-amazon.com/images/I/71W-kisuJRL._AC_UL320_.jpg",
        title: "Windbreaker jas — lichtgewicht & stevig",
        price: "€34,99",
        brand: "Amazon.nl",
        href: amazonProductUrl("B0DLH9WJSG"),
        tag: `${Math.round(a.windMax48h)} km/u`,
        reason: `Windstoten tot ${Math.round(a.windMax48h)} km/u. Een normale jas waait op. Deze niet.`,
      };

    default: // mixed
      return {
        image: "https://m.media-amazon.com/images/I/71W-kisuJRL._AC_UL320_.jpg",
        title: "3-in-1 jas — regen, wind én kou",
        price: "€59,99",
        oldPrice: "€79,99",
        brand: "Amazon.nl",
        href: amazonProductUrl("B0DLH9WJSG"),
        tag: "Alleskunner",
        reason: `${Math.round(a.tempMin48h)}° tot ${Math.round(a.tempMax48h)}°, wisselvallig. Eén jas voor alles.`,
      };
  }
}

// ============================================================
// Main AffiliateCard — 1 product, native look
// ============================================================

export default function AffiliateCard({ weather }: Props) {
  const product = getHeroProduct(weather);
  const [sessionId] = useState(() => Math.random().toString(36).slice(2));
  const impressionFired = useRef(false);
  const tag = getConditionTag(weather);

  const weatherContext = {
    temp: weather.current.temperature,
    rain: weather.current.precipitation,
    wind: weather.current.windSpeed,
    code: weather.current.weatherCode,
  };

  useEffect(() => {
    if (impressionFired.current) return;
    impressionFired.current = true;
    fetch("/api/affiliate/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ eventType: "IMPRESSION", tag, weatherContext, platform: "SITE", sessionId }),
    }).catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleClick() {
    fetch("/api/affiliate/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ eventType: "CLICK", tag, weatherContext, platform: "SITE", sessionId }),
    }).catch(() => {});
  }

  return (
    <a
      href={product.href}
      target="_blank"
      rel="noopener noreferrer sponsored"
      onClick={handleClick}
      className="block rounded-2xl overflow-hidden transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5"
      style={{
        background: "rgba(255,255,255,0.85)",
        border: "1px solid rgba(0,0,0,0.06)",
        backdropFilter: "blur(12px)",
      }}
    >
      <div className="flex gap-4 p-4">
        {/* Product image */}
        <div className="relative w-[100px] h-[100px] rounded-xl overflow-hidden bg-black/[0.03] shrink-0">
          <img
            src={product.image}
            alt={product.title}
            loading="lazy"
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          {product.tag && (
            <span className="absolute top-1.5 left-1.5 text-[9px] font-bold uppercase tracking-wide bg-accent-orange text-text-primary px-2 py-0.5 rounded-full shadow-sm">
              {product.tag}
            </span>
          )}
        </div>

        {/* Product info */}
        <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
          <div>
            <p className="text-[13px] font-extrabold text-text-primary leading-tight line-clamp-2">
              {product.title}
            </p>
            <p className="text-[11px] text-text-secondary mt-1 leading-snug line-clamp-2">
              {product.reason}
            </p>
          </div>
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-1.5">
              <span className="text-[15px] font-black text-text-primary">{product.price}</span>
              {product.oldPrice && (
                <span className="text-[11px] text-text-muted line-through">{product.oldPrice}</span>
              )}
            </div>
            <span className="text-[9px] text-text-muted">{product.brand} · Advertentie</span>
          </div>
        </div>
      </div>
    </a>
  );
}
