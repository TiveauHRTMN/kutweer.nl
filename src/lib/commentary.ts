import type { WeatherData } from "./types";
import { getWeatherDescription } from "./weather";

// ============================================================
// Commentary engine — WEERZONE: zakelijk, zelfverzekerd, precies.
// 48 uur vooruit, op 1 bij 1 km.
// Kijkt naar CURRENT + komende uren + morgen voor context.
// ============================================================
export function getMainCommentary(w: WeatherData): string {
  const currentDesc = getWeatherDescription(w.current.weatherCode);
  const tomorrow = w.daily[1];
  const rainNext6h = w.hourly.slice(0, 6).reduce((acc, h) => acc + h.precipitation, 0).toFixed(1);
  
  let report = `Op dit moment is het ${currentDesc.toLowerCase()} in de omgeving. De thermometer wijst ${w.current.temperature}° aan, `;
  
  if (w.current.feelsLike < w.current.temperature - 2) {
    report += `maar door de wind voelt het aan als een schrale ${w.current.feelsLike}°. `;
  } else {
    report += `en dat voelt buiten ook daadwerkelijk zo aan. `;
  }

  if (w.current.precipitation > 0) {
    report += `Het regent momenteel aardig door met ${w.current.precipitation}mm nu. `;
  } else if (parseFloat(rainNext6h) > 0.5) {
    report += `Het is nu nog droog, maar houd rekening met zo'n ${rainNext6h}mm aan nattigheid in de komende uren. `;
  } else {
    report += `Voorlopig houden we het droog, dus daar hoef je je geen zorgen over te maken. `;
  }

  if (tomorrow) {
    report += `Morgen schakelen we over naar ${getWeatherDescription(tomorrow.weatherCode).toLowerCase()} met een maximumtemperatuur van rond de ${tomorrow.tempMax}°. `;
  }

  report += "Dit is de nauwkeurigste voorspelling voor jouw locatie.";
  
  return report;
}

export function getMisereScore(w: WeatherData): { score: number; label: string; emoji: string } {
  let score = 5; // baseline

  const t = w.current.temperature;
  const rain = w.current.precipitation;
  const wind = w.current.windSpeed;
  const code = w.current.weatherCode;

  // Temperatuur (ideaal = 18-22°C)
  if (t >= 18 && t <= 22) score -= 2;
  else if (t >= 15 && t <= 25) score -= 1;
  else if (t >= 10 && t <= 28) score += 0;
  else if (t < 0 || t > 33) score += 3;
  else if (t < 5 || t > 30) score += 2;
  else score += 1;

  // Regen
  if (rain === 0) score -= 1.5;
  else if (rain < 1) score += 1;
  else if (rain < 5) score += 2;
  else score += 3;

  // Wind
  if (wind < 15) score -= 0.5;
  else if (wind < 30) score += 0.5;
  else if (wind < 50) score += 1.5;
  else score += 2.5;

  // Weercode
  if (code === 0) score -= 1;
  if (code >= 95) score += 2;
  if (code >= 71 && code <= 77) score += 1;

  // Komende uren: verslechtering straft extra
  const rainNext3h = w.hourly.slice(0, 3).filter(h => h.precipitation > 0.5).length;
  if (rainNext3h >= 2) score += 1;

  // Clamp
  score = Math.max(0.5, Math.min(10, Math.round(score * 10) / 10));

  if (score <= 2) return { score, label: "Prachtig weer. Ideaal om naar buiten te gaan.", emoji: "😎" };
  if (score <= 4) return { score, label: "Prima weer. Niets op aan te merken.", emoji: "🙂" };
  if (score <= 6) return { score, label: "Matig weer. Een jasje kan geen kwaad.", emoji: "😐" };
  if (score <= 8) return { score, label: "Slecht weer. Blijf lekker binnen als het kan.", emoji: "😒" };
  return { score, label: "Zeer slecht weer. Sterkte vandaag.", emoji: "💀" };
}

