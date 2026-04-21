import { getSupabase } from "../src/lib/supabase";

async function checkTable() {
  const supabase = getSupabase();
  if (!supabase) {
    console.error("Supabase not configured");
    return;
  }

  console.log("Checking for 'agent_activity' table...");
  const { data, error } = await supabase
    .from("agent_activity")
    .select("count", { count: 'exact', head: true });

  if (error) {
    console.error("Error accessing 'agent_activity':", error.message);
    if (error.message.includes("does not exist")) {
        console.log("TABLE DOES NOT EXIST. Please run the SQL migration.");
    }
  } else {
    console.log("Table exists! Row count:", data);
  }

  console.log("\nChecking for 'b2b_leads' table...");
  const { error: b2bError } = await supabase.from("b2b_leads").select("id").limit(1);
  if (b2bError) console.error("Error accessing 'b2b_leads':", b2bError.message);
  else console.log("b2b_leads table exists.");
}

checkTable();
