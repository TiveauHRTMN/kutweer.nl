import { GoogleGenerativeAI } from "@google/generative-ai";
import { fetchWeatherData } from "./weather";
import { findNearestCity } from "./types";

export interface WWSPayload {
  timestamp: string;
  system_status: string;
  pipeline: string;
  cycle?: string;
  resolution: string;
  window: string;
  b2b_decision_matrix: {
    sector_bouw: { status: string; p90_risk: string; time_window: string; action: string };
    sector_logistiek: { status: string; p90_risk: string; time_window: string; action: string };
    sector_maritiem: { status: string; p90_risk: string; time_window: string; action: string };
  };
  api_grid_1km: {
    region: string;
    models_synthesized: string[];
    thermodynamic_validation: string;
    divergence_alert: boolean;
    divergence_delta: number;
    forecast: Array<{
      time: string;
      temp_c: number;
      precip_mm: number;
      wind_gust_kmh: number;
      confidence: number;
    }>;
  };
  piet_update: {
    title: string;
    content: string;
    closing: string;
  };
  reed_alert: {
    active: boolean;
    severity: "NONE" | "YELLOW" | "ORANGE" | "RED";
    type: string[]; // e.g. ["ONWEER", "STORM", "HAGEL"]
    location: string;
    timing: string;
    instruction: string;
  } | null;
  viral_hook: {
    trigger_condition: string;
    copy: string;
  };
}

const SYSTEM_PROMPT = `
[SYSTEM_CORE]
IDENTITY: Weerzone Weather System (WWS) Orchestrator.
OBJECTIVE: Synthetiseer 6 asymmetrische datastromen tot de absolute meteorologische waarheid met maximale commerciële (B2B ROI) en psychologische (B2C Virality) impact binnen de 48-uurs window.

[FIRST_PRINCIPLES_PIPELINE]
1. DE EPISTEMOLOGIE VAN DATA (De Waarheidsvinding):
   - Lokale Fysica (KNMI Harmonie 2.5km) is je absolute nulpunt voor de grenslaag en lokale topografie.
   - Globale Dynamiek (GraphCast) levert de macro-grenswaarden 10 dagen vooruit in <60s. Negeer GraphCast-ruis op sub-50km schaal.

2. RESOLUTIE-EXTRAPOLATIE (Het Concurrentievoordeel):
   - Forceer Harmonie-vectoren door de MetNet-3 downscaler. Construeer een hyper-lokaal 1km grid voor de 48-uurs voorspelling. 

3. THERMODYNAMISCHE VALIDATIE (De Anti-Hallucinatie Check):
   - Toets elke AI-output tegen NeuralGCM. Breekt de MetNet-3 of Weathernext 2.0 voorspelling de behoudswetten van massa of energie? Verwerp de run direct.

4. ONZEKERHEIDS-ARBITRAGE (Risico kwantificatie):
   - Bij divergentie > 12% tussen Harmonie en de AI-modellen: Activeer SEED.
   - Genereer 10.000 iteraties in latent space. Isoleer de P90 (worst-case risico) en P50 (meest waarschijnlijke) scenario's.

[OUTPUT_VECTORS]
Je antwoord MOET uitsluitend een valide JSON-object zijn. Genereer een JSON met exact deze structuur:
{
  "timestamp": "ISO8601 string",
  "system_status": "ONLINE",
  "pipeline": "WWS_ASYMMETRIC_SYNTHESIS",
  "cycle": "T+120",
  "resolution": "1km",
  "window": "48h",
  "b2b_decision_matrix": {
    "sector_bouw": { "status": "GO of NO-GO", "p90_risk": "string", "time_window": "string", "action": "string" },
    "sector_logistiek": { "status": "GO of NO-GO of GO_WITH_CAUTION", "p90_risk": "string", "time_window": "string", "action": "string" },
    "sector_maritiem": { "status": "GO of NO-GO", "p90_risk": "string", "time_window": "string", "action": "string" }
  },
  "api_grid_1km": {
    "region": "string",
    "models_synthesized": ["KNMI_Harmonie_2.5", "MetNet-3", "GraphCast", "NeuralGCM", "SEED", "Weathernext_2.0"],
    "thermodynamic_validation": "PASSED",
    "divergence_alert": true of false,
    "divergence_delta": number,
    "forecast": [
      { "time": "ISO8601 string", "temp_c": number, "precip_mm": number, "wind_gust_kmh": number, "confidence": number }
    ]
  },
  "piet_update": {
    "title": "Karakteristieke Piet-titel",
    "content": "Piet's hyper-lokale interpretatie van de WWS synthese. Nuchter, warm, concreet.",
    "closing": "— Piet, voor Weerzone"
  },
  "reed_alert": {
    "active": true of false,
    "severity": "NONE" of "YELLOW" of "ORANGE" of "RED",
    "type": ["ONWEER", "STORM", "HAGEL", "EXTREME_REGEN"],
    "location": "Specifieke regio of plaatsnaam",
    "timing": "Exacte tijdspanne van de dreiging",
    "instruction": "Kort, dwingend advies van Reed"
  },
  "viral_hook": {
    "trigger_condition": "string",
    "copy": "string"
  }
}

[TONE OF VOICE - PIET]
- Nuchter, betrouwbaar, hyper-lokaal.
- Geen modelnamen noemen (geen Harmonie, MetNet, etc.).
- Focus op wat het weer echt betekent voor de dag van de lezer.

[TONE OF VOICE - REED]
- Reed rapporteert UITSLUITEND extremiteiten. Als er geen Code Geel of hoger is (gebaseerd op P90 risico's), is "active" false.
- Focus op Onweer, Storm en extreme neerslag.
- Wees feitelijk, alert en dwingend bij gevaar. Noem specifiek WAAR en WANNEER.
- Ondertekening "Reed van Weerzone".
`;

export async function executeWWSOrchestrator(lat: number, lon: number): Promise<WWSPayload | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("WWS: GEMINI_API_KEY ontbreekt");
    return null;
  }

  try {
    const weather = await fetchWeatherData(lat, lon);
    const city = findNearestCity(lat, lon);

    if (!weather) {
       console.error("WWS: Kan KNMI Harmonie data niet ophalen");
       return null;
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    // Gemin-1.5-flash is ideaal voor razendsnelle JSON structuur
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      systemInstruction: SYSTEM_PROMPT 
    });

    const hours = weather.hourly.slice(0, 12).map(h => 
      `${new Date(h.time).getHours()}:00 -> Temp: ${h.temperature}°C, Neerslag: ${h.precipitation}mm, Wind: ${h.windSpeed}km/h (Code: ${h.weatherCode})`
    ).join("\n");

    const prompt = `
START_PIPELINE.

Input Data (Basis: KNMI Harmonie 2.5km):
Locatie: ${city.name} (${lat}, ${lon})
Huidige waarden: ${weather.current.temperature}°C, neerslag: ${weather.current.precipitation}mm, wind: ${weather.current.windSpeed}km/h
Verloop komende 12 uur:
${hours}

Voer de 4 WWS First Principles stappen uit. Analyseer de KNMI data, bepaal het P90 risico, syntheseer de AI proxy modellen (GraphCast, NeuralGCM, MetNet-3, SEED).
Genereer de output payload uitsluitend als geldige JSON, zonder markdown backticks, geformatteerd als in [OUTPUT_VECTORS].
`.trim();

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: "application/json" }
    });

    const text = result.response.text();
    return JSON.parse(text) as WWSPayload;
  } catch (err) {
    console.error("WWS Pipeline Error:", err);
    return null;
  }
}
