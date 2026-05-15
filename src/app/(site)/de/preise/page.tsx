import type { Metadata } from "next";
import { PERSONAS, TRIAL_END, PERSONA_ORDER_DE } from "@/lib/personas";
import PreiseClient from "./PreiseClient";
import { ALL_PLACES } from "@/lib/places-data";
import { fetchWeatherData } from "@/lib/weather";
import { getSavedLocationServer } from "@/lib/location-cookies";

export const metadata: Metadata = {
  title: "Preise — Karl, Reed und Steve",
  description:
    "Wähle dein WEERZONE-Abo. Karl für tägliches Wetter, Reed für Extremwetter-Warnungen, Steve für Unternehmen. Jetzt vorübergehend kostenlos testen — keine Kreditkarte nötig.",
  keywords: [
    "weerzone abo",
    "wetter abo deutschland",
    "persönlicher wetterbericht",
    "weerzone preise",
    "wetterwarnungen",
  ],
  alternates: {
    canonical: "https://weerzone.nl/de/preise",
    languages: {
      "nl-NL": "https://weerzone.nl/prijzen",
      "de-DE": "https://weerzone.nl/de/preise",
      "x-default": "https://weerzone.nl/prijzen",
    },
  },
  openGraph: {
    title: "Preise — Karl, Reed und Steve | WEERZONE",
    description:
      "Karl für tägliches Wetter, Reed für Warnungen, Steve für Unternehmen. Jetzt kostenlos zu testen.",
    type: "website",
    locale: "de_DE",
    url: "https://weerzone.nl/de/preise",
    siteName: "WEERZONE",
  },
  twitter: {
    card: "summary_large_image",
    title: "Preise | WEERZONE",
    description:
      "Karl, Reed oder Steve. Hyperlokale Wetterberichte nach Maß. Jetzt kostenlos zu testen — keine Kreditkarte nötig.",
  },
};

function buildOffer(tier: "karl" | "reed") {
  const p = PERSONAS[tier];
  const isBeta = Date.now() < TRIAL_END.getTime();
  const regularPrice = (p.priceCents! / 100).toFixed(2);
  const trialEndDate = TRIAL_END.toISOString().split("T")[0];

  return {
    "@type": "Offer",
    priceCurrency: "EUR",
    price: isBeta ? "0.00" : regularPrice,
    ...(isBeta
      ? { priceValidUntil: trialEndDate }
      : {
          priceSpecification: {
            "@type": "UnitPriceSpecification",
            price: regularPrice,
            priceCurrency: "EUR",
            referenceQuantity: { "@type": "QuantitativeValue", value: 1, unitCode: "MON" },
          },
        }),
    availability: "https://schema.org/InStock",
    hasMerchantReturnPolicy: {
      "@type": "MerchantReturnPolicy",
      applicableCountry: "DE",
      returnPolicyCategory: "https://schema.org/MerchantReturnNotPermitted",
    },
    shippingDetails: {
      "@type": "OfferShippingDetails",
      shippingRate: { "@type": "MonetaryAmount", value: "0.00", currency: "EUR" },
      shippingDestination: { "@type": "DefinedRegion", addressCountry: "DE" },
      deliveryTime: {
        "@type": "ShippingDeliveryTime",
        handlingTime: { "@type": "QuantitativeValue", minValue: 0, maxValue: 0, unitCode: "DAY" },
        transitTime: { "@type": "QuantitativeValue", minValue: 0, maxValue: 0, unitCode: "DAY" },
      },
    },
    url: `https://weerzone.nl/app/signup?tier=${tier}&lang=de`,
  };
}

const productSchemaLd = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: "WEERZONE Abos",
  url: "https://weerzone.nl/de/preise",
  itemListElement: PERSONA_ORDER_DE.filter((t) => t !== "steve").map((tier, i) => ({
    "@type": "ListItem",
    position: i + 1,
    item: {
      "@context": "https://schema.org",
      "@type": "Product",
      name: `WEERZONE ${PERSONAS[tier].name} — ${PERSONAS[tier].label}`,
      description: PERSONAS[tier].description,
      image: "https://weerzone.nl/og-image.png",
      url: `https://weerzone.nl/app/signup?tier=${tier}&lang=de`,
      brand: { "@type": "Brand", name: "WEERZONE" },
      offers: buildOffer(tier as "karl" | "reed"),
    },
  })),
};

const berlin = ALL_PLACES.find((p) => p.name === "Berlin") ?? ALL_PLACES[0];

export default async function PreisePage() {
  const loc = await getSavedLocationServer().catch(() => null);
  const activeLoc = loc || berlin;
  const initialWeather = await fetchWeatherData(activeLoc.lat, activeLoc.lon, false, false, undefined, "de").catch(() => undefined);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchemaLd) }}
      />
      <PreiseClient
        userTier={null}
        isFounder={false}
        initialCity={activeLoc}
        initialWeather={initialWeather}
      />
    </>
  );
}
