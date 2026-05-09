interface Props {
  forecast: string;
}

export default function KNMIForecastCard({ forecast }: Props) {
  return (
    <div className="card p-5 sm:p-6">
      <div className="flex items-center gap-2 mb-3">
        <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600">
          Piet · weerbericht
        </span>
        <span className="ml-auto text-[9px] text-slate-400">bron: KNMI</span>
      </div>
      <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
        {forecast}
      </p>
    </div>
  );
}