export function getFietsScore(w: WeatherData): { score: number; label: string } {
  let score = 10;

  if (w.current.precipitation > 0) score -= 4;
  if (w.current.precipitation > 2) score -= 3;
  if (w.current.windSpeed > 30) score -= 2;
  if (w.current.windSpeed > 50) score -= 3;
  if (w.current.temperature < 0) score -= 2;
  if (w.current.temperature < 5) score -= 1;
  if (w.current.weatherCode >= 95) score -= 3;
  if (w.current.weatherCode >= 45 && w.current.weatherCode <= 48) score -= 1;

  score = Math.max(0, Math.min(10, Math.round(score * 10) / 10));

  if (score >= 8) return { score, label: "Uitstekend fietsweer. Geniet van de rit." };
  if (score >= 6) return { score, label: "Prima te doen op de fiets. Jasje mee voor de zekerheid." };
  if (score >= 4) return { score, label: "Het kan, maar het is niet ideaal." };
  if (score >= 2) return { score, label: "Alleen voor de echte doorzetters." };
  return { score, label: "Geen aanrader om nu de fiets te pakken." };
}

export function getOutfitAdvice(w: WeatherData): { emoji: string; advice: string } {
  const t = w.current.feelsLike;
  const rain = w.current.precipitation;
  const rainComing = w.hourly.slice(0, 6).some(h => h.precipitation > 0.5);

  if (t >= 25) {
    return { emoji: "🩳", advice: rain > 0 || rainComing ? "Korte broek, maar neem een regenjas mee." : "Kort en luchtig. Vergeet je niet in te smeren." };
  }
  if (t >= 18) {
    return { emoji: "👕", advice: rain > 0 || rainComing ? "T-shirt, maar houd een regenjas bij de hand." : "T-shirt weer. Geniet ervan zolang het duurt." };
  }
  if (t >= 12) {
    return { emoji: "🧥", advice: `Jas mee. ${rainComing ? "Een waterdichte jas is verstandig." : "Een licht jack is voldoende."}` };
  }
  if (t >= 5) {
    return { emoji: "🧥", advice: "Winterjas. Het is frisser dan je denkt." };
  }
  if (t >= 0) {
    return { emoji: "🧣", advice: "Sjaal en handschoenen zijn geen overbodige luxe." };
  }
  return { emoji: "🥶", advice: "Kleed je warm aan. Thermisch ondergoed is aanbevolen." };
}

export function getWindComment(wind: number, gusts: number): string {
  if (gusts > 80) return "Windstoten boven de 80 km/u. Extreem gevaarlijk — blijf binnen.";
  if (gusts > 60) return "Zware rukwinden. Houd losse spullen binnen en wees voorzichtig.";
  if (wind > 40) return "Stevige wind. Vermijd het water en open terrein.";
  if (wind > 25) return "Behoorlijk wat wind. Fietsen kost flink meer moeite.";
  if (wind > 15) return "Een frisse bries. Merkbaar, maar prima te doen.";
  return "Windstil. Een zeldzame, aangename dag.";
}

export function getKutweerScore(w: WeatherData): number {
  return getMisereScore(w).score;
}

export function getDayProgression(w: WeatherData): string {
  const hourly = w.hourly.slice(0, 24);
  if (hourly.length < 24) return "";

  const parts = [
    { name: "Ochtend", range: [6, 12] },
    { name: "Middag", range: [12, 18] },
    { name: "Avond", range: [18, 24] },
  ];

  const summaries = parts.map((part) => {
    const periodHours = hourly.filter(
      (_, i) => i >= part.range[0] && i < part.range[1]
    );
    if (periodHours.length === 0) return `${part.name} —`;
    const avgCode =
      periodHours.reduce((acc, h) => acc + h.weatherCode, 0) /
      periodHours.length;
    const maxPrecip = Math.max(...periodHours.map((h) => h.precipitation));

    let desc = "";
    if (maxPrecip > 0.5) desc = "regen";
    else if (avgCode <= 1) desc = "zon";
    else if (avgCode <= 3) desc = "lichte bewolking";
    else desc = "bewolkt";

    return `${part.name} ${desc}`;
  });

  return summaries.join(", ") + ".";
}

const ROTATING_QUOTES = [
  "De nauwkeurigste 48-uurs weersverwachting van Nederland.",
  "Voorspellingen op 1 bij 1 kilometer — precies voor jouw locatie.",
  "Waarom 48 uur? Dat is zo ver als een voorspelling betrouwbaar reikt.",
  "WEERZONE: het weerbericht teruggebracht tot wat echt klopt.",
  "Nauwkeurig tot op de straat, tot 48 uur vooruit.",
  "Helder, precies en betrouwbaar — 48 uur vooruit.",
  "Een eerlijk en nauwkeurig verslag van wat je kunt verwachten.",
];

