import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

async function main() {
  const base = process.env.NEXT_PUBLIC_BASE_URL || "https://weerzone.nl";
  const secret = process.env.CRON_SECRET;
  const url = `${base}/api/cron/social-post?dry=1&secret=${secret}`;
  console.log("Hitting:", url.replace(secret!, "***"));

  const res = await fetch(url);
  const data = await res.json();
  console.log("Status:", res.status);
  console.log("\n--- X caption ---");
  console.log(data.x?.caption);
  console.log("\n--- TikTok caption ---");
  console.log(data.tiktok?.caption);
  console.log("\n--- Images X ---");
  for (const img of data.images?.x ?? []) console.log(" ", img);
  console.log("\n--- Images TikTok ---");
  for (const img of data.images?.tt ?? []) console.log(" ", img);
}

main().catch(console.error);
