
import fs from 'fs';
import path from 'path';

// Rough bounding boxes for NL provinces
const PROVINCE_BOUNDS: Record<string, { minLat: number; maxLat: number; minLon: number; maxLon: number }> = {
  groningen: { minLat: 53.05, maxLat: 53.6, minLon: 6.2, maxLon: 7.23 },
  friesland: { minLat: 52.8, maxLat: 53.6, minLon: 5.2, maxLon: 6.4 },
  drenthe: { minLat: 52.6, maxLat: 53.1, minLon: 6.1, maxLon: 7.1 },
  overijssel: { minLat: 52.2, maxLat: 52.8, minLon: 5.8, maxLon: 7.1 },
  gelderland: { minLat: 51.75, maxLat: 52.5, minLon: 5.2, maxLon: 6.85 },
  flevoland: { minLat: 52.2, maxLat: 52.8, minLon: 5.0, maxLon: 5.95 },
  utrecht: { minLat: 51.95, maxLat: 52.3, minLon: 4.75, maxLon: 5.6 },
  "noord-holland": { minLat: 52.2, maxLat: 53.6, minLon: 4.4, maxLon: 5.35 },
  "zuid-holland": { minLat: 51.7, maxLat: 52.4, minLon: 3.8, maxLon: 5.1 },
  zeeland: { minLat: 51.2, maxLat: 51.8, minLon: 3.3, maxLon: 4.25 },
  "noord-brabant": { minLat: 51.2, maxLat: 51.85, minLon: 4.2, maxLon: 6.05 },
  limburg: { minLat: 50.7, maxLat: 51.76, minLon: 5.58, maxLon: 6.25 },
};

function getProvince(lat: number, lon: number): string {
  for (const [name, bounds] of Object.entries(PROVINCE_BOUNDS)) {
    if (lat >= bounds.minLat && lat <= bounds.maxLat && lon >= bounds.minLon && lon <= bounds.maxLon) {
      return name;
    }
  }
  return "UNKNOWN";
}

function placeSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/&/g, "en")
    .replace(/[^a-z0-9\-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function ingest() {
  const discoveredPath = path.join(process.cwd(), 'scratch', 'discovered-places.json');
  const placesJsonPath = path.join(process.cwd(), 'src', 'lib', 'places.json');

  if (!fs.existsSync(discoveredPath)) {
    console.error("❌ No discovered-places.json found in scratch/");
    return;
  }

  const discovered = JSON.parse(fs.readFileSync(discoveredPath, 'utf8'));
  const existingPlaces = JSON.parse(fs.readFileSync(placesJsonPath, 'utf8'));

  console.log(`📖 Loaded ${discovered.length} discovered places.`);
  console.log(`🔍 Existing places: ${existingPlaces.length}`);

  // Create a set of existing slugs per province to avoid URL collisions
  const existingSlugs = new Set(existingPlaces.map((p: any) => `${p.province}/${placeSlug(p.name)}`));
  
  const newPlaces: any[] = [];
  let skippedCount = 0;

  for (const p of discovered) {
    const province = getProvince(p.lat, p.lon);
    if (province === "UNKNOWN") continue;

    const slug = placeSlug(p.name);
    const key = `${province}/${slug}`;

    if (!existingSlugs.has(key)) {
      newPlaces.push({
        name: p.name,
        province,
        lat: p.lat,
        lon: p.lon,
        population: p.population,
        character: p.type === 'city' ? 'urban' : undefined
      });
      existingSlugs.add(key);
    } else {
      skippedCount++;
    }
  }

  console.log(`➕ Adding ${newPlaces.length} new places.`);
  console.log(`⏭️ Skipped ${skippedCount} duplicates/slug collisions.`);

  if (newPlaces.length > 0) {
    const updatedPlaces = [...existingPlaces, ...newPlaces];
    // Sort to keep it organized
    updatedPlaces.sort((a, b) => {
        if (a.province !== b.province) return a.province.localeCompare(b.province);
        return a.name.localeCompare(b.name);
    });

    fs.writeFileSync(placesJsonPath, JSON.stringify(updatedPlaces, null, 2));
    console.log(`✅ Successfully updated ${placesJsonPath}`);
  } else {
    console.log("ℹ️ No new places to add.");
  }
}

ingest();
