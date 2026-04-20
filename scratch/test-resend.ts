import { Resend } from "resend";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

async function test() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error("❌ RESEND_API_KEY missing");
    return;
  }
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
    else console.log("✅ Resend Success:", data);
  } catch (err) {
    console.error("❌ Unexpected error:", err);
  }
}

test();
