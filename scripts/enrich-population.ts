import fs from 'fs';
import path from 'path';
import axios from 'axios';

// Bron: Geonames of vergelijkbare database voor populatie
// We kunnen ook de Open-Meteo API gebruiken om populatie op te halen voor de steden zonder data.

const PROVINCE_MAP: Record<string, string> = {
    "Antwerpen": "antwerpen",
    "Limburg": "limburg-be",
    "Oost-Vlaanderen": "oost-vlaanderen",
    "Vlaams-Brabant": "vlaams-brabant",
    "West-Vlaanderen": "west-vlaanderen",
};

async function run() {
    const placesPath = path.join(process.cwd(), "src", "lib", "places.json");
    const places = JSON.parse(fs.readFileSync(placesPath, "utf-8"));
    
    console.log(`🚀 Start opschonen en verrijken van ${places.length} locaties...`);

    // 1. Verwijder duidelijke buurtschappen zonder inwoners (indien bekend)
    // Maar we moeten voorzichtig zijn: we willen niet per ongeluk grote steden verwijderen.
    
    // We gaan eerst proberen populatiedata te fetchen voor de top-locaties in Vlaanderen
    const beProvinces = Object.values(PROVINCE_MAP);
    const bePlaces = places.filter((p: any) => beProvinces.includes(p.province) && p.population === undefined);
    
    console.log(`📍 ${bePlaces.length} Vlaamse locaties missen populatiedata.`);

    let updated = 0;
    // We doen een steekproef/batch van de eerste 50 om de API niet te overbelasten
    for (let i = 0; i < Math.min(bePlaces.length, 100); i++) {
        const p = bePlaces[i];
        try {
            const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(p.name)}&count=1&language=nl`;
            const res = await axios.get(url);
            if (res.data.results && res.data.results[0]) {
                const result = res.data.results[0];
                if (result.population) {
                    p.population = result.population;
                    updated++;
                }
            }
            // Sleep to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 200));
        } catch (e) {
            console.error(`Error for ${p.name}:`, (e as any).message);
        }
    }

    console.log(`✅ ${updated} locaties verrijkt met populatiedata.`);

    // 2. Filteren op basis van de 1000 inwoners regel (indien data beschikbaar)
    // Belangrijk: locaties zonder data houden we voorlopig aan totdat we zeker weten dat ze klein zijn.
    const filtered = places.filter((p: any) => {
        if (p.population !== undefined) {
            return p.population >= 1000;
        }
        return true; // Keep for now if unknown
    });

    console.log(`📉 Database geschoond: van ${places.length} naar ${filtered.length} locaties.`);
    
    fs.writeFileSync(placesPath, JSON.stringify(filtered, null, 2));
    console.log("💾 Wijzigingen opgeslagen in places.json");
}

run();
