
import { geocodeCity, buildSnippet } from '../src/lib/b2b-relevance';
import { fetchWeatherData } from '../src/lib/weather';
import { findLeadsInCity, getLeadDetails } from '../src/lib/b2b-discovery';

async function testHunter() {
  console.log("🔥 IGNITING TEST HUNTER CYCLE...");
  
  const sampleCity = "Vlissingen"; // Vaak wind/regen hotspot
  const industry = "dakdekker"; 
  
  console.log(`\n📍 Checking weather for ${sampleCity}...`);
  const coords = await geocodeCity(sampleCity);
  if (!coords) return console.log("❌ Geocoding failed");

  const weather = await fetchWeatherData(coords.lat, coords.lon);
  const snippet = buildSnippet(weather, sampleCity, industry as any);

  console.log(`   Weather: ${weather.current.temperature}°C, ${snippet.desc}`);
  
  if (snippet.event) {
    console.log(`🎯 HOTSPOT DETECTED: ${snippet.event.label} (${snippet.event.kind})`);
    console.log(`🔍 Searching for ${industry}s in ${sampleCity}...`);
    
    const leads = await findLeadsInCity(sampleCity, industry);
    console.log(`\n✅ Found ${leads.length} leads via Google Places:`);
    
    for (const lead of leads.slice(0, 3)) {
        console.log(`   - ${lead.businessName} (${lead.address})`);
        const details = await getLeadDetails(lead.placeId);
        if (details.website) console.log(`     🌐 Website: ${details.website}`);
    }
  } else {
    console.log("⚪ No immediate B2B relevance found in this city right now.");
    console.log("   (De Hunter zou nu doorgaan naar de volgende stad op de lijst)");
  }
}

testHunter();
