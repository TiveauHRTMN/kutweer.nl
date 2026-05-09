interface Props {
  forecast: string;
}

export default function KNMIForecastCard({ forecast }: Props) {
  return (
    <div className="card p-5 sm:p-6">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
          KNMI · officiële verwachting
        </span>
        <span className="ml-auto text-[9px] font-black uppercase tracking-widest text-blue-500 border border-blue-200 rounded px-1.5 py-0.5">
          Nederland
        </span>
      </div>
      <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
        {forecast}
      </p>
    </div>
  );
}
