
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

async function ingest() {
  const discoveredPath = path.join(process.cwd(), 'scratch', 'discovered-places.json');
  const existingPath = path.join(process.cwd(), 'src', 'lib', 'places-data.ts');

  if (!fs.existsSync(discoveredPath)) {
    console.error("❌ No discovered-places.json found in scratch/");
    return;
  }

  const discovered = JSON.parse(fs.readFileSync(discoveredPath, 'utf8'));
  console.log(`📖 Loaded ${discovered.length} discovered places.`);

  // Load existing places to avoid duplicates
  const existingFile = fs.readFileSync(existingPath, 'utf8');
  const existingPlacesJsonMatch = existingFile.match(/export const ALL_PLACES: Place\[] = \[([\s\S]*?)];/);
  
  if (!existingPlacesJsonMatch) {
    console.error("❌ Could not find ALL_PLACES in src/lib/places-data.ts");
    return;
  }

  // We'll just build a new array of objects
  const uniqueByName = new Set<string>();
  
  // Extract names from existing file (simple regex way since it's a TS file)
  const nameRegex = /name: "([^"]+)"/g;
  let match;
  while ((match = nameRegex.exec(existingFile)) !== null) {
    uniqueByName.add(match[1]);
  }
  
  console.log(`🔍 Existing unique names: ${uniqueByName.size}`);

  const newPlaces: any[] = [];
  for (const p of discovered) {
    if (!uniqueByName.has(p.name)) {
      const province = getProvince(p.lat, p.lon);
      if (province !== "UNKNOWN") {
        newPlaces.push({
          name: p.name,
          province,
          lat: p.lat,
          lon: p.lon,
          population: p.population,
          character: p.type === 'city' ? 'urban' : undefined
        });
        uniqueByName.add(p.name);
      }
    }
  }

  console.log(`➕ Adding ${newPlaces.length} new places.`);

  // Generate the new content for the array
  const newEntriesStr = newPlaces
    .map(p => `  { name: "${p.name}", province: "${p.province}", lat: ${p.lat}, lon: ${p.lon}${p.population ? `, population: ${p.population}` : ''}${p.character ? `, character: "${p.character}"` : ''} },`)
    .join('\n');

  const updatedFile = existingFile.replace(
    /];\s*\/\/\s*=\s*=\s*=+/ ,
    `\n${newEntriesStr}\n];\n\n// ============================================================`
  );

  // Note: The regex above might be fragile. Let's try to insert it before the closing bracket of ALL_PLACES
  const lastBracketIndex = existingFile.lastIndexOf('];');
  const finalContent = existingFile.slice(0, lastBracketIndex) + 
    `\n  // --- AUTO-GENERATED BATCH BY OPENCLAW ---\n` +
    newEntriesStr + 
    '\n' + 
    existingFile.slice(lastBracketIndex);

  fs.writeFileSync(existingPath, finalContent);
  console.log(`✅ Successfully updated ${existingPath} with ${newPlaces.length} new locations.`);
}

ingest();
