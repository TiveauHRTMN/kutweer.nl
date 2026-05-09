import { unstable_cache } from "next/cache";
import { hermesChat } from "@/lib/hermes";
import type { WeatherData } from "@/lib/types";

const WC_LABEL: Record<number, string> = {
  0: "stralend", 1: "zonnig", 2: "half bewolkt", 3: "bewolkt",
  45: "mistig", 48: "rijpige mist",
  51: "lichte motregen", 53: "matige motregen", 55: "dichte motregen",
  61: "lichte regen", 63: "matige regen", 65: "zware regen",
  71: "lichte sneeuw", 73: "matige sneeuw", 75: "zware sneeuw",
  80: "regenbuien", 81: "stevige buien", 82: "zware stortbuien",
  95: "onweer", 96: "onweer met hagel", 99: "zwaar onweer met hagel",
};

function wcLabel(code: number): string {
  return WC_LABEL[code] ?? "wisselend";
}

function weatherToPrompt(w: WeatherData, city: string): string {
  const now = w.current;
  const today = w.daily[0];
  const tomorrow = w.daily[1];

  const hourlyLines = w.hourly
    .slice(0, 18)
    .filter((_, i) => i % 3 === 0)
    .map((h) => {
      const time = new Date(h.time).toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" });
      return `${time}: ${h.temperature}° ${wcLabel(h.weatherCode)}, ${h.precipitation}mm, wind ${h.windSpeed}km/u`;
    })
    .join("\n");

  const lines = [
    `Locatie: ${city}`,
    `Nu: ${now.temperature}°C (voelt ${now.feelsLike}°), ${wcLabel(now.weatherCode)}, wind ${now.windSpeed}km/u (vlagen ${now.windGusts}), neerslag ${now.precipitation}mm, luchtvochtigheid ${now.humidity}%.`,
    `Vandaag: min ${today.tempMin}°, max ${today.tempMax}°, ${wcLabel(today.weatherCode)}, neerslag ${today.precipitationSum}mm, wind max ${today.windSpeedMax}km/u, zon ${today.sunHours}u.`,
    `Uurverloop:\n${hourlyLines}`,
  ];

  if (tomorrow) {
    lines.push(`Morgen: min ${tomorrow.tempMin}°, max ${tomorrow.tempMax}°, ${wcLabel(tomorrow.weatherCode)}, neerslag ${tomorrow.precipitationSum}mm.`);
  }

  return lines.join("\n\n");
}

const PIET_SYSTEM = `
Je bent Piet — een gewone Nederlandse buurman die het weer serieus bijhoudt als hobby. Je vertelt het aan iemand bij de koffie of bij het hek: direct, licht, met een droge noot hier en daar. Altijd feitelijk correct, altijd grammaticaal foutloos.

TOON:
- Conversationeel maar verzorgd. Geen slordig taalgebruik.
- Lichte droge humor mag — een opmerking die klopt, niet een grap die uitgelegd moet worden.
- Nooit dramatisch of paniekerig. Slecht weer is gewoon slecht weer.
- Schrijf alsof je er al vanochtend naar hebt gekeken en je conclusie al klaar is.

STRUCTUUR:
- 2 tot 3 vloeiende alinea's. Geen bullets, geen lijstjes, geen kopjes.
- Eerste alinea: de dag in één beweging neerzetten — wat voor dag wordt het?
- Tweede alinea: het verloop of de details die er écht toe doen.
- Derde alinea (optioneel, alleen als morgen relevant is): morgen kort aantippen.

VERBODEN:
- Geen meteorologie-jargon ("trog", "lagedrukgebied", "front", "hogedrukgebied", "instabiliteit").
- Geen anglicismen.
- Geen "Er is een kans op...", "Meteorologisch gezien...", "Het systeem verwacht...".
- Geen bronvermelding, geen zelfverwijzing.
- Geen emoji.
- Niet meer dan 200 woorden totaal.

Lever alleen de tekst. Niets eromheen.
`.trim();

async function _generate(w: WeatherData, city: string): Promise<string | null> {
  const weatherStr = weatherToPrompt(w, city);
  try {
    const text = await hermesChat(
      [
        { role: "system", content: PIET_SYSTEM },
        {
          role: "user",
          content: `Schrijf het weerbericht op basis van deze data:\n\n${weatherStr}`,
        },
      ],
      { model: "persona", temperature: 0.72, maxTokens: 350 }
    );
    return text.trim() || null;
  } catch {
    return null;
  }
}

/**
 * Genereert Piet's weerbericht voor een locatie.
 * Gecached per ~1km² per 30 minuten — LLM draait niet op elke pageload.
 */
export function fetchPietWeerbericht(
  lat: number,
  lon: number,
  city: string,
  weather: WeatherData
): Promise<string | null> {
  const latKey = String(Math.round(lat * 10));
  const lonKey = String(Math.round(lon * 10));
  const dateKey = new Date().toLocaleDateString("sv-SE", { timeZone: "Europe/Amsterdam" });

  const cached = unstable_cache(
    () => _generate(weather, city),
    ["piet-weerbericht", latKey, lonKey, dateKey],
    { revalidate: 1800, tags: ["piet-weerbericht"] }
  );

  return cached();
}
