import { NextResponse } from "next/server";
import { executeWWSOrchestrator } from "@/lib/wws-orchestrator";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const lat = parseFloat(searchParams.get("lat") || "52.1011"); // Default De Bilt
  const lon = parseFloat(searchParams.get("lon") || "5.1775");

  if (isNaN(lat) || isNaN(lon)) {
    return NextResponse.json({ error: "Invalid coordinates" }, { status: 400 });
  }

  const payload = await executeWWSOrchestrator(lat, lon);

  if (!payload) {
    return NextResponse.json({ error: "WWS Pipeline failed to execute" }, { status: 500 });
  }

  return NextResponse.json(payload);
}
