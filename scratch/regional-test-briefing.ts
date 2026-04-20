import { Resend } from "resend";
import dotenv from "dotenv";
import path from "path";
import { fetchWeatherData, getWindBeaufort } from "../src/lib/weather";
import { DUTCH_CITIES } from "../src/lib/types";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Load env
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

async function regionalTest() {
  console.log("📍 Regional Test: Noord, Oost, West, Zuid, Midden...");
  
  const resend = new Resend(process.env.RESEND_API_KEY);
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
  
  try {
    const REGIONS = [
      { name: "Midden", city: "De Bilt" },
      { name: "Noord", city: "Leeuwarden" },
      { name: "Oost", city: "Twenthe" },
      { name: "West", city: "Amsterdam" },
      { name: "Zuid", city: "Eindhoven" },
    ];

    const regionData = [];
    for (const reg of REGIONS) {
      const city = DUTCH_CITIES.find(c => c.name === reg.city) || DUTCH_CITIES[0];
      const weather = await fetchWeatherData(city.lat, city.lon);
      regionData.push({ ...reg, weather });
      await new Promise(r => setTimeout(r, 500)); // Rate limit protection
    }

    const mainWeather = regionData[0].weather;
    const regionalSummary = regionData.map(r => ({
      name: r.name,
      temp: `${r.weather.current.temperature}°C`,
      weather: r.weather.current.precipitation > 0 ? "🌧️" : "🌤️",
    }));

    const slots = [];
    for (let i = 0; i < 24; i += 6) {
      const chunk = mainWeather.hourly.slice(i, i + 6);
      const bft = getWindBeaufort(chunk[0].windSpeed);
      slots.push({
        name: i === 0 ? "Nacht" : i === 6 ? "Ochtend" : i === 12 ? "Middag" : "Avond",
        temp: `${chunk[0].temperature.toFixed(1)}°C`,
        feels: `${chunk[0].apparentTemperature.toFixed(1)}°C`,
        rain: `${chunk[0].precipitation.toFixed(1)}mm`,
        wind: `${bft.scale} Bft`
      });
    }

    // Piet AI Content
    const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });
    const prompt = `
      Je bent Piet van WeerZone. STIJL: Professioneel, scherp, direct. Premium uitstraling.
      DATA (Midden): Slots: ${JSON.stringify(slots)}.
      REGIO'S: ${JSON.stringify(regionalSummary)}.
      Zonuren: ${mainWeather.daily[0].sunHours}u, UV: ${mainWeather.uvIndex.toFixed(1)}.
      TAAK: Schrijf een beknopte 'Piet's Update' voor Photoshop. 
      FORMAAT: 4 tot 6 KORTE, krachtige zinnen, elk op een NIEUWE REGEL. 
      GEEN opsommingen met tekens, GEEN cijferlijstjes. Focus op de meteorologische impact.
      Vermijd te informele taal.
    `;

    const result = await model.generateContent(prompt);
    const pietCommentary = result.response.text().replace(/\n/g, "<br>");

    const reportDate = new Date().toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' });

    const { data, error } = await resend.emails.send({
      from: "Piet <piet@weerzone.nl>",
      to: ["info@weerzone.nl"],
      subject: `Piet's Weerbrief — REGIO TEST (${reportDate})`,
      html: `
        <div style="font-family: sans-serif; color: #1e293b; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
          <div style="background: #0ea5e9; padding: 25px; color: white; text-align: center;">
            <h1 style="margin: 0; font-size: 28px;">Piet's Briefing</h1>
            <p style="margin: 5px 0 0; opacity: 0.9;">${reportDate} — Landelijk Rapport</p>
          </div>
          
          <div style="padding: 15px; background: #f0f9ff; display: flex; justify-content: space-around; border-bottom: 1px solid #e0f2fe; text-align: center;">
            <div><div style="font-size: 10px; color: #0369a1; font-weight: bold; text-transform: uppercase;">Zonuren</div><div style="font-size: 18px; font-weight: 900; color: #0c4a6e;">${mainWeather.daily[0].sunHours}u</div></div>
            <div><div style="font-size: 10px; color: #0369a1; font-weight: bold; text-transform: uppercase;">UV Index</div><div style="font-size: 18px; font-weight: 900; color: #0c4a6e;">${mainWeather.uvIndex.toFixed(1)}</div></div>
            <div><div style="font-size: 10px; color: #0369a1; font-weight: bold; text-transform: uppercase;">Midden (Nu)</div><div style="font-size: 18px; font-weight: 900; color: #0c4a6e;">${mainWeather.current.temperature}°C</div></div>
          </div>

          <div style="padding: 20px; background: #ffffff; border-bottom: 1px solid #f1f5f9;">
            <h3 style="margin-top: 0; font-size: 11px; text-transform: uppercase; color: #94a3b8; letter-spacing: 0.1em;">Kaart van Nederland</h3>
            <div style="display: flex; justify-content: space-between; gap: 10px;">
              ${regionalSummary.map(r => `
                <div style="text-align: center; flex: 1; padding: 10px; background: #f8fafc; border-radius: 8px;">
                  <div style="font-size: 10px; font-weight: 900; color: #64748b; text-transform: uppercase; margin-bottom: 4px;">${r.name}</div>
                  <div style="font-size: 16px; font-weight: 900;">${r.weather} ${r.temp}</div>
                </div>
              `).join("")}
            </div>
          </div>

          <div style="padding: 30px;">
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
              <tr style="text-align: left; font-size: 11px; color: #64748b; text-transform: uppercase;">
                <th style="padding: 10px 0;">Slot (Midden)</th>
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
            
            <div style="background: #f8fafc; padding: 25px; border-radius: 12px; border-left: 4px solid #ffd60a; border-right: 1px solid #e2e8f0; border-top: 1px solid #e2e8f0; border-bottom: 1px solid #e2e8f0;">
              <h2 style="margin-top: 0; font-size: 20px; color: #0f172a;">💬 Piet's Update</h2>
              <div style="line-height: 1.7; color: #334155;">
                ${pietCommentary}
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
    console.log("✅ Regional test verzonden! ID:", data?.id);

  } catch (err) {
    console.error("❌ Error during regional test:", err);
  }
}

regionalTest();
