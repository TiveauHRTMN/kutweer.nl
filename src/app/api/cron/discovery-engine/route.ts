import { NextResponse } from "next/server";
import { ALL_PLACES, type Place } from "@/lib/places-data";
import { logAgentAction } from "@/lib/agent-logger";
import { GoogleGenerativeAI } from "@google/generative-ai";

export const dynamic = "force-dynamic";

/**
 * OpenClaw: Discovery Engine.
 * Deze agent zoekt naar "micro-locaties" (wijken, gehuchten, parken) 
 * om het SEO-netwerk van WeerZone uit te breiden tot voorbij de standaard steden.
 */
export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (process.env.NODE_ENV === "production" && process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // 1. Selecteer een willekeurige set plaatsen die nog geen 'character' hebben
    const candidates = ALL_PLACES.filter(p => !p.character).slice(0, 100);
    const target = candidates[Math.floor(Math.random() * candidates.length)];

    if (!target) {
      return NextResponse.json({ status: "No discovery needed", count: 0 });
    }

    // 2. AI Analyse van de locatie
    let discoveryLog = `OpenClaw heeft een micro-locatie geanalyseerd: ${target.name}.`;
    let suggestedCharacter: Place["character"] = "inland";

    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const prompt = `
        Je bent OpenClaw, de Discovery Agent van WEERZONE.nl.
        Je analyseert de locatie: ${target.name} in de provincie ${target.province}.
        Coördinaten: ${target.lat}, ${target.lon}.
        
        Is dit een kustplaats, landinwaarts, stedelijk of hooggelegen gebied? 
        Kies uit: coastal, inland, highland, urban.
        Geef ook een KORTE reden (1 zin).
        Antwoord in JSON formaat: {"type": "...", "reason": "..."}
      `.trim();
      
      const result = await model.generateContent(prompt);
      const responseText = result.response.text().trim();
      try {
        const json = JSON.parse(responseText.replace(/```json|```/g, ""));
        suggestedCharacter = json.type;
        discoveryLog = `OpenClaw heeft ${target.name} geïdentificeerd als '${json.type}'. Reden: ${json.reason}`;
      } catch (e) {
        console.error("JSON Parse error in OpenClaw:", responseText);
      }
    }

    // 3. Log de ontdekking
    await logAgentAction(
      "OpenClaw",
      "system_check",
      discoveryLog,
      { 
        place: target.name, 
        province: target.province,
        suggestedType: suggestedCharacter,
        discoveryType: "micro_location_audit"
      }
    );

    return NextResponse.json({
      status: "Discovery Cycle Complete",
      discovered: target.name,
      character: suggestedCharacter,
      log: discoveryLog
    });
  } catch (e: any) {
    console.error("OpenClaw Error:", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
