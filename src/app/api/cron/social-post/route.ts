import { NextResponse } from "next/server";
import { fetchWeatherData } from "@/lib/weather";
import { GoogleGenerativeAI } from "@google/generative-ai";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// Buffer GraphQL IDs (bevestigd via /api/admin/buffer-check op 19-04-2026)
const BUFFER_ORG_ID = "69e51acfc3f39b8c8987146b";
const BUFFER_CHANNELS = {
  x: "69e51ee4031bfa423c1f65c6", // @weerzone
  tiktok: "69e51f4f031bfa423c1f673b", // weerzonenl
};

const CAPTION_PROMPT = `
Je bent Piet — de brutale, nuchtere Nederlandse weerman van WEERZONE.
Schrijf een korte social-post (X + TikTok) op basis van de weerdata hieronder.

STRIKT:
- Max 220 tekens (X-limiet, laat ruimte voor URL + hashtags)
- Nederlands, nuchter, brutaal maar niet grof
- Noem ochtend + middag + avond kort (één zin)
- Eindig met: "👉 weerzone.nl"
- Voeg 3-4 hashtags toe: #weer #weerzone #nederland en één contextueel (#regen/#zon/#wind/#kou)
- Geen emoji-overload, max 2 emoji's in de hele post
`;

interface WeatherLite {
  current: { temperature: number; weatherCode: number; windSpeed: number; precipitation: number };
  daily: { temperature_2m_max: number[]; temperature_2m_min: number[]; precipitation_sum?: number[] };
  hourly?: { temperature_2m?: number[]; weather_code?: number[] };
}

async function generateCaption(weather: WeatherLite): Promise<string> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    return "Landelijk weerbericht van Piet. 48 uur, geen ruis. 👉 weerzone.nl #weer #weerzone #nederland";
  }
  try {
    const genAI = new GoogleGenerativeAI(key);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
    const summary = {
      nu_temp: Math.round(weather.current.temperature),
      nu_wind_kmu: Math.round(weather.current.windSpeed),
      nu_regen_mm: weather.current.precipitation,
      ochtend_temp: Math.round(weather.hourly?.temperature_2m?.[8] ?? weather.current.temperature),
      middag_temp: Math.round(weather.hourly?.temperature_2m?.[13] ?? weather.daily.temperature_2m_max[0]),
      avond_temp: Math.round(weather.hourly?.temperature_2m?.[19] ?? weather.current.temperature),
      morgen_max: Math.round(weather.daily.temperature_2m_max[1] ?? weather.daily.temperature_2m_max[0]),
    };
    const res = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: `${CAPTION_PROMPT}\n\nDATA:\n${JSON.stringify(summary)}` }] }],
      generationConfig: { maxOutputTokens: 300, temperature: 0.8 },
    });
    const text = res.response.text()?.trim();
    return text || "Landelijk weerbericht. 👉 weerzone.nl #weer #weerzone";
  } catch (e) {
    console.error("Gemini caption error:", e);
    return "Landelijk weerbericht van Piet. 👉 weerzone.nl #weer #weerzone #nederland";
  }
}

interface BufferResponse {
  data?: unknown;
  errors?: Array<{ message: string; path?: string[] }>;
}

async function bufferGraphQL(query: string, variables: Record<string, unknown>): Promise<BufferResponse> {
  const token = process.env.BUFFER_API_TOKEN;
  if (!token) throw new Error("BUFFER_API_TOKEN missing");
  const res = await fetch("https://api.buffer.com", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query, variables }),
  });
  const body = (await res.json()) as BufferResponse;
  if (!res.ok) throw new Error(`Buffer HTTP ${res.status}: ${JSON.stringify(body)}`);
  return body;
}

async function createBufferPost(channelId: string, text: string, imageUrls: string[]) {
  const mutation = `
    mutation CreatePost($input: CreatePostInput!) {
      createPost(input: $input) {
        __typename
        ... on CreatePostSuccess { post { id scheduledAt } }
        ... on MutationError { message }
      }
    }
  `;
  const variables = {
    input: {
      organizationId: BUFFER_ORG_ID,
      channelIds: [channelId],
      text,
      media: imageUrls.map((url) => ({ url, type: "image" })),
      schedulingType: "custom",
      mode: "shareNow",
    },
  };
  return bufferGraphQL(mutation, variables);
}

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
    // De Bilt — landelijk centrum van NL, gebruikt KNMI als referentie
    const weather = await fetchWeatherData(52.11, 5.18);
    if (!weather) throw new Error("Weather fetch failed");

    const caption = await generateCaption(weather as unknown as WeatherLite);

    const base = process.env.NEXT_PUBLIC_BASE_URL || "https://weerzone.nl";
    const bust = Date.now();
    const slide1 = `${base}/api/social/piet?city=debilt&slide=1&t=${bust}`;
    const slide2 = `${base}/api/social/piet?city=debilt&slide=2&t=${bust}`;

    if (dryRun) {
      return NextResponse.json({
        dry_run: true,
        caption,
        caption_length: caption.length,
        images: [slide1, slide2],
      });
    }

    // Post parallel naar X en TikTok
    const [xResult, tiktokResult] = await Promise.allSettled([
      createBufferPost(BUFFER_CHANNELS.x, caption, [slide1, slide2]),
      createBufferPost(BUFFER_CHANNELS.tiktok, caption, [slide1, slide2]),
    ]);

    return NextResponse.json({
      status: "done",
      caption,
      caption_length: caption.length,
      images: [slide1, slide2],
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
