import { NextResponse } from "next/server";
import { ALL_PLACES } from "@/lib/places-data";
import { getSupabase } from "@/lib/supabase";
import { logAgentAction } from "@/lib/agent-logger";

export const dynamic = "force-dynamic";

/**
 * OpenClaw Harvester: Autonomous Location Discovery
 * Zoekt naar nieuwe micro-locaties rondom bestaande bekende locaties.
 */
export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (process.env.NODE_ENV === "production" && process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = getSupabase();
  if (!supabase) return NextResponse.json({ error: "Supabase not configured" }, { status: 500 });

  try {
    // 1. Kies een willekeurige 'seed' locatie uit onze 9000+ lijst
    const seed = ALL_PLACES[Math.floor(Math.random() * ALL_PLACES.length)];
    
    // 2. Query Open-Meteo Geocoding voor locaties in de buurt van de seed
    // We gebruiken de naam van de seed om 'vage' variaties te vinden die we misschien nog niet hebben
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(seed.name)}&count=10&language=nl&country=NL`;
    const res = await fetch(url);
    const data = await res.json();

    if (!data.results) {
      return NextResponse.json({ status: "No new locations found", seed: seed.name });
    }

    const discovered = [];
    for (const loc of data.results) {
      // Check of we deze al hebben in onze statische lijst of DB
      const existsInStatic = ALL_PLACES.some(p => p.name.toLowerCase() === loc.name.toLowerCase() && p.province.toLowerCase() === (loc.admin1 || "").toLowerCase());
      
      if (!existsInStatic) {
        // Dubbel-check in DB
        const { data: existingDB } = await supabase
          .from("discovered_places")
          .select("id")
          .eq("name", loc.name)
          .eq("province", loc.admin1 || "Onbekend")
          .maybeSingle();

        if (!existingDB) {
          // INSERT!
          const { error } = await supabase.from("discovered_places").insert({
            name: loc.name,
            province: loc.admin1 || "Onbekend",
            lat: loc.latitude,
            lon: loc.longitude,
            source: "openclaw_harvester",
            metadata: {
              elevation: loc.elevation,
              feature_code: loc.feature_code,
              timezone: loc.timezone
            }
          });

          if (!error) discovered.push(loc.name);
        }
      }
    }

    if (discovered.length > 0) {
      await logAgentAction(
        "OpenClaw",
        "lead_found",
        `OpenClaw Harvester heeft ${discovered.length} nieuwe micro-locaties ontdekt rondom ${seed.name}.`,
        { discovered, seed: seed.name }
      );
    }

    return NextResponse.json({
      status: "Harvester Cycle Complete",
      seed: seed.name,
      newlyDiscoveredCount: discovered.length,
      locations: discovered
    });

  } catch (e: any) {
    console.error("OpenClaw Harvester Error:", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
