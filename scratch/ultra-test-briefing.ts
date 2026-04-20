import { Resend } from "resend";
import dotenv from "dotenv";
import path from "path";
import { fetchWeatherData, getWindBeaufort } from "../src/lib/weather";
import { DUTCH_CITIES } from "../src/lib/types";

// Load env
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

async function ultraTest() {
  console.log("🌞 Ultra Test: Sun, UV, Wind + Full Layout...");
  
  const resend = new Resend(process.env.RESEND_API_KEY);
  
  try {
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
      const avgWind = chunk.reduce((sum, h) => sum + h.windSpeed, 0) / chunk.length;
      const bft = getWindBeaufort(avgWind);
      
      slots.push({
        name: slotName,
        temp: `${avgTemp.toFixed(1)}°C`,
        feels: `${avgFeels.toFixed(1)}°C`,
        rain: `${totalRain.toFixed(1)}mm`,
        wind: `${bft.scale} Bft`
      });
    }

    const reportDate = new Date().toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' });

    const { data, error } = await resend.emails.send({
      from: "Piet <piet@weerzone.nl>",
      to: ["info@weerzone.nl"],
      subject: `Piet's Weerbrief — ULTRA TEST (${reportDate})`,
      html: `
        <div style="font-family: sans-serif; color: #1e293b; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
          <div style="background: #0ea5e9; padding: 25px; color: white; text-align: center;">
            <h1 style="margin: 0; font-size: 28px;">Piet's Briefing</h1>
            <p style="margin: 5px 0 0; opacity: 0.9;">${reportDate} — Landelijk Rapport</p>
          </div>
          
          <div style="padding: 15px; background: #f0f9ff; display: flex; justify-content: space-around; border-bottom: 1px solid #e0f2fe; text-align: center;">
            <div>
              <div style="font-size: 10px; color: #0369a1; font-weight: bold; text-transform: uppercase;">Zonuren</div>
              <div style="font-size: 18px; font-weight: 900; color: #0c4a6e;">${weather.daily[0].sunHours}u</div>
            </div>
            <div>
              <div style="font-size: 10px; color: #0369a1; font-weight: bold; text-transform: uppercase;">UV Index</div>
              <div style="font-size: 18px; font-weight: 900; color: #0c4a6e;">${weather.uvIndex.toFixed(1)}</div>
            </div>
            <div>
              <div style="font-size: 10px; color: #0369a1; font-weight: bold; text-transform: uppercase;">Zon Op</div>
              <div style="font-size: 18px; font-weight: 900; color: #0c4a6e;">${new Date(weather.sunrise).toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' })}</div>
            </div>
          </div>

          <div style="padding: 30px;">
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
              <tr style="text-align: left; font-size: 11px; color: #64748b; text-transform: uppercase;">
                <th style="padding: 10px 0;">Slot</th>
                <th>Temp</th>
                <th>Regen</th>
                <th>Wind</th>
              </tr>
              ${slots.map(s => `
                <tr style="border-bottom: 1px solid #f1f5f9;">
                  <td style="padding: 12px 0; font-weight: bold;">${s.name}</td>
                  <td style="padding: 12px 0;">${s.temp} <span style="font-size: 10px; color: #94a3b8; font-weight: normal;">(${s.feels})</span></td>
                  <td style="padding: 12px 0;">${s.rain}</td>
                  <td style="padding: 12px 0;">${s.wind}</td>
                </tr>
              `).join("")}
            </table>
            
            <div style="background: #f8fafc; padding: 25px; border-radius: 12px; border-left: 4px solid #ffd60a;">
              <h2 style="margin-top: 0; font-size: 20px; color: #0f172a;">💬 Piet's Update</h2>
              <div style="line-height: 1.7; color: #334155; font-style: italic;">
                "Kijk de details even aan. Zonuren, UV-index, windkracht in Beaufort... 
                Dit is waar de Nederlander wat aan heeft als hij 's ochtends z'n bootje in stapt of de tuin in gaat. 
                De data staat als een paal boven water. Nu die AI nog even laten inzien dat we niet op vakantie zijn in Zuid-Frankrijk, 
                en dan hebben we de beste weerbrief van het land. Kop d'r veur!"
              </div>
            </div>
          </div>
          <div style="background: #f1f5f9; padding: 15px; text-align: center; font-size: 11px; color: #94a3b8;">
            WEERZONE.nl — 48 uur. De rest is ruis.
          </div>
        </div>
      `
    });

    if (error) throw error;
    console.log("✅ Ultra test verzonden! ID:", data?.id);

  } catch (err) {
    console.error("❌ Error during ultra test:", err);
  }
}

ultraTest();
