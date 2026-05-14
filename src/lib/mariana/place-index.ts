import { ALL_PLACES, placeSlug, type Place } from "@/lib/places-data";
import { PROVINCE_TO_DE_BUNDESLAND } from "@/config/locales";
import { toMarianaLocation } from "./location";
import type { MarianaLocationRef } from "./types";

export interface MarianaPlaceTarget {
  place: Place;
  location: MarianaLocationRef;
  url: string;
}

export function marianaTargetForPlace(place: Place): MarianaPlaceTarget {
  const bundesland = PROVINCE_TO_DE_BUNDESLAND[place.province as keyof typeof PROVINCE_TO_DE_BUNDESLAND];
  const url = bundesland
    ? `/de/wetter/${bundesland}/${placeSlug(place.name)}`
    : `/weer/${place.province}/${placeSlug(place.name)}`;
  return {
    place,
    location: toMarianaLocation(place),
    url,
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
