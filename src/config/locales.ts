/**
 * Centrale locale-configuratie voor Weerzone.
 *
 * NL  → Piet-tier,  routes zonder prefix  (/mijnweer, /weer/…)
 * DE  → Karl-tier,  routes onder /de/     (/de/mein-wetter, /de/wetter/…)
 *
 * Voeg /be/ toe door een derde locale entry te maken.
 */

import type { Province } from "@/lib/places-data";

// ─── Locale type ─────────────────────────────────────────────────────────────
export type Locale = "nl" | "de" | "fr";

// ─── Nav link definitie ───────────────────────────────────────────────────────
export interface NavLink {
  key: string;
  label: string;
  href: string;
}

// ─── Locale config ────────────────────────────────────────────────────────────
export interface LocaleConfig {
  locale: Locale;
  lang: string;
  entryTier: "piet" | "karl";
  routes: {
    home: string;
    myWeather: string;
    warnings: string;
    pricing: string;
    about: string;
    contact: string;
    weather: string;
  };
  nav: NavLink[];
  meta: {
    titleDefault: string;
    titleTemplate: string;
    description: string;
    ogLocale: string;
    siteName: string;
  };
  hreflang: string;
}

export const LOCALES: Record<Locale, LocaleConfig> = {
  nl: {
    locale: "nl",
    lang: "nl",
    entryTier: "piet",
    routes: {
      home: "/",
      myWeather: "/mijnweer",
      warnings: "/waarschuwingen",
      pricing: "/prijzen",
      about: "/over",
      contact: "/contact",
      weather: "/weer",
    },
    nav: [
      { key: "mijnweer",        label: "Mijn Weer",      href: "/mijnweer" },
      { key: "waarschuwingen",  label: "Waarschuwingen", href: "/waarschuwingen" },
      { key: "zakelijk",        label: "Zakelijk",       href: "/zakelijk" },
      { key: "prijzen",         label: "Prijzen",        href: "/prijzen" },
      { key: "over",            label: "Over",           href: "/over" },
      { key: "contact",         label: "Contact",        href: "/contact" },
    ],
    meta: {
      titleDefault:   "WEERZONE | Weerkeuzes voor vandaag en morgen",
      titleTemplate:  "%s | WEERZONE",
      description:    "WEERZONE helpt je beslissen wat je vandaag en morgen met het weer doet. Hyperlokaal, tot 48 uur vooruit.",
      ogLocale:       "nl_NL",
      siteName:       "WEERZONE",
    },
    hreflang: "nl-NL",
  },

  de: {
    locale: "de",
    lang: "de",
    entryTier: "karl",
    routes: {
      home: "/de",
      myWeather: "/de/mein-wetter",
      warnings: "/de/warnungen",
      pricing: "/de/preise",
      about: "/de/uber-uns",
      contact: "/de/kontakt",
      weather: "/de/wetter",
    },
    nav: [
      { key: "mein-wetter", label: "Mein Wetter", href: "/de/mein-wetter" },
      { key: "warnungen",   label: "Warnungen",   href: "/de/warnungen" },
      { key: "preise",      label: "Preise",      href: "/de/preise" },
      { key: "uber-uns",    label: "Über uns",    href: "/de/uber-uns" },
      { key: "kontakt",     label: "Kontakt",     href: "/de/kontakt" },
    ],
    meta: {
      titleDefault:   "WEERZONE | Lokale Wettervorhersage für Deutschland",
      titleTemplate:  "%s | WEERZONE Deutschland",
      description:    "Aktuelle Wettervorhersage für Deutschland. Präzise lokale Prognosen für Temperatur, Niederschlag, Wind und Warnungen für die nächsten 48 Stunden.",
      ogLocale:       "de_DE",
      siteName:       "WEERZONE",
    },
    hreflang: "de-DE",
  },
  fr: {
    locale: "fr",
    lang: "fr",
    entryTier: "piet",
    routes: {
      home: "/fr",
      myWeather: "/fr/ma-meteo",
      warnings: "/fr/alertes",
      pricing: "/fr/tarifs",
      about: "/fr/a-propos",
      contact: "/fr/contact",
      weather: "/fr/meteo",
    },
    nav: [
      { key: "ma-meteo", label: "Ma Météo", href: "/fr/ma-meteo" },
      { key: "alertes",   label: "Alertes",    href: "/fr/alertes" },
      { key: "tarifs",    label: "Tarifs",     href: "/fr/tarifs" },
      { key: "a-propos",  label: "À propos",   href: "/fr/a-propos" },
      { key: "contact",   label: "Contact",    href: "/fr/contact" },
    ],
    meta: {
      titleDefault:   "WEERZONE | Prévisions météo pour la France & Belgique",
      titleTemplate:  "%s | WEERZONE France",
      description:    "Prévisions météo actuelles pour la France et la Belgique. Prévisions locales précises pour la température, les précipitations, le vent et alertes pour les prochaines 48 heures.",
      ogLocale:       "fr_FR",
      siteName:       "WEERZONE",
    },
    hreflang: "fr-FR",
  },
};

