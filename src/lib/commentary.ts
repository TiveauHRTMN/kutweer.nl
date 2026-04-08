import type { WeatherData } from "./types";

// ============================================================
// Commentary engine — WeerZone: brutaal, direct, geen gelul
// De brutale weerdienst van Nederland.
// ============================================================

export function getMainCommentary(w: WeatherData): string {
  const t = w.current.temperature;
  const rain = w.current.precipitation;
  const wind = w.current.windSpeed;
  const code = w.current.weatherCode;

  // Regen
  if (rain > 5) return "Het regent alsof God een emmer omgooit. Maar je wist het al — wij zeiden het.";
  if (rain > 1) return "Regen. Verrassing? Niet als je WeerZone checkt.";
  if (rain > 0) return "Lichte motregen. Net genoeg om je dag te verpesten.";

  // Sneeuw
  if (code >= 71 && code <= 77) return "Sneeuw. Over 10 minuten staat half Nederland stil.";

  // Onweer
  if (code >= 95) return "Onweer. Bliksem, donder, drama. Binnenblijven.";

  // Mist
  if (code >= 45 && code <= 48) return "Dikke mist. Je ziet geen hand voor ogen. Wij zien wél 48 uur vooruit.";

  // Wind
  if (wind > 60) return "Storm. Als je nu naar buiten gaat verdien je een Darwin Award.";
  if (wind > 40) return "Het waait als een malle. Je fiets? Die ligt al om.";

  // Temperatuur extremen
  if (t >= 30) return "Tropenrooster. Nederland smelt. Airco is geen luxe, het is zelfbehoud.";
  if (t >= 25) return "Warm. Heel Nederland rent naar de Hema voor een ijsje. Terecht.";
  if (t <= -5) return "Het vriest dat het kraakt. Geen discussie: alles aan, jas dicht, muts op.";
  if (t <= 0) return "Onder nul. Je vingers zijn straks decoratie als je geen handschoenen pakt.";

  // Mooi weer
  if (code <= 2 && t >= 15 && wind < 25) {
    return "Het is prachtweer. Scherm uit, naar buiten, nu.";
  }
  if (code <= 3 && t >= 10) {
    return "Prima weer. Niet spectaculair, maar je mag niet klagen.";
  }

  // Default
  if (t < 5) return "Koud en grijs. Welkom in Nederland.";
  if (t < 10) return "Frisjes. Jas aan. Niet onderhandelen.";
  return "Doorsnee Nederlands weer. Het is wat het is.";
}

export function getKutweerScore(w: WeatherData): { score: number; label: string; emoji: string } {
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

  // Clamp
  score = Math.max(0.5, Math.min(10, Math.round(score * 10) / 10));

  if (score <= 2) return { score, label: "Perfect weer. Telefoon weg, naar buiten.", emoji: "😎" };
  if (score <= 4) return { score, label: "Niks mis mee. Gewoon genieten.", emoji: "🙂" };
  if (score <= 6) return { score, label: "Mwah. Je overleeft het wel.", emoji: "😐" };
  if (score <= 8) return { score, label: "Bagger. Netflix en chill.", emoji: "😒" };
  return { score, label: "Echt dramatisch. Condoleances.", emoji: "💀" };
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

  if (score >= 8) return { score, label: "Topweer om te fietsen. Geen excuus." };
  if (score >= 6) return { score, label: "Prima te doen. Jas mee, niet janken." };
  if (score >= 4) return { score, label: "Kan. Maar je gaat er niet van genieten." };
  if (score >= 2) return { score, label: "Alleen voor de harde kern. Of masochisten." };
  return { score, label: "Nee. Gewoon nee. OV. Uber. Kruipen. Alles beter dan fietsen." };
}

