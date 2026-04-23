import { MetadataRoute } from 'next';
import { ALL_PLACES, placeSlug } from '@/lib/places-data';

/**
 * SEO TURBO: Segmented Sitemap Index
 * We splitsen de 9.000+ pagina's op in chunks van 2000 URLs.
 * Dit voorkomt memory limits en zorgt dat Google de site sneller 'snapt'.
 */

const CHUNK_SIZE = 2000;

export async function generateSitemaps() {
  // We hebben ca 9000 entries, dus ca 5 sitemaps
  const total = ALL_PLACES.length + 1000; // Ruime schatting inclusief ontdekte locaties
  const count = Math.ceil(total / CHUNK_SIZE);
  return Array.from({ length: count }, (_, i) => ({ id: i }));
}

export default async function sitemap({ id }: { id: number }): Promise<MetadataRoute.Sitemap> {
  // 1. Statische hoofdpagina's (alleen in de eerste sitemap id: 0)
  const staticPages: MetadataRoute.Sitemap = id === 0 ? [
    { url: 'https://weerzone.nl', lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: 'https://weerzone.nl/prijzen', lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: 'https://weerzone.nl/over-ons', lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
  ] : [];

  // 2. Dynamische lokale pagina's uit de database (JSON)
  const start = id * CHUNK_SIZE;
  const end = start + CHUNK_SIZE;
  
  const placePages: MetadataRoute.Sitemap = ALL_PLACES.slice(start, end).map((city) => ({
    url: `https://weerzone.nl/weer/${city.province}/${placeSlug(city.name)}`,
    lastModified: new Date(),
    changeFrequency: 'hourly',
    priority: city.population && city.population > 100000 ? 0.8 : 0.6,
  }));

  // 3. Autonoom ontdekte locaties (OpenClaw) — Alleen toevoegen als we nog 'ruimte' hebben in dit chunk
  // Of we kunnen een aparte id range reserveren voor DB locaties
  let discoveredPages: MetadataRoute.Sitemap = [];
  
  // Als we voorbij de ALL_PLACES zijn, of in het laatste chunk zitten, check de DB
  if (id >= Math.floor(ALL_PLACES.length / CHUNK_SIZE)) {
    try {
      const { getSupabase } = await import("@/lib/supabase");
      const supabase = getSupabase();
      if (supabase) {
        const { data: discovered } = await supabase
          .from("location_metadata")
          .select("place_name, province")
          .order('created_at', { ascending: false })
          .limit(CHUNK_SIZE);
        
        if (discovered) {
          discoveredPages = discovered.map((loc) => ({
            url: `https://weerzone.nl/weer/${loc.province.toLowerCase().replace(/ /g, "-")}/${placeSlug(loc.place_name)}`,
            lastModified: new Date(),
            changeFrequency: 'hourly',
            priority: 0.5,
          }));
        }
      }
    } catch (e) {
      // Silently fail for sitemap
    }
  }

  return [...staticPages, ...placePages, ...discoveredPages];
}
