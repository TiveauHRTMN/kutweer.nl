import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { logAgentAction } from "@/lib/agent-logger";

export const dynamic = "force-dynamic";

/**
 * Paperclip: Revenue & Yield Optimizer.
 * Analyseert click-data om te bepalen welke producten het beste presteren bij welk weer.
 */
export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (process.env.NODE_ENV === "production" && process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = getSupabase();
  if (!supabase) return NextResponse.json({ error: "Supabase not configured" }, { status: 500 });

  try {
    // 1. Haal top presterende producten op per categorie
    const { data: topPerformers } = await supabase
      .from("affiliate_performance")
      .select("*")
      .order("clicks", { ascending: false })
      .limit(20);

    if (!topPerformers || topPerformers.length === 0) {
      return NextResponse.json({ status: "No data to optimize yet" });
    }

    // 2. Analyseer yield (simpel: meeste clicks = winnaar)
    const bestByCat: Record<string, string> = {};
    topPerformers.forEach(p => {
      if (!bestByCat[p.weather_category]) {
        bestByCat[p.weather_category] = p.product_id;
      }
    });

    // 3. Log de bevindingen
    await logAgentAction(
      "Paperclip",
      "system_check",
      `Paperclip heeft de Yield Audit voltooid. Top categorie: ${Object.keys(bestByCat).join(", ")}.`,
      { 
        optimizationData: bestByCat,
        totalClickRecords: topPerformers.length
      }
    );

    return NextResponse.json({
      status: "Paperclip Optimization Complete",
      insights: bestByCat
    });

  } catch (e: any) {
    console.error("Paperclip Error:", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
