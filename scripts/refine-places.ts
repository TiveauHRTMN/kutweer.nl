import fs from 'fs';
import path from 'path';
import axios from 'axios';

async function run() {
    const placesPath = path.join(process.cwd(), "src", "lib", "places.json");
    const places = JSON.parse(fs.readFileSync(placesPath, "utf-8"));
    
    console.log(`🚀 Verfijnen database (${places.length} locaties)...`);

    const noPop = places.filter((p: any) => p.population === undefined);
    console.log(`📍 ${noPop.length} locaties missen populatiedata. Scannen van de top...`);

    let updated = 0;
    let removed = 0;
    const finalPlaces = [...places];

    // We scannen een batch van 200 locaties die nog geen data hebben
    for (let i = 0; i < Math.min(noPop.length, 200); i++) {
        const p = noPop[i];
        try {
            const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(p.name)}&count=1&language=nl`;
            const res = await axios.get(url);
            
            if (res.data.results && res.data.results[0]) {
                const result = res.data.results[0];
                const pop = result.population || 0;
                
                // Update in de hoofdlijst
                const index = finalPlaces.findIndex(fp => fp.name === p.name && fp.province === p.province);
                if (index !== -1) {
                    if (pop >= 1000) {
                        finalPlaces[index].population = pop;
                        updated++;
                    } else if (pop > 0 && pop < 1000) {
                        // Het is een bekende kleine plaats -> verwijderen
                        finalPlaces.splice(index, 1);
                        removed++;
                    } else {
                        // Pop is 0 of onbekend bij API -> we houden hem voor de zekerheid als het een 'name' is die niet op een buurtschap lijkt
                    }
                }
            }
            if (i % 20 === 0) console.log(`⏳ Bezig... (${i}/${Math.min(noPop.length, 200)})`);
            await new Promise(resolve => setTimeout(resolve, 150));
        } catch (e) {
            console.error(`Error for ${p.name}`);
        }
    }

    console.log(`✅ Resultaat: ${updated} steden geüpdatet, ${removed} kleine plaatsen verwijderd.`);
    console.log(`📉 Nieuw totaal: ${finalPlaces.length} locaties.`);
    
    fs.writeFileSync(placesPath, JSON.stringify(finalPlaces, null, 2));
}

run();
