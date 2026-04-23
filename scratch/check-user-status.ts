import { createClient } from "@supabase/supabase-js";

async function checkUser() {
  const url = "https://bhguergqkyiejyxsiwdu.supabase.co";
  const key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJoZ3Vlcmdxa3lpZWp5eHNpd2R1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTk4OTk4NywiZXhwIjoyMDkxNTY1OTg3fQ.tpPoBfdMvTqnoFNbSn4zju5393kmKtpnqyIX-dCAT0U"; // service_role
  
  const supabase = createClient(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
  
  const email = "info@weerzone.nl";
  console.log(`Checking user: ${email}`);
  
  const { data, error } = await supabase.auth.admin.listUsers();
  
  if (error) {
    console.error("Error listing users:", error.message);
    return;
  }
  
  const user = data.users.find(u => u.email === email);
  
  if (user) {
    console.log("User found:");
    console.log("ID:", user.id);
    console.log("Email:", user.email);
    console.log("Confirmed At:", user.email_confirmed_at);
    console.log("Last Sign In:", user.last_sign_in_at);
    console.log("User Metadata:", user.user_metadata);
  } else {
    console.log("User not found.");
  }
}

checkUser();
