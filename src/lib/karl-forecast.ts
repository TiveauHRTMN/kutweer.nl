import { unstable_cache } from "next/cache";
import { hermesChat } from "@/lib/hermes";
import { fetchDwdBriefing } from "@/lib/dwd-briefing";
import type { WeatherData } from "@/lib/types";

const WC_LABEL_DE: Record<number, string> = {
  0: "strahlend sonnig", 1: "sonnig", 2: "leicht bewölkt", 3: "bewölkt",
  45: "neblig", 48: "neblig mit Reif",
  51: "leichter Nieselregen", 53: "mäßiger Nieselregen", 55: "starker Nieselregen",
  61: "leichter Regen", 63: "mäßiger Regen", 65: "starker Regen",
  71: "leichter Schneefall", 73: "mäßiger Schneefall", 75: "starker Schneefall",
  80: "Regenschauer", 81: "kräftige Schauer", 82: "heftige Schauer",
  95: "Gewitter", 96: "Gewitter mit Hagel", 99: "schweres Gewitter mit Hagel",
};

function wcLabel(code: number): string {
  return WC_LABEL_DE[code] ?? "wechselhaft";
}

const TAGE = ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"];

function tagName(offsetDagen = 0): string {
  const d = new Date(new Date().toLocaleString("en-US", { timeZone: "Europe/Berlin" }));
  d.setDate(d.getDate() + offsetDagen);
  return TAGE[d.getDay()];
}

function weatherToContext(w: WeatherData, city: string): string {
  const now = w.current;
  const today = w.daily[0];
  const tomorrow = w.daily[1];
  const heute = tagName(0);
  const morgen = tagName(1);

  const hourlyLines = w.hourly
    .slice(0, 18)
    .filter((_, i) => i % 3 === 0)
    .map((h) => {
      const time = new Date(h.time).toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" });
      return `  ${time}: ${h.temperature}° ${wcLabel(h.weatherCode)}, ${h.precipitation}mm, Wind ${h.windSpeed}km/h`;
    })
    .join("\n");

  const lines = [
    `Standort: ${city}`,
    `Jetzt: ${now.temperature}°C (gefühlt ${now.feelsLike}°), ${wcLabel(now.weatherCode)}, Wind ${now.windSpeed}km/h (Böen ${now.windGusts}), Niederschlag ${now.precipitation}mm, Luftfeuchtigkeit ${now.humidity}%.`,
    `${heute} (heute): min ${today.tempMin}°, max ${today.tempMax}°, ${wcLabel(today.weatherCode)}, Niederschlag ${today.precipitationSum}mm, Wind max ${today.windSpeedMax}km/h, Sonne ${today.sunHours}h.`,
    `Stundenverlauf ${heute}:\n${hourlyLines}`,
  ];

  if (tomorrow) {
    lines.push(`${morgen} (morgen): min ${tomorrow.tempMin}°, max ${tomorrow.tempMax}°, ${wcLabel(tomorrow.weatherCode)}, Niederschlag ${tomorrow.precipitationSum}mm.`);
  }

  return lines.join("\n\n");
}

const KARL_SYSTEM = `
Du bist Karl — ein ganz normaler deutscher Nachbar, der das Wetter ernsthaft als Hobby verfolgt. Du erzählst es jemandem beim Kaffee oder am Gartenzaun: direkt, locker, mit gelegentlich trockenem Humor. Immer faktisch korrekt und grammatikalisch sauber.

TON:
- Konversationell aber gepflegt. Kein schlampiger Sprachgebrauch.
- Trockener Humor okay — eine Bemerkung, die sitzt, kein Witz, den man erklären muss.
- Nie dramatisch. Schlechtes Wetter ist einfach schlechtes Wetter.
- Schreib, als hättest du das Wetter heute Morgen schon gecheckt und deine Einschätzung steht.

STRUKTUR:
- 2 bis 3 fließende Absätze. Keine Bullet-Points, keine Listen, keine Überschriften.
- Erster Absatz: den Tag in einer Bewegung einordnen.
- Zweiter Absatz: den Verlauf oder die Details, die wirklich wichtig sind.
- Dritter Absatz (optional): morgen kurz antippen, wenn relevant.

TAGE — PFLICHT:
- Schreib immer den konkreten Wochentag, nie vage Zeitangaben.
- NICHT verwenden: "heute", "nachmittags", "abends", "morgen" alleine.
- WOHL verwenden: "Sonntagnachmittag", "Montagmorgen", "morgen (Montag)", "Dienstagabend".
- Die Daten geben die Tagesnamen mit — nutze sie in deinem Text.

VERBOTEN:
- Kein Meteo-Fachjargon ("Trog", "Tiefdruckgebiet", "Front", "Hochdruckgebiet").
- Keine Anglizismen.
- Kein "Es besteht die Möglichkeit von...", "Meteorologisch gesehen...".
- Keine Quellenangabe oder Selbstreferenz ("Der DWD sagt...", "laut den Daten...").
- Keine Emojis. Maximal 200 Wörter.

Liefere nur den Text. Nichts drumherum.
`.trim();

async function _generate(w: WeatherData, city: string): Promise<string | null> {
  const [briefing, weatherContext] = await Promise.all([
    fetchDwdBriefing("deutschland").catch(() => null),
    Promise.resolve(weatherToContext(w, city)),
  ]);

  const briefingText = briefing ? briefing.paragraphs.join("\n\n") : null;
  const userPrompt = briefingText
    ? `OFFIZIELLER DWD-WETTERBERICHT (nutze als faktische Basis, schreib in deinem Stil um):\n"${briefingText}"\n\nHYPERLOKALE DATEN für ${city}:\n${weatherContext}`
    : `HYPERLOKALE DATEN für ${city}:\n${weatherContext}`;

  try {
    const text = await hermesChat(
      [
        { role: "system", content: KARL_SYSTEM },
        { role: "user", content: userPrompt },
      ],
      { model: "persona", temperature: 0.72, maxTokens: 350 }
    );
    return text.trim() || null;
  } catch {
    return null;
  }
}

/**
 * Genereert Karls Wetterbericht: DWD-Wetterbericht + hyperlokale Open-Meteo data → LLM.
 * Gecached per ~1km² per 30 minuten.
 */
export function fetchKarlWetterbericht(
  lat: number,
  lon: number,
  city: string,
  weather: WeatherData,
): Promise<string | null> {
  const latKey = String(Math.round(lat * 10));
  const lonKey = String(Math.round(lon * 10));
  const dateKey = new Date().toLocaleDateString("sv-SE", { timeZone: "Europe/Berlin" });

  return unstable_cache(
    () => _generate(weather, city),
    ["karl-wetterbericht", latKey, lonKey, dateKey],
    { revalidate: 1800, tags: ["karl-wetterbericht"] },
  )();
}
