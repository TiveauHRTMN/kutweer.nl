import { getSupabase } from "../src/lib/supabase";

async function checkAgents() {
  const supabase = getSupabase();
  if (!supabase) {
    console.error("No Supabase");
    return;
  }

  const { data, error } = await supabase
    .from("system_state")
    .select("*");

  if (error) console.error("System state error:", error.message);
  else console.log("System state:", data);

  const { data: agents, error: err2 } = await supabase
    .from("agent_activity")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(10);

  if (err2) console.error("Agent activity error:", err2.message);
  else {
    console.log("Recent Agent Activities:");
    agents?.forEach(a => {
      console.log(`[${a.created_at}] ${a.agent_name} (${a.action}): ${a.details}`);
    });
  }
}

checkAgents();
