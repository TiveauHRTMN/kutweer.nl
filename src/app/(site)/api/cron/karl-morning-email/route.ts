/**
 * KARL MORNING EMAIL
 * Täglicher 48-Stunden-Wetterbericht für Karl-Abonnenten (DE).
 * Vercel cron: 0 6 * * *  (06:00 UTC = 07:00/08:00 CET/CEST)
 *
 * Ablauf pro Abonnent:
 *  1. Wetterdaten für primary_lat/lon abrufen (gruppiert per ~1km-Grid)
 *  2. Karl-Tagesverlauf via Hermes generieren (Morgen/Nachmittag/Abend/Nacht/Morgen)
 *  3. HTML-E-Mail via Resend versenden
 */

import { NextResponse } from "next/server";
import { Resend } from "resend";
import { hermesChat } from "@/lib/hermes";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getWeatherEmoji, getWeatherDescription, getWindBeaufort } from "@/lib/weather";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function gridKey(lat: number, lon: number) {
  return `${lat.toFixed(2)},${lon.toFixed(2)}`;
}

interface HourlySlice {
  time: string[];
  temperature_2m: number[];
  apparent_temperature: number[];
  weather_code: number[];
  precipitation: number[];
  wind_speed_10m: number[];
  wind_gusts_10m: number[];
}

async function fetchWeather48h(lat: number, lon: number) {
  const url =
    `https://api.open-meteo.com/v1/dwd-icon` +
    `?latitude=${lat}&longitude=${lon}` +
    `&models=icon_d2` +
    `&current=temperature_2m,weather_code,wind_speed_10m,apparent_temperature,precipitation` +
    `&hourly=temperature_2m,apparent_temperature,weather_code,precipitation,wind_speed_10m,wind_gusts_10m` +
    `&daily=temperature_2m_max,temperature_2m_min,weather_code,precipitation_sum,sunrise,sunset` +
    `&timezone=Europe/Berlin&forecast_days=2`;
  const res = await fetch(url, { next: { revalidate: 0 } });
  if (!res.ok) throw new Error(`Open-Meteo DWD ${res.status}`);
  return res.json();
}

async function generateNarrative(city: string, weatherJson: string): Promise<string> {
  const systemInstruction = `
Du bist Karl — die Stimme der meteorologischen Wahrheit bei Weerzone Deutschland.
Dein Alleinstellungsmerkmal: extreme Präzision. Wir raten nicht, wir rechnen auf den Kilometer genau.

STIL & TON:
- Verwende exakte Uhrzeiten (z.B. "Ab 14:15 setzt Regen ein" statt "Am Nachmittag").
- Verwende konkrete Werte (z.B. "Böen bis 64 km/h" statt "Es wird windig").
- Kein Blabla: Keine vagen Wetterphrasen. Sei der Architekt der Tagesplanung des Lesers.
- Sachlich & Scharf: Die Wahrheit ist wichtiger als gute Laune.

STRUKTUR:
Schreibe einen kraftvollen Bericht für die nächsten 48 Stunden mit diesen Abschnitten:
**Morgen** (6:00 - 12:00), **Nachmittag** (12:00 - 18:00), **Abend** (18:00 - 0:00), **Nacht** (0:00 - 6:00), **Morgen** (Prognose für den ganzen nächsten Tag).

GRENZEN:
- 200–300 Wörter.
- Max 1 Emoji.
- Keine Modellnamen nennen.
- Korrektes Deutsch.
- Schlusszeile: "— Karl, für Weerzone".`.trim();

  return (await hermesChat(
    [
      { role: "system", content: systemInstruction },
      { role: "user", content: `Stadt: ${city}\n\nWetterdaten (48h):\n${weatherJson}` },
    ],
    { model: "persona", temperature: 0.6, maxTokens: 600 }
  )).trim();
}

// ---------------------------------------------------------------------------
// E-Mail HTML
// ---------------------------------------------------------------------------