// ─── Locale detection ─────────────────────────────────────────────────────────
export function detectLocale(pathname: string): Locale {
  if (pathname === "/de" || pathname.startsWith("/de/")) return "de";
  if (pathname === "/fr" || pathname.startsWith("/fr/")) return "fr";
  return "nl";
}

export function getLocaleConfig(pathname: string): LocaleConfig {
  return LOCALES[detectLocale(pathname)];
}

// ─── Bundesland URL-slug ↔ interne province-key mapping ──────────────────────
// /de/wetter/[bundesland]/[ort] gebruikt Duitse URL-slugs voor SEO.
// Intern slaan we plaatsen op met de Dutch-slang province-keys.

export const DE_BUNDESLAND_TO_PROVINCE: Record<string, Province> = {
  "berlin":                  "berlijn",
  "bayern":                  "beieren",
  "nordrhein-westfalen":     "noordrijn-westfalen",
  "niedersachsen":           "nedersaksen",
  "sachsen":                 "saksen",
  "sachsen-anhalt":          "saksen-anhalt",
  "thueringen":              "thuringen",
  "mecklenburg-vorpommern":  "mecklenburg-voorpommeren",
  "schleswig-holstein":      "sleeswijk-holstein",
  "rheinland-pfalz":         "rijnland-palts",
  "baden-wuerttemberg":      "baden-wurttemberg",
  // Identiek in Duits en intern
  "hessen":                  "hessen",
  "hamburg":                 "hamburg",
  "bremen":                  "bremen",
  "saarland":                "saarland",
  "brandenburg":             "brandenburg",
};

export const PROVINCE_TO_DE_BUNDESLAND: Partial<Record<Province, string>> = {
  berlijn:                   "berlin",
  beieren:                   "bayern",
  "noordrijn-westfalen":     "nordrhein-westfalen",
  nedersaksen:               "niedersachsen",
  saksen:                    "sachsen",
  "saksen-anhalt":           "sachsen-anhalt",
  thuringen:                 "thueringen",
  "mecklenburg-voorpommeren":"mecklenburg-vorpommern",
  "sleeswijk-holstein":      "schleswig-holstein",
  "rijnland-palts":          "rheinland-pfalz",
  "baden-wurttemberg":       "baden-wuerttemberg",
  hessen:                    "hessen",
  hamburg:                   "hamburg",
  bremen:                    "bremen",
  saarland:                  "saarland",
  brandenburg:               "brandenburg",
};

// Weergave-namen voor /de/wetter/[bundesland] pagina's
export const DE_BUNDESLAND_LABELS: Record<string, string> = {
  berlin:                   "Berlin",
  bayern:                   "Bayern",
  "nordrhein-westfalen":    "Nordrhein-Westfalen",
  niedersachsen:            "Niedersachsen",
  sachsen:                  "Sachsen",
  "sachsen-anhalt":         "Sachsen-Anhalt",
  thueringen:               "Thüringen",
  "mecklenburg-vorpommern": "Mecklenburg-Vorpommern",
  "schleswig-holstein":     "Schleswig-Holstein",
  "rheinland-pfalz":        "Rheinland-Pfalz",
  "baden-wuerttemberg":     "Baden-Württemberg",
  hessen:                   "Hessen",
  hamburg:                  "Hamburg",
  bremen:                   "Bremen",
  saarland:                 "Saarland",
  brandenburg:              "Brandenburg",
};

// Alle geldige Duitse Bundesland URL-slugs
export const DE_BUNDESLAND_SLUGS = Object.keys(DE_BUNDESLAND_TO_PROVINCE);

