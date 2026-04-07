"use client";

import type { WeatherData } from "@/lib/types";

interface Props {
  variant: "top" | "bottom";
  weather: WeatherData;
}

interface AffiliateItem {
  emoji: string;
  brand: string;
  title: string;
  description: string;
  cta: string;
  href: string;
}

// Top spot: Bol.com (weer-producten) vs Booking.com (vakantie bij kutweer)
// Logic: slecht weer → Booking.com vaker tonen, goed weer → Bol.com producten
function getTopAffiliate(weather: WeatherData): AffiliateItem {
  const temp = weather.current.temperature;
  const rain = weather.current.precipitation > 0 || weather.hourly.some(h => h.precipitation > 0.5);
  const cold = temp < 8;
  const hot = temp > 25;
  const kutWeer = rain || cold || weather.current.windSpeed > 35;

  // Rotate between Bol.com and Booking.com — but bias based on weather
  const hour = new Date().getHours();
  const showBooking = kutWeer
    ? hour % 3 !== 0  // Kutweer: Booking 2/3 van de tijd
    : hour % 4 === 0; // Goed weer: Booking 1/4 van de tijd

  if (showBooking) {
    // Booking.com — slecht weer = vakantie-drang
    if (cold && rain) {
      return {
        emoji: "✈️",
        brand: "Booking.com",
        title: "Koud en nat? Boek een zonvakantie",
        description: "Weg uit dit kutweer. Zon, zee en strand vanaf €199. Gratis annuleren.",
        cta: "Bekijk deals",
        href: "#booking-zon",
      };
    }
    if (rain) {
      return {
        emoji: "🏖️",
        brand: "Booking.com",
        title: "Regen zat? Vlieg naar de zon",
        description: "Last-minute zon-deals. Morgen al aan het strand. Gratis annuleren.",
        cta: "Ontsnap aan de regen",
        href: "#booking-lastminute",
      };
    }
    if (cold) {
      return {
        emoji: "🌴",
        brand: "Booking.com",
        title: "Klaar met de kou?",
        description: "Citytrip of strandvakantie. 30°C in plaats van deze ellende.",
        cta: "Bekijk bestemmingen",
        href: "#booking-warm",
      };
    }
    return {
      emoji: "🧳",
      brand: "Booking.com",
      title: "Weekendje weg?",
      description: "Lekker weer nu, maar wie weet morgen. Plan alvast je ontsnapping.",
      cta: "Bekijk aanbiedingen",
      href: "#booking-weekend",
    };
  }

  // Bol.com — weer-specifieke producten
  if (rain) {
    return {
      emoji: "☂️",
      brand: "Bol.com",
      title: "Droog blijven vandaag?",
      description: "Regenjassen, paraplu's en waterdichte tassen. Morgen in huis.",
      cta: "Bekijk op Bol.com",
      href: "#bol-regen",
    };
  }
  if (cold) {
    return {
      emoji: "🧣",
      brand: "Bol.com",
      title: "Warm blijven vandaag",
      description: "Thermokleding, handschoenen en mutsen. Morgen in huis.",
      cta: "Bekijk op Bol.com",
      href: "#bol-warm",
    };
  }
  if (hot) {
    return {
      emoji: "🧴",
      brand: "Bol.com",
      title: `UV-index ${weather.uvIndex.toFixed(0)} — smeer je in`,
      description: "Zonnebrand, zonnebrillen en ventilators. Snel geleverd.",
      cta: "Bekijk op Bol.com",
      href: "#bol-zon",
    };
  }
  // Goed weer fallback
  return {
    emoji: "🚴",
    brand: "Bol.com",
    title: "Lekker weer om naar buiten te gaan",
    description: "Fietsaccessoires, buitenspeelgoed en tuinmeubelen. Morgen in huis.",
    cta: "Bekijk op Bol.com",
    href: "#bol-buiten",
  };
}

// Bottom spot: Thuisbezorgd (slecht weer) vs Bol.com secundair (goed weer)
function getBottomAffiliate(weather: WeatherData): AffiliateItem {
  const temp = weather.current.temperature;
  const rain = weather.current.precipitation > 0 || weather.hourly.some(h => h.precipitation > 0.5);
  const cold = temp < 10;
  const kutWeer = rain || cold || weather.current.windSpeed > 35;

  // Kutweer → Thuisbezorgd is king
  if (kutWeer) {
    if (rain && cold) {
      return {
        emoji: "🍕",
        brand: "Thuisbezorgd",
        title: "Blijf lekker binnen",
        description: "Koud, nat, en geen zin om te koken? Bestel je favoriete eten. Binnen 30 min bezorgd.",
        cta: "Bestel nu",
        href: "#thuisbezorgd-regen",
      };
    }
    if (rain) {
      return {
        emoji: "🍜",
        brand: "Thuisbezorgd",
        title: "Regen + bank = bestellen",
        description: "Waarom zou je naar buiten gaan? Laat je eten bezorgen en geniet van de droogte binnen.",
        cta: "Bekijk restaurants",
        href: "#thuisbezorgd-comfort",
      };
    }
    return {
      emoji: "🍔",
      brand: "Thuisbezorgd",
      title: "Geen weer om te koken",
      description: "Kutweer buiten, comfort food binnen. Je favoriete restaurant bezorgt aan de deur.",
      cta: "Bestel eten",
      href: "#thuisbezorgd-kutweer",
    };
  }

  // Goed weer → Bol.com BBQ/tuin of Booking.com weekend
  const hour = new Date().getHours();
  if (hour % 2 === 0) {
    return {
      emoji: "🔥",
      brand: "Bol.com",
      title: "BBQ-weer!",
      description: "Profiteer van het goede weer. BBQ's, tuinmeubelen en buitenverlichting.",
      cta: "Bekijk op Bol.com",
      href: "#bol-bbq",
    };
  }
  return {
    emoji: "📱",
    brand: "Bol.com",
    title: "Eigen weerstation?",
    description: "Meet temperatuur, luchtvochtigheid en wind in je eigen tuin. Realtime op je telefoon.",
    cta: "Bekijk weerstations",
    href: "#bol-weerstation",
  };
}

export default function AffiliateCard({ variant, weather }: Props) {
  const item = variant === "top" ? getTopAffiliate(weather) : getBottomAffiliate(weather);

  return (
    <a
      href={item.href}
      className="card p-5 flex flex-col gap-4 group cursor-pointer border-accent-orange/20 hover:border-accent-orange/40 overflow-hidden relative"
      target="_blank"
      rel="noopener noreferrer sponsored"
    >
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-accent-orange via-accent-amber to-accent-orange opacity-60" />
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-accent-orange/15 to-accent-amber/15 flex items-center justify-center text-3xl shrink-0 group-hover:scale-110 transition-transform">
          {item.emoji}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-base font-bold text-text-primary">{item.title}</span>
            <span className="text-[9px] font-bold uppercase tracking-wider text-accent-orange/70 bg-accent-orange/10 px-2 py-0.5 rounded-full">{item.brand}</span>
          </div>
          <p className="text-sm text-text-secondary leading-relaxed">{item.description}</p>
        </div>
      </div>
      <div className="flex justify-end">
        <span className="btn-cta text-sm px-5 py-2.5 group-hover:translate-y-[-1px] transition-transform">{item.cta} →</span>
      </div>
    </a>
  );
}
