import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Resend } from "resend";
import { fetchWeatherData } from "@/lib/weather";
import { DUTCH_CITIES } from "@/lib/types";

// Config
const resend = new Resend(process.env.RESEND_API_KEY);
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export const dynamic = "force-dynamic";
export const maxDuration = 300; // 5 min — ruimte voor meerdere regio-fetches en LLM-call

export async function GET(request: Request) {
  // Security check
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get("secret");
  
  if (secret !== process.env.CRON_SECRET && process.env.NODE_ENV === "production") {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const REGIONS = [
      { name: "Midden", city: "De Bilt" },
      { name: "Noord", city: "Leeuwarden" },
      { name: "Oost", city: "Twenthe" },
      { name: "West", city: "Amsterdam" },
      { name: "Zuid", city: "Eindhoven" },
    ];

    // 1. Haal data op voor alle regio's in parallel
    const regionData = await Promise.all(REGIONS.map(async (reg) => {
      const city = DUTCH_CITIES.find(c => c.name === reg.city) || DUTCH_CITIES[0];
      const weather = await fetchWeatherData(city.lat, city.lon);
      return { ...reg, weather };
    }));

    const mainWeather = regionData[0].weather; // Midden (De Bilt) als hoofd-data
    const { getWindBeaufort } = await import("@/lib/weather");

    // 2. Verwerk slots voor Midden (Hoofdoverzicht)
    const slots = [];
    const hourly = mainWeather.hourly;
    for (let i = 0; i < 24; i += 6) {
      const chunk = hourly.slice(i, i + 6);
      const startTime = new Date(chunk[0].time);
      const hour = startTime.getHours();
      let slotName = hour >= 6 && hour < 12 ? "Ochtend" : hour >= 12 && hour < 18 ? "Middag" : hour >= 18 && hour < 24 ? "Avond" : "Nacht";
      
      const avgTemp = chunk.reduce((sum, h) => sum + h.temperature, 0) / chunk.length;
      const avgFeels = chunk.reduce((sum, h) => sum + h.apparentTemperature, 0) / chunk.length;
      const avgWind = chunk.reduce((sum, h) => sum + h.windSpeed, 0) / chunk.length;
      const bft = getWindBeaufort(avgWind);
      
      slots.push({
        name: slotName,
        temp: `${avgTemp.toFixed(1)}°C`,
        feels: `${avgFeels.toFixed(1)}°C`,
        rain: `${chunk.reduce((sum, h) => sum + h.precipitation, 0).toFixed(1)}mm`,
        wind: `${bft.scale} Bft`,
      });
    }

    // 3. Regio Samenvatting (Compact)
    const regionalSummary = regionData.map(r => ({
      name: r.name,
      temp: `${r.weather.current.temperature}°C`,
      weather: r.weather.current.precipitation > 0 ? "🌧️" : "🌤️",
    }));

    // 4. De 'Piet' Content-Engine
    const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });
    const prompt = `
      Je bent Piet van WeerZone. STIJL: Professioneel, scherp, direct. Premium uitstraling.
      DATA (De Bilt): Slots: ${JSON.stringify(slots)}.
      REGIO'S: ${JSON.stringify(regionalSummary)}.
      Zonuren: ${mainWeather.daily[0].sunHours}u, UV: ${mainWeather.uvIndex.toFixed(1)}.
      TAAK: Schrijf een beknopte 'Piet's Update' voor een grafisch ontwerp (Photoshop). 
      FORMAAT: 4 tot 6 KORTE, krachtige zinnen, elk op een NIEUWE REGEL. 
      GEEN opsommingen met tekens, GEEN cijferlijstjes. Focus op de meteorologische impact.
      Vermijd te informele taal.
    `;

    const result = await model.generateContent(prompt);
    const pietCommentary = result.response.text();

    // 5. Verzending
    const reportDate = new Date().toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' });
    
    const { data, error } = await resend.emails.send({
      from: "Piet <piet@weerzone.nl>",
      to: ["info@weerzone.nl"],
      subject: `Piet's Weerbrief — ${reportDate}`,
      html: `
        <div style="font-family: 'Inter', sans-serif; color: #1e293b; max-width: 500px; margin: 0 auto; background: #4a9ee8; padding: 20px; border-radius: 20px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h1 style="color: white; margin: 0; font-size: 24px; letter-spacing: 2px;">WEERZONE</h1>
          </div>

          <div style="display: flex; gap: 10px; margin-bottom: 15px;">
            <div style="flex: 1; background: #f1f5f9; padding: 15px; border-radius: 20px; text-align: left;">
              <div style="font-size: 14px; font-weight: bold; color: #64748b;">Zonuren</div>
              <div style="font-size: 20px; font-weight: 900; margin-bottom: 10px;">${mainWeather.daily[0].sunHours}u</div>
              <div style="font-size: 14px; font-weight: bold; color: #64748b;">UV Index</div>
              <div style="font-size: 20px; font-weight: 900;">${mainWeather.uvIndex.toFixed(1)}</div>
            </div>
            <div style="flex: 1.5; background: #f1f5f9; padding: 15px; border-radius: 20px; text-align: right;">
              ${regionalSummary.map(r => `
                <div style="display: flex; justify-content: space-between; margin-bottom: 4px; font-size: 16px;">
                  <span style="font-weight: 900; color: #1e293b;">${r.name}:</span>
                  <span style="font-weight: 900;">${r.weather} ${r.temp}</span>
                </div>
              `).join("")}
            </div>
          </div>

          <div style="background: #f1f5f9; padding: 15px; border-radius: 20px; margin-bottom: 15px;">
            <table style="width: 100%; border-collapse: collapse; font-size: 15px; font-weight: 900;">
              ${slots.map(s => `
                <tr style="height: 35px;">
                  <td style="width: 30%;">${s.name}</td>
                  <td style="width: 25%;">${s.temp}</td>
                  <td style="width: 25%;">${s.rain}</td>
                  <td style="width: 20%; text-align: right;">${s.wind}</td>
                </tr>
              `).join("")}
            </table>
          </div>

          <div style="background: #f1f5f9; padding: 25px; border-radius: 20px;">
            <h2 style="margin-top: 0; font-size: 20px; color: #000; font-weight: 900; display: flex; align-items: center; gap: 8px;">
              💬 Piet's Update
            </h2>
            <div style="line-height: 1.6; color: #1e293b; font-size: 14px; font-weight: 500;">
              ${pietCommentary.replace(/\n/g, "<br>")}
            </div>
          </div>

          <div style="text-align: center; color: white; margin-top: 25px; font-size: 13px; font-weight: 500;">
            Ga naar <a href="https://www.weerzone.nl" style="color: #ffd60a; font-weight: 900; text-decoration: none;">www.weerzone.nl</a> voor het volledige weer
          </div>
        </div>
      `
    });

    if (error) throw error;
    return NextResponse.json({ success: true, id: data?.id });
  } catch (err: any) {
    console.error("Piet Briefing Error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
