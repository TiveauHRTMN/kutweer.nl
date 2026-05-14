#!/usr/bin/env node
/**
 * Seed Duitse plaatsen uit GeoNames cities500 dump.
 *
 * Vooraf draaien:
 *   curl -sSL -o tmp/cities500.zip https://download.geonames.org/export/dump/cities500.zip
 *   unzip -o tmp/cities500.zip -d tmp/
 *
 * Daarna: node scripts/seed-de-from-geonames.js
 *
 * Resultaat: places.json krijgt alle DE plaatsen met populatie ≥ 500
 * (~12.000 plaatsen, vergelijkbaar met NL dekking).
 */

const fs = require('fs');
const path = require('path');

const GEONAMES_FILE = path.join(__dirname, '..', 'tmp', 'cities500.txt');
const PLACES_FILE   = path.join(__dirname, '..', 'src', 'lib', 'places.json');

// GeoNames admin1 code → onze interne province key (matched naar places-data.ts Province type).
const ADMIN1_TO_PROVINCE = {
  '01': 'baden-wurttemberg',
  '02': 'beieren',
  '03': 'bremen',
  '04': 'hamburg',
  '05': 'hessen',
  '06': 'nedersaksen',
  '07': 'noordrijn-westfalen',
  '08': 'rijnland-palts',
  '09': 'saarland',
  '10': 'sleeswijk-holstein',
  '11': 'berlijn',
  '12': 'brandenburg',
  '13': 'mecklenburg-voorpommeren',
  '14': 'saksen',
  '15': 'saksen-anhalt',
  '16': 'thuringen',
};

// Bepaal het karakter op basis van Bundesland + populatie.
function deriveCharacter(province, population) {
  if (province === 'hamburg' || province === 'mecklenburg-voorpommeren' || province === 'sleeswijk-holstein' || province === 'bremen') return 'coastal';
  if (province === 'baden-wurttemberg' || province === 'beieren' || province === 'thuringen' || province === 'saksen') return 'highland';
  if (population && population >= 250_000) return 'urban';
  return 'inland';
}

function main() {
  if (!fs.existsSync(GEONAMES_FILE)) {
    console.error(`❌ ${GEONAMES_FILE} ontbreekt. Eerst downloaden:`);
    console.error(`   curl -sSL -o tmp/cities500.zip https://download.geonames.org/export/dump/cities500.zip`);
    console.error(`   unzip -o tmp/cities500.zip -d tmp/`);
    process.exit(1);
  }

  const existing = JSON.parse(fs.readFileSync(PLACES_FILE, 'utf8'));
  console.log(`📚 Bestaand: ${existing.length} plaatsen in places.json`);

  // Dedup-key per (province, normalized name)
  const seen = new Set();
  for (const p of existing) {
    seen.add(`${p.province}|${normalizeName(p.name)}`);
  }

  const text = fs.readFileSync(GEONAMES_FILE, 'utf8');
  const lines = text.split('\n');

  const newPlaces = [];
  const perProvince = {};
  let skipped = 0, dups = 0, badAdmin = 0;

  for (const line of lines) {
    if (!line) continue;
    const cols = line.split('\t');
    if (cols.length < 19) continue;
    const country = cols[8];
    if (country !== 'DE') continue;

    const featureClass = cols[6];
    if (featureClass !== 'P') { skipped++; continue; }

    const name        = cols[1].trim();
    const lat         = parseFloat(cols[4]);
    const lon         = parseFloat(cols[5]);
    const admin1      = cols[10];
    const populationS = cols[14];
    const population  = populationS ? parseInt(populationS, 10) : 0;

    const province = ADMIN1_TO_PROVINCE[admin1];
    if (!province) { badAdmin++; continue; }

    if (!name || Number.isNaN(lat) || Number.isNaN(lon)) { skipped++; continue; }
    if (name.length > 60) { skipped++; continue; }

    const key = `${province}|${normalizeName(name)}`;
    if (seen.has(key)) { dups++; continue; }
    seen.add(key);

    const place = {
      name,
      province,
      lat: Number(lat.toFixed(4)),
      lon: Number(lon.toFixed(4)),
    };
    if (population > 0) place.population = population;
    const character = deriveCharacter(province, population);
    if (character) place.character = character;

    newPlaces.push(place);
    perProvince[province] = (perProvince[province] || 0) + 1;
  }

  console.log(`\n📊 GeoNames parse-resultaat:`);
  console.log(`   Nieuw toegevoegd: ${newPlaces.length}`);
  console.log(`   Duplicaat overgeslagen: ${dups}`);
  console.log(`   Geskipt (geen P-class of bad data): ${skipped}`);
  console.log(`   Onbekende admin1: ${badAdmin}`);

  console.log(`\n🗺  Nieuw per Bundesland:`);
  for (const [prov, count] of Object.entries(perProvince).sort((a, b) => b[1] - a[1])) {
    console.log(`   ${prov.padEnd(28)} ${count}`);
  }

  const merged = [...existing, ...newPlaces];
  fs.writeFileSync(PLACES_FILE, JSON.stringify(merged, null, 2) + '\n');
  console.log(`\n✅ places.json: ${existing.length} → ${merged.length} plaatsen`);
}

function normalizeName(name) {
  return name
    .toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '');
}

main();
