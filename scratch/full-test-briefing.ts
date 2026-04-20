import { Resend } from "resend";
import dotenv from "dotenv";
import path from "path";
import { fetchWeatherData } from "../src/lib/weather";
import { DUTCH_CITIES } from "../src/lib/types";

// Load env
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

async function fullTest() {
  console.log("🌦️ Full Test: Weather Data + Layout...");
  
  const resend = new Resend(process.env.RESEND_API_KEY);
  
  try {
    // 1. Haal echte data op
    const deBilt = DUTCH_CITIES.find(c => c.name === "De Bilt")!;
    const weather = await fetchWeatherData(deBilt.lat, deBilt.lon);
    
    const slots = [];
    for (let i = 0; i < 24; i += 6) {
      const chunk = weather.hourly.slice(i, i + 6);
      const startTime = new Date(chunk[0].time);
      const hour = startTime.getHours();
      
      let slotName = "Nacht";
      if (hour >= 6 && hour < 12) slotName = "Ochtend";
      else if (hour >= 12 && hour < 18) slotName = "Middag";
      else if (hour >= 18 && hour < 24) slotName = "Avond";
      
      const avgTemp = chunk.reduce((sum, h) => sum + h.temperature, 0) / chunk.length;
      const avgFeels = chunk.reduce((sum, h) => sum + h.apparentTemperature, 0) / chunk.length;
      const totalRain = chunk.reduce((sum, h) => sum + h.precipitation, 0);
      
      slots.push({
        name: slotName,
        temp: `${avgTemp.toFixed(1)}°C`,
        feels: `${avgFeels.toFixed(1)}°C`,
        rain: `${totalRain.toFixed(1)}mm`
      });
    }

    const reportDate = new Date().toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' });

    // 2. Verzenden
    const { data, error } = await resend.emails.send({
      from: "Piet <piet@weerzone.nl>",
      to: ["info@weerzone.nl"],
      subject: `Piet's Weerbrief — FULL TEST (${reportDate})`,
      html: `
        <div style="font-family: sans-serif; color: #1e293b; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
          <div style="background: #0ea5e9; padding: 25px; color: white; text-align: center;">
            <h1 style="margin: 0; font-size: 28px;">Piet's Briefing</h1>
            <p style="margin: 5px 0 0; opacity: 0.9;">${reportDate} — Landelijk Rapport (KNMI)</p>
          </div>
          <div style="padding: 30px;">
            <h2 style="border-bottom: 2px solid #ffd60a; padding-bottom: 10px; font-size: 18px;">📊 De Harde Cijfers</h2>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
              <tr style="text-align: left; font-size: 11px; color: #64748b; text-transform: uppercase;">
                <th style="padding: 10px 0;">Slot</th>
                <th>Temp</th>
                <th>Gevoel</th>
                <th>Regen</th>
              </tr>
              ${slots.map(s => `
                <tr style="border-bottom: 1px solid #f1f5f9;">
                  <td style="padding: 12px 0; font-weight: bold;">${s.name}</td>
                  <td style="padding: 12px 0;">${s.temp}</td>
                  <td style="padding: 12px 0;">${s.feels}</td>
                  <td style="padding: 12px 0;">${s.rain}</td>
                </tr>
              `).join("")}
            </table>
            
            <div style="background: #f8fafc; padding: 25px; border-radius: 12px; border-left: 4px solid #ffd60a;">
              <h2 style="margin-top: 0; font-size: 20px; color: #0f172a;">💬 Piet's Update</h2>
              <div style="line-height: 1.7; color: #334155; font-style: italic;">
                "Kijk, die tabel hierboven? Dat zijn de cijfers waar we het mee moeten doen. 
                Geen vage voorspellingen voor over twee weken, maar gewoon wat we nu weten van de KNMI bakken. 
                Het weerbericht is pas compleet als je de harde data ziet. 
                Vanaf morgen komt hier de vlijmscherpe Piet-analyse bij, zodra we die AI een schop onder z'n hol hebben gegeven. 
                Maar de data? Die staat er in ieder geval loepzuiver op nu. Kop d'r veur!"
              </div>
            </div>
            
            <div style="margin-top: 30px; text-align: center;">
              <a href="https://weerzone.nl" style="display: inline-block; padding: 12px 24px; background: #ffd60a; color: #000; font-weight: bold; text-decoration: none; border-radius: 99px;">
                Check de site →
              </a>
            </div>
          </div>
          <div style="background: #f1f5f9; padding: 15px; text-align: center; font-size: 11px; color: #94a3b8;">
            WEERZONE.nl — 48 uur. De rest is ruis.
          </div>
        </div>
      `
    });

    if (error) throw error;
    console.log("✅ Full test verzonden! ID:", data?.id);

  } catch (err) {
    console.error("❌ Error during full test:", err);
  }
}

fullTest();
