
import { geocodeCity, buildSnippet } from '../src/lib/b2b-relevance';
import { fetchWeatherData } from '../src/lib/weather';
import { findLeadsInCity } from '../src/lib/b2b-discovery';

const CITIES = ["Vlissingen", "Maastricht", "Groningen", "Amsterdam", "Utrecht", "Den Helder"];
const INDUSTRIES = ["dakdekker", "horeca", "hovenier"];

async function findGlobalHotspot() {
  console.log("🌍 SCANNING NETHERLANDS FOR B2B HOTSPOTS...");
  
  for (const city of CITIES) {
    process.stdout.write(`🔍 Scanning ${city}... `);
    const coords = await geocodeCity(city);
    if (!coords) { console.log("Skip (Geocoding error)"); continue; }
    
    const weather = await fetchWeatherData(coords.lat, coords.lon);
    
    for (const industry of INDUSTRIES) {
      const snippet = buildSnippet(weather, city, industry as any);
      if (snippet.event) {
        console.log(`\n\n🎯 HOTSPOT FOUND!`);
        console.log(`📍 City: ${city}`);
        console.log(`🏢 Industry: ${industry}`);
        console.log(`🌩️  Reason: ${snippet.event.label}`);
        
        console.log(`\n🚀 Initializing Google Places lead discovery...`);
        const leads = await findLeadsInCity(city, industry);
        console.log(`✅ Leads discovered: ${leads.length}`);
        leads.slice(0, 3).forEach(l => console.log(`   - ${l.businessName}`));
        
        return; // We found the "Gold", we can stop.
      }
    }
    console.log("Clear.");
  }
  
  console.log("\n⚪ The whole of NL is currently boring for B2B. No urgent pitches possible.");
}

findGlobalHotspot();
