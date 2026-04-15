import { NextResponse } from "next/server";
import { Resend } from "resend";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { getWeatherDescription, getWeatherEmoji } from "@/lib/weather";

export const dynamic = "force-dynamic";

async function fetchWeather(lat: number, lon: number) {
  const res = await fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
    `&current=temperature_2m,weather_code,wind_speed_10m,precipitation` +
    `&daily=temperature_2m_max,temperature_2m_min,weather_code,precipitation_sum&timezone=Europe/Amsterdam&forecast_days=2`
  );
  return res.json();
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const to = searchParams.get("to");

  if (!to) {
    return NextResponse.json({ usage: "/api/test-weather-image?to=je@email.nl" });
  }

  const geminiKey = process.env.GEMINI_API_KEY;
  const resendKey = process.env.RESEND_API_KEY;
  if (!geminiKey || !resendKey) {
    return NextResponse.json({ error: "GEMINI_API_KEY of RESEND_API_KEY niet gevonden" }, { status: 500 });
  }

  // Weer ophalen voor Amsterdam
  const city = "Amsterdam";
  const weatherData = await fetchWeather(52.37, 4.89);
  const current = weatherData.current as Record<string, number>;
  const daily = weatherData.daily as Record<string, number[]>;
  const temp = Math.round(current.temperature_2m);
  const code = current.weather_code;
  const desc = getWeatherDescription(code);
  const wind = Math.round(current.wind_speed_10m);
  const maxTemp = Math.round(Math.max(...daily.temperature_2m_max.slice(0, 2)));
  const minTemp = Math.round(Math.min(...daily.temperature_2m_min.slice(0, 2)));
  const totalPrecip = daily.precipitation_sum[0] + daily.precipitation_sum[1];
  const emoji = getWeatherEmoji(code, true);

  let mood = "calm and pleasant";
  if (code >= 95) mood = "dramatic and stormy with lightning";
  else if (code >= 61) mood = "rainy and moody with grey skies";
  else if (code >= 51) mood = "drizzly with light rain";
  else if (code >= 71) mood = "snowy and cold, winter wonderland";
  else if (code >= 45) mood = "foggy and mysterious";
  else if (code >= 2) mood = "partly cloudy with scattered clouds";
  else if (code <= 1) mood = "bright and sunny with blue skies";

  const imagePrompt =
    `A beautiful Dutch landscape in ${city} showing ${mood}. ` +
    `Weather: ${desc}, ${temp}°C, wind ${wind} km/h. ` +
    `Modern weather infographic style. Vibrant colors. ` +
    `Photorealistic Dutch scenery with canals and classic architecture.`;

  // Genereer image
  let imageBase64: string | null = null;
  let imageMime = "image/png";
  let imageError: string | null = null;

  try {
    const genAI = new GoogleGenerativeAI(geminiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-3.1-flash-image-preview",
      generationConfig: {
        responseModalities: ["TEXT", "IMAGE"],
      } as never,
    });

    const result = await model.generateContent(imagePrompt);
    const response = result.response;

    for (const candidate of response.candidates || []) {
      for (const part of candidate.content?.parts || []) {
        if (part.inlineData) {
          imageBase64 = part.inlineData.data;
          imageMime = part.inlineData.mimeType || "image/png";
          break;
        }
      }
    }
  } catch (e) {
    imageError = e instanceof Error ? e.message : String(e);
  }

  if (!imageBase64) {
    return NextResponse.json({
      error: "Image generatie mislukt",
      detail: imageError,
      prompt: imagePrompt,
      weather: { temp, desc, wind, code },
    }, { status: 500 });
  }

  // Email versturen
  const cid = "weather-image";
  const resend = new Resend(resendKey);

  const html = `
<!DOCTYPE html>
<html lang="nl">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>
<body style="margin:0;padding:0;background:#4a9ee8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:480px;margin:0 auto;padding:32px 24px;">
    <div style="text-align:center;padding:12px 0 32px;">
      <img src="https://weerzone.nl/logo-full.png" alt="WeerZone" style="height:50px;width:auto;margin-bottom:8px;" />
      <p style="color:#ffffff;font-size:11px;margin:4px 0 0;letter-spacing:2px;text-transform:uppercase;font-weight:700;">🧪 TEST — Weerbeeld Voor ${city}</p>
    </div>
    <div style="background:#ffffff;border-radius:18px;overflow:hidden;margin-bottom:16px;box-shadow:0 4px 12px rgba(0,0,0,0.05);">
      <img src="cid:${cid}" alt="Weer visualisatie" style="width:100%;height:auto;display:block;" />
      <div style="padding:24px;">
        <div style="display:flex;align-items:center;gap:16px;">
          <span style="font-size:48px;">${emoji}</span>
          <div>
            <p style="margin:0;font-size:36px;font-weight:800;color:#1e293b;">${temp}°</p>
            <p style="margin:4px 0 0;font-size:15px;color:#475569;">${desc}</p>
          </div>
        </div>
        <div style="margin-top:24px;padding-top:20px;border-top:1px solid #f1f5f9;">
          <p style="margin:0 0 8px;font-size:14px;color:#94a3b8;font-weight:600;text-transform:uppercase;letter-spacing:1px;">48-Uurs Vooruitzicht:</p>
          <ul style="margin:0;padding-left:20px;color:#475569;line-height:1.6;font-size:15px;">
            <li>Tussen <strong style="color:#1e293b;">${minTemp}°</strong> en <strong style="color:#1e293b;">${maxTemp}°</strong></li>
            ${wind > 20 ? `<li>Windstoten tot <strong style="color:#ef4444;">${wind} km/u</strong></li>` : `<li>Wind rond de ${wind} km/u</li>`}
            ${totalPrecip > 0 ? `<li style="color:#ef4444;font-weight:600;">Regen verwacht: ${totalPrecip.toFixed(1)}mm</li>` : `<li>Droog! Geen regen verwacht.</li>`}
          </ul>
        </div>
      </div>
    </div>
    <div style="text-align:center;padding:16px 0;">
      <a href="https://weerzone.nl/weer/amsterdam" style="display:inline-block;padding:14px 32px;background:#f59e0b;color:#1e293b;font-weight:700;font-size:14px;border-radius:999px;text-decoration:none;letter-spacing:0.5px;box-shadow:0 4px 12px rgba(245,158,11,0.3);">
        BEKIJK RADAR & IMPACT →
      </a>
    </div>
  </div>
</body>
</html>`;

  try {
    const result = await resend.emails.send({
      from: "WeerZone <info@weerzone.nl>",
      to,
      subject: `${emoji} ${temp}° Amsterdam — TEST Weerbeeld | WeerZone`,
      html,
      attachments: [
        {
          filename: "weerbeeld.png",
          content: imageBase64,
          content_type: imageMime,
          cid,
        } as never,
      ],
    });

    if (result.error) {
      return NextResponse.json({ error: result.error.message, prompt: imagePrompt }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: `Weerbeeld email verstuurd naar ${to}`,
      id: result.data?.id,
      weather: { temp, desc, wind, minTemp, maxTemp, totalPrecip: totalPrecip.toFixed(1) },
      imagePrompt,
    });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : String(e) }, { status: 500 });
  }
}
