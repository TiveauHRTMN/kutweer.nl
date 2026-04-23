import { createClient } from "@supabase/supabase-js";

async function checkProfile() {
  const url = "https://bhguergqkyiejyxsiwdu.supabase.co";
  const key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJoZ3Vlcmdxa3lpZWp5eHNpd2R1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTk4OTk4NywiZXhwIjoyMDkxNTY1OTg3fQ.tpPoBfdMvTqnoFNbSn4zju5393kmKtpnqyIX-dCAT0U"; // service_role
  
  const supabase = createClient(url, key);
  
  const userId = "73d0fe64-3c94-477d-b950-87c901a69152";
  console.log(`Checking profile for user ID: ${userId}`);
  
  const { data: profile, error: profileError } = await supabase
    .from("user_profile")
    .select("*")
    .eq("id", userId)
    .maybeSingle();
    
  if (profileError) {
    console.error("Error fetching profile:", profileError.message);
  } else if (profile) {
    console.log("Profile found:", profile);
  } else {
    console.log("Profile not found.");
  }
  
  const { data: subs, error: subsError } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", userId);
    
  if (subsError) {
    console.error("Error fetching subscriptions:", subsError.message);
  } else {
    console.log("Subscriptions found:", subs);
  }
}

checkProfile();
