import { createClient } from "@supabase/supabase-js";

async function fixUser() {
  const url = "https://bhguergqkyiejyxsiwdu.supabase.co";
  const key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJoZ3Vlcmdxa3lpZWp5eHNpd2R1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTk4OTk4NywiZXhwIjoyMDkxNTY1OTg3fQ.tpPoBfdMvTqnoFNbSn4zju5393kmKtpnqyIX-dCAT0U"; // service_role
  
  const supabase = createClient(url, key);
  
  const userId = "73d0fe64-3c94-477d-b950-87c901a69152";
  const email = "info@weerzone.nl";
  
  console.log(`Fixing user: ${email} (${userId})`);
  
  // 1. Create Profile
  const { error: profileError } = await supabase
    .from("user_profile")
    .insert({
      id: userId,
      email: email,
      full_name: "Admin Weerzone"
    });
    
  if (profileError) {
    console.error("Error creating profile:", profileError.message);
  } else {
    console.log("Profile created.");
  }
  
  // 2. Create Subscription
  const { error: subError } = await supabase
    .from("subscriptions")
    .insert({
      user_id: userId,
      tier: "reed",
      status: "trialing",
      is_founder: true,
      trial_end: "2026-06-01 00:00:00+02"
    });
    
  if (subError) {
    console.error("Error creating subscription:", subError.message);
  } else {
    console.log("Subscription created.");
  }
}

fixUser();
