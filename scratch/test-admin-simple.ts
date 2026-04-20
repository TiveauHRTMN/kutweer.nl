import fs from 'fs';
import { createClient } from "@supabase/supabase-js";

function loadEnv() {
  const content = fs.readFileSync('.env.local', 'utf8');
  content.split('\n').forEach(line => {
    const [key, ...rest] = line.split('=');
    if (key && rest.length) {
      process.env[key.trim()] = rest.join('=').trim();
    }
  });
}

async function test() {
  loadEnv();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const admin = createClient(url!, key!, { auth: { autoRefreshToken: false, persistSession: false } });
  
  console.log("Generating link for test@example.com...");
  const { data, error } = await admin.auth.admin.generateLink({
    type: "magiclink",
    email: "test@example.com",
    options: { redirectTo: "https://weerzone.nl" }
  });

  if (error) console.error("❌ Admin API failed:", error.message);
  else console.log("✅ Admin API Success! Link generated.");
}

test();
