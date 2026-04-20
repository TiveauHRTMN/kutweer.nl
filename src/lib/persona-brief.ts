import { GoogleGenerativeAI } from "@google/generative-ai";
import { PERSONAS, type PersonaTier } from "@/lib/personas";

export interface WeatherSnapshot {
  current: {
    temperature: number;
    feelsLike: number;
    windSpeed: number;
    windGusts: number;
    precipitation: number;
    weatherCode: number;
    humidity: number;
  };
  daily: {
    tempMax: number;
    tempMin: number;
    precipitationSum: number;
    weatherCode: number;
    windMax: number;
  };
  hourlySummary: string; // bv. "07:00 droog 8°, 12:00 bui 11°, 18:00 wind 35km/u"
}

export interface PersonaBrief {
  subject: string;       // mail-onderwerp
  greeting: string;      // "Goedemorgen, Roy."
  verdict: string;       // 1-2 zinnen scherpe samenvatting
  details: string[];     // 2-4 bullets met concrete adviezen
  closing: string;       // afsluiter in character
}

export interface BriefContext {
  tier: PersonaTier;
  firstName?: string | null;
  city: string;
  weather: WeatherSnapshot;
  prefs: Record<string, unknown>; // persona_preferences JSONB
}

// ---------- WEERZONE Short-Prompt ----------
// ---------- WEERZONE Core Style ----------
// Professioneel, analytisch en kernachtig. Het weer als kritieke data-stroom.
// Scherp maar beschaafd. Geen ruis, geen fluff. De rest is ruis.

const WEERZONE_SHORT_PROMPT = `
HUISSTIJL — WEERZONE:
Hanteer de stijl van WEERZONE: Professioneel, direct en data-gedreven.

PROTOCOLLEN:
- GEEN RUIS. Skip irrelevante beleefdheden. Focus op de feiten. Herhaal geen technische cijferlijstjes die al in de data-bron staan; analyseer de impact.
- LEXICON. Gebruik zakelijke maar rake termen: 'meteorologische analyse', 'impact-analyse', '48-uurs window'. 
- DATA ALS FUNDAMENT. Breng data als een onbetwistbare waarheid. Geen mitsen of maren als de data duidelijk is.
- DE FILTER. Schrijf beknopt, als een ervaren meteorologisch expert die spreekt tegen een gewaardeerde cliënt. 
  Scherp op de inhoud, tekstueel superieur, zonder overbodige cijferreeksen in de tekst.

HARDE GRENZEN (die blijven staan, ook in karakter):
- 100% correct Nederlands. Spelling en grammatica kloppen, punt.
- Geen anglicismen: géén "stay safe", "enjoy", "check it", "oant moarn".
- Geen scheldwoorden die gericht zijn op etniciteit, geloof, geaardheid,
  geslacht of beperking. Cynisme richten op instituten, apps, media en
  de 14-daagse. Nooit op groepen mensen.
- Geen echte namen van derden, geen roddels over personen, geen
  beschuldigingen van individuen.
- Maximaal 1-2 emoji in de hele mail. Geen uitroeptekens achter elkaar.

FORMAAT — lever strikt JSON:
{
  "subject": "string, max 70 tekens, prikkelend, geen clickbait",
  "greeting": "string, max 40 tekens, in karakter",
  "verdict": "string, 4-6 KORTE zinnen — elk op een nieuwe regel (\n). Geen opsommingen of sterretjes. Ideaal voor Photoshop.",
  "details": ["string","string","string"],
  "closing": "string, max 90 tekens, droog, in karakter"
}
Lever UITSLUITEND dat JSON-object. Geen code fence, geen uitleg eromheen.
`.trim();

// SHARED_STYLE blijft voor backwards-compat zodat de userPrompt niet breekt
const SHARED_STYLE = WEERZONE_SHORT_PROMPT;

const PIET_SYSTEM = `
Je bent Piet. Archetype: De vertrouwde, ervaren weerman. Nuchter, 
boerenverstand, maar met de precisie van een Zwitsers uurwerk. 
Je praat tegen de lezer op een toegankelijke maar professionele manier. 
Je bent eerlijk over de onzekerheden, maar beslist over de feiten. 
Geen onnodige franje, alleen wat de gebruiker écht moet weten voor zijn dag.
`.trim();

const REED_SYSTEM = `
Je bent Reed. Archetype: De wachter. Gefocust op extremen en 
impact-volle events. Je bent direct, urgent wanneer nodig, en 
volledig wars van sensatiezucht van de massa-media. Je waarschuwt 
alleen als de data daar aanleiding toe geeft. Scherp, koel, en 
altijd kijkend naar de risico's.
`.trim();

