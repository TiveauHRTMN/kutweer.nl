import { ImageResponse } from "next/og";
import { findPlace } from "@/lib/places-data";
import { readFileSync } from "fs";
import path from "path";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const runtime = "nodejs";

export default async function OgImage({ params }: { params: Promise<{ province: string; place: string }> }) {
  const { province, place: slug } = await params;
  const place = findPlace(province, slug);
  const cityName = place ? place.name : slug.replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase());

  // Load the provided WEERZONE logo
  const logoPath = path.join(process.cwd(), "public", "logo-full.png");
  let logoSrc = "";
  try {
    const logoBuffer = readFileSync(logoPath);
    logoSrc = `data:image/png;base64,${logoBuffer.toString("base64")}`;
  } catch (e) {
    console.error("Could not load logo for OpenGraph", e);
  }

  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "system-ui, sans-serif",
          padding: "60px",
          position: "relative",
        }}
      >
        {/* Subtle silver tech gray accent overlay */}
        <div 
          style={{ 
            position: "absolute", 
            top: 0, 
            left: 0, 
            right: 0, 
            bottom: 0, 
            background: "radial-gradient(circle at 50% 0%, rgba(203, 213, 225, 0.2) 0%, transparent 70%)" 
          }} 
        />

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            background: "#ffffff",
            border: "3px solid #cbd5e1", // Silver tech gray border
            borderRadius: "48px",
            padding: "80px 100px",
            boxShadow: "0 40px 100px rgba(0,0,0,0.4)",
            position: "relative",
          }}
        >
          {/* WEERZONE Brand Badge (Image) */}
          {logoSrc ? (
            <img src={logoSrc} alt="WEERZONE" width={280} style={{ marginBottom: "32px" }} />
          ) : (
            <div
              style={{
                background: "#ffd60a",
                color: "black",
                padding: "12px 28px",
                borderRadius: "99px",
                fontSize: "18px",
                fontWeight: 900,
                letterSpacing: "4px",
                marginBottom: "40px",
                display: "flex",
                boxShadow: "0 10px 30px rgba(255, 214, 10, 0.3)",
              }}
            >
              WEERZONE
            </div>
          )}

          {/* Dynamic City Name */}
          <div
            style={{
              fontSize: "110px",
              fontWeight: 900,
              color: "#0f172a", // Dark slate for contrast
              letterSpacing: "-4px",
              lineHeight: 1.1,
              marginBottom: "24px",
              textAlign: "center",
              display: "flex",
            }}
          >
            {cityName}
          </div>

          {/* Information Gap Copy */}
          <div
            style={{
              fontSize: "38px",
              fontWeight: 600,
              color: "#64748b", // Tech gray text
              letterSpacing: "1px",
              textAlign: "center",
              marginBottom: "56px",
              display: "flex",
            }}
          >
            Bekijk of jij vanmiddag droog blijft.
          </div>

          {/* Click-forcing CTA Button */}
          <div
            style={{
              background: "#0ea5e9", // Sky blue CTA
              color: "white",
              padding: "24px 56px",
              borderRadius: "32px",
              fontSize: "36px",
              fontWeight: 800,
              letterSpacing: "1px",
              display: "flex",
              alignItems: "center",
              boxShadow: "0 20px 40px rgba(14, 165, 233, 0.4)",
            }}
          >
            Live Radar Bekijken &rarr;
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
