
/**
 * 🕵️‍♂️ OpenClaw Discovery Script
 * Dit script haalt alle Nederlandse woonplaatsen op via de Overpass API (OpenStreetMap)
 * en genereert de TypeScript objecten voor places-data.ts.
 */

async function discover() {
  console.log("🚀 OpenClaw: Starting discovery...");

  const query = `
    [out:json][timeout:25];
    area["name:en"="Netherlands"]->.searchArea;
    (
      node["place"~"city|town|village|suburb"](area.searchArea);
    );
    out body;
  `;

  try {
    const response = await fetch("https://overpass-api.de/api/interpreter", {
      method: "POST",
      body: query
    });

    const data = await response.json();
    const elements = data.elements || [];

    console.log(`📡 Ontvangen: ${elements.length} ruwe locaties.`);

    const places = elements
      .filter((e: any) => e.tags && e.tags.name)
      .map((e: any) => ({
        name: e.tags.name,
        lat: e.lat,
        lon: e.lon,
        type: e.tags.place
      }));

    // Sorteer op naam
    places.sort((a: any, b: any) => a.name.localeCompare(b.name));

    console.log("\n--- GENERATED CODE SNIPPET ---");
    console.log("// Kopieer deze batch naar places-data.ts\n");
    
    places.slice(0, 100).forEach((p: any) => {
      console.log(`  { name: "${p.name}", province: "UNKNOWN", lat: ${p.lat.toFixed(4)}, lon: ${p.lon.toFixed(4)} },`);
    });

    console.log(`\n... en nog ${places.length - 100} andere locaties.`);
    
  } catch (error) {
    console.error("❌ Discovery failed:", error);
  }
}

discover();
