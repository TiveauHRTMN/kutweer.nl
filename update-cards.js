const fs = require('fs');

const data = JSON.parse(fs.readFileSync('amazon-data.json', 'utf8'));

// map current generic titles approx to our scraped queries
const mapping = {
  // rain_now
  "Regenjas waterdicht": "regenjas",
  "Senz stormparaplu": "stormparaplu",
  "Waterdichte rugzakhoes": "rugzakhoes waterdicht",
  "Regenbroek": "regenbroek waterdicht",
  "Waterdichte schoenen": "waterdichte schoenen heren",
  
  // rain_coming
  "Stormparaplu - automatisch": "stormparaplu",
  "Regenponcho opvouwbaar": "regenponcho lichtgewicht",
  "Regenoverschoenen": "regenoverschoenen fiets",
  "Droogrek opvouwbaar": "droogrek binnen",
  
  // freezing
  "Thermo ondergoed": "thermo ondergoed",
  "Winterjas warm": "winterjas",
  "Touchscreen handschoenen": "touchscreen handschoenen",
  "Ijskrabber": "ijskrabber auto",
  
  // cold_snap
  "Fleece vest": "thermo ondergoed",
  "Merino sjaal": "winterjas",
  "Softshell jas": "winterjas",
  "Thermosfles": "droogrek binnen", // just fallback
  
  // perfect
  "Zonnebrand": "zonnebrand",
  "Zonnebril": "zonnebril",
  "Picknickdeken": "koelbox",
  "Waterfles": "waterfles",
};

let content = fs.readFileSync('src/components/AffiliateCard.tsx', 'utf8');

// replace amazonUrl with amazonProductUrl
content = content.replace("amazonUrl, bookingUrl", "amazonUrl, amazonProductUrl, bookingUrl");

// A brute force pattern replace:
Object.keys(data).forEach(q => {
  const item = data[q];
  if (!item.img) return; // missing item
  
  // Find products that roughly match the previous URL search pattern.
  // We'll replace all product object properties where href matched roughly.
  // Actually, using regex on JSON inside TSX is brittle. Let's do it via finding blocks.
});
