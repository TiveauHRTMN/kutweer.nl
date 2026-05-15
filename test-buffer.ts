import { config } from "dotenv";
config({ path: ".env.local" });

import { GET } from "./src/app/(site)/api/cron/social-post/route";

async function test() {
  console.log("Starting Buffer test (TikTok only)...");
  
  // Mock request
  const req = new Request("http://localhost:3000/api/cron/social-post?auth=" + process.env.CRON_SECRET);
  
  try {
    const res = await GET(req);
    const data = await res.json();
    console.log("Response Status:", res.status);
    console.dir(data, { depth: null });
  } catch (error) {
    console.error("Test failed:", error);
  }
}

test();
