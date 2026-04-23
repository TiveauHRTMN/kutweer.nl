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
    label: "Neurale Precisie",
    color: "#22c55e",
    colorVar: "--persona-piet",
    tagline: "Oant moarn, maar dan met neurale kracht.",
    description:
      "Piet brengt het weer terug naar de mensen. Geïnspireerd door Piet Paulusma, maar versterkt met Google MetNet-3. Hij geeft je dat vertrouwde gevoel van de lokale weerman die precies weet wat er in jouw dorp gebeurt, tot op de minuut nauwkeurig.",
    priceCents: 499,
    founderPriceCents: 299,
    features: [
      "MetNet-3 Neural Nowcasting (1km grid)",
      "Warm, lokaal en toegankelijk (Paulusma-stijl)",
      "Elke ochtend vóór 7:00 je persoonlijke brief",
      "Focus op jouw dagelijkse buitenleven",
      "Oant moarn: Altijd een blik op morgen",
    ],
    audience: "Voor wie houdt van een menselijk weerbericht met de scherpste techniek.",
  },
  reed: {
    tier: "reed",
    name: "Reed",
    label: "Extreme Wachter",
    color: "#ef4444",
    colorVar: "--persona-reed",
    tagline: "DOMINATOR energy voor extreem weer.",
    description:
      "Geïnspireerd door stormchaser Reed Timmer. Hij jaagt op data in de kern van de storm. Gebruikt SEED AI-simulaties om gevaarlijke situaties (storm, hitte, ijzel) te detecteren. Als Reed waarschuwt, is het menens. High energy, high stakes.",
    priceCents: 999,
    founderPriceCents: 699,
    features: [
      "SEED Ensemble Simulaties (Extreme Events)",
      "Dominator-stijl alerts bij extreem weer",
      "Focus op veiligheid en impact-maximalisatie",
      "Directe, intense berichtgeving",
      "Piet-precisie inbegrepen",
    ],
    audience: "Buitenmensen en professionals die willen domineren, wat de lucht ook brengt.",
    includes: ["piet"],
  },
  steve: {
    tier: "steve",
    name: "Steve",
    label: "Zakelijk Strateeg",
    color: "#3b82f6",
    colorVar: "--persona-steve",
    tagline: "Insanely great weather intelligence.",
    description:
      "Steve vertaalt het weer naar een perfecte bedrijfsbeslissing. Geïnspireerd door Steve Jobs: perfectionistisch, visionair en minimalistisch. Hij gebruikt NeuralGCM om de ruis te filteren en de 'one more thing' in je zakelijke planning te vinden.",
    priceCents: 4999,
    founderPriceCents: 2900,
    features: [
      "NeuralGCM Strategische Planning (15 dagen)",
      "Minimalistisch dashboard (Jobs-stijl)",
      "Focus op ROI en operationele perfectie",
      "B2B Lead Intelligence (Google Maps)",
      "Zegt 'nee' tegen 1000 dingen, zodat jij de juiste doet",
    ],
    audience: "Ondernemers die alleen de essentie willen voor maximale groei.",
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
