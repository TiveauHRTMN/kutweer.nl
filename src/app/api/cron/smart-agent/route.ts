import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { fetchWeatherData } from "@/lib/weather";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Resend } from "resend";
import { getSmartAffiliateEmailHtml } from "@/lib/smart-affiliate-email";
import { getImpactAnalysis } from "@/lib/impact-engine";

export const dynamic = "force-dynamic";

/**
 * Smart Agent: De proactieve affiliate assistent.
 * Stuurt getargete emails op basis van weertriggers (regen, storm, hitte).
 */
export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (process.env.NODE_ENV === "production" && process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createSupabaseAdminClient();
  const { data: users, error: userError } = await supabase
    .from("profiles")
    .select("id, email, city, lat, lon, alerts_enabled")
    .eq("alerts_enabled", true);

  if (userError) return NextResponse.json({ error: userError.message }, { status: 500 });

  const genAI = process.env.GEMINI_API_KEY ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY) : null;
  const resend = new Resend(process.env.RESEND_API_KEY || "dummy");

  const AGENT_PROMPT = `Je bent de "Hyper-Affiliate" Timing Agent van WEERZONE.nl. 
    Je missie is om een onmisbare (en tikkeltje brutale) tip te geven op basis van het weer.
    Gebruik GEEN aanhef (geen "Hoi", geen "Beste"). Begin direct. Maximaal 2 korte zinnen.
    Toon: Direct, tikkeltje cynisch, maar behulpzaam.`;

  for (const user of users as any[]) {
    if (!user.lat || !user.lon) continue;

    try {
      const weather = await fetchWeatherData(user.lat, user.lon);
      
      // Detect triggers
      const rainEvent = weather.hourly.slice(0, 4).find(h => h.precipitation > 2.0);
      const heatEvent = weather.current.temperature > 28;
      const coldEvent = weather.current.temperature < 2;
      const stormEvent = weather.current.windSpeed > 60;

      let trigger = "";
      let details = "";

      if (stormEvent) { trigger = "storm"; details = "Windkracht 8+ komt eraan."; }
      else if (rainEvent) { trigger = "regen"; details = `Er valt ${rainEvent.precipitation}mm om ${new Date(rainEvent.time).getHours()}:00.`; }
      else if (heatEvent) { trigger = "hitte"; details = `Het is ${weather.current.temperature}°C. Geen pretje.`; }
      else if (coldEvent) { trigger = "kou"; details = `Met ${weather.current.temperature}°C vriezen je oren eraf.`; }

      if (!trigger) continue; 

      let aiText = `Er komt ${trigger} aan in ${user.city}. Bereid je voor op ellende.`;
      
      if (genAI) {
        try {
          const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
          const result = await model.generateContent(`${AGENT_PROMPT}\n\nSituatie: ${trigger} in ${user.city}. Details: ${details}.`);
          aiText = result.response.text()?.trim() || aiText;
        } catch (e) {
          console.error("Gemini error:", e);
        }
      }
      
      // Impact Analysis
      let impactData = undefined;
      try {
        impactData = await getImpactAnalysis(user.lat, user.lon);
      } catch (e) {
        console.error("Impact Analysis failed (non-fatal):", e);
      }

      // Verstuur de mail
      const html = getSmartAffiliateEmailHtml(user.city, trigger, aiText, impactData);
      await resend.emails.send({
        from: "WEERZONE Alert <info@weerzone.nl>",
        to: user.email,
        subject: `⚠️ Belangrijk: ${trigger.toUpperCase()} alert voor ${user.city}`,
        html,
      });

      console.log(`Smart Agent sent ${trigger} alert to ${user.email}`);
    } catch (e) {
      console.error(`Smart Agent failed for ${user.email}:`, e);
    }
  }

  return NextResponse.json({ status: "Smart Agent Cycle Complete", usersProcessed: users.length });
}
