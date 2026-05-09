import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import { createClient } from "@supabase/supabase-js";

async function main() {
  const sb = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );

  const { count, error } = await sb
    .from("seo_injections")
    .select("*", { count: "exact", head: true });

  if (error) {
    console.error("Error:", error.message);
    process.exit(1);
  }
  console.log("Totaal rows:", count);

  // Ophalen van alle unieke provincies
  const { data, error: dataError } = await sb.from("seo_injections").select("province");
  if (dataError) {
    console.error("Data Error:", dataError.message);
    process.exit(1);
  }

  const m: Record<string, number> = {};
  for (const r of data ?? []) {
    const p = r.province || "onbekend";
    m[p] = (m[p] ?? 0) + 1;
  }
  
  console.log("Provincie breakdown:");
  for (const [p, n] of Object.entries(m).sort((a, b) => a[0].localeCompare(b[0]))) {
    console.log(`  ${p}: ${n}`);
  }
}

main().catch(console.error);
