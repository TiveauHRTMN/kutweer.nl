import { Resend } from "resend";
import dotenv from "dotenv";
import path from "path";

// Load env
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

async function sendTest() {
  console.log("📧 Poging tot verzenden test-briefing via Resend...");
  
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error("❌ Geen RESEND_API_KEY gevonden in .env.local");
    return;
  }

  const resend = new Resend(apiKey);

  try {
    const { data, error } = await resend.emails.send({
      from: "Piet <piet@weerzone.nl>",
      to: ["info@weerzone.nl"],
      subject: "Piet's Weerbrief — TEST (Direct)",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; color: #1e293b;">
          <div style="background: #0ea5e9; padding: 25px; color: white; text-align: center;">
            <h1 style="margin: 0;">Piet's Briefing</h1>
            <p style="margin: 5px 0 0; opacity: 0.9;">Handmatige Test — Geen AROME meer</p>
          </div>
          <div style="padding: 30px;">
            <div style="background: #f8fafc; padding: 25px; border-radius: 12px; border-left: 4px solid #ffd60a;">
              <h2 style="margin-top: 0;">💬 Piet's Update</h2>
              <div style="line-height: 1.7; font-style: italic;">
                "Zo, daar zijn we weer. De techniek liet ons even in de steek, maar Pietje staat weer op scherp. 
                Geen Frans gezeik meer met die AROME meuk, we gaan voor de echte Nederlandse polder-kwaliteit. 
                De site draait, de briefing staat, en als je dit leest werkt die Resend bak ook eindelijk. 
                Nu nog even die Gemini sleutel op de goede plek en we kunnen los. Kop d'r veur!"
              </div>
            </div>
          </div>
          <div style="background: #f1f5f9; padding: 15px; text-align: center; font-size: 11px; color: #94a3b8;">
            WEERZONE.nl — 48 uur. De rest is ruis.
          </div>
        </div>
      `
    });

    if (error) {
      console.error("❌ Resend Error:", error);
    } else {
      console.log("✅ Mail succesvol verzonden! ID:", data?.id);
    }
  } catch (err) {
    console.error("❌ Crash tijdens verzenden:", err);
  }
}

sendTest();
