import { DUTCH_CITIES } from "@/lib/types";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{ city?: string }>;
}

/**
 * Preview-pagina voor de dagelijkse Piet IG/TikTok carrousel.
 * Twee slides (1080x1350): weer-update + logo/CTA.
 * Rechts-klik → "Afbeelding opslaan als…" om te exporteren.
 */
export default async function PietSocialPreview({ searchParams }: PageProps) {
  const { city = "amsterdam" } = await searchParams;
  const bust = Date.now();

  const base = `/api/social/piet?city=${encodeURIComponent(city)}`;
  const slide1 = `${base}&slide=1&t=${bust}`;
  const slide2 = `${base}&slide=2&t=${bust}`;

  const cityOptions = DUTCH_CITIES.slice(0, 15);

  return (
    <main className="min-h-screen bg-[#0f172a] py-10 px-4">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-black text-white mb-2">
          Piet · social-carrousel preview
        </h1>
        <p className="text-white/70 text-sm mb-6">
          1080×1350 (IG portret / TikTok). Rechts-klik op een slide →
          &ldquo;Afbeelding opslaan als…&rdquo;. Format: <code>?city=amsterdam</code>.
        </p>

        {/* Stadkiezer */}
        <form className="flex flex-wrap gap-2 mb-8">
          {cityOptions.map((c) => {
            const active = c.name.toLowerCase() === city.toLowerCase();
            return (
              <a
                key={c.name}
                href={`?city=${c.name.toLowerCase()}`}
                className={`px-3 py-1.5 rounded-full text-sm font-bold transition-colors ${
                  active
                    ? "bg-[#FFB400] text-slate-900"
                    : "bg-white/10 text-white/80 hover:bg-white/20"
                }`}
              >
                {c.name}
              </a>
            );
          })}
        </form>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col gap-2">
            <p className="text-white/60 text-xs uppercase tracking-widest font-bold">
              Slide 1 · Weer-update
            </p>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={slide1}
              alt="Slide 1 — weer-update"
              className="w-full rounded-2xl shadow-2xl bg-black/40"
            />
            <a
              href={slide1}
              download={`weerzone-piet-${city}-slide1.png`}
              className="text-center py-2 rounded-xl bg-white/10 text-white text-sm font-bold hover:bg-white/20"
            >
              Download slide 1
            </a>
          </div>

          <div className="flex flex-col gap-2">
            <p className="text-white/60 text-xs uppercase tracking-widest font-bold">
              Slide 2 · Logo + CTA
            </p>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={slide2}
              alt="Slide 2 — logo en CTA"
              className="w-full rounded-2xl shadow-2xl bg-black/40"
            />
            <a
              href={slide2}
              download={`weerzone-piet-${city}-slide2.png`}
              className="text-center py-2 rounded-xl bg-white/10 text-white text-sm font-bold hover:bg-white/20"
            >
              Download slide 2
            </a>
          </div>
        </div>

        <p className="text-white/50 text-xs mt-8">
          API: <code>/api/social/piet?slide=1|2&amp;city=…</code>. Weer-data via
          Open-Meteo (KNMI HARMONIE-fallback), gegenereerd per request.
        </p>
      </div>
    </main>
  );
}
