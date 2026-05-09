import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import { createClient } from "@supabase/supabase-js";

async function main() {
  const sb = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );

  const dutchProvinces = [
    "drenthe", "flevoland", "friesland", "gelderland", "groningen",
    "limburg", "noord-brabant", "noord-holland", "overijssel",
    "utrecht", "zeeland", "zuid-holland",
  ];
  const flandersProvinces = ['antwerpen', 'limburg-be', 'oost-vlaanderen', 'vlaams-brabant', 'west-vlaanderen'];
  
  const allProvinces = [...dutchProvinces, ...flandersProvinces];

  console.log("Checking SEO status (PAGINATED)...");

  const results: Record<string, number> = {};

  for (const p of allProvinces) {
    // Check lowercase
    const { count: c1 } = await sb.from("seo_injections").select("*", { count: "exact", head: true }).eq('province', p);
    // Check capitalized
    const cap = p.charAt(0).toUpperCase() + p.slice(1);
    const { count: c2 } = await sb.from("seo_injections").select("*", { count: "exact", head: true }).eq('province', cap);
    
    results[p] = (c1 || 0) + (c2 || 0);
  }

  console.log("Results:");
  for (const [p, n] of Object.entries(results).sort((a,b) => b[1] - a[1])) {
    if (n > 0) {
      console.log(`  ${p}: ${n}`);
    }
  }

  const { count: total } = await sb.from("seo_injections").select("*", { count: "exact", head: true });
  const accounted = Object.values(results).reduce((a,b) => a+b, 0);
  console.log(`\nTotal: ${total}, Accounted: ${accounted}, Remaining: ${(total||0) - accounted}`);
}

main().catch(console.error);
