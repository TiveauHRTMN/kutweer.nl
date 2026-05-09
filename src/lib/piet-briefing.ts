import { createSupabaseServerClient } from "@/lib/supabase/server";

export interface DailySlot {
  name: string;
  temp: string;
  rain: string;
  emoji: string;
}

export interface PietDailyBriefingData {
  date: string;
  generated_at: string;
  commentary: string;
  slots: DailySlot[];
  region_data: { name: string; city: string; temp: number }[];
}

export async function fetchPietDailyBriefing(): Promise<PietDailyBriefingData | null> {
  try {
    const today = new Date().toLocaleDateString("sv-SE", { timeZone: "Europe/Amsterdam" });
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("piet_daily_briefing")
      .select("*")
      .eq("date", today)
      .maybeSingle();
    if (error || !data) return null;
    return data as PietDailyBriefingData;
  } catch {
    return null;
  }
}

export function currentSegment(): "Ochtend" | "Middag" | "Avond" | "Nacht" {
  const hour = parseInt(
    new Date().toLocaleTimeString("nl-NL", { timeZone: "Europe/Amsterdam", hour: "2-digit", hour12: false })
  );
  if (hour >= 6 && hour < 12) return "Ochtend";
  if (hour >= 12 && hour < 17) return "Middag";
  if (hour >= 17 && hour < 22) return "Avond";
  return "Nacht";
}
