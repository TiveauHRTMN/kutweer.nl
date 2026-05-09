import fs from "fs";
import path from "path";
import axios from "axios";

// De bron voor geocoded Belgische locaties (Spatie)
const BELGIUM_CSV_URL = "https://raw.githubusercontent.com/spatie/belgian-cities-geocoded/master/belgian-cities-geocoded.csv";

const PROVINCE_MAP: Record<string, string> = {
  "Antwerpen": "antwerpen",
  "Limburg": "limburg-be",
  "Oost-Vlaanderen": "oost-vlaanderen",
  "Vlaams-Brabant": "vlaams-brabant",
  "West-Vlaanderen": "west-vlaanderen",
};

async function run() {
  console.log("📥 Ophalen Belgische data...");
  const response = await axios.get(BELGIUM_CSV_URL);
  const rows = response.data.split("\n");

  const newPlaces = [];
  
  // Skip header: "postal","name","lat","lng","province"
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i].trim();
    if (!row) continue;

    // Simpele CSV parser (naam kan commas bevatten maar in dit bestand niet tussen quotes gelukkig)
    const [postal, rawName, lat, lng, rawProvince] = row.split(",").map(s => s.replace(/"/g, ""));
    
    const provinceSlug = PROVINCE_MAP[rawProvince];
    
    if (provinceSlug) {
      newPlaces.push({
        name: rawName,
        province: provinceSlug,
        lat: parseFloat(lat),
        lon: parseFloat(lng)
      });
    }
  }

  console.log(`✅ ${newPlaces.length} Vlaamse locaties verwerkt.`);

  const placesPath = path.join(process.cwd(), "src", "lib", "places.json");
  const existing = JSON.parse(fs.readFileSync(placesPath, "utf-8"));
  
  // Mergen (voorkom duplicaten op naam+provincie)
  const merged = [...existing];
  let added = 0;
  
  for (const np of newPlaces) {
    const exists = existing.find((ep: any) => ep.name === np.name && ep.province === np.province);
    if (!exists) {
      merged.push(np);
      added++;
    }
  }

  fs.writeFileSync(placesPath, JSON.stringify(merged, null, 2));
  console.log(`🚀 Klaar! ${added} nieuwe Vlaamse locaties toegevoegd aan places.json.`);
  console.log(`Totaal aantal locaties nu: ${merged.length}`);
}

run().catch(console.error);