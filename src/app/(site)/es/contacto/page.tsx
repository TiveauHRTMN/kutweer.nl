import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Contacto | WEERZONE Espana",
  description:
    "Contacta con el equipo de WEERZONE: prensa, prueba beta, integraciones para negocios o feedback sobre Juan, Reed y Steve.",
  alternates: {
    canonical: "https://weerzone.nl/es/contacto",
    languages: {
      "nl-NL": "https://weerzone.nl/contact",
      "de-DE": "https://weerzone.nl/de/kontakt",
      "fr-FR": "https://weerzone.nl/fr/contact",
      "es-ES": "https://weerzone.nl/es/contacto",
      "x-default": "https://weerzone.nl/contact",
    },
  },
  openGraph: {
    title: "Contacto | WEERZONE Espana",
    description: "Escribenos para prensa, beta y negocios.",
    type: "website",
    locale: "es_ES",
    url: "https://weerzone.nl/es/contacto",
    siteName: "WEERZONE",
  },
};

const CHANNELS = [
  {
    label: "Prensa y medios",
    text:
      "Materiales de marca, entrevistas con el equipo o referencias para reportajes sobre tiempo en Espana, DANA o calor extremo.",
    cta: { label: "info@weerzone.nl", href: "mailto:info@weerzone.nl?subject=Prensa%20WEERZONE%20Espana" },
  },
  {
    label: "Prueba beta",
    text:
      "Quieres acceso anticipado a Juan o Reed para tu ciudad o pueblo? Cuentanos en una linea desde donde escribes y como usas hoy el tiempo.",
    cta: { label: "Pedir beta", href: "mailto:info@weerzone.nl?subject=Beta%20WEERZONE%20Espana" },
  },
  {
    label: "Negocios (Steve)",
    text:
      "Restauracion, eventos, agricultura, logistica, deporte al aire libre. Si tu operativa depende del tiempo, Steve esta para eso.",
    cta: { label: "Hablar con Steve", href: "mailto:info@weerzone.nl?subject=Steve%20B2B%20Espana" },
  },
];

export default function ContactoPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-12 sm:py-16 space-y-8">
      <header className="space-y-3 max-w-2xl">
        <p className="text-[10px] font-black uppercase tracking-[0.25em] text-amber-700">
          Contacto
        </p>
        <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-text-primary leading-[1.05]">
          Aqui contesta una persona, no un bot.
        </h1>
        <p className="text-lg text-text-secondary leading-relaxed">
          WEERZONE es un equipo pequeno con base en los Paises Bajos. Para Espana escribimos en
          castellano y contestamos en horario laboral europeo. Sin colas, sin formularios eternos.
        </p>
      </header>

      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {CHANNELS.map((channel) => (
          <div key={channel.label} className="card p-5 sm:p-6 flex flex-col gap-3">
            <p className="text-[11px] font-black uppercase tracking-widest text-amber-700">
              {channel.label}
            </p>
            <p className="text-sm text-text-secondary leading-relaxed flex-1">{channel.text}</p>
            <a href={channel.cta.href} className="text-sm font-black text-text-primary underline decoration-amber-500 decoration-2 underline-offset-4">
              {channel.cta.label}
            </a>
          </div>
        ))}
      </section>

      <section className="card p-6 sm:p-8 space-y-3">
        <h2 className="text-2xl font-black text-text-primary tracking-tight">Direccion directa</h2>
        <p className="text-base text-text-secondary leading-relaxed">
          Cualquier cosa que no encaje en lo anterior:{" "}
          <a href="mailto:info@weerzone.nl" className="underline decoration-slate-300 hover:decoration-slate-900">
            info@weerzone.nl
          </a>
          . Tambien puedes mirar nuestras paginas de{" "}
          <Link href="/es/sobre-nosotros" className="underline decoration-slate-300 hover:decoration-slate-900">
            sobre nosotros
          </Link>{" "}
          o{" "}
          <Link href="/es/precios" className="underline decoration-slate-300 hover:decoration-slate-900">
            precios
          </Link>{" "}
          si tu pregunta es de antes de empezar.
        </p>
      </section>
    </main>
  );
}
