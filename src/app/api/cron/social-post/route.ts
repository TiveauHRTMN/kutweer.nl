import { NextResponse } from "next/server";
import { fetchWeatherData } from "@/lib/weather";
import { ALL_PLACES } from "@/lib/places-data";
import { hermesChat } from "@/lib/hermes";
import { GoogleGenerativeAI } from "@google/generative-ai"; // Voor visual generation
import { Resend } from "resend";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// Buffer GraphQL IDs
const BUFFER_ORG_ID = "69e51acfc3f39b8c8987146b";
const BUFFER_CHANNELS = {
  x: "69e51ee4031bfa423c1f65c6", // @weerzone
  tiktok: "69e51f4f031bfa423c1f673b", // weerzonenl
};

import { amazonUrl, temuUrl, AFFILIATE_CONFIG } from "@/lib/affiliates";
import { matchProducts } from "@/lib/amazon-matcher";
import { productHref } from "@/lib/amazon-catalog";

const PERSONA_PROMPTS = {
  PIET: `
Je bent Piet van WEERZONE. 
STIJL: Vandaag Inside / PowNed. Brutaal, ongezouten mening, absolute weer-expertise. 
Je focus: De harde realiteit landelijk gezien. Als het kutweer is in het oosten maar droog in het westen, zeg je dat eerlijk.
REGELLIJST: Max 240 tekens. Johan Derksen van het weer. Gebruik "virale" hooks. Max 2 emoji.
`.trim()
};

interface WeatherLite {
  current: { temperature: number; weatherCode: number; windSpeed: number; precipitation: number };
  daily: Array<{ tempMax: number; tempMin: number; precipitationSum: number }>;
  hourly?: Array<{ temperature: number; weatherCode: number; precipitation: number }>;
}

interface RegionalWeather {
  region: string;
  weather: WeatherLite;
}

export async function generatePlatformCaption(regions: RegionalWeather[], platform: 'x' | 'tiktok') {
  if (!regions || regions.length === 0) throw new Error("No weather data provided");
  const isTikTok = platform === 'tiktok';
  const persona = "piet";
  const personaPrompt = PERSONA_PROMPTS.PIET;

  // Gebruik Midden-Nederland (of eerste regio) voor affiliate product match proxy
  const proxyWeather = regions.find(r => r.region === "Midden")?.weather || regions[0].weather;
  const { products } = matchProducts(proxyWeather as any, 1, new Date(), persona);
  const deal = products[0];
  const affiliateUrl = deal ? productHref(deal) : (isTikTok ? temuUrl("regenjas") : amazonUrl("regenjas"));
  const productLabel = deal ? deal.title : "Waterdichte regenjas";

  const regionalSummary = regions.map(r => {
    const temp = r.weather.current?.temperature ?? 10;
    const max = r.weather.daily?.[0]?.tempMax ?? 15;
    const rain = r.weather.daily?.[0]?.precipitationSum ?? 0;
    return `- ${r.region}: Nu ${Math.round(temp)}°, Verwacht max: ${Math.round(max)}°, Regen: ${rain}mm`;
  }).join('\n');

  const dataContext = `REGIO DATA VANDAAG:\n${regionalSummary}\n\nTip bij dit weer (advertentie) om subtiel in de tekst te verwerken (inclusief URL): ${productLabel} → ${affiliateUrl}\nVergeet hashtags niet aan het einde: #weer #weerzone #nederland #weerbericht #knmi #buienradar #vandaag #ad`;

  try {
    const text = await hermesChat([
      { role: "system", content: personaPrompt },
      { role: "user", content: `Schrijf een landelijke social media post in jouw stijl.\n\n${dataContext}` }
    ], { model: "kimi", temperature: 0.8, maxTokens: 400 });
    
    return { caption: text.trim(), affiliateUrl, persona };
  } catch (e) {
    console.error("Caption generation error:", e);
    return { caption: `Lokaal wisselvallig vandaag. Echte voorspelling op jouw postcode → weerzone.nl\nTip: ${productLabel} → ${affiliateUrl}\n#weer #weerzone #nederland #weerbericht #vandaag #ad`, affiliateUrl, persona };
  }
}

