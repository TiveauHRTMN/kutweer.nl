"use server";

import { fetchWeatherData, getWeatherDescription } from "@/lib/weather";
import type { WeatherData } from "@/lib/types";
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
import { getMainCommentary } from "@/lib/commentary";

export async function getWeather(lat: number, lon: number): Promise<WeatherData> {
  const weather = await fetchWeatherData(lat, lon);
  const apiKey = process.env.GEMINI_API_KEY;

  if (apiKey) {
    let attempts = 0;
    while (attempts < 3) {
      try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ 
          model: "gemini-3-flash-preview",
          safetySettings: [
            { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
            { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
            { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
            { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
          ]
        });

        const tomorrow = weather.daily[1];
        const prompt = `
Je bent de weerverteller van WeerZone. Stijl: Roddelpraat / VI / Powned — direct, brutaal, eerlijk, met mening. Geen gelul, wel netjes (geen scheldwoorden).

LENGTE (HARD):
- Exact 3 zinnen.
- Samen 35-55 woorden totaal.
- Korter of langer = fout.

STRUCTUUR:
1. Situatie nu + gevoel (met mening: lekker, ruk, meevaller, tegenvaller).
2. Wat de komende uren te merken is (regen ja/nee, wind, wel/niet naar buiten).
3. Korte dreun over morgen — één pittige conclusie.

STIJL:
- Schrijf alsof je op een terras zit met een biertje. Direct, scherp, met humor.
- Mening hebben mag. Voorbeelden: "Prima hoor.", "Niks om over te zeuren.", "Tegenvaller.", "Daar zit je dan.", "Gewoon doen.", "Jas aan en bek dicht."
- GEEN: 'analyse', 'verwachting', 'significant', 'conform', 'momenteel', 'gedurende', 'tikkeltje'.
- GEEN scheldwoorden, wel attitude.

VOORBEELD (qua toon/lengte — NIET kopiëren):
"Elf graden met een grijze lucht, voelt buiten als een schamele 9. Droog blijft het wel, dus geen reden om binnen te blijven hangen. Morgen zakt het verder in met 8 graden en regen — tegenvallertje."

FEITEN NU:
Lucht: ${getWeatherDescription(weather.current.weatherCode)}
Temp: ${weather.current.temperature}° (voelt als ${weather.current.feelsLike}°)
Wind: ${weather.current.windSpeed} km/h
Regen nu: ${weather.current.precipitation} mm

VERLOOP VANDAAG/AVOND:
Regen komende 12u: ${weather.hourly.slice(0, 12).reduce((acc, h) => acc + h.precipitation, 0).toFixed(1)} mm

MORGEN (${tomorrow.date}):
Max: ${tomorrow.tempMax}°, Min: ${tomorrow.tempMin}°
Lucht: ${getWeatherDescription(tomorrow.weatherCode)}
Regen: ${tomorrow.precipitationSum} mm

Geef nu het weerbericht (3 zinnen, 35-55 woorden, Roddelpraat-toon).
        `.trim();

        const result = await model.generateContent({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: { maxOutputTokens: 2000, temperature: 0.8, topP: 0.95 },
        });

        const text = result.response.text().trim().replace(/^"|"$/g, '');
        const wordCount = text.split(/\s+/).filter(Boolean).length;
        // Accept 25-70 woorden (3 zinnen range)
        if (text && wordCount >= 25 && wordCount <= 70) {
          weather.aiVerdict = text;
          break;
        }
        console.warn(`AI output buiten range (${wordCount} woorden), retry...`);
        attempts++;
        if (attempts === 3) {
          weather.aiVerdict = text && wordCount > 10 ? text : getMainCommentary(weather);
        }
      } catch (e) {
        attempts++;
        console.error(`AI Verdict attempt ${attempts} failed:`, e);
          if (attempts === 3) {
            weather.aiVerdict = getMainCommentary(weather);
          }
        await new Promise(r => setTimeout(r, 500)); // Wacht even voor de volgende poging
      }
    }
  }

  return weather;
}

export async function findBusinessLeads(query: string) {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    throw new Error("GOOGLE_MAPS_API_KEY is not set in environment variables");
  }

  try {
    const response = await fetch("https://places.googleapis.com/v1/places:searchText", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask": "places.displayName,places.formattedAddress,places.websiteUri,places.nationalPhoneNumber,places.types",
      },
      body: JSON.stringify({
        textQuery: query,
        languageCode: "nl",
        maxResultCount: 20, // Maximaal 20 per keer voor overzicht
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Places API error:", errorData);
      throw new Error(`Google Places API error: ${response.statusText}`);
    }

    const data = await response.json();
    
    // Transformeren naar een cleaner formaat
    return (data.places || []).map((place: any) => ({
      name: place.displayName?.text || "Onbekend",
      address: place.formattedAddress,
      website: place.websiteUri,
      phone: place.nationalPhoneNumber,
      types: place.types,
    }));
  } catch (error) {
    console.error("Lead finding error:", error);
    return [];
  }
}
