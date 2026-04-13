"use client";

import type { WeatherData } from "@/lib/types";
import { amazonUrl, bookingUrl } from "@/lib/affiliates";

interface Props {
  variant: "top" | "bottom";
  weather: WeatherData;
}

interface Product {
  image: string;
  title: string;
  price: string;
  oldPrice?: string;
  brand: string;
  href: string;
  tag?: string;
}

interface AffiliateSection {
  heading: string;
  subtitle: string;
  products: Product[];
}

// Placeholder images using emoji-based colored gradients
function placeholderImg(emoji: string, hue: number): string {
  return `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><rect width="200" height="200" rx="16" fill="hsl(${hue},40%,92%)"/><text x="100" y="115" font-size="64" text-anchor="middle">${emoji}</text></svg>`)}`;
}

function getTopProducts(weather: WeatherData): AffiliateSection {
  const temp = weather.current.temperature;
  const rain = weather.current.precipitation > 0 || weather.hourly.some(h => h.precipitation > 0.5);
  const cold = temp < 8;
  const hot = temp > 25;
  const isRukWeer = rain || cold || weather.current.windSpeed > 35;

  const hour = new Date().getHours();
  const showBooking = isRukWeer ? hour % 3 !== 0 : hour % 4 === 0;

  if (showBooking) {
    return {
      heading: isRukWeer ? "Ontsnap aan dit rukweer" : "Weekendje weg?",
      subtitle: "Booking.com",
      products: [
        {
          image: "https://images.unsplash.com/photo-1583422409516-2895a77efded?w=400&h=400&fit=crop",
          title: "Barcelona",
          price: "vanaf €149",
          brand: "Booking.com",
          href: bookingUrl("Barcelona"),
          tag: "Populair",
        },
        {
          image: "https://images.unsplash.com/photo-1534008897995-27a23e859048?w=400&h=400&fit=crop",
          title: "Malaga",
          price: "vanaf €179",
          brand: "Booking.com",
          href: bookingUrl("Malaga"),
        },
        {
          image: "https://images.unsplash.com/photo-1585218356057-062e5b7fb60f?w=400&h=400&fit=crop",
          title: "Lissabon",
          price: "vanaf €159",
          oldPrice: "€209",
          brand: "Booking.com",
          href: bookingUrl("Lissabon"),
          tag: "Deal",
        },
        {
          image: "https://images.unsplash.com/photo-1605553556093-9c98a5d3f23a?w=400&h=400&fit=crop",
          title: "Kreta",
          price: "vanaf €219",
          brand: "Booking.com",
          href: bookingUrl("Kreta"),
        },
        {
          image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=400&h=400&fit=crop",
          title: "Parijs",
          price: "vanaf €129",
          brand: "Booking.com",
          href: bookingUrl("Parijs"),
          tag: "Citytrip",
        },
      ],
    };
  }

  if (rain) {
    return {
      heading: "Droog blijven vandaag",
      subtitle: "Amazon.nl",
      products: [
        {
          image: "https://images.unsplash.com/photo-1504280613098-befe68d3ee6b?w=400&h=400&fit=crop",
          title: "Regenjas waterdicht",
          price: "€49,99",
          oldPrice: "€69,99",
          brand: "Amazon.nl",
          href: amazonUrl("regenjas waterdicht heren dames"),
          tag: "Aanbieding",
        },
        {
          image: "https://images.unsplash.com/photo-1519001389478-433cce7f86eb?w=400&h=400&fit=crop",
          title: "Stormparaplu XL",
          price: "€24,95",
          brand: "Amazon.nl",
          href: amazonUrl("stormparaplu windproof"),
          tag: "Bestseller",
        },
        {
          image: "https://images.unsplash.com/photo-1520699697851-3dc68aa3a474?w=400&h=400&fit=crop",
          title: "Regenlaarzen",
          price: "€34,99",
          brand: "Amazon.nl",
          href: amazonUrl("regenlaarzen waterdicht"),
        },
        {
          image: "https://images.unsplash.com/photo-1491637639811-60e2756cc1c7?w=400&h=400&fit=crop",
          title: "Waterdichte rugzak",
          price: "€39,95",
          brand: "Amazon.nl",
          href: amazonUrl("waterdichte rugzak"),
        },
      ],
    };
  }

  if (cold) {
    return {
      heading: "Warm blijven",
      subtitle: "Amazon.nl",
      products: [
        {
          image: "https://images.unsplash.com/photo-1520903920243-00d872a2d1c9?w=400&h=400&fit=crop",
          title: "Merino sjaal",
          price: "€29,95",
          brand: "Amazon.nl",
          href: amazonUrl("merino wol sjaal"),
        },
        {
          image: "https://images.unsplash.com/photo-1544605963-3de1b7dfb3ce?w=400&h=400&fit=crop",
          title: "Thermo handschoenen",
          price: "€19,99",
          oldPrice: "€27,99",
          brand: "Amazon.nl",
          href: amazonUrl("thermo handschoenen touchscreen"),
          tag: "Aanbieding",
        },
        {
          image: "https://images.unsplash.com/photo-1539533113208-f6df8cc8b543?w=400&h=400&fit=crop",
          title: "Winterjas",
          price: "€89,95",
          brand: "Amazon.nl",
          href: amazonUrl("winterjas heren warm"),
          tag: "Bestseller",
        },
        {
          image: "https://images.unsplash.com/photo-1604183861214-e53b98471ce6?w=400&h=400&fit=crop",
          title: "Thermosfles 500ml",
          price: "€22,50",
          brand: "Amazon.nl",
          href: amazonUrl("thermosfles 500ml"),
        },
      ],
    };
  }

  if (hot) {
    return {
      heading: `UV ${weather.uvIndex.toFixed(0)} — bescherm jezelf`,
      subtitle: "Amazon.nl",
      products: [
        {
          image: "https://images.unsplash.com/photo-1526413232644-8a407dd56156?w=400&h=400&fit=crop",
          title: "Zonnebrand SPF50",
          price: "€12,99",
          brand: "Amazon.nl",
          href: amazonUrl("zonnebrand spf50"),
          tag: "Noodzaak",
        },
        {
          image: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=400&h=400&fit=crop",
          title: "Polaroid zonnebril",
          price: "€34,95",
          oldPrice: "€49,95",
          brand: "Amazon.nl",
          href: amazonUrl("polaroid zonnebril gepolariseerd"),
          tag: "Deal",
        },
        {
          image: "https://images.unsplash.com/photo-1616782522778-9ebcd473b64c?w=400&h=400&fit=crop",
          title: "Tafelventilator",
          price: "€29,99",
          brand: "Amazon.nl",
          href: amazonUrl("tafelventilator stil"),
        },
        {
          image: "https://images.unsplash.com/photo-1599839619722-39751411ea63?w=400&h=400&fit=crop",
          title: "Koelbox 24L",
          price: "€44,95",
          brand: "Amazon.nl",
          href: amazonUrl("koelbox 24 liter"),
        },
      ],
    };
  }

  return {
    heading: "Lekker weer? Naar buiten!",
    subtitle: "Amazon.nl",
    products: [
      {
        image: "https://images.unsplash.com/photo-1532298229144-0ec0c57515c7?w=400&h=400&fit=crop",
        title: "Fietslamp set LED",
        price: "€14,95",
        brand: "Amazon.nl",
        href: amazonUrl("fietslamp set led oplaadbaar"),
        tag: "Populair",
      },
      {
        image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop",
        title: "Dagrugzak 20L",
        price: "€29,99",
        oldPrice: "€39,99",
        brand: "Amazon.nl",
        href: amazonUrl("dagrugzak 20 liter"),
        tag: "Aanbieding",
      },
      {
        image: "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=400&h=400&fit=crop",
        title: "Buitenspeelgoed",
        price: "vanaf €9,99",
        brand: "Amazon.nl",
        href: amazonUrl("buitenspeelgoed kinderen"),
      },
      {
        image: "https://images.unsplash.com/photo-1595844730298-b960ff88fee6?w=400&h=400&fit=crop",
        title: "Tuinstoel opvouwbaar",
        price: "€24,95",
        brand: "Amazon.nl",
        href: amazonUrl("tuinstoel opvouwbaar"),
      },
    ],
  };
}

function getBottomProducts(weather: WeatherData): AffiliateSection {
  const temp = weather.current.temperature;
  const rain = weather.current.precipitation > 0 || weather.hourly.some(h => h.precipitation > 0.5);
  const cold = temp < 10;
  const isRukWeer = rain || cold || weather.current.windSpeed > 35;

  if (isRukWeer) {
    return {
      heading: "Binnen blijven = investeren in comfort",
      subtitle: "Amazon.nl",
      products: [
        {
          image: "https://images.unsplash.com/photo-1580302302824-34ba85c4939b?w=400&h=400&fit=crop",
          title: "Fleece deken XL",
          price: "€19,99",
          brand: "Amazon.nl",
          href: amazonUrl("fleece deken groot warm"),
          tag: "Favoriet",
        },
        {
          image: "https://images.unsplash.com/photo-1511920170033-f8396924c348?w=400&h=400&fit=crop",
          title: "Nespresso cups",
          price: "€24,99",
          brand: "Amazon.nl",
          href: amazonUrl("nespresso capsules compatible"),
        },
        {
          image: "https://images.unsplash.com/photo-1602874801007-bd458bb1b8b6?w=400&h=400&fit=crop",
          title: "Geurkaarsen set",
          price: "€16,95",
          brand: "Amazon.nl",
          href: amazonUrl("geurkaarsen set soja"),
          tag: "Populair",
        },
        {
          image: "https://images.unsplash.com/photo-1592285896110-8d88b5b3a5d8?w=400&h=400&fit=crop",
          title: "Kindle Paperwhite",
          price: "€149,99",
          brand: "Amazon.nl",
          href: amazonUrl("kindle paperwhite"),
          tag: "Bestseller",
        },
      ],
    };
  }

  const hour = new Date().getHours();
  if (hour % 2 === 0) {
    return {
      heading: "BBQ-weer!",
      subtitle: "Amazon.nl",
      products: [
        {
          image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&h=400&fit=crop",
          title: "Houtskool BBQ",
          price: "€49,99",
          oldPrice: "€69,99",
          brand: "Amazon.nl",
          href: amazonUrl("houtskool bbq"),
          tag: "Deal",
        },
        {
          image: "https://images.unsplash.com/photo-1596796417769-ca3b9c66914b?w=400&h=400&fit=crop",
          title: "BBQ gereedschap set",
          price: "€24,95",
          brand: "Amazon.nl",
          href: amazonUrl("bbq gereedschap set rvs"),
        },
        {
          image: "https://images.unsplash.com/photo-1595844730298-b960ff88fee6?w=400&h=400&fit=crop",
          title: "Loungestoel tuin",
          price: "€79,95",
          brand: "Amazon.nl",
          href: amazonUrl("loungestoel tuin opvouwbaar"),
          tag: "Populair",
        },
      ],
    };
  }

  return {
    heading: "Slimme weermeters",
    subtitle: "Amazon.nl",
    products: [
      {
        image: "https://images.unsplash.com/photo-1534067783941-51c9c23ecefd?w=400&h=400&fit=crop",
        title: "Netatmo weerstation",
        price: "€149,99",
        oldPrice: "€189,99",
        brand: "Amazon.nl",
        href: amazonUrl("netatmo weerstation wifi"),
        tag: "Tip",
      },
      {
        image: "https://images.unsplash.com/photo-1561565509-f1fbffc4c23c?w=400&h=400&fit=crop",
        title: "Buiten thermometer",
        price: "€12,95",
        brand: "Amazon.nl",
        href: amazonUrl("buitenthermometer digitaal"),
      },
      {
        image: "https://images.unsplash.com/photo-1596781745422-92e1069bdccc?w=400&h=400&fit=crop",
        title: "Regenmeter tuin",
        price: "€8,99",
        brand: "Amazon.nl",
        href: amazonUrl("regenmeter tuin"),
        tag: "Bestseller",
      },
    ],
  };
}

function ProductCard({ product }: { product: Product }) {
  return (
    <a
      href={product.href}
      className="shrink-0 w-[140px] group/product cursor-pointer"
      target="_blank"
      rel="noopener noreferrer sponsored"
    >
      <div className="relative w-[140px] h-[140px] rounded-2xl overflow-hidden bg-black/[0.03] mb-2">
        <img
          src={product.image}
          alt={product.title}
          className="w-full h-full object-cover group-hover/product:scale-105 transition-transform duration-300"
        />
        {product.tag && (
          <span className="absolute top-2 left-2 text-[10px] font-bold uppercase tracking-wide bg-accent-orange text-text-primary px-2 py-0.5 rounded-full">
            {product.tag}
          </span>
        )}
      </div>
      <div className="text-xs font-bold text-text-primary leading-tight line-clamp-2 group-hover/product:text-accent-orange transition-colors">
        {product.title}
      </div>
      <div className="flex items-center gap-1.5 mt-1">
        <span className="text-sm font-black text-text-primary">{product.price}</span>
        {product.oldPrice && (
          <span className="text-[10px] text-text-muted line-through">{product.oldPrice}</span>
        )}
      </div>
    </a>
  );
}

export default function AffiliateCard({ variant, weather }: Props) {
  const section = variant === "top" ? getTopProducts(weather) : getBottomProducts(weather);

  return (
    <div className="card p-5 overflow-hidden relative">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h4 className="text-sm font-bold text-text-primary">{section.heading}</h4>
          <span className="text-[10px] text-text-muted">{section.subtitle}</span>
        </div>
        <span className="text-[9px] font-bold uppercase tracking-wider text-accent-orange/70 bg-accent-orange/10 px-2 py-0.5 rounded-full">Advertentie</span>
      </div>
      <div className="horizontal-scroll no-scrollbar gap-3">
        {section.products.map((product, i) => (
          <ProductCard key={`${product.title}-${i}`} product={product} />
        ))}
      </div>
    </div>
  );
}