// ─── Régions Françaises ─────────────────────────────────────────────────────────
export const FR_REGION_TO_PROVINCE: Record<string, Province> = {
  "ain": "ain",
  "aisne": "aisne",
  "allier": "allier",
  "alpes-de-haute-provence": "alpes-de-haute-provence",
  "hautes-alpes": "hautes-alpes",
  "alpes-maritimes": "alpes-maritimes",
  "ardeche": "ardeche",
  "ardennes": "ardennes",
  "ariege": "ariege",
  "aube": "aube",
  "aude": "aude",
  "aveyron": "aveyron",
  "bouches-du-rhone": "bouches-du-rhone",
  "calvados": "calvados",
  "cantal": "cantal",
  "charente": "charente",
  "charente-maritime": "charente-maritime",
  "cher": "cher",
  "correze": "correze",
  "cote-d-or": "cote-d-or",
  "cotes-d-armor": "cotes-d-armor",
  "creuse": "creuse",
  "dordogne": "dordogne",
  "doubs": "doubs",
  "drome": "drome",
  "eure": "eure",
  "eure-et-loir": "eure-et-loir",
  "finistere": "finistere",
  "corse-du-sud": "corse-du-sud",
  "haute-corse": "haute-corse",
  "gard": "gard",
  "haute-garonne": "haute-garonne",
  "gers": "gers",
  "gironde": "gironde",
  "herault": "herault",
  "ille-et-vilaine": "ille-et-vilaine",
  "indre": "indre",
  "indre-et-loire": "indre-et-loire",
  "isere": "isere",
  "jura": "jura",
  "landes": "landes",
  "loir-et-cher": "loir-et-cher",
  "loire": "loire",
  "haute-loire": "haute-loire",
  "loire-atlantique": "loire-atlantique",
  "loiret": "loiret",
  "lot": "lot",
  "lot-et-garonne": "lot-et-garonne",
  "lozere": "lozere",
  "maine-et-loire": "maine-et-loire",
  "manche": "manche",
  "marne": "marne",
  "haute-marne": "haute-marne",
  "mayenne": "mayenne",
  "meurthe-et-moselle": "meurthe-et-moselle",
  "meuse": "meuse",
  "morbihan": "morbihan",
  "moselle": "moselle",
  "nievre": "nievre",
  "nord": "nord",
  "oise": "oise",
  "orne": "orne",
  "pas-de-calais": "pas-de-calais",
  "puy-de-dome": "puy-de-dome",
  "pyrenees-atlantiques": "pyrenees-atlantiques",
  "hautes-pyrenees": "hautes-pyrenees",
  "pyrenees-orientales": "pyrenees-orientales",
  "bas-rhin": "bas-rhin",
  "haut-rhin": "haut-rhin",
  "rhone": "rhone",
  "haute-saone": "haute-saone",
  "saone-et-loire": "saone-et-loire",
  "sarthe": "sarthe",
  "savoie": "savoie",
  "haute-savoie": "haute-savoie",
  "paris": "paris",
  "seine-maritime": "seine-maritime",
  "seine-et-marne": "seine-et-marne",
  "yvelines": "yvelines",
  "deux-sevres": "deux-sevres",
  "somme": "somme",
  "tarn": "tarn",
  "tarn-et-garonne": "tarn-et-garonne",
  "var": "var",
  "vaucluse": "vaucluse",
  "vendee": "vendee",
  "vienne": "vienne",
  "haute-vienne": "haute-vienne",
  "vosges": "vosges",
  "yonne": "yonne",
  "territoire-de-belfort": "territoire-de-belfort",
  "essonne": "essonne",
  "hauts-de-seine": "hauts-de-seine",
  "seine-saint-denis": "seine-saint-denis",
  "val-de-marne": "val-de-marne",
  "val-d-oise": "val-d-oise",
  "guadeloupe": "guadeloupe",
  "martinique": "martinique",
  "guyane": "guyane",
  "la-reunion": "la-reunion",
  "mayotte": "mayotte",
  "wallonie": "wallonie",
};

