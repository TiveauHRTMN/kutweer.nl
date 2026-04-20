import { GoogleGenerativeAI } from "@google/generative-ai";
import { Resend } from "resend";
import dotenv from "dotenv";
import path from "path";

// Load env
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

async function testPiet() {
  console.log("🚀 Handmatige test Piet Briefing start...");

  // We proberen de Maps key als fallback want de AQ... key geeft 404
  const apiKey = process.env.GEMINI_API_KEY || "AIzaSyBXvOTrC79I5I9ExZGVwR72CfJ0V2t3Fn4";
  const resend = new Resend(process.env.RESEND_API_KEY);
  const genAI = new GoogleGenerativeAI(apiKey);

  try {
    const mockSlots = [
      { name: "Ochtend", temp: "11.2°C", feels: "9.5°C", rain: "0.2mm", uv: "1.2" },
      { name: "Middag", temp: "16.4°C", feels: "15.8°C", rain: "0.0mm", uv: "4.5" },
      { name: "Avond", temp: "14.1°C", feels: "12.2°C", rain: "1.5mm", uv: "0.0" },
      { name: "Nacht", temp: "9.8°C", feels: "7.4°C", rain: "0.5mm", uv: "0.0" },
    ];

    console.log("🤖 Piet aan het woord laten met model gemini-1.5-flash...");
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `
      Je bent Piet van Weerzone. Je schrijft een test-weerbrief voor info@weerzone.nl.
      STIJL: Nuchtere Piet gemixt met de vlijmscherpe VI/Roddelpraat/Powned stijl. Geen politiek correct geneuzel. 
      Actualiteit: Maak een grapje over dat we eindelijk 'live' gaan en dat de technologie nu eindelijk werkt (zonder AROME).
      DATA: ${JSON.stringify(mockSlots)}
    `;

    const result = await model.generateContent(prompt);
    const pietCommentary = result.response.text();

    console.log("📧 Email verzenden naar info@weerzone.nl...");
    const { data, error } = await resend.emails.send({
      from: "Piet <piet@weerzone.nl>",
      to: ["info@weerzone.nl"],
      subject: "TEST | Piet's Nieuwe Briefing",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
          <div style="background: #0ea5e9; padding: 25px; color: white; text-align: center;">
            <h1 style="margin: 0;">Piet's TEST Briefing</h1>
          </div>
          <div style="padding: 30px;">
            <div style="background: #f8fafc; padding: 25px; border-radius: 12px; border-left: 4px solid #ffd60a;">
              <h2 style="margin-top: 0;">💬 Piet's Update</h2>
              <div style="line-height: 1.7;">${pietCommentary.replace(/\n/g, "<br>")}</div>
            </div>
          </div>
        </div>
      `
    });

    if (error) throw error;
    console.log("✅ Test geslaagd! Email ID:", data?.id);

  } catch (err) {
    console.error("❌ Test mislukt:", err);
  }
}

testPiet();
