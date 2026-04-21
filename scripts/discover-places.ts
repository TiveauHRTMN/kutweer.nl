

/**
 * 🕵️‍♂️ OpenClaw Discovery Script - V2
 * Fetches all Dutch locations (city, town, village, suburb) from OSM.
 */

import fs from 'fs';
import path from 'path';

async function discover() {
  console.log("🚀 OpenClaw: Starting deep discovery (Netherlands)...");

  // Fetching all populated places in the Netherlands
  const query = `
    [out:json][timeout:90];
    area["name:en"="Netherlands"]->.searchArea;
    (
      node["place"~"city|town|village|hamlet|suburb|neighbourhood"](area.searchArea);
    );
    out body;
  `;

  try {
    const response = await fetch("https://overpass-api.de/api/interpreter", {
      method: "POST",
      headers: {
        'User-Agent': 'WeerZone-OpenClaw/1.0 (rwnhr@example.com)'
      },
      body: query
    });

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    
    const data = await response.json();
    const elements = data.elements || [];

    console.log(`📡 Received: ${elements.length} raw locations.`);

    // Province lookup (rough estimation based on latitude/longitude or we can try to fetch it)
    // To keep it simple and fast, we'll try to use a simple bounding box or just leave as "UNKNOWN" for manual batching.
    // Actually, Overpass can give us the province if we ask for it, but it makes the query much slower.
    
    const places = elements
      .filter((e: any) => e.tags && e.tags.name && e.lat && e.lon)
      .map((e: any) => {
        const p = {
          name: e.tags.name,
          lat: parseFloat(e.lat.toFixed(4)),
          lon: parseFloat(e.lon.toFixed(4)),
          type: e.tags.place,
          population: parseInt(e.tags.population) || undefined
        };
        return p;
      });

    // Remove duplicates by name
    const uniquePlaces = Array.from(new Map(places.map((p: any) => [p.name, p])).values());
    uniquePlaces.sort((a: any, b: any) => a.name.localeCompare(b.name));

    console.log(`✅ Deduplicated to ${uniquePlaces.length} unique locations.`);

    const outputDir = path.join(process.cwd(), 'scratch');
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);
    
    const outputPath = path.join(outputDir, 'discovered-places.json');
    fs.writeFileSync(outputPath, JSON.stringify(uniquePlaces, null, 2));

    console.log(`💾 Saved to ${outputPath}`);
    console.log("\nNext step: Use this data to populate src/lib/places-data.ts in batches.");
    
  } catch (error) {
    console.error("❌ Discovery failed:", error);
  }
}

discover();

