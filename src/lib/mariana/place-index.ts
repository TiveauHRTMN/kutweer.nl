import { ALL_PLACES, placeSlug, type Place } from "@/lib/places-data";
import { PROVINCE_TO_DE_BUNDESLAND, PROVINCE_TO_FR_REGION } from "@/config/locales";
import { toMarianaLocation } from "./location";
import type { MarianaLocationRef } from "./types";

export interface MarianaPlaceTarget {
  place: Place;
  location: MarianaLocationRef;
  url: string;
}

function canonicalUrlForPlace(place: Place): string {
  const slug = placeSlug(place.name);
  const bundesland = PROVINCE_TO_DE_BUNDESLAND[place.province as keyof typeof PROVINCE_TO_DE_BUNDESLAND];
  if (bundesland) return `/de/wetter/${bundesland}/${slug}`;
  // Wallonie wordt als Belgisch behandeld en hoort op /weer/wallonie/{slug} (BE-sitemap).
  if (place.province !== "wallonie") {
    const region = PROVINCE_TO_FR_REGION[place.province as keyof typeof PROVINCE_TO_FR_REGION];
    if (region) return `/fr/meteo/${region}/${slug}`;
  }
  return `/weer/${place.province}/${slug}`;
}

export function marianaTargetForPlace(place: Place): MarianaPlaceTarget {
  return {
    place,
    location: toMarianaLocation(place),
    url: canonicalUrlForPlace(place),
  };
}

export function getMarianaPlaceTargetCount(args: {
  minPopulation?: number;
  province?: string;
} = {}): number {
  return ALL_PLACES
    .filter((place) => !args.province || place.province === args.province)
    .filter((place) => !args.minPopulation || (place.population ?? 0) >= args.minPopulation)
    .length;
}

export function getMarianaPlaceTargets(args: {
  limit?: number;
  offset?: number;
  minPopulation?: number;
  province?: string;
} = {}): MarianaPlaceTarget[] {
  const limit = Math.max(1, Math.min(1000, args.limit ?? 250));
  const offset = Math.max(0, args.offset ?? 0);

  return ALL_PLACES
    .filter((place) => !args.province || place.province === args.province)
    .filter((place) => !args.minPopulation || (place.population ?? 0) >= args.minPopulation)
    .slice(offset, offset + limit)
    .map(marianaTargetForPlace);
}
