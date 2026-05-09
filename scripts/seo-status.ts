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

  const { data } = await sb.from("seo_injections").select("province");
  const m: Record<string, number> = {};
  for (const r of data ?? []) m[r.province] = (m[r.province] ?? 0) + 1;
  for (const [p, n] of Object.entries(m).sort((a, b) => a[0].localeCompare(b[0]))) {
    console.log(`  ${p}: ${n}`);
  }
}

main().catch(console.error);
