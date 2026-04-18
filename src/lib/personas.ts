// Centrale config voor Piet · Reed · Steve tiers.
// Eén bron van waarheid voor prijs, kleur, kopij, founder-lock.
// Gebruikt door: /prijzen, PersonaModal, FounderBanner, NavBar-badge, signup-flow.

export type PersonaTier = "piet" | "reed" | "steve";

export interface PersonaConfig {
  tier: PersonaTier;
  name: string;              // "Piet"
  label: string;             // "Basis" | "Waarschuwing" | "Zakelijk"
  color: string;             // hex
  colorVar: string;          // CSS var name
  tagline: string;           // korte propositie
  description: string;       // langere omschrijving
  priceCents: number;        // normale prijs vanaf 1 juni (cent)
  founderPriceCents: number; // founder-lock prijs voor altijd (cent)
  features: string[];        // bullets op kaartje
  audience: string;          // voor wie
  includes?: PersonaTier[];  // tier-hiërarchie: Reed bevat Piet
}

export const PERSONAS: Record<PersonaTier, PersonaConfig> = {
  piet: {
    tier: "piet",
    name: "Piet",
    label: "Basis",
    color: "#22c55e",
    colorVar: "--persona-piet",
    tagline: "Je persoonlijke weerbrief elke ochtend.",
    description:
      "Piet kent jou. Je locatie op de meter, je hobby's, je hond, je fietsroute. Geen dashboard, geen app — één mail die weet wat jij vandaag gaat doen.",
    priceCents: 499,
    founderPriceCents: 299,
    features: [
      "Dagelijks 07:00 in je inbox",
      "48-uur op jouw GPS-locatie (KNMI HARMONIE 2,5 km)",
      "Persoonlijk: kent je hond, fiets, tuin, kinderen",
      "Live dashboard met uurdetail",
      "Geen ads, geen ruis",
    ],
    audience: "Voor wie het weer écht wil weten, persoonlijk gemaakt.",
  },
  reed: {
    tier: "reed",
    name: "Reed",
    label: "Waarschuwing",
    color: "#ef4444",
    colorVar: "--persona-reed",
    tagline: "Piet + slimme waarschuwingen als het ertoe doet.",
    description:
      "Alles van Piet. Plus Reed: meldt zich alleen als er echt iets aankomt voor jouw huis, jouw gezin, jouw situatie. Geen generieke code-geel-spam.",
    priceCents: 799,
    founderPriceCents: 499,
    features: [
      "Alles uit Piet",
      "Slimme alerts — alleen als het jou raakt",
      "Weet van je kelder, plat dak, paard in de wei",
      "Push + e-mail, jij kiest drempel",
      "Alert-historie + nauwkeurigheid zichtbaar",
    ],
    audience: "Gezinnen, huiseigenaren, ZZP'ers met kwetsbare bezit.",
    includes: ["piet"],
  },
  steve: {
    tier: "steve",
    name: "Steve",
    label: "Zakelijk",
    color: "#3b82f6",
    colorVar: "--persona-steve",
    tagline: "Jouw bedrijf. Jouw drempels. Jouw beslissingen.",
    description:
      "Steve neemt beslissingen voor je. Werkramen per 2u-blok, inkoopadvies, annulering-deadlines, personeelsrooster-suggesties. Weet je branche, je capaciteit, je concurrent.",
    priceCents: 4999,
    founderPriceCents: 2900,
    features: [
      "Dagelijkse zakelijke brief + dashboard",
      "Werkramen 48u × 2u-blokken per locatie",
      "Drempelwaarden per filiaal (wind, regen, temp, onweer)",
      "Inkoop- en rooster-suggesties",
      "Accuracy-tracking per locatie",
      "Meerdere adressen / filialen",
    ],
    audience: "Strandtenten, dakdekkers, hoveniers, horeca, bouw, evenementen.",
  },
};

export const PERSONA_ORDER: PersonaTier[] = ["piet", "reed", "steve"];

export function formatPrice(cents: number): string {
  const euros = cents / 100;
  return `€${euros.toFixed(2).replace(".", ",")}`;
}

// Trial-einddatum (1 juni 2026). Alle pre-launch signups zijn founders.
export const TRIAL_END = new Date("2026-06-01T00:00:00+02:00");
export const FOUNDER_SLOTS = 25;

export function daysUntilLaunch(): number {
  const now = Date.now();
  const diff = TRIAL_END.getTime() - now;
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}
