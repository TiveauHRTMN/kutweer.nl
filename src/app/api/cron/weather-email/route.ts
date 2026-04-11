import { NextResponse } from "next/server";
import { Resend } from "resend";
import { getSupabase } from "@/lib/supabase";
import { getWeatherDescription, getWeatherEmoji } from "@/lib/weather";

// Vercel Cron: elke ochtend om 06:30 NL tijd
export const dynamic = "force-dynamic";

interface Subscriber {
  email: string;
  city: string;
  lat: number;
  lon: number;
}

async function fetchWeather(lat: number, lon: number) {
  const res = await fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
    `&current=temperature_2m,weather_code,wind_speed_10m,precipitation` +
    `&daily=temperature_2m_max,temperature_2m_min,weather_code,precipitation_sum&timezone=Europe/Amsterdam&forecast_days=2`
  );
  return res.json();
}

function buildEmailHtml(city: string, data: Record<string, unknown>): string {
  const current = data.current as Record<string, number>;
  const daily = data.daily as Record<string, number[]>;
  const temp = Math.round(current.temperature_2m);
  const code = current.weather_code;
  const emoji = getWeatherEmoji(code, true);
  const desc = getWeatherDescription(code);
  const wind = Math.round(current.wind_speed_10m);
  const precip = current.precipitation;
  const maxToday = Math.round(daily.temperature_2m_max[0]);
  const minToday = Math.round(daily.temperature_2m_min[0]);
  const maxMorgen = Math.round(daily.temperature_2m_max[1]);
  const minMorgen = Math.round(daily.temperature_2m_min[1]);
  const precipToday = daily.precipitation_sum[0];
  const precipMorgen = daily.precipitation_sum[1];
  const codeMorgen = (daily.weather_code as number[])[1];
  const emojiMorgen = getWeatherEmoji(codeMorgen, true);
  const descMorgen = getWeatherDescription(codeMorgen);

  return `
<!DOCTYPE html>
<html lang="nl">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>
<body style="margin:0;padding:0;background:#4a9ee8;font-family:'Inter',system-ui,sans-serif;">
  <div style="max-width:480px;margin:0 auto;padding:24px 16px;">

    <div style="text-align:center;padding:20px 0;">
      <h1 style="color:#fff;font-size:24px;margin:0;">WeerZone</h1>
      <p style="color:rgba(255,255,255,0.6);font-size:12px;margin:4px 0 0;letter-spacing:2px;text-transform:uppercase;">48 uur. De rest is ruis.</p>
    </div>

    <div style="background:rgba(255,255,255,0.92);border-radius:18px;padding:24px;margin-bottom:12px;">
      <p style="margin:0 0 4px;font-size:12px;color:#94a3b8;font-weight:700;text-transform:uppercase;letter-spacing:1px;">Nu in ${city}</p>
      <div style="display:flex;align-items:center;gap:12px;">
        <span style="font-size:48px;">${emoji}</span>
        <div>
          <p style="margin:0;font-size:36px;font-weight:900;color:#1e293b;">${temp}°</p>
          <p style="margin:0;font-size:14px;color:#475569;">${desc} · Wind ${wind} km/h</p>
        </div>
      </div>
      ${precip > 0 ? `<p style="margin:8px 0 0;font-size:13px;color:#ef4444;font-weight:600;">🌧️ ${precip}mm neerslag nu</p>` : ""}
    </div>

    <div style="background:rgba(255,255,255,0.92);border-radius:18px;padding:20px;margin-bottom:12px;">
      <table style="width:100%;border-collapse:collapse;font-size:14px;color:#1e293b;">
        <tr>
          <td style="padding:8px 0;font-weight:700;">Vandaag</td>
          <td style="text-align:center;">${emoji} ${desc}</td>
          <td style="text-align:right;font-weight:600;">${minToday}° / ${maxToday}°</td>
        </tr>
        <tr style="border-top:1px solid rgba(0,0,0,0.06);">
          <td style="padding:8px 0;font-weight:700;">Morgen</td>
          <td style="text-align:center;">${emojiMorgen} ${descMorgen}</td>
          <td style="text-align:right;font-weight:600;">${minMorgen}° / ${maxMorgen}°</td>
        </tr>
      </table>
      ${precipToday > 0 || precipMorgen > 0 ? `
      <p style="margin:12px 0 0;font-size:12px;color:#475569;">
        💧 Neerslag: vandaag ${precipToday}mm${precipMorgen > 0 ? `, morgen ${precipMorgen}mm` : ""}
      </p>` : ""}
    </div>

    <div style="text-align:center;padding:16px 0;">
      <a href="https://weerzone.nl" style="display:inline-block;padding:12px 32px;background:#ffe500;color:#1e293b;font-weight:700;font-size:14px;border-radius:999px;text-decoration:none;">
        Bekijk volledige voorspelling →
      </a>
    </div>

    <p style="text-align:center;font-size:11px;color:rgba(255,255,255,0.4);margin:16px 0 0;">
      Je ontvangt dit omdat je je hebt aangemeld op WeerZone.nl<br>
      <a href="https://weerzone.nl/api/unsubscribe?email={{EMAIL}}" style="color:rgba(255,255,255,0.5);">Uitschrijven</a>
    </p>
  </div>
</body>
</html>`;
}

export async function GET(req: Request) {
  // Verify cron secret (Vercel sends this header)
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) {
    return NextResponse.json({ error: "RESEND_API_KEY niet geconfigureerd" }, { status: 500 });
  }

  const resend = new Resend(resendKey);
  const supabase = getSupabase();

  if (!supabase) {
    return NextResponse.json({ error: "Supabase niet geconfigureerd" }, { status: 500 });
  }

  // Haal actieve subscribers op
  const { data: subscribers, error } = await supabase
    .from("subscribers")
    .select("email, city, lat, lon")
    .eq("active", true);

  if (error || !subscribers?.length) {
    return NextResponse.json({ sent: 0, error: error?.message });
  }

  let sent = 0;
  const errors: string[] = [];

  // Groepeer op stad voor efficiëntie
  const cityGroups = new Map<string, { subscribers: Subscriber[]; lat: number; lon: number }>();
  for (const sub of subscribers as Subscriber[]) {
    const key = `${sub.lat.toFixed(2)},${sub.lon.toFixed(2)}`;
    if (!cityGroups.has(key)) {
      cityGroups.set(key, { subscribers: [], lat: sub.lat, lon: sub.lon });
    }
    cityGroups.get(key)!.subscribers.push(sub);
  }

  for (const [, group] of cityGroups) {
    try {
      const weatherData = await fetchWeather(group.lat, group.lon);
      const city = group.subscribers[0].city;
      const html = buildEmailHtml(city, weatherData);

      // Batch verstuur per stad
      for (const sub of group.subscribers) {
        try {
          await resend.emails.send({
            from: "WeerZone <weer@weerzone.nl>",
            to: sub.email,
            subject: `${getWeatherEmoji(weatherData.current.weather_code, true)} ${Math.round(weatherData.current.temperature_2m)}° in ${sub.city} — WeerZone`,
            html: html.replace("{{EMAIL}}", encodeURIComponent(sub.email)),
          });
          sent++;
        } catch (e) {
          errors.push(`${sub.email}: ${e}`);
        }
      }
    } catch (e) {
      errors.push(`Weather fetch failed: ${e}`);
    }
  }

  return NextResponse.json({ sent, total: subscribers.length, errors: errors.slice(0, 5) });
}
