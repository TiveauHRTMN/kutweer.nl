import { NextResponse } from "next/server";
import { getLucWeatherVerdict, getWeather } from "@/app/actions";
import { FR_REGION_LABELS } from "@/config/locales";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lat = parseFloat(searchParams.get("lat") || "");
  const lon = parseFloat(searchParams.get("lon") || "");
  const city = searchParams.get("city") || "";

  if (isNaN(lat) || isNaN(lon)) {
    return NextResponse.json({ error: "Missing coords" }, { status: 400 });
  }

  try {
    const weather = await getWeather(lat, lon, false, "fr");
    if (!weather) return NextResponse.json("");

    // Determine region label for prompt context
    // In a real app we'd lookup the dept code from coords, here we use a placeholder or leave it to AI
    const region = "France"; 

    // Character Intelligence (simplified version for API)
    const char = (() => {
        if (lat < 43.8) return "méditerranéen";
        if (lon < -1) return "atlantique";
        if (lon > 5.5) return "montagneux";
        return "continental";
    })();

    const verdict = await getLucWeatherVerdict(weather, city, region, char);
    return NextResponse.json(verdict);
  } catch (error) {
    console.error("Luc API Error:", error);
    return NextResponse.json("");
  }
}
