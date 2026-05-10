/**
 * Vult seo_injections aan voor plaatsen die er nog niet in zitten.
 * Sla op: meta_description + geo_optimized_summary + ai_strategy.
 *
 * Gebruik: npx tsx scripts/seed-seo-injections.ts [--province groningen] [--limit 500] [--dry]
 */
import * as dotenv from "dotenv";
import path from "path";
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

import { ALL_PLACES } from "../src/lib/places-data";
import { hermesChat } from "../src/lib/hermes";
import { getSupabaseAdmin } from "../src/lib/supabase";

const BATCH_SIZE = 10;      // plaatsen per AI-call
const DELAY_MS   = 600;     // pauze tussen batches (rate limiting)
const PROVINCE_LABELS: Record<string, string> = {
  groningen: "Groningen", friesland: "Friesland", drenthe: "Drenthe",
  overijssel: "Overijssel", flevoland: "Flevoland", gelderland: "Gelderland",
  utrecht: "Utrecht", "noord-holland": "Noord-Holland", "zuid-holland": "Zuid-Holland",
  zeeland: "Zeeland", "noord-brabant": "Noord-Brabant", limburg: "Limburg (NL)",
  antwerpen: "Antwerpen", "limburg-be": "Limburg (BE)",
  "oost-vlaanderen": "Oost-Vlaanderen", "vlaams-brabant": "Vlaams-Brabant",
  "west-vlaanderen": "West-Vlaanderen",
};

// CLI args
const args = process.argv.slice(2);
const DRY_RUN       = args.includes("--dry");
const provinceIdx   = args.indexOf("--province");
const provinceArg   = provinceIdx !== -1 ? args[provinceIdx + 1] : undefined;
const limitIdx      = args.indexOf("--limit");
const limitArg      = limitIdx !== -1 ? args[limitIdx + 1] : undefined;
const LIMIT         = limitArg ? parseInt(limitArg, 10) : Infinity;

function extractJsonArray(text: string): any[] {
  const cleaned = text.replace(/```json|```/g, "").trim();
  const parsed = JSON.parse(cleaned);
  if (Array.isArray(parsed)) return parsed;
  const val = Object.values(parsed).find(Array.isArray) as any[] | undefined;
  if (val) return val;
  throw new Error(`Geen JSON array in response: ${cleaned.slice(0, 120)}`);
}

async function run() {
  const supabase = getSupabaseAdmin();
  if (!supabase) throw new Error("Geen Supabase-verbinding (check SUPABASE_SERVICE_ROLE_KEY in .env.local)");

  // 1. Haal alle bestaande place_names op uit seo_injections (paginering voor grote sets)
  console.log("🔍 Bestaande seo_injections ophalen…");
  const existing = new Set<string>();
  let page = 0;
  while (true) {
    const { data, error } = await supabase
      .from("seo_injections")
      .select("place_name")
      .range(page * 1000, page * 1000 + 999);
    if (error) throw new Error(`Supabase fout: ${error.message}`);
    if (!data || data.length === 0) break;
    data.forEach(r => existing.add(r.place_name));
    if (data.length < 1000) break;
    page++;
  }
  console.log(`   ${existing.size} plaatsen al aanwezig in seo_injections`);

  // 2. Bepaal welke plaatsen ontbreken (exclusief unknown-be)
  const candidates = ALL_PLACES.filter(p =>
    p.province !== "unknown-be" &&
    (!provinceArg || p.province === provinceArg) &&
    !existing.has(p.name)
  );

  const targets = candidates.slice(0, LIMIT);
  const total = ALL_PLACES.filter(p => p.province !== "unknown-be").length;
  const gap = candidates.length;

  console.log(`\n📊 Status:`);
  console.log(`   Totaal indexeerbare plaatsen : ${total}`);
  console.log(`   Al in seo_injections         : ${existing.size}`);
  console.log(`   Ontbreekt (gap)              : ${gap}`);
  console.log(`   Te verwerken nu              : ${targets.length}${LIMIT !== Infinity ? ` (--limit ${LIMIT})` : ""}`);
  if (provinceArg) console.log(`   Provincie filter             : ${provinceArg}`);
  if (DRY_RUN)     console.log(`\n⚠️  DRY RUN — geen wijzigingen worden opgeslagen.`);
  if (targets.length === 0) { console.log("\n✅ Niets te doen."); return; }

  // 3. Verwerk in batches
  let saved = 0, failed = 0;
  const grouped: Record<string, typeof targets> = {};
  for (const p of targets) {
    if (!grouped[p.province]) grouped[p.province] = [];
    grouped[p.province].push(p);
  }

  for (const [province, places] of Object.entries(grouped)) {
    const provLabel = PROVINCE_LABELS[province] || province;
    console.log(`\n📍 ${provLabel}: ${places.length} plaatsen te verwerken`);

    for (let i = 0; i < places.length; i += BATCH_SIZE) {
      const batch = places.slice(i, i + BATCH_SIZE);
      const batchLabel = batch.map(p => p.name).join(", ");

      try {
        const text = await hermesChat([
          {
            role: "system",
            content: `Je bent de SEO-copywriter van WEERZONE.nl. Schrijf voor elke locatie een unieke meta_description. Geef ALLEEN een JSON array terug, geen uitleg of markdown.`,
          },
          {
            role: "user",
            content: `Schrijf voor elke locatie in provincie "${provLabel}" een meta_description: max 155 tekens, uniek per locatie, informatief over het lokale weer/klimaat en geografische ligging.

Locaties: ${batchLabel}

Geef terug als JSON array:
[{ "name": "Plaatsnaam", "meta_description": "..." }]`,
          },
        ], { model: "seo", temperature: 0.4, maxTokens: 2048 });

        const entries = extractJsonArray(text);

        for (const entry of entries) {
          const place = batch.find(p => p.name === entry.name);
          if (!place || !entry.meta_description) continue;

          if (!DRY_RUN) {
            const { error } = await supabase.from("seo_injections").upsert({
              place_name: place.name,
              province: place.province,
              meta_description: entry.meta_description.slice(0, 160),
              ai_strategy: `seed-seo-injections v1 (${new Date().toISOString().slice(0, 10)})`,
              json_ld: {
                "@context": "https://schema.org",
                "@type": "WebPage",
                name: `Weer ${place.name} — WEERZONE`,
                description: entry.meta_description.slice(0, 160),
              },
            }, { onConflict: "place_name,province" });

            if (error) {
              console.error(`  ❌ ${place.name}: ${error.message}`);
              failed++;
            } else {
              saved++;
            }
          } else {
            console.log(`  [dry] ${place.name}: "${entry.meta_description.slice(0, 80)}…"`);
            saved++;
          }
        }

        const progress = Math.min(i + BATCH_SIZE, places.length);
        process.stdout.write(`  ✅ ${progress}/${places.length} (${saved} opgeslagen, ${failed} fouten)\r`);
      } catch (e) {
        failed += batch.length;
        console.error(`\n  ❌ Batch ${i} (${province}): ${(e as Error).message}`);
      }

      await new Promise(r => setTimeout(r, DELAY_MS));
    }
    console.log(); // newline na progress-regel
  }

  console.log(`\n🏁 Klaar. ${saved} opgeslagen, ${failed} mislukt.`);
  if (DRY_RUN) console.log("   (--dry was actief, niets weggeschreven naar Supabase)");
}

run().catch(err => {
  console.error("\n❌ Script mislukt:", err.message);
  process.exit(1);
});
