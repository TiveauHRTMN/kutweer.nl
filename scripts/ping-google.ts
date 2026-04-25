import { pingSearchConsole } from "../src/app/actions";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

async function run() {
  console.log("🚀 Pinging Google Search Console for sitemap update...");
  const result = await pingSearchConsole();
  if (result.success) {
    console.log("✅ Successfully pinged Google.");
  } else {
    console.log("❌ Failed to ping Google.");
  }
}

run();
