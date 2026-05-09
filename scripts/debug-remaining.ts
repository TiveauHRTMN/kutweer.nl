import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import { createClient } from "@supabase/supabase-js";

async function main() {
  const sb = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );

  const dutch = ["drenthe", "flevoland", "friesland", "gelderland", "groningen", "limburg", "noord-brabant", "noord-holland", "overijssel", "utrecht", "zeeland", "zuid-holland"];
  const dutchCap = dutch.map(p => p.charAt(0).toUpperCase() + p.slice(1));

  const { data } = await sb.from("seo_injections").select("place_name, province").not("province", "in", "(" + [...dutch, ...dutchCap].join(",") + ")").limit(80);
  console.log("Remaining 80 rows sample:");
  console.log(data);
}

main().catch(console.error);
