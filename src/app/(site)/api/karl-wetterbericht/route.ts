import { NextRequest, NextResponse } from "next/server";
import { fetchWeatherData } from "@/lib/weather";
import { fetchKarlWetterbericht } from "@/lib/karl-forecast";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const lat = parseFloat(searchParams.get("lat") ?? "");
  const lon = parseFloat(searchParams.get("lon") ?? "");
  const city = searchParams.get("city") ?? "Deutschland";

  if (isNaN(lat) || isNaN(lon)) {
    return NextResponse.json({ error: "lat/lon required" }, { status: 400 });
  }

  const weather = await fetchWeatherData(lat, lon, false, false, undefined, "de").catch(() => null);
  if (!weather) return NextResponse.json(null);

  const forecast = await fetchKarlWetterbericht(lat, lon, city, weather).catch(() => null);
  return NextResponse.json(forecast);
}
