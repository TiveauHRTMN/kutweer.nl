import fs from 'fs';
import path from 'path';

const placesPath = path.join(process.cwd(), "src", "lib", "places.json");
const rawPlaces = JSON.parse(fs.readFileSync(placesPath, "utf-8"));

const m: Record<string, number> = {};
(rawPlaces as any).forEach((p: any) => {
  m[p.province] = (m[p.province] || 0) + 1;
});

console.log("Places in places.json:");
for (const [p, n] of Object.entries(m).sort()) {
  console.log(`  ${p}: ${n}`);
}
