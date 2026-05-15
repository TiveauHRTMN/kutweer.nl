/**
 * DWD Wetterbericht — officiële tekstvoorspelling van de Deutscher Wetterdienst.
 *
 * Bron: https://opendata.dwd.de/weather/text_forecasts/txt/
 *   - VHDL30_DWMG_LATEST_de.txt → Wettervorhersage Deutschland (24h overzicht)
 *   - VHDL50_DWMG_LATEST_de.txt → Mittelfristige Vorhersage (3-7 dagen)
 *
 * Equivalent van de KNMI 30-min weerbriefing voor NL. Updated meerdere keren per dag.
 * Plain text, German, geen API-key vereist.
 */

const TEXT_FORECAST_BASE = "https://opendata.dwd.de/weather/text_forecasts/txt";

const FILE_BY_KIND: Record<"deutschland" | "mittelfrist", string> = {
  deutschland: "VHDL30_DWMG_LATEST_de.txt",
  mittelfrist: "VHDL50_DWMG_LATEST_de.txt",
};

export interface DwdBriefing {
  /** Volledige tekst van de DWD-briefing (Duits, plain text). */
  raw: string;
  /** Eerste regel — meestal de titel/heading. */
  title: string;
  /** Hoofdtekst gesplitst in paragrafen. */
  paragraphs: string[];
  /** ISO timestamp van de fetch — DWD update meerdere keren per dag. */
  fetchedAt: string;
  /** Bron-URL. */
  source: string;
}

function cleanText(raw: string): string {
  return raw
    // Soms is de file UTF-8 BOM. Strip.
    .replace(/^﻿/, "")
    // Normaliseer linebreaks
    .replace(/\r\n/g, "\n")
    // DWD gebruikt soms heel veel whitespace voor uitlijning — comprimeer
    .replace(/[ \t]+\n/g, "\n")
    .trim();
}

function splitParagraphs(text: string): string[] {
  return text
    .split(/\n{2,}/)
    .map((p) => p.replace(/\n/g, " ").trim())
    .filter((p) => p.length > 0);
}

/**
 * Haal de DWD-briefing op (default: Deutschland 24h overzicht).
 * Cached server-side voor 30 minuten (matched DWD's update-frequentie).
 */
export async function fetchDwdBriefing(
  kind: "deutschland" | "mittelfrist" = "deutschland",
): Promise<DwdBriefing | null> {
  const filename = FILE_BY_KIND[kind];
  const url = `${TEXT_FORECAST_BASE}/${filename}`;
  try {
    const res = await fetch(url, {
      next: { revalidate: 1800 }, // 30 minuten
      headers: { "User-Agent": "WeerzoneBot/1.0 (+https://weerzone.nl)" },
      signal: AbortSignal.timeout(4000),
    });
    if (!res.ok) return null;
    const raw = cleanText(await res.text());
    if (!raw) return null;

    const lines = raw.split("\n").map((l) => l.trim()).filter(Boolean);
    const title = lines[0] ?? "DWD-Wetterbericht";
    const body = raw.split("\n").slice(1).join("\n").trim();
    const paragraphs = splitParagraphs(body);

    return {
      raw,
      title,
      paragraphs,
      fetchedAt: new Date().toISOString(),
      source: url,
    };
  } catch (err) {
    console.error("DWD briefing fetch failed:", err);
    return null;
  }
}
