/**
 * Alle Nederlandse woonplaatsen — gegroepeerd per provincie.
 * Dit bestand wordt continu uitgebreid door OpenClaw's SEO engine.
 * 
 * Elke plaats wordt een eigen pagina op /weer/[province]/[place]
 * die rankt voor "weer [plaatsnaam]" in Google.
 * 
 * DOEL: ~7.000 plaatsen → ~7.000 indexeerbare pagina's.
 */

import allPlacesRaw from "./places.json";

export interface Place {
  name: string;
  province: string;
  lat: number;
  lon: number;
  population?: number;
  character?: "coastal" | "inland" | "highland" | "urban" | "mountain" | "mediterranean coastal" | "atlantic coastal" | "northern continental"; // Voor slimme AI-commentaar en affiliates
}

export const ALL_PLACES = allPlacesRaw as Place[];
export const PLACES_COUNT = ALL_PLACES.length;

export type Province =
  | "groningen"
  | "friesland"
  | "drenthe"
  | "overijssel"
  | "flevoland"
  | "gelderland"
  | "utrecht"
  | "noord-holland"
  | "zuid-holland"
  | "zeeland"
  | "noord-brabant"
  | "limburg"
  | "antwerpen"
  | "limburg-be"
  | "oost-vlaanderen"
  | "vlaams-brabant"
  | "west-vlaanderen"
  | "wallonie"
  | "beieren"
  | "berlijn"
  | "brandenburg"
  | "bremen"
  | "hamburg"
  | "hessen"
  | "mecklenburg-voorpommeren"
  | "nedersaksen"
  | "noordrijn-westfalen"
  | "rijnland-palts"
  | "saarland"
  | "saksen"
  | "saksen-anhalt"
  | "sleeswijk-holstein"
  | "thuringen"
  | "baden-wurttemberg"
  | "ain"
  | "aisne"
  | "allier"
  | "alpes-de-haute-provence"
  | "hautes-alpes"
  | "alpes-maritimes"
  | "ardeche"
  | "ardennes"
  | "ariege"
  | "aube"
  | "aude"
  | "aveyron"
  | "bouches-du-rhone"
  | "calvados"
  | "cantal"
  | "charente"
  | "charente-maritime"
  | "cher"
  | "correze"
  | "cote-d-or"
  | "cotes-d-armor"
  | "creuse"
  | "dordogne"
  | "doubs"
  | "drome"
  | "eure"
  | "eure-et-loir"
  | "finistere"
  | "corse-du-sud"
  | "haute-corse"
  | "gard"
  | "haute-garonne"
  | "gers"
  | "gironde"
  | "herault"
  | "ille-et-vilaine"
  | "indre"
  | "indre-et-loire"
  | "isere"
  | "jura"
  | "landes"
  | "loir-et-cher"
  | "loire"
  | "haute-loire"
  | "loire-atlantique"
  | "loiret"
  | "lot"
  | "lot-et-garonne"
  | "lozere"
  | "maine-et-loire"
  | "manche"
  | "marne"
  | "haute-marne"
  | "mayenne"
  | "meurthe-et-moselle"
  | "meuse"
  | "morbihan"
  | "moselle"
  | "nievre"
  | "nord"
  | "oise"
  | "orne"
  | "pas-de-calais"
  | "puy-de-dome"
  | "pyrenees-atlantiques"
  | "hautes-pyrenees"
  | "pyrenees-orientales"
  | "bas-rhin"
  | "haut-rhin"
  | "rhone"
  | "haute-saone"
  | "saone-et-loire"
  | "sarthe"
  | "savoie"
  | "haute-savoie"
  | "paris"
  | "seine-maritime"
  | "seine-et-marne"
  | "yvelines"
  | "deux-sevres"
  | "somme"
  | "tarn"
  | "tarn-et-garonne"
  | "var"
  | "vaucluse"
  | "vendee"
  | "vienne"
  | "haute-vienne"
  | "vosges"
  | "yonne"
  | "territoire-de-belfort"
  | "essonne"
  | "hauts-de-seine"
  | "seine-saint-denis"
  | "val-de-marne"
  | "val-d-oise"
  | "guadeloupe"
  | "martinique"
  | "guyane"
  | "la-reunion"
  | "mayotte"
  | "luxembourg-country";

