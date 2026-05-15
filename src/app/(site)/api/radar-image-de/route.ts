import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const res = await fetch(
      "https://www.dwd.de/DWD/wetter/radar/rad_brd_akt.jpg",
      { headers: { "User-Agent": "weerzone.nl/1.0" }, next: { revalidate: 300 } }
    );

    if (!res.ok) {
      return new NextResponse(null, { status: res.status });
    }

    const buf = await res.arrayBuffer();
    return new NextResponse(buf, {
      headers: {
        "Content-Type": res.headers.get("Content-Type") ?? "image/jpeg",
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=60",
      },
    });
  } catch {
    return new NextResponse(null, { status: 502 });
  }
}