export const FR_REGION_LABELS: Record<string, string> = {
  "ain": "Ain (01)",
  "aisne": "Aisne (02)",
  "allier": "Allier (03)",
  "alpes-de-haute-provence": "Alpes-de-Haute-Provence (04)",
  "hautes-alpes": "Hautes-Alpes (05)",
  "alpes-maritimes": "Alpes-Maritimes (06)",
  "ardeche": "Ardèche (07)",
  "ardennes": "Ardennes (08)",
  "ariege": "Ariège (09)",
  "aube": "Aube (10)",
  "aude": "Aude (11)",
  "aveyron": "Aveyron (12)",
  "bouches-du-rhone": "Bouches-du-Rhône (13)",
  "calvados": "Calvados (14)",
  "cantal": "Cantal (15)",
  "charente": "Charente (16)",
  "charente-maritime": "Charente-Maritime (17)",
  "cher": "Cher (18)",
  "correze": "Corrèze (19)",
  "cote-d-or": "Côte-d'Or (21)",
  "cotes-d-armor": "Côtes-d'Armor (22)",
  "creuse": "Creuse (23)",
  "dordogne": "Dordogne (24)",
  "doubs": "Doubs (25)",
  "drome": "Drôme (26)",
  "eure": "Eure (27)",
  "eure-et-loir": "Eure-et-Loir (28)",
  "finistere": "Finistère (29)",
  "corse-du-sud": "Corse-du-Sud (2A)",
  "haute-corse": "Haute-Corse (2B)",
  "gard": "Gard (30)",
  "haute-garonne": "Haute-Garonne (31)",
  "gers": "Gers (32)",
  "gironde": "Gironde (33)",
  "herault": "Hérault (34)",
  "ille-et-vilaine": "Ille-et-Vilaine (35)",
  "indre": "Indre (36)",
  "indre-et-loire": "Indre-et-Loire (37)",
  "isere": "Isère (38)",
  "jura": "Jura (39)",
  "landes": "Landes (40)",
  "loir-et-cher": "Loir-et-Cher (41)",
  "loire": "Loire (42)",
  "haute-loire": "Haute-Loire (43)",
  "loire-atlantique": "Loire-Atlantique (44)",
  "loiret": "Loiret (45)",
  "lot": "Lot (46)",
  "lot-et-garonne": "Lot-et-Garonne (47)",
  "lozere": "Lozère (48)",
  "maine-et-loire": "Maine-et-Loire (49)",
  "manche": "Manche (50)",
  "marne": "Marne (51)",
  "haute-marne": "Haute-Marne (52)",
  "mayenne": "Mayenne (53)",
  "meurthe-et-moselle": "Meurthe-et-Moselle (54)",
  "meuse": "Meuse (55)",
  "morbihan": "Morbihan (56)",
  "moselle": "Moselle (57)",
  "nievre": "Nièvre (58)",
  "nord": "Nord (59)",
  "oise": "Oise (60)",
  "orne": "Orne (61)",
  "pas-de-calais": "Pas-de-Calais (62)",
  "puy-de-dome": "Puy-de-Dôme (63)",
  "pyrenees-atlantiques": "Pyrénées-Atlantiques (64)",
  "hautes-pyrenees": "Hautes-Pyrénées (65)",
  "pyrenees-orientales": "Pyrénées-Orientales (66)",
  "bas-rhin": "Bas-Rhin (67)",
  "haut-rhin": "Haut-Rhin (68)",
  "rhone": "Rhône (69)",
  "haute-saone": "Haute-Saône (70)",
  "saone-et-loire": "Saône-et-Loire (71)",
  "sarthe": "Sarthe (72)",
  "savoie": "Savoie (73)",
  "haute-savoie": "Haute-Savoie (74)",
  "paris": "Paris (75)",
  "seine-maritime": "Seine-Maritime (76)",
  "seine-et-marne": "Seine-et-Marne (77)",
  "yvelines": "Yvelines (78)",
  "deux-sevres": "Deux-Sèvres (79)",
  "somme": "Somme (80)",
  "tarn": "Tarn (81)",
  "tarn-et-garonne": "Tarn-et-Garonne (82)",
  "var": "Var (83)",
  "vaucluse": "Vaucluse (84)",
  "vendee": "Vendée (85)",
  "vienne": "Vienne (86)",
  "haute-vienne": "Haute-Vienne (87)",
  "vosges": "Vosges (88)",
  "yonne": "Yonne (89)",
  "territoire-de-belfort": "Territoire de Belfort (90)",
  "essonne": "Essonne (91)",
  "hauts-de-seine": "Hauts-de-Seine (92)",
  "seine-saint-denis": "Seine-Saint-Denis (93)",
  "val-de-marne": "Val-de-Marne (94)",
  "val-d-oise": "Val-d'Oise (95)",
  "guadeloupe": "Guadeloupe (971)",
  "martinique": "Martinique (972)",
  "guyane": "Guyane (973)",
  "la-reunion": "La Réunion (974)",
  "mayotte": "Mayotte (976)",
  "wallonie": "Wallonie",
};

export const FR_REGION_SLUGS = Object.keys(FR_REGION_TO_PROVINCE);

