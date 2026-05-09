interface Props {
  forecast: string;
}

export default function KNMIForecastCard({ forecast }: Props) {
  const paragraphs = forecast.split(/\n+/).map((p) => p.trim()).filter(Boolean);

  return (
    <div className="card p-5 sm:p-6">
      <div className="flex items-center gap-2 mb-4">
        <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600">
          Piet · weerbericht
        </span>
      </div>

      <div className="space-y-3">
        {paragraphs.map((p, i) => (
          <p key={i} className="text-sm text-slate-700 leading-relaxed">
            {p}
          </p>
        ))}
      </div>

      <p className="text-[9px] text-slate-400 mt-4">Gebaseerd op KNMI-data · elke 30 minuten bijgewerkt</p>
    </div>
  );
}