async function createBufferPost(channelId: string, text: string, imageUrls: string[]) {
  const token = process.env.BUFFER_API_TOKEN;
  if (!token) throw new Error("BUFFER_API_TOKEN missing");

  const query = `
    mutation CreatePost($input: CreatePostInput!) {
      createPost(input: $input) {
        ... on PostActionSuccess {
          post {
            id
          }
        }
      }
    }
  `;

  const variables = {
    input: {
      channelId,
      text,
      assets: {
        images: imageUrls.map(url => ({ url }))
      },
      schedulingType: "automatic",
      mode: "shareNow"
    }
  };

  const res = await fetch("https://api.buffer.com", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query, variables }),
  });

  const body = await res.json();
  if (!res.ok || body.errors) {
    throw new Error(`Buffer GraphQL Error: ${JSON.stringify(body.errors || body)}`);
  }
  return body.data;
}

const KNMI_REGIONS = [
  { name: "Noordwest", lat: 52.63, lon: 4.75 }, // Alkmaar
  { name: "Noordoost", lat: 53.22, lon: 6.57 }, // Groningen
  { name: "Oost", lat: 52.22, lon: 6.89 },      // Enschede
  { name: "Zuidoost", lat: 51.44, lon: 5.48 },  // Eindhoven
  { name: "Zuid", lat: 50.85, lon: 5.69 },      // Maastricht
  { name: "West", lat: 51.92, lon: 4.48 },      // Rotterdam
  { name: "Zuidwest", lat: 51.44, lon: 3.57 },  // Vlissingen
  { name: "Midden", lat: 52.11, lon: 5.18 }     // De Bilt
];

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const authParam = searchParams.get("auth");
  const authHeader = req.headers.get("authorization");
  const isVercelCron = req.headers.get("x-vercel-cron") === "1";
  const cronSecret = process.env.CRON_SECRET;
  const authenticated =
    isVercelCron || authHeader === `Bearer ${cronSecret}` || authParam === cronSecret;

  if (process.env.NODE_ENV === "production" && !authenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Dry-run: ?dry=1 → genereert caption, probeert Buffer niet
  const dryRun = searchParams.get("dry") === "1";

  try {
    // Haal landelijk weer op per KNMI regio
    const regionalData: RegionalWeather[] = await Promise.all(
      KNMI_REGIONS.map(async (r) => {
        const data = await fetchWeatherData(r.lat, r.lon);
        return { region: r.name, weather: data as unknown as WeatherLite };
      })
    );

    // Stel de caption op (Piet Social 2.1: Brutaal & Echt Landelijk)
    const [xData, tiktokData] = await Promise.all([
      generatePlatformCaption(regionalData, 'x'),
      generatePlatformCaption(regionalData, 'tiktok'),
    ]);

    const base = process.env.NEXT_PUBLIC_BASE_URL || "https://weerzone.nl";
    const bust = Date.now();
    // Gebruik Midden/De Bilt voor de social slide images als fallback landelijk
    const center = KNMI_REGIONS.find(r => r.name === "Midden")!;
    const citySlug = "nederland";
    const xPersona = xData.persona;
    const ttPersona = tiktokData.persona;

    const xSlide1 = `${base}/api/social/piet-v2?city=${citySlug}&lat=${center.lat}&lon=${center.lon}&slide=1&format=x&persona=${xPersona}&t=${bust}`;
    const xSlide2 = `${base}/api/social/piet-v2?city=${citySlug}&lat=${center.lat}&lon=${center.lon}&slide=2&format=x&persona=${xPersona}&t=${bust}`;
    const ttSlide1 = `${base}/api/social/piet-v2?city=${citySlug}&lat=${center.lat}&lon=${center.lon}&slide=1&format=tiktok&persona=${ttPersona}&t=${bust}`;
    const ttSlide2 = `${base}/api/social/piet-v2?city=${citySlug}&lat=${center.lat}&lon=${center.lon}&slide=2&format=tiktok&persona=${ttPersona}&t=${bust}`;

    // Nano Banana 2: Viral Visual Generation for Social
    let viralVisualUrl = "";
    const key = process.env.GEMINI_API_KEY;
    if (key) {
      try {
        const genAI = new GoogleGenerativeAI(key);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const promptRes = await model.generateContent(`
          Geef een KORTE Engelse prompt voor een virale weerfoto in Nederland.
          Gebaseerd op dit weerbericht: "${xData.caption}"
          Locatie: Nederland.
          Stijl: National Geographic, dramatic lighting, 8k, awe-inspiring. 
          Geen tekst in beeld.
        `);
        const prompt = promptRes.response.text().trim();
        viralVisualUrl = `${base}/api/visuals/gen?prompt=${encodeURIComponent(prompt)}&v=2.1&seed=${bust}`;
      } catch (e) {
        console.error("Social Visual Error:", e);
      }
    }

    const xImages = viralVisualUrl ? [viralVisualUrl, xSlide1, xSlide2] : [xSlide1, xSlide2];
    const ttImages = viralVisualUrl ? [viralVisualUrl, ttSlide1, ttSlide2] : [ttSlide1, ttSlide2];

    if (dryRun) {
      return NextResponse.json({
        dry_run: true,
        x: xData,
        tiktok: tiktokData,
        images: {
          x: xImages,
          tt: ttImages
        },
      });
    }

    // Post parallel naar X en TikTok
    const [xResult, tiktokResult] = await Promise.allSettled([
      createBufferPost(BUFFER_CHANNELS.x, xData.caption, xImages),
      createBufferPost(BUFFER_CHANNELS.tiktok, tiktokData.caption, ttImages),
    ]);

    // 3. Stuur een kopie en samenvatting naar de founder (info@weerzone.nl)
    const resendKey = process.env.RESEND_API_KEY;
    if (resendKey) {
      const resend = new Resend(resendKey);
      await resend.emails.send({
        from: "Weerzone System <system@weerzone.nl>",
        to: "info@weerzone.nl",
        subject: `🚀 Social Post Status: Landelijk Weer`,
        html: `
          <div style="font-family:sans-serif; padding:20px;">
            <h1 style="color:#0ea5e9;">WeerZone Social Automator</h1>
            <p>De landelijke social media posts (Piet) zijn voorbereid en doorgestuurd naar Buffer.</p>
            
            <hr />
            
            <h3>X (Twitter) Content [${xPersona.toUpperCase()}]:</h3>
            <p style="background:#f1f5f9; padding:15px; border-radius:8px;">${xData.caption.replace(/\n/g, '<br>')}</p>
            <div style="display:flex; gap:10px;">
              <img src="${xSlide1}" width="300" style="border:1px solid #ddd" />
              <img src="${xSlide2}" width="300" style="border:1px solid #ddd" />
            </div>

            <h3>TikTok Content [${ttPersona.toUpperCase()}]:</h3>
            <p style="background:#f1f5f9; padding:15px; border-radius:8px;">${tiktokData.caption.replace(/\n/g, '<br>')}</p>
            <div style="display:flex; gap:10px;">
              <img src="${ttSlide1}" width="200" style="border:1px solid #ddd" />
              <img src="${ttSlide2}" width="200" style="border:1px solid #ddd" />
            </div>

            <hr />
            <p style="font-size:12px; color:#666;">Status X: ${xResult.status}<br>Status TikTok: ${tiktokResult.status}</p>
          </div>
        `
      });
    }

    return NextResponse.json({
      status: "done",
      x: xData,
      tiktok: tiktokData,
      images: [xSlide1, xSlide2, ttSlide1, ttSlide2],
      results: {
        x:
          xResult.status === "fulfilled"
            ? xResult.value
            : { error: (xResult.reason as Error).message },
        tiktok:
          tiktokResult.status === "fulfilled"
            ? tiktokResult.value
            : { error: (tiktokResult.reason as Error).message },
      },
    });
  } catch (e) {
    const msg = (e as Error).message;
    console.error("social-post error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}