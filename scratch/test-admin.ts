import { createSupabaseAdminClient } from "../src/lib/supabase/admin";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

async function test() {
  const admin = createSupabaseAdminClient();
  console.log("Creating test link for support@weerzone.nl...");
  
  const { data, error } = await admin.auth.admin.generateLink({
    type: "magiclink",
    email: "support@weerzone.nl",
    options: { redirectTo: "https://weerzone.nl/app/onboarding" }
  });

  if (error) {
    console.error("❌ Admin API failed:", error.message);
  } else {
    console.log("✅ Success! Generated link:", data.properties.action_link);
  }
}

test();
