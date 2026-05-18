import type { Metadata } from "next";
import Link from "next/link";
import { Check } from "lucide-react";

export const metadata: Metadata = {
  title: "Precios | WEERZONE Espana",
  description:
    "WEERZONE para Espana: gratis durante la beta. Juan, Reed y Steve traducen el tiempo en decisiones para tu casa, tu negocio y tu calle.",
  alternates: {
    canonical: "https://weerzone.nl/es/precios",
    languages: {
      "nl-NL": "https://weerzone.nl/prijzen",
      "de-DE": "https://weerzone.nl/de/preise",
      "fr-FR": "https://weerzone.nl/fr/tarifs",
      "es-ES": "https://weerzone.nl/es/precios",
      "x-default": "https://weerzone.nl/prijzen",
    },
  },
  openGraph: {
    title: "Precios | WEERZONE Espana",
    description: "Gratis durante la beta. Juan, Reed y Steve, sin publicidad ni tracking.",
    type: "website",
    locale: "es_ES",
    url: "https://weerzone.nl/es/precios",
    siteName: "WEERZONE",
  },
};

const TIERS = [
  {
    name: "Juan",
    price: "Gratis · beta",
    tagline: "El parte del barrio cada manana.",
    description:
      "Juan te envia un correo corto antes de las siete: como viene hoy y manana en tu calle, tu costa o tu sierra. Sin jerga, sin spam.",
    features: [
      "Correo diario antes de las 7:00",
      "Para tu codigo postal exacto (1x1 km)",
      "Tu decides que cuenta: terraza, perro, ninos, bici",
      "Panel con la evolucion por hora",
      "Sin publicidad ni tracking",
    ],
    cta: { label: "Conocer a Juan", href: "/es/mi-tiempo" },
  },
  {
    name: "Reed",
    price: "Gratis · beta",
    tagline: "Aviso solo cuando el tiempo cruza tu limite.",
    description:
      "Reed te toca cuando hay riesgo real: DANA, calor extremo, viento fuerte, helada o tormenta en tu zona. Lo demas no te molesta.",
    features: [
      "Todo lo que envia Juan",
      "Alertas con tus propios umbrales",
      "Especifico para DANA, levante, cierzo, calor",
      "Ojo en tu tejado plano, sotano, animales fuera",
      "Sin notificaciones de relleno",
    ],
    highlight: true,
    cta: { label: "Activar Reed", href: "/es/alertas" },
  },
  {
    name: "Steve",
    price: "Proximamente",
    tagline: "El tiempo traducido a decision comercial.",
    description:
      "Steve es la capa para negocios con la operativa atada al tiempo: terrazas, hosteleria, eventos, agricultura, logistica. Aviso a 48 horas con accion concreta.",
    features: [
      "Briefing diario para tu equipo",
      "Reglas propias por sucursal o ruta",
      "API y webhook para tu stack",
      "Soporte con humano detras",
      "SLA y contrato B2B",
    ],
    cta: { label: "Hablar con Steve", href: "/es/contacto" },
    unavailable: true,
  },
];

const FAQS: Array<[string, string]> = [
  ["Por que es gratis ahora?", "WEERZONE esta en beta. Puedes probar Juan y Reed sin tarjeta — tu uso nos ayuda a afinar el producto con gente real, no con datos sinteticos."],
  ["Cual es la diferencia entre Juan y Reed?", "Juan te cuenta el dia cada manana. Reed entra solo cuando viento, lluvia, tormenta, calor o frio cruzan tu umbral personal. Uno explica, el otro avisa."],
  ["Puedo cambiar de plan?", "Si. Durante la beta no hay compromiso ni cobro. Cuando arranquemos los precios podras subir, bajar o salir sin penalizacion."],
  ["Por que solo 48 horas?", "Porque ese es el horizonte donde la prevision sirve para decidir. Mas alla suele dar direccion, no plan fiable — y no vendemos humo de catorce dias."],
];

export default function PreciosPage() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-12 sm:py-16 space-y-10">
      <header className="space-y-4 max-w-3xl">
        <p className="text-[10px] font-black uppercase tracking-[0.25em] text-amber-700">
          Precios · Espana
        </p>
        <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-text-primary leading-[1.05]">
          Tiempo util, no pronostico para rellenar.
        </h1>
        <p className="text-lg text-text-secondary leading-relaxed">
          Durante la beta puedes usar Juan y Reed sin pagar. Steve llega despues, pensado para negocios
          con la operativa atada al tiempo.
        </p>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {TIERS.map((tier) => (
          <div
            key={tier.name}
            className={`card p-6 sm:p-7 flex flex-col gap-4 ${
              tier.highlight ? "ring-2 ring-amber-500" : ""
            } ${tier.unavailable ? "opacity-80" : ""}`}
          >
            <div>
              <div className="flex items-center justify-between gap-3 mb-2">
                <h2 className="text-2xl font-black text-text-primary">{tier.name}</h2>
                {tier.highlight && (
                  <span className="text-[10px] font-black uppercase tracking-widest text-amber-700 bg-amber-50 px-2 py-1 rounded">
                    Recomendado
                  </span>
                )}
              </div>
              <p className="text-sm font-bold text-text-secondary">{tier.price}</p>
            </div>
            <p className="text-base font-black text-text-primary leading-snug">{tier.tagline}</p>
            <p className="text-sm text-text-secondary leading-relaxed">{tier.description}</p>
            <ul className="space-y-2 text-sm text-text-secondary">
              {tier.features.map((feature) => (
                <li key={feature} className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
            <div className="mt-auto pt-3">
              <Link
                href={tier.cta.href}
                className={`btn btn-sm w-full justify-center ${
                  tier.unavailable ? "btn-ghost" : tier.highlight ? "btn-primary" : "btn-ghost"
                }`}
              >
                {tier.cta.label}
              </Link>
            </div>
          </div>
        ))}
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-black text-text-primary tracking-tight">Preguntas frecuentes</h2>
        <div className="space-y-3">
          {FAQS.map(([q, a]) => (
            <details key={q} className="card p-5 group">
              <summary className="font-black text-text-primary cursor-pointer text-base">{q}</summary>
              <p className="mt-3 text-sm text-text-secondary leading-relaxed">{a}</p>
            </details>
          ))}
        </div>
      </section>
    </main>
  );
}
