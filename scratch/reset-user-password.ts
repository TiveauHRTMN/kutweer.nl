import { createClient } from "@supabase/supabase-js";

async function resetPassword() {
  const url = "https://bhguergqkyiejyxsiwdu.supabase.co";
  const key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJoZ3Vlcmdxa3lpZWp5eHNpd2R1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTk4OTk4NywiZXhwIjoyMDkxNTY1OTg3fQ.tpPoBfdMvTqnoFNbSn4zju5393kmKtpnqyIX-dCAT0U"; // service_role
  
  const supabase = createClient(url, key);
  
  const email = "info@weerzone.nl";
  const newPassword = "WeerZone2026!";
  
  console.log(`Resetting password for: ${email}`);
  
  const { data: list } = await supabase.auth.admin.listUsers();
  const user = list?.users.find(u => u.email === email);
  
  if (!user) {
    console.error("User not found.");
    return;
  }
  
  const { data, error } = await supabase.auth.admin.updateUserById(user.id, {
    password: newPassword
  });
  
  if (error) {
    console.error("Error resetting password:", error.message);
  } else {
    console.log("Password reset successful for user ID:", data.user.id);
    console.log("You can now log in with the new password.");
  }
}

resetPassword();