export function getOneLiner(w: WeatherData): string {
  const code = w.current.weatherCode;
  const temp = w.current.temperature;
  const rain = w.current.precipitation;
  const wind = w.current.windSpeed;

  if (code >= 95) return "Onweer en zware buien. Blijf binnen.";
  if (rain > 5) return "Het regent flink. Neem een paraplu mee.";
  if (wind > 40) return "Zeer harde wind. Let op losse spullen.";
  if (temp > 28) return "Heet! Zoek de schaduw op.";
  if (temp < 0) return "Het vriest. Kleed je dik aan.";
  if (code <= 1 && temp > 18) return "Prachtig zonnig weer. Geniet ervan.";
  if (code <= 1) return "Lekker zonnig vandaag.";
  return "Gewoon Hollands weer. Prima dag.";
}

export function getRandomQuote(): string {
  return ROTATING_QUOTES[Math.floor(Math.random() * ROTATING_QUOTES.length)];
}

export function getUvLabel(uv: number): { label: string; color: string } {
  if (uv <= 2) return { label: "Laag — geen bescherming nodig", color: "#34d399" };
  if (uv <= 5) return { label: "Matig — zonnebrand aanbevolen", color: "#f0a040" };
  if (uv <= 7) return { label: "Hoog — factor 30 minimaal", color: "#e8743a" };
  if (uv <= 10) return { label: "Zeer hoog — factor 50 en schaduw opzoeken", color: "#ef4444" };
  return { label: "Extreem — huidbeschadiging binnen enkele minuten", color: "#a855f7" };
}

export function getBbqScore(w: WeatherData): number {
    let score = 10;
    const t = w.current.temperature;
    if (t < 15) score -= 4;
    else if (t < 20) score -= 1.5;
    else if (t > 32) score -= 2.5;

    if (w.current.precipitation > 0) score -= 7;
    if (w.current.windSpeed > 25) score -= 3;
    if (w.current.windSpeed > 40) score -= 5;
    
    return Math.max(1, Math.min(10, Math.round(score)));
}

export function getStrandScore(w: WeatherData): number {
    let score = 1;
    const t = w.current.temperature;
    const uv = w.uvIndex;
    
    if (t > 20) score += 4;
    if (t > 24) score += 2;
    if (t > 28) score += 1;
    if (uv > 4) score += 2;
    if (uv > 7) score += 1;
    
    if (w.current.precipitation > 0) score -= 5;
    if (w.current.windSpeed > 40) score -= 3;
    
    return Math.max(1, Math.min(10, Math.round(score)));
}

export function getHooikoortsScore(w: WeatherData): number {
    // Hooikoorts is erger bij droog, zonnig weer met een briesje
    let score = 1;
    if (w.current.precipitation === 0) score += 5;
    if (w.current.windSpeed > 10 && w.current.windSpeed < 30) score += 3;
    if (w.current.temperature > 15) score += 1;
    
    if (w.current.precipitation > 2) score -= 4;
    
    return Math.max(1, Math.min(10, Math.round(score)));
}

export function getHardloopScore(w: WeatherData): number {
    let score = 10;
    const t = w.current.temperature;
    
    // Ideaal tussen 8 en 16 graden
    if (t < 5) score -= 2;
    if (t > 20) score -= 3;
    if (t > 25) score -= 4;
    if (t > 30) score -= 2;

    if (w.current.precipitation > 0.5) score -= 4;
    if (w.current.windSpeed > 35) score -= 4;
    if (w.current.humidity > 85) score -= 1;
    
    return Math.max(1, Math.min(10, Math.round(score)));
}

export function getTerrasScore(w: WeatherData): number {
    let score = 1;
    const t = w.current.temperature;
    const isDay = w.current.isDay;
    
    if (t > 15) score += 3;
    if (t > 18) score += 3;
    if (t > 22) score += 2;
    if (t > 28) score += 1;
    if (w.current.precipitation === 0) score += 1;
    if (w.current.windSpeed < 15) score += 1;
    
    // Avond terrasje bonus
    if (!isDay && t > 16) score += 2;
    
    if (w.current.precipitation > 0) score -= 6;
    if (w.current.windSpeed > 35) score -= 3;
    if (t < 12) score -= 4;

    return Math.max(1, Math.min(10, Math.round(score)));
}

export function getWandelScore(w: WeatherData): number {
    // Wandelen: droog, niet te koud, niet te veel wind
    let score = 10;
    const t = w.current.temperature;
    if (t < 5) score -= 3;
    if (t > 28) score -= 3;
    if (w.current.precipitation > 0) score -= 5;
    if (w.current.windSpeed > 40) score -= 4;
    return Math.max(1, Math.min(10, Math.round(score)));
}

