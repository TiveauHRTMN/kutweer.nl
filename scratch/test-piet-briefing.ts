import { GoogleGenerativeAI } from "@google/generative-ai";
import { Resend } from "resend";
import dotenv from "dotenv";
import path from "path";

// Load env
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

async function testPiet() {
  console.log("🚀 Handmatige test Piet Briefing start...");

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("❌ GEMINI_API_KEY missing in .env.local");
    return;
  }

  const resend = new Resend(process.env.RESEND_API_KEY);
  const genAI = new GoogleGenerativeAI(apiKey);

  try {
    const mockSlots = [
      { name: "Ochtend", temp: "11.2°C", feels: "9.5°C", rain: "0.2mm", uv: "1.2" },
      { name: "Middag", temp: "16.4°C", feels: "15.8°C", rain: "0.0mm", uv: "4.5" },
      { name: "Avond", temp: "14.1°C", feels: "12.2°C", rain: "1.5mm", uv: "0.0" },
      { name: "Nacht", temp: "9.8°C", feels: "7.4°C", rain: "0.5mm", uv: "0.0" },
    ];

    // We gebruiken 'gemini-1.5-flash' - we voegen een kleine try-catch voor de model-init toe
    console.log("🤖 Piet aan het woord laten met model gemini-1.5-flash...");
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const prompt = `
      Je bent Piet van Weerzone. Archetype: De warme volksheld (geïnspireerd door Piet Paulusma). 
      Je praat nuchter en menselijk, met een sterke verbinding naar de regio. 
      Je gebruikt je neurale MetNet-3 krachten om mensen te helpen hun dag te plannen. 
      Eindig ALTIJD met een variatie op "Oant moarn". 
      
      Taak: Schrijf een korte test-weerbrief voor info@weerzone.nl.
      Actualiteit: Noem dat de technologie nu eindelijk werkt met neurale kracht en dat we klaar zijn voor de mensen.
      DATA: ${JSON.stringify(mockSlots)}
    `;

    const result = await model.generateContent(prompt);
    const pietCommentary = result.response.text();

    console.log("📧 Email verzenden naar info@weerzone.nl...");
    const { data, error } = await resend.emails.send({
      from: "Piet | WEERZONE <piet@weerzone.nl>",
      to: ["info@weerzone.nl"],
      subject: "Oant moarn! | Piet's Nieuwe Briefing is live",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 24px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.05);">
          <div style="background: #22c55e; padding: 40px; color: white; text-align: center;">
            <p style="text-transform: uppercase; font-size: 11px; font-weight: 900; letter-spacing: 2px; margin-bottom: 10px; opacity: 0.8;">Neural Engine v2.0</p>
            <h1 style="margin: 0; font-size: 32px; font-weight: 900;">Piet's Update</h1>
          </div>
          <div style="padding: 40px; background: white;">
            <div style="font-size: 18px; line-height: 1.8; color: #1e293b; font-weight: 500;">
              ${pietCommentary.replace(/\n/g, "<br>")}
            </div>
          </div>
          <div style="background: #f8fafc; padding: 20px; text-align: center; color: #64748b; font-size: 12px; border-top: 1px solid #e2e8f0;">
            <strong>WEERZONE</strong> · MetNet-3 Powered · Oant moarn!
          </div>
        </div>
      `
    });

    if (error) throw error;
    console.log("✅ Test geslaagd! Email ID:", data?.id);

  } catch (err: any) {
    console.error("❌ Test mislukt:", err.message || err);
  }
}

testPiet();
