import fs from 'fs';
import { sendBrandedMagicLink } from "../src/app/actions";

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
  // We testen voor Steve omdat dat de meest complexe is
  console.log("Testing FULL Branded Magic Link for Steve -> iamrowanonl@gmail.com...");
  
  try {
    await sendBrandedMagicLink("iamrowanonl@gmail.com", "steve", "Rowan - WeerZone Test");
    console.log("✅ FULL FLOW SUCCESS! Check je mail voor de Steve-activatie mail.");
  } catch (err) {
    console.error("❌ FULL FLOW FAILED:", err);
  }
}

test();