const STEVE_SYSTEM = `
Je bent Steve. Archetype: De strateeg. Minimalistisch, 
compromisloos en gericht op zakelijke resultaten. Je vertaalt 
het weer naar Euro's en ROI. Geen geduld voor excuses of 
vage voorspellingen. Je geeft advies dat leidt tot actie: 
optimaliseren of consolideren. Kort, krachtig en zakelijk superieur.
`.trim();

function systemFor(tier: PersonaTier): string {
  if (tier === "piet") return PIET_SYSTEM;
  if (tier === "reed") return REED_SYSTEM;
  return STEVE_SYSTEM;
}

// ---------- Prompt builder ----------

function humanisePrefs(tier: PersonaTier, prefs: Record<string, unknown>): string {
  const lines: string[] = [];
  if (tier === "piet") {
    const hond = (prefs.hond as { naam?: string } | undefined)?.naam;
    if (hond) lines.push(`- Hond: ${hond}`);
    if (prefs.fiets) lines.push("- Fietst dagelijks");
    if (prefs.tuin) lines.push("- Heeft tuin");
    if (prefs.kinderen) lines.push("- Heeft kinderen");
    if (prefs.astma) lines.push("- Astma / luchtweggevoelig");
  }
  if (tier === "reed") {
    if (prefs.kelder_gevoelig) lines.push("- Kelder gevoelig voor water");
    if (prefs.plat_dak) lines.push("- Plat dak (windgevoelig)");
    if (prefs.baby) lines.push("- Baby in huis");
    if (prefs.paard_wei) lines.push("- Paarden in de wei");
    if (prefs.waterschade_historie) lines.push(`- Waterschade-historie: ${prefs.waterschade_historie}`);
  }
  if (tier === "steve") {
    if (prefs.branche) lines.push(`- Branche: ${prefs.branche}`);
    if (prefs.capaciteit) lines.push(`- Capaciteit: ${prefs.capaciteit} plekken`);
    const d = prefs.drempels as Record<string, unknown> | undefined;
    if (d) lines.push(`- Drempels: wind ${d.wind_bft ?? "?"} bft, regen ${d.regen_mm ?? "?"} mm, temp min ${d.temp_min ?? "?"}°, onweer ${d.onweer ? "ja" : "nee"}`);
    const dl = prefs.deadlines as Record<string, unknown> | undefined;
    if (dl) lines.push(`- Deadlines: inkoop ${dl.inkoop_uur ?? "?"}u, annulering ${dl.annulering_uur ?? "?"}u`);
  }
  return lines.length ? lines.join("\n") : "- (nog geen voorkeuren ingesteld)";
}

function weatherToPrompt(w: WeatherSnapshot): string {
  return [
    `Nu: ${w.current.temperature}°C (voelt ${w.current.feelsLike}°), wind ${w.current.windSpeed} km/u (vlagen ${w.current.windGusts}), neerslag ${w.current.precipitation} mm, vocht ${w.current.humidity}%, code ${w.current.weatherCode}.`,
    `Vandaag: min ${w.daily.tempMin}°, max ${w.daily.tempMax}°, neerslag ${w.daily.precipitationSum} mm, wind-max ${w.daily.windMax} km/u, code ${w.daily.weatherCode}.`,
    `Verloop: ${w.hourlySummary}`,
  ].join("\n");
}

export async function generatePersonaBrief(
  ctx: BriefContext,
): Promise<PersonaBrief> {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY ontbreekt");

  const persona = PERSONAS[ctx.tier];
  const system = systemFor(ctx.tier);
  const prefsStr = humanisePrefs(ctx.tier, ctx.prefs);
  const weatherStr = weatherToPrompt(ctx.weather);
  const date = new Date().toLocaleDateString("nl-NL", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  const userPrompt = `
Schrijf de dagelijkse ${persona.name}-brief voor ${ctx.firstName ?? "de lezer"} in ${ctx.city} (${date}).

PROFIEL:
${prefsStr}

WEERDATA VANDAAG (KNMI HARMONIE):
${weatherStr}

${SHARED_STYLE}
`.trim();

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: "gemini-3-flash-preview",
    systemInstruction: system,
    generationConfig: {
      temperature: 0.85,
      maxOutputTokens: 800,
      responseMimeType: "application/json",
    },
  });

  const result = await model.generateContent(userPrompt);
  const raw = result.response.text().trim();
  const parsed = JSON.parse(raw) as PersonaBrief;

  // Defensieve sanering
  return {
    subject: (parsed.subject ?? `${persona.name} — ${ctx.city}`).slice(0, 100),
    greeting: (parsed.greeting ?? `Goedemorgen${ctx.firstName ? `, ${ctx.firstName}` : ""}.`).slice(0, 80),
    verdict: parsed.verdict ?? "",
    details: Array.isArray(parsed.details) ? parsed.details.slice(0, 4) : [],
    closing: (parsed.closing ?? "").slice(0, 140),
  };
}
