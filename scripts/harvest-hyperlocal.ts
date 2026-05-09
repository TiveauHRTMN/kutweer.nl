import axios from 'axios';
import fs from 'fs';
import path from 'path';

/**
 * Hyper-Local Harvester v2
 * Fetches woonplaatsen + gehuchten + buurtschappen via OSM Overpass API
 * voor Nederland (12 provincies) en Vlaanderen (5 provincies).
 */

const OVERPASS_URL = "https://overpass-api.de/api/interpreter";
const DELAY_MS = 2000; // beleefd wachten tussen queries

const PROVINCES_NL: Record<string, string> = {
  "Drenthe":       "drenthe",
  "Flevoland":     "flevoland",
  "Fryslân":       "friesland",
  "Gelderland":    "gelderland",
  "Groningen":     "groningen",
  "Limburg":       "limburg",
  "Noord-Brabant": "noord-brabant",
  "Noord-Holland": "noord-holland",
  "Overijssel":    "overijssel",
  "Utrecht":       "utrecht",
  "Zeeland":       "zeeland",
  "Zuid-Holland":  "zuid-holland",
};

const PROVINCES_BE: Record<string, string> = {
  "Antwerpen":       "antwerpen",
  "Limburg":         "limburg-be",
  "Oost-Vlaanderen": "oost-vlaanderen",
  "Vlaams-Brabant":  "vlaams-brabant",
  "West-Vlaanderen": "west-vlaanderen",
};

// OSM place types die gehuchten en buurtschappen omvatten
const PLACE_TYPES = "hamlet|village|town|city|locality|isolated_dwelling|suburb";

async function sleep(ms: number) {
  return new Promise(r => setTimeout(r, ms));
}

async function overpassQuery(query: string, retries = 3): Promise<any[]> {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await axios.post(
        OVERPASS_URL,
        `data=${encodeURIComponent(query)}`,
        {
          headers: {
            'User-Agent': 'WeerzoneHyperLocalBot/2.0 (info@weerzone.nl)',
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          timeout: 90000,
        }
      );
      return res.data.elements ?? [];
    } catch (e: any) {
      console.warn(`  ⚠️ Overpass fout (poging ${i + 1}): ${e.message}`);
      if (i < retries - 1) await sleep(5000);
    }
  }
  return [];
}

async function harvestProvince(
  provinceName: string,
  provinceSlug: string,
  countryCode: "nl" | "be"
): Promise<{ name: string; province: string; lat: number; lon: number }[]> {
  // Gebruik de OSM admin_level voor provincie-areas:
  //   NL provincies: admin_level=4
  //   BE provincies: admin_level=6 (Belgische provincies zitten in gewesten op level 4)
  const adminLevel = countryCode === "nl" ? "4" : "6";

  const query = `
[out:json][timeout:90];
area["name"="${provinceName}"]["admin_level"="${adminLevel}"]->.prov;
(
  node["place"~"${PLACE_TYPES}"](area.prov);
);
out body;
  `.trim();

  const elements = await overpassQuery(query);
  const results: { name: string; province: string; lat: number; lon: number }[] = [];

  for (const el of elements) {
    const name = el.tags?.name;
    if (!name || !el.lat || !el.lon) continue;
    results.push({ name, province: provinceSlug, lat: el.lat, lon: el.lon });
  }

  return results;
}

async function run() {
  const placesPath = path.join(process.cwd(), "src", "lib", "places.json");
  const existing: any[] = JSON.parse(fs.readFileSync(placesPath, "utf-8"));
  const merged = [...existing];

  const existingKey = (p: any) =>
    `${p.name.toLowerCase()}|${Math.round(p.lat * 100)}|${Math.round(p.lon * 100)}`;
  const existingKeys = new Set(merged.map(existingKey));

  let newNl = 0;
  let newBe = 0;

  // ── Nederland ────────────────────────────────────────────────
  console.log("\n🇳🇱 Nederland (OSM Overpass)...");
  for (const [provinceName, provinceSlug] of Object.entries(PROVINCES_NL)) {
    process.stdout.write(`  ${provinceName}... `);
    const places = await harvestProvince(provinceName, provinceSlug, "nl");
    let added = 0;
    for (const p of places) {
      const k = existingKey(p);
      if (!existingKeys.has(k)) {
        merged.push(p);
        existingKeys.add(k);
        added++;
        newNl++;
      }
    }
    console.log(`${places.length} gevonden, ${added} nieuw`);
    await sleep(DELAY_MS);
  }

  // ── Vlaanderen ────────────────────────────────────────────────
  console.log("\n🇧🇪 Vlaanderen (OSM Overpass)...");
  for (const [provinceName, provinceSlug] of Object.entries(PROVINCES_BE)) {
    process.stdout.write(`  ${provinceName}... `);
    const places = await harvestProvince(provinceName, provinceSlug, "be");
    let added = 0;
    for (const p of places) {
      const k = existingKey(p);
      if (!existingKeys.has(k)) {
        merged.push(p);
        existingKeys.add(k);
        added++;
        newBe++;
      }
    }
    console.log(`${places.length} gevonden, ${added} nieuw`);
    await sleep(DELAY_MS);
  }

  // ── Opslaan ───────────────────────────────────────────────────
  console.log(`\n📊 Samenvatting:`);
  console.log(`  ${newNl} nieuwe NL locaties (incl. gehuchten & buurtschappen)`);
  console.log(`  ${newBe} nieuwe BE locaties`);
  console.log(`  Totaal in database: ${merged.length}`);

  fs.writeFileSync(placesPath, JSON.stringify(merged, null, 2));
  console.log("✅ places.json bijgewerkt.");
}

run();