export const PROVINCE_LABELS: Record<Province, string> = {
  groningen: "Groningen",
  friesland: "Friesland",
  drenthe: "Drenthe",
  overijssel: "Overijssel",
  flevoland: "Flevoland",
  gelderland: "Gelderland",
  utrecht: "Utrecht",
  "noord-holland": "Noord-Holland",
  "zuid-holland": "Zuid-Holland",
  zeeland: "Zeeland",
  "noord-brabant": "Noord-Brabant",
  limburg: "Limburg (NL)",
  antwerpen: "Antwerpen",
  "limburg-be": "Limburg (BE)",
  "oost-vlaanderen": "Oost-Vlaanderen",
  "vlaams-brabant": "Vlaams-Brabant",
  "west-vlaanderen": "West-Vlaanderen",
  wallonie: "Wallonie",
  beieren: "Beieren",
  berlijn: "Berlijn",
  brandenburg: "Brandenburg",
  bremen: "Bremen",
  hamburg: "Hamburg",
  hessen: "Hessen",
  "mecklenburg-voorpommeren": "Mecklenburg-Voorpommeren",
  nedersaksen: "Nedersaksen",
  "noordrijn-westfalen": "Noordrijn-Westfalen",
  "rijnland-palts": "Rijnland-Palts",
  saarland: "Saarland",
  saksen: "Saksen",
  "saksen-anhalt": "Sachsen-Anhalt",
  "sleeswijk-holstein": "Sleeswijk-Holstein",
  thuringen: "Thüringen",
  "baden-wurttemberg": "Baden-Württemberg",
  "ain": "Ain",
  "aisne": "Aisne",
  "allier": "Allier",
  "alpes-de-haute-provence": "Alpes-de-Haute-Provence",
  "hautes-alpes": "Hautes-Alpes",
  "alpes-maritimes": "Alpes-Maritimes",
  "ardeche": "Ardèche",
  "ardennes": "Ardennes",
  "ariege": "Ariège",
  "aube": "Aube",
  "aude": "Aude",
  "aveyron": "Aveyron",
  "bouches-du-rhone": "Bouches-du-Rhône",
  "calvados": "Calvados",
  "cantal": "Cantal",
  "charente": "Charente",
  "charente-maritime": "Charente-Maritime",
  "cher": "Cher",
  "correze": "Corrèze",
  "cote-d-or": "Côte-d'Or",
  "cotes-d-armor": "Côtes-d'Armor",
  "creuse": "Creuse",
  "dordogne": "Dordogne",
  "doubs": "Doubs",
  "drome": "Drôme",
  "eure": "Eure",
  "eure-et-loir": "Eure-et-Loir",
  "finistere": "Finistère",
  "corse-du-sud": "Corse-du-Sud",
  "haute-corse": "Haute-Corse",
  "gard": "Gard",
  "haute-garonne": "Haute-Garonne",
  "gers": "Gers",
  "gironde": "Gironde",
  "herault": "Hérault",
  "ille-et-vilaine": "Ille-et-Vilaine",
  "indre": "Indre",
  "indre-et-loire": "Indre-et-Loire",
  "isere": "Isère",
  "jura": "Jura",
  "landes": "Landes",
  "loir-et-cher": "Loir-et-Cher",
  "loire": "Loire",
  "haute-loire": "Haute-Loire",
  "loire-atlantique": "Loire-Atlantique",
  "loiret": "Loiret",
  "lot": "Lot",
  "lot-et-garonne": "Lot-et-Garonne",
  "lozere": "Lozère",
  "maine-et-loire": "Maine-et-Loire",
  "manche": "Manche",
  "marne": "Marne",
  "haute-marne": "Haute-Marne",
  "mayenne": "Mayenne",
  "meurthe-et-moselle": "Meurthe-et-Moselle",
  "meuse": "Meuse",
  "morbihan": "Morbihan",
  "moselle": "Moselle",
  "nievre": "Nièvre",
  "nord": "Nord",
  "oise": "Oise",
  "orne": "Orne",
  "pas-de-calais": "Pas-de-Calais",
  "puy-de-dome": "Puy-de-Dôme",
  "pyrenees-atlantiques": "Pyrénées-Atlantiques",
  "hautes-pyrenees": "Hautes-Pyrénées",
  "pyrenees-orientales": "Pyrénées-Orientales",
  "bas-rhin": "Bas-Rhin",
  "haut-rhin": "Haut-Rhin",
  "rhone": "Rhône",
  "haute-saone": "Haute-Saône",
  "saone-et-loire": "Saone-et-Loire",
  "sarthe": "Sarthe",
  "savoie": "Savoie",
  "haute-savoie": "Haute-Savoie",
  "paris": "Paris",
  "seine-maritime": "Seine-Maritime",
  "seine-et-marne": "Seine-et-Marne",
  "yvelines": "Yvelines",
  "deux-sevres": "Deux-Sèvres",
  "somme": "Somme",
  "tarn": "Tarn",
  "tarn-et-garonne": "Tarn-et-Garonne",
  "var": "Var",
  "vaucluse": "Vaucluse",
  "vendee": "Vendée",
  "vienne": "Vienne",
  "haute-vienne": "Haute-Vienne",
  "vosges": "Vosges",
  "yonne": "Yonne",
  "territoire-de-belfort": "Territoire de Belfort",
  "essonne": "Essonne",
  "hauts-de-seine": "Hauts-de-Seine",
  "seine-saint-denis": "Seine-Saint-Denis",
  "val-de-marne": "Val-de-Marne",
  "val-d-oise": "Val-d'Oise",
  "guadeloupe": "Guadeloupe",
  "martinique": "Martinique",
  "guyane": "Guyane",
  "la-reunion": "La Réunion",
  "mayotte": "Mayotte",
  "luxembourg-country": "Luxembourg",
};

export type City = { name: string; lat: number; lon: number; population?: number; character?: string };

export function placesByProvince(): Record<string, Place[]> {
  const grouped: Record<string, Place[]> = {};
  for (const p of ALL_PLACES) {
    if (!grouped[p.province]) grouped[p.province] = [];
    grouped[p.province].push(p);
  }
  return grouped;
}

export function placeSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function findPlace(province: string, slug: string): Place | undefined {
    return ALL_PLACES.find(p => p.province === province && placeSlug(p.name) === slug);
}

export function nearbyPlaces(base: Place, limit = 10): Place[] {
    const dist = (p: Place) => (p.lat - base.lat) ** 2 + (p.lon - base.lon) ** 2;
    return ALL_PLACES
        .filter(p => p.name !== base.name || p.province !== base.province)
        .sort((a, b) => dist(a) - dist(b))
        .slice(0, limit);
}