function tageszeitenRows(hourly: HourlySlice): string {
  const now = new Date();
  const todayStr = now.toISOString().slice(0, 10);
  const tomorrowStr = new Date(Date.now() + 86400000).toISOString().slice(0, 10);

  const slices = [
    { label: "Morgens",      dateStr: todayStr,    from: 6,  to: 12 },
    { label: "Nachmittag",   dateStr: todayStr,    from: 12, to: 18 },
    { label: "Abend",        dateStr: todayStr,    from: 18, to: 24 },
    { label: "Nacht",        dateStr: tomorrowStr, from: 0,  to: 6  },
    { label: "Morgen",       dateStr: tomorrowStr, from: 6,  to: 24 },
  ];

  return slices
    .map(({ label, dateStr, from, to }) => {
      const idxs = hourly.time
        .map((t, i) => ({ t, i }))
        .filter(({ t }) => t.slice(0, 10) === dateStr && new Date(t).getHours() >= from && new Date(t).getHours() < to)
        .map(({ i }) => i);

      if (!idxs.length) return "";

      const temps = idxs.map((i) => hourly.temperature_2m[i]);
      const codes = idxs.map((i) => hourly.weather_code[i]);
      const precips = idxs.map((i) => hourly.precipitation[i]);
      const winds = idxs.map((i) => hourly.wind_speed_10m[i]);

      const tempMin = Math.round(Math.min(...temps));
      const tempMax = Math.round(Math.max(...temps));
      const rainSum = precips.reduce((a, b) => a + b, 0);
      const maxWind = Math.max(...winds);
      const midCode = codes[Math.floor(codes.length / 2)];
      const emoji = getWeatherEmoji(midCode, from >= 6 && from < 20);
      const bft = getWindBeaufort(maxWind, "de");

      const rainCell =
        rainSum < 0.1
          ? `<span style="color:#64748b;">Trocken</span>`
          : `<span style="color:#2563eb;font-weight:700;">${rainSum.toFixed(1)} mm</span>`;

      return `
        <tr style="border-bottom:1px solid #f1f5f9;">
          <td style="padding:10px 12px;font-size:13px;font-weight:700;color:#334155;">
            ${emoji} ${label}
          </td>
          <td style="padding:10px 6px;font-size:13px;color:#334155;text-align:right;">
            ${tempMin}°–${tempMax}°
          </td>
          <td style="padding:10px 6px;font-size:13px;text-align:right;">${rainCell}</td>
          <td style="padding:10px 12px;font-size:13px;color:#64748b;text-align:right;">
            ${bft.scale} bft
          </td>
        </tr>`;
    })
    .join("");
}

