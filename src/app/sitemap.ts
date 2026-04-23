import { MetadataRoute } from 'next';
import { ALL_PLACES, placeSlug } from '@/lib/places-data';

/**
 * SEO TURBO: Segmented Sitemap Index
 * We splitsen de 9.000+ pagina's op per provincie.
 * Dit voorkomt memory limits en zorgt dat Google de site sneller 'snapt'.
 */

const PROVINCES = [
  "groningen", "friesland", "drenthe", "overijssel", "flevoland", "gelderland", 
  "utrecht", "noord-holland", "zuid-holland", "zeeland", "noord-brabant", "limburg"
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // 1. Statische hoofdpagina's
  const staticPages: MetadataRoute.Sitemap = [
    { url: 'https://weerzone.nl', lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: 'https://weerzone.nl/prijzen', lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: 'https://weerzone.nl/over-ons', lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
  ];

  // 2. Dynamische lokale pagina's (ca. 9000 stuks)
  const dynamicPages: MetadataRoute.Sitemap = ALL_PLACES.map((city) => ({
    url: `https://weerzone.nl/weer/${city.province}/${placeSlug(city.name)}`,
    lastModified: new Date(),
    changeFrequency: 'hourly',
    priority: 0.7,
  }));

  // 3. Autonoom ontdekte locaties (OpenClaw)
  let discoveredPages: MetadataRoute.Sitemap = [];
  try {
    const { getSupabase } = await import("@/lib/supabase");
    const supabase = getSupabase();
    if (supabase) {
      const { data: discovered } = await supabase
        .from("discovered_places")
        .select("name, province")
        .limit(1000);
      
      if (discovered) {
        discoveredPages = discovered.map((loc) => ({
          url: `https://weerzone.nl/weer/${loc.province.toLowerCase().replace(/ /g, "-")}/${placeSlug(loc.name)}`,
          lastModified: new Date(),
          changeFrequency: 'hourly',
          priority: 0.6,
        }));
      }
    }
  } catch (e) {
    console.error("Sitemap discovery error:", e);
  }

  return [...staticPages, ...dynamicPages, ...discoveredPages];
}
