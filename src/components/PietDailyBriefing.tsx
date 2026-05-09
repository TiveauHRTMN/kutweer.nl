import type { PietDailyBriefingData } from "@/lib/piet-briefing";
import { currentSegment } from "@/lib/piet-briefing";

const SEGMENT_HOURS: Record<string, string> = {
  Ochtend: "06–12",
  Middag: "12–17",
  Avond: "17–22",
  Nacht: "22–06",
};

export default function PietDailyBriefing({ data }: { data: PietDailyBriefingData }) {
  const active = currentSegment();
  const updatedAt = new Date(data.generated_at).toLocaleTimeString("nl-NL", {
    timeZone: "Europe/Amsterdam",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="card p-5 sm:p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg">🌤️</span>
          <p className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">
            Weerbericht vandaag
          </p>
        </div>
        <span className="text-[10px] text-slate-400 font-medium">bijgewerkt {updatedAt}</span>
      </div>

      <div className="grid grid-cols-4 gap-2">
        {data.slots.map((slot) => {
          const isActive = slot.name === active;
          return (
            <div
              key={slot.name}
              className={`rounded-xl p-3 text-center transition-all ${
                isActive
                  ? "bg-slate-900 text-white shadow-md"
                  : "bg-slate-50 text-slate-700"
              }`}
            >
              <p className={`text-[10px] font-black uppercase tracking-wide mb-1 ${isActive ? "text-slate-400" : "text-slate-400"}`}>
                {slot.name}
                <span className={`block font-normal normal-case tracking-normal text-[9px] ${isActive ? "text-slate-500" : "text-slate-300"}`}>
                  {SEGMENT_HOURS[slot.name]}
                </span>
              </p>
              <span className="text-xl block mb-1">{slot.emoji}</span>
              <p className={`text-sm font-black ${isActive ? "text-white" : "text-slate-800"}`}>{slot.temp}</p>
              <p className={`text-[10px] font-semibold ${isActive ? "text-slate-300" : "text-slate-400"}`}>{slot.rain}</p>
            </div>
          );
        })}
      </div>

      <p className="text-sm text-slate-600 leading-relaxed border-l-2 border-slate-200 pl-4">
        {data.commentary}
      </p>
    </div>
  );
}