function buildKarlEmailHtml(
  city: string,
  narrative: string,
  data: Record<string, unknown>,
  subscriberEmail: string
): string {
  const current = data.current as Record<string, number>;
  const daily = (data.daily as Record<string, number[]>);
  const hourly = data.hourly as HourlySlice;

  const temp = Math.round(current.temperature_2m);
  const feelsLike = Math.round(current.apparent_temperature);
  const code = current.weather_code;
  const emoji = getWeatherEmoji(code, true);
  const desc = getWeatherDescription(code, "de");
  const wind = Math.round(current.wind_speed_10m);
  const bft = getWindBeaufort(wind, "de");

  const maxToday = Math.round(daily.temperature_2m_max[0]);
  const minToday = Math.round(daily.temperature_2m_min[0]);
  const rainToday = daily.precipitation_sum[0].toFixed(1);
  const sunrise = daily.sunrise?.[0] ? new Date(daily.sunrise[0]).toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" }) : "—";
  const sunset = daily.sunset?.[0]  ? new Date(daily.sunset[0]).toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" }) : "—";

  const rows = tageszeitenRows(hourly);
  const unsubUrl = `https://weerzone.nl/api/unsubscribe?email=${encodeURIComponent(subscriberEmail)}`;
  const karlUrl = `https://weerzone.nl/de/mein-wetter`;

  const narrativeHtml = narrative
    .split("\n\n")
    .map((para) =>
      `<p style="margin:0 0 14px;font-size:15px;color:#1e293b;line-height:1.65;">
        ${para.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")}
      </p>`
    )
    .join("");

  return `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Dein 48-Stunden-Wetterbericht — Weerzone</title>
</head>
<body style="margin:0;padding:0;background:#3b7ff0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:520px;margin:0 auto;padding:32px 20px 48px;">

    <!-- HEADER -->
    <div style="text-align:center;padding-bottom:28px;">
      <img src="https://weerzone.nl/weerzone-logo.png" alt="Weerzone" style="height:48px;width:auto;" />
      <p style="margin:8px 0 0;font-size:11px;color:rgba(255,255,255,0.65);letter-spacing:1.5px;text-transform:uppercase;font-weight:700;">
        Täglicher 48-Stunden-Wetterbericht
      </p>
    </div>

    <!-- JETZT-KARTE -->
    <div style="background:rgba(255,255,255,0.22);border:1px solid rgba(255,255,255,0.35);border-radius:20px;padding:28px;margin-bottom:16px;backdrop-filter:blur(16px);">
      <p style="margin:0 0 4px;font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:1.5px;color:rgba(255,255,255,0.6);">Jetzt in ${city}</p>
      <div style="display:flex;align-items:center;gap:16px;margin:12px 0 20px;">
        <span style="font-size:56px;line-height:1;">${emoji}</span>
        <div>
          <p style="margin:0;font-size:52px;font-weight:900;color:#fff;line-height:1;letter-spacing:-2px;">${temp}°</p>
          <p style="margin:4px 0 0;font-size:14px;color:rgba(255,255,255,0.8);font-weight:600;">${desc}${feelsLike !== temp ? ` · fühlt sich an wie ${feelsLike}°` : ""}</p>
        </div>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:8px;padding-top:16px;border-top:1px solid rgba(255,255,255,0.2);">
        <div style="text-align:center;">
          <p style="margin:0;font-size:10px;color:rgba(255,255,255,0.5);font-weight:700;text-transform:uppercase;letter-spacing:1px;">Max</p>
          <p style="margin:4px 0 0;font-size:16px;font-weight:900;color:#fff;">${maxToday}°</p>
        </div>
        <div style="text-align:center;">
          <p style="margin:0;font-size:10px;color:rgba(255,255,255,0.5);font-weight:700;text-transform:uppercase;letter-spacing:1px;">Min</p>
          <p style="margin:4px 0 0;font-size:16px;font-weight:900;color:#fff;">${minToday}°</p>
        </div>
        <div style="text-align:center;">
          <p style="margin:0;font-size:10px;color:rgba(255,255,255,0.5);font-weight:700;text-transform:uppercase;letter-spacing:1px;">Regen</p>
          <p style="margin:4px 0 0;font-size:16px;font-weight:900;color:${parseFloat(rainToday) > 0.1 ? "#93c5fd" : "#fff"};">${parseFloat(rainToday) > 0.1 ? rainToday + "mm" : "Trocken"}</p>
        </div>
        <div style="text-align:center;">
          <p style="margin:0;font-size:10px;color:rgba(255,255,255,0.5);font-weight:700;text-transform:uppercase;letter-spacing:1px;">Wind</p>
          <p style="margin:4px 0 0;font-size:16px;font-weight:900;color:#fff;">${bft.scale} bft</p>
        </div>
      </div>
    </div>

    <!-- KARLS WETTERBERICHT -->
    <div style="background:rgba(255,255,255,0.22);border:1px solid rgba(255,255,255,0.35);border-left:4px solid #38bdf8;border-radius:20px;padding:28px;margin-bottom:16px;">
      <p style="margin:0 0 16px;font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:1.5px;color:#38bdf8;">Der vollständige Wetterbericht · ${new Date().toLocaleDateString("de-DE", { weekday: "long", day: "numeric", month: "long" })}</p>
      ${narrativeHtml}
    </div>

    <!-- TAGESZEITEN-TABELLE -->
    <div style="background:rgba(255,255,255,0.22);border:1px solid rgba(255,255,255,0.35);border-radius:20px;overflow:hidden;margin-bottom:16px;">
      <div style="padding:16px 20px 8px;">
        <p style="margin:0;font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:1.5px;color:rgba(255,255,255,0.6);">Morgens → Morgen auf einen Blick</p>
      </div>
      <table style="width:100%;border-collapse:collapse;background:rgba(255,255,255,0.95);">
        <thead>
          <tr style="background:#f8fafc;border-bottom:2px solid #e2e8f0;">
            <th style="padding:8px 12px;font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:1px;color:#94a3b8;text-align:left;">Tageszeit</th>
            <th style="padding:8px 6px;font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:1px;color:#94a3b8;text-align:right;">Temp</th>
            <th style="padding:8px 6px;font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:1px;color:#94a3b8;text-align:right;">Regen</th>
            <th style="padding:8px 12px;font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:1px;color:#94a3b8;text-align:right;">Wind</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
      <div style="padding:12px 20px;background:rgba(255,255,255,0.85);">
        <p style="margin:0;font-size:10px;color:#64748b;">
          ☀️ Sonnenaufgang ${sunrise} · 🌇 Sonnenuntergang ${sunset}
        </p>
      </div>
    </div>

    <!-- CTA -->
    <div style="text-align:center;padding:8px 0 24px;">
      <a href="${karlUrl}"
         style="display:inline-block;padding:16px 40px;background:#fff;color:#3b7ff0;font-weight:800;font-size:14px;border-radius:14px;text-decoration:none;letter-spacing:0.5px;box-shadow:0 4px 24px rgba(0,0,0,0.15);">
        Vollständige Prognose öffnen →
      </a>
    </div>

    <!-- FOOTER -->
    <div style="text-align:center;padding-top:8px;">
      <p style="font-size:11px;color:rgba(255,255,255,0.55);line-height:1.6;">
        Weerzone · 48 Stunden voraus, nicht weiter.<br>
        <a href="${unsubUrl}" style="color:rgba(255,255,255,0.7);text-decoration:underline;">Abmelden</a>
      </p>
    </div>

  </div>
</body>
</html>`;
}

