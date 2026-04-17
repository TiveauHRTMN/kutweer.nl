import Link from "next/link";

type Props = {
  cityName: string;
};

/**
 * CTA banner richting /zakelijk voor buitenwerkers.
 * Getoond op elke /weer/[city] pagina — drijft SEO-verkeer naar B2B-funnel.
 */
export default function ZakelijkCTA({ cityName }: Props) {
  return (
    <section className="w-full px-4 py-10 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="max-w-3xl mx-auto rounded-2xl border border-white/10 bg-white/[0.03] p-8 sm:p-10 backdrop-blur">
        <div className="flex flex-col sm:flex-row sm:items-center gap-6">
          <div className="flex-1">
            <p className="text-[11px] font-bold uppercase tracking-widest text-accent-orange mb-3">
              Voor bedrijven in {cityName}
            </p>
            <h3 className="text-2xl sm:text-3xl font-black text-white leading-tight mb-3">
              Werk je buiten? Dan kost slecht weer je geld.
            </h3>
            <p className="text-white/60 text-sm sm:text-base leading-relaxed">
              Dagelijks een zakelijk weerrapport op maat. 48 uur messcherp,
              branche-specifiek. Geen 14-daagse ruis, gewoon bruikbare data voor je planning.
              <span className="text-white/80 font-semibold"> Gratis tijdens de beta.</span>
            </p>
          </div>
          <div className="flex-shrink-0">
            <Link
              href="/zakelijk"
              className="inline-block px-6 py-4 rounded-xl bg-accent-orange text-text-primary font-bold text-base hover:brightness-95 transition-all shadow-lg shadow-accent-orange/20 whitespace-nowrap"
            >
              Gratis aanmelden →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
