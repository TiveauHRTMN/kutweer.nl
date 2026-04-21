import { NextResponse } from "next/server";
import { ALL_PLACES } from "@/lib/places-data";
import { fetchWeatherData } from "@/lib/weather";
import { logAgentAction } from "@/lib/agent-logger";

export const dynamic = "force-dynamic";

/**
 * Performance Control: Piet.
 * Deze agent optimaliseert de koppelvlakken tussen weerdata en commerciële conversie.
 */
export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (process.env.NODE_ENV === "production" && process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // 1. Analyseer landelijke trends (sample van 3 grote steden)
    const cities = ["Utrecht", "Amsterdam", "Eindhoven"];
    const trends = [];

    for (const cityName of cities) {
      const p = ALL_PLACES.find(x => x.name === cityName);
      if (p) {
        const weather = await fetchWeatherData(p.lat, p.lon);
        const temp = weather.current.temperature;
        const rain = weather.current.precipitation;
        
        trends.push({ cityName, temp, rain });
      }
    }

    // 2. Commerciële logica bepaalt focus
    const avgTemp = trends.reduce((acc, curr) => acc + curr.temp, 0) / trends.length;
    let strategy = "Balanced Revenue";
    let priorityProduct = "Stormparaplu (Safety)";

    if (avgTemp > 22) {
      strategy = "High-Heat Conversion";
      priorityProduct = "Mobiele Airco & Ventilatoren";
    } else if (avgTemp < 5) {
      strategy = "Cold-Snap Protection";
      priorityProduct = "IJskrabbers & Thermo-kleding";
    }

    // 3. Log de "Winst-zet" van Piet
    await logAgentAction(
      "Performance Control",
      "system_check",
      `Piet heeft de landelijke conversie-focus ingesteld op: ${strategy}.`,
      { 
        averageTemp: avgTemp.toFixed(1),
        priorityProduct,
        recommendation: `Verhoog de zichtbaarheid van ${priorityProduct} in de komende uren.`
      }
    );

    return NextResponse.json({
      status: "Performance Audit Complete",
      strategy,
      avgTemp
    });
  } catch (e: any) {
    console.error("Performance Control Error:", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