// ---------------------------------------------------------------------------
// Handler
// ---------------------------------------------------------------------------

export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (
    process.env.NODE_ENV === "production" &&
    process.env.CRON_SECRET &&
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) return NextResponse.json({ error: "RESEND_API_KEY missing" }, { status: 500 });

  const resend = new Resend(resendKey);
  const admin = createSupabaseAdminClient();

  // 1. Alle actieve Karl-abonnees ophalen
  const { data: subs, error } = await admin
    .from("subscriptions")
    .select(`
      user_id,
      tier,
      user_profile!inner(email, full_name, primary_lat, primary_lon)
    `)
    .in("status", ["trialing", "active"])
    .eq("tier", "karl");

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!subs?.length) return NextResponse.json({ sent: 0, reason: "Keine Karl-Abonnenten" });

  type SubRow = {
    user_id: string;
    tier: string;
    user_profile: { email: string; full_name: string | null; primary_lat: number | null; primary_lon: number | null };
  };

  const validSubs = (subs as unknown as SubRow[]).filter(
    (s) => s.user_profile?.primary_lat != null && s.user_profile?.primary_lon != null
  );

  // 2. Op locatie groeperen
  const locGroups = new Map<string, SubRow[]>();
  for (const sub of validSubs) {
    const key = gridKey(sub.user_profile.primary_lat!, sub.user_profile.primary_lon!);
    if (!locGroups.has(key)) locGroups.set(key, []);
    locGroups.get(key)!.push(sub);
  }

  let sent = 0;
  const errors: string[] = [];

  const results = await Promise.allSettled(
    Array.from(locGroups.entries()).map(async ([, group]) => {
      const first = group[0];
      const lat = first.user_profile.primary_lat!;
      const lon = first.user_profile.primary_lon!;

      const data = await fetchWeather48h(lat, lon);

      // Stadtnamen per Reverse-Geocode
      let cityLabel = `${lat.toFixed(2)}, ${lon.toFixed(2)}`;
      try {
        const geo = await fetch(
          `https://geocoding-api.open-meteo.com/v1/search?latitude=${lat}&longitude=${lon}&count=1&language=de`
        );
        const geoData = await geo.json();
        if (geoData.results?.[0]?.name) cityLabel = geoData.results[0].name;
      } catch {}

      const weatherJson = JSON.stringify({
        current: data.current,
        hourly_sample: (data.hourly?.time || []).slice(0, 48).map((t: string, i: number) => ({
          time: t,
          temp: data.hourly.temperature_2m[i],
          code: data.hourly.weather_code[i],
          precip: data.hourly.precipitation[i],
          wind: data.hourly.wind_speed_10m[i],
          gusts: data.hourly.wind_gusts_10m[i],
        })),
        daily: data.daily,
      });

      let narrative = `Guten Morgen! Heute in ${cityLabel}: ${getWeatherDescription(data.current.weather_code, "de").toLowerCase()}, ${Math.round(data.current.temperature_2m)}°. Einen guten Tag gewünscht. — Karl, für Weerzone`;
      try {
        narrative = await generateNarrative(cityLabel, weatherJson);
      } catch (e) {
        throw new Error(`AI error ${cityLabel}: ${e}`);
      }

      const html = buildKarlEmailHtml(cityLabel, narrative, data, "__EMAIL__");
      const subjectEmoji = getWeatherEmoji(data.current.weather_code, true);
      const subjectTemp = Math.round(data.current.temperature_2m);
      const subject = `${subjectEmoji} ${subjectTemp}° in ${cityLabel} — dein 48-Stunden-Update`;

      return group.map(sub => {
        const personalHtml = html.replace("__EMAIL__", sub.user_profile.email);
        return {
          from: "Karl von Weerzone <karl@weerzone.nl>",
          to: sub.user_profile.email,
          subject,
          html: personalHtml,
        };
      });
    })
  );

  const payloads: any[] = [];
  for (const result of results) {
    if (result.status === "fulfilled" && result.value) {
      payloads.push(...result.value);
    } else if (result.status === "rejected") {
      errors.push(`Group processing failed: ${result.reason}`);
    }
  }

  for (let i = 0; i < payloads.length; i += 100) {
    const chunk = payloads.slice(i, i + 100);
    try {
      const { error: sendErr } = await resend.batch.send(chunk);
      if (sendErr) errors.push(sendErr.message);
      else sent += chunk.length;
    } catch (e) {
      errors.push(`Batch send failed: ${e}`);
    }
  }

  return NextResponse.json({ sent, total: validSubs.length, errors: errors.slice(0, 10) });
}