export function getOutfitAdvice(w: WeatherData): { emoji: string; advice: string } {
  const t = w.current.feelsLike;
  const rain = w.current.precipitation;

  if (t >= 25) {
    return { emoji: "🩳", advice: rain > 0 ? "Kort, maar paraplu mee tenzij je graag een natte kat speelt." : "Kort en luchtig. Smeer je in, je bent geen krokodil." };
  }
  if (t >= 18) {
    return { emoji: "👕", advice: rain > 0 ? "T-shirt, maar pak die regenjas. Vertrouw ons." : "T-shirt weer. Eindelijk. Geniet ervan, duurt toch niet lang." };
  }
  if (t >= 12) {
    return { emoji: "🧥", advice: "Jas mee. Niet discussiëren. Je moeder had gelijk." };
  }
  if (t >= 5) {
    return { emoji: "🧥", advice: "Winterjas. Het voelt kouder dan je denkt. Altijd." };
  }
  if (t >= 0) {
    return { emoji: "🧣", advice: "Sjaal, muts, handschoenen. De hele handel. Geen stoer doen." };
  }
  return { emoji: "🥶", advice: "Alles aan. Thermisch ondergoed is geen schande, het is overlevingsstrategie." };
}

export function getWindComment(wind: number, gusts: number): string {
  if (gusts > 80) return "Windstoten van boven de 80. Je fiets ligt om. Jij straks ook.";
  if (gusts > 60) return "Flinke rukwinden. Je paraplu? Die is al van iemand anders.";
  if (wind > 40) return "Stevig waaiig. Niet te dicht bij het water, niet stoer doen.";
  if (wind > 25) return "Behoorlijk wat wind. Fietsen wordt cardio.";
  if (wind > 15) return "Lekker briesje. Fris, maar te doen.";
  return "Windstil. Zeldzaam. Geniet ervan.";
}

const ROTATING_QUOTES = [
  "Andere apps voorspellen 14 dagen vooruit. Wij noemen dat: liegen.",
  "Morgen wordt het beter. Dat zeiden ze gisteren ook. Wij niet.",
  "\"Kans op zon\" is meteorologen-taal voor: we weten het niet. Wij weten het wél.",
  "48 uur. Meer heb je niet nodig. Meer is ook niet betrouwbaar.",
  "Je weer-app zegt 22° volgende week? Dat is een random number generator.",
  "KNMI HARMONIE + DWD ICON. Twee supercomputers. Eén eerlijk antwoord.",
  "14-daagse voorspelling? Dan kun je net zo goed een muntje opgooien.",
  "Fietsen in de regen bouwt karakter, zeggen mensen die een auto hebben.",
  "Het is weer jas-aan-jas-uit-jas-aan weer. Typisch.",
  "De windmolens draaien. Tenminste iemand die blij is met dit weer.",
  "Nederland: vier seizoenen op één dag. Soms op één uur.",
  "WeerZone liegt niet. Nooit. Dat doen die andere apps wel.",
  "Iedereen is meteoroloog totdat ze de paraplu vergeten.",
  "Wij beloven niks. Behalve dat de komende 48 uur klopt.",
  "\"Lekker weertje\" zeggen terwijl het 12 graden is. Dat zijn wij niet.",
  "De meest eerlijke weerdienst van Nederland. Brutaal? Nee. Eerlijk.",
  "Regen voorspeld? Dan regent het ook. Daar zijn we vrij stellig in.",
  "Je horoscoop is betrouwbaarder dan een 10-daagse weersverwachting.",
];

export function getRandomQuote(): string {
  return ROTATING_QUOTES[Math.floor(Math.random() * ROTATING_QUOTES.length)];
}

export function getUvLabel(uv: number): { label: string; color: string } {
  if (uv <= 2) return { label: "Laag", color: "#34d399" };
  if (uv <= 5) return { label: "Matig — smeren", color: "#f0a040" };
  if (uv <= 7) return { label: "Hoog — echt smeren", color: "#e8743a" };
  if (uv <= 10) return { label: "Zeer hoog — binnenblijven of factor 50", color: "#ef4444" };
  return { label: "Extreem — verbrandt in minuten", color: "#a855f7" };
}
