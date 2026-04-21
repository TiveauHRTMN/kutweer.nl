import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";
export const dynamic = "force-dynamic";

type Format = "tiktok" | "x";
const SIZES: Record<Format, { width: number; height: number }> = {
  tiktok: { width: 1080, height: 1920 },
  x: { width: 1600, height: 900 },
};

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const formatParam = (searchParams.get("format") || "x").toLowerCase() as Format;
    const SIZE = SIZES[formatParam] || SIZES.x;
    const cityName = searchParams.get("city") || "Nederland";

    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            background: "linear-gradient(135deg, #0ea5e9 0%, #000000 100%)",
            fontFamily: "system-ui, sans-serif",
            color: "white",
            padding: "80px",
            alignItems: "center",
            justifyContent: "center"
          }}
        >
          <div style={{ fontSize: "100px", fontWeight: 900, marginBottom: "20px", display: "flex" }}>WEERZONE</div>
          <div style={{ fontSize: "60px", fontWeight: 700, color: "#ffd60a", display: "flex" }}>{cityName.toUpperCase()}</div>
          <div style={{ fontSize: "300px", display: "flex", marginTop: "40px" }}>🌤️</div>
          <div style={{ fontSize: "40px", marginTop: "80px", opacity: 0.8, display: "flex" }}>DE REST IS RUIS · WWW.WEERZONE.NL</div>
        </div>
      ),
      { ...SIZE }
    );
  } catch (e: any) {
    return new Response(`ERROR: ${e.message}`, { status: 500 });
  }
}
