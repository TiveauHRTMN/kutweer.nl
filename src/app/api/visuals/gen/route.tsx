import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";
export const dynamic = "force-dynamic";

/**
 * Nano Banana 2.1 - Local Visual Engine (Standard Fallback)
 * This replaces the external visuals.weerzone.nl engine when it's offline.
 * It generates beautiful, context-aware gradients and overlays.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const prompt = searchParams.get("prompt") || "Weather";
    const city = searchParams.get("city") || "";
    
    // Determine color scheme based on prompt keywords with HIGH VIBRANCY
    let bgGradient = "linear-gradient(135deg, #0284c7 0%, #2563eb 100%)"; // Deep Ocean Blue
    if (prompt.toLowerCase().includes("regen") || prompt.toLowerCase().includes("rain")) {
      bgGradient = "linear-gradient(135deg, #1e293b 0%, #020617 100%)"; // Midnight Storm
    } else if (prompt.toLowerCase().includes("zon") || prompt.toLowerCase().includes("sun")) {
      bgGradient = "linear-gradient(135deg, #ea580c 0%, #9a3412 100%)"; // Sunset Burn
    } else if (prompt.toLowerCase().includes("mist") || prompt.toLowerCase().includes("fog")) {
      bgGradient = "linear-gradient(135deg, #475569 0%, #1e293b 100%)"; // Dark Fog
    }

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: bgGradient,
            fontFamily: 'sans-serif',
          }}
        >
          {/* Subtle Texture Overlay */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            opacity: 0.1,
            display: 'flex',
            flexWrap: 'wrap',
          }}>
            {Array.from({ length: 20 }).map((_, i) => (
              <div key={i} style={{ width: '20%', height: '25%', border: '1px solid white' }} />
            ))}
          </div>

          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '10px',
            padding: '40px',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '30px',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            backdropFilter: 'blur(10px)',
          }}>
            <div style={{ fontSize: 60, fontWeight: 900, color: 'white', textTransform: 'uppercase', letterSpacing: '-2px' }}>
              {city || 'WEERZONE'}
            </div>
            <div style={{ fontSize: 20, fontWeight: 700, color: 'rgba(255, 255, 255, 0.8)', textTransform: 'uppercase', letterSpacing: '4px' }}>
              Nano Banana 2.1 Visual
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (e: any) {
    return new Response(`Visual Engine Error: ${e.message}`, { status: 500 });
  }
}