export const PROVINCE_TO_FR_REGION: Partial<Record<Province, string>> = {
  "ain": "ain",
  "aisne": "aisne",
  "allier": "allier",
  "alpes-de-haute-provence": "alpes-de-haute-provence",
  "hautes-alpes": "hautes-alpes",
  "alpes-maritimes": "alpes-maritimes",
  "ardeche": "ardeche",
  "ardennes": "ardennes",
  "ariege": "ariege",
  "aube": "aube",
  "aude": "aude",
  "aveyron": "aveyron",
  "bouches-du-rhone": "bouches-du-rhone",
  "calvados": "calvados",
  "cantal": "cantal",
  "charente": "charente",
  "charente-maritime": "charente-maritime",
  "cher": "cher",
  "correze": "correze",
  "cote-d-or": "cote-d-or",
  "cotes-d-armor": "cotes-d-armor",
  "creuse": "creuse",
  "dordogne": "dordogne",
  "doubs": "doubs",
  "drome": "drome",
  "eure": "eure",
  "eure-et-loir": "eure-et-loir",
  "finistere": "finistere",
  "corse-du-sud": "corse-du-sud",
  "haute-corse": "haute-corse",
  "gard": "gard",
  "haute-garonne": "haute-garonne",
  "gers": "gers",
  "gironde": "gironde",
  "herault": "herault",
  "ille-et-vilaine": "ille-et-vilaine",
  "indre": "indre",
  "indre-et-loire": "indre-et-loire",
  "isere": "isere",
  "jura": "jura",
  "landes": "landes",
  "loir-et-cher": "loir-et-cher",
  "loire": "loire",
  "haute-loire": "haute-loire",
  "loire-atlantique": "loire-atlantique",
  "loiret": "loiret",
  "lot": "lot",
  "lot-et-garonne": "lot-et-garonne",
  "lozere": "lozere",
  "maine-et-loire": "maine-et-loire",
  "manche": "manche",
  "marne": "marne",
  "haute-marne": "haute-marne",
  "mayenne": "mayenne",
  "meurthe-et-moselle": "meurthe-et-moselle",
  "meuse": "meuse",
  "morbihan": "morbihan",
  "moselle": "moselle",
  "nievre": "nievre",
  "nord": "nord",
  "oise": "oise",
  "orne": "orne",
  "pas-de-calais": "pas-de-calais",
  "puy-de-dome": "puy-de-dome",
  "pyrenees-atlantiques": "pyrenees-atlantiques",
  "hautes-pyrenees": "hautes-pyrenees",
  "pyrenees-orientales": "pyrenees-orientales",
  "bas-rhin": "bas-rhin",
  "haut-rhin": "haut-rhin",
  "rhone": "rhone",
  "haute-saone": "haute-saone",
  "saone-et-loire": "saone-et-loire",
  "sarthe": "sarthe",
  "savoie": "savoie",
  "haute-savoie": "haute-savoie",
  "paris": "paris",
  "seine-maritime": "seine-maritime",
  "seine-et-marne": "seine-et-marne",
  "yvelines": "yvelines",
  "deux-sevres": "deux-sevres",
  "somme": "somme",
  "tarn": "tarn",
  "tarn-et-garonne": "tarn-et-garonne",
  "var": "var",
  "vaucluse": "vaucluse",
  "vendee": "vendee",
  "vienne": "vienne",
  "haute-vienne": "haute-vienne",
  "vosges": "vosges",
  "yonne": "yonne",
  "territoire-de-belfort": "territoire-de-belfort",
  "essonne": "essonne",
  "hauts-de-seine": "hauts-de-seine",
  "seine-saint-denis": "seine-saint-denis",
  "val-de-marne": "val-de-marne",
  "val-d-oise": "val-d-oise",
  "guadeloupe": "guadeloupe",
  "martinique": "martinique",
  "guyane": "guyane",
  "la-reunion": "la-reunion",
  "mayotte": "mayotte",
  "wallonie": "wallonie",
};

// ─── hreflang helpers ─────────────────────────────────────────────────────────
const BASE = "https://weerzone.nl";

export interface HreflangEntry {
  hreflang: string;
  href: string;
}

export function buildHreflang(nlPath: string, dePath: string): HreflangEntry[] {
  return [
    { hreflang: "nl-NL",    href: `${BASE}${nlPath}` },
    { hreflang: "de-DE",    href: `${BASE}${dePath}` },
    { hreflang: "x-default", href: `${BASE}${nlPath}` },
  ];
}

// Voor pagina's die alleen in één taal bestaan (bijv. DE-weerplaats zonder NL-equivalent)
export function buildHreflangSingle(path: string, locale: Locale): HreflangEntry[] {
  return [
    { hreflang: LOCALES[locale].hreflang, href: `${BASE}${path}` },
    { hreflang: "x-default", href: `${BASE}${path}` },
  ];
}
