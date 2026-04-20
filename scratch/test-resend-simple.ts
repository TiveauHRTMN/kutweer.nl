import fs from 'fs';
import { Resend } from "resend";

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
  const apiKey = process.env.RESEND_API_KEY;
  const resend = new Resend(apiKey);
  console.log("Sending test mail to iamrowanonl@gmail.com...");
  
  try {
    const { data, error } = await resend.emails.send({
      from: "WEERZONE <info@weerzone.nl>",
      to: "iamrowanonl@gmail.com",
      subject: "Test Branded Auth",
      html: "<h1>Het werkt!</h1>",
    });
    if (error) console.error("❌ Resend failed:", error);
    else console.log("✅ Resend Success ID:", data?.id);
  } catch (err) {
    console.error("❌ Unexpected error:", err);
  }
}

test();
