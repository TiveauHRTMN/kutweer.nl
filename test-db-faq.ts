import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
);

async function main() {
  const { data, error } = await supabase
    .from("seo_injections")
    .select("place_name, province, json_ld");
    
  if (error) {
    console.error("Error:", error);
    return;
  }
  
  let faqCount = 0;
  for (const row of data || []) {
      if (row.json_ld && JSON.stringify(row.json_ld).includes("FAQPage")) {
          faqCount++;
          console.log(`Found FAQPage in ${row.province}/${row.place_name}`);
      }
  }
  console.log("Total FAQPage entries found:", faqCount);
}

main();