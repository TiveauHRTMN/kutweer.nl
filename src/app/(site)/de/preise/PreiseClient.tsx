"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, BellRing, BriefcaseBusiness, Check, CloudSun, ShieldCheck } from "lucide-react";
import WeatherDashboard from "@/components/WeatherDashboard";
import { PERSONAS, formatPrice, type PersonaTier, PERSONA_ORDER_DE } from "@/lib/personas";
import type { City, WeatherData } from "@/lib/types";

const VISIBLE_TIERS: PersonaTier[] = PERSONA_ORDER_DE;
const HIGHLIGHT: PersonaTier = "reed";
const UNAVAILABLE: PersonaTier[] = ["steve"];

interface Props {
  userTier: PersonaTier | null;
  isFounder: boolean;
  initialCity?: City;
  initialWeather?: WeatherData;
}

const FAQS: Array<[string, string]> = [
  ["Warum ist es jetzt kostenlos?", "WEERZONE ist in der Beta-Phase. Du kannst Karl und Reed ohne Kreditkarte testen, damit wir das Produkt mit echten Nutzern verbessern können."],
  ["Was ist der Unterschied zwischen Karl und Reed?", "Karl liefert die tägliche Wetterdeutung. Reed ergänzt persönliche Warnungen, wenn Wind, Regen, Gewitter, Hitze oder Frost über deine Schwelle geht."],
  ["Kann ich später wechseln?", "Ja. Du kannst jederzeit upgraden oder downgraden. In der Beta bist du an nichts gebunden."],
  ["Warum 48 Stunden voraus?", "Weil dieser Zeitraum für echte Entscheidungen brauchbar ist. Weiter in die Zukunft gibt oft Richtung, aber keine Planung."],
];

const DE_PERSONA_COPY: Record<PersonaTier, { tagline: string; description: string; audience: string; features: string[] }> = {
  karl: {
    tagline: "Dein lokaler Wetterassistent für Deutschland.",
    description:
      "Karl schickt dir jeden Morgen vor 7 Uhr eine kurze Mail: Was das Wetter heute und morgen an deiner genauen Adresse macht.",
    audience: "Für alle, die morgens in einer Minute wissen wollen, was der Tag meteorologisch bringt.",
    features: [
      "Jeden Morgen vor 7 Uhr in deinem Posteingang",
      "Für deine genaue Adresse (hyperlokal, 1 km Auflösung)",
      "Du bestimmst, was Karl berücksichtigt: Fahrrad, Garten, Kinder, Hund",
      "Dashboard mit stündlichem Verlauf",
      "Keine Werbung, kein Tracking, keine Cookie-Banner",
    ],
  },
  reed: {
    tagline: "Warnung, wenn das Wetter deine Grenze überschreitet.",
    description:
      "Reed schickt nur eine Nachricht, wenn das Wetter durch deine Schwelle geht. Bei allem anderen lässt er dich in Ruhe.",
    audience: "Für Familien und Hauseigentümer, die nicht bei jedem Schauer benachrichtigt werden wollen.",
    features: [
      "Alles, was Karl auch schickt",
      "Warnung auf deiner Schwelle (Wind, Regen, Frost, Gewitter)",
      "Du gibst an, was empfindlich ist: Keller, Flachdach, Tiere im Freien",
      "E-Mail und Push — pro Kategorie wählbar",
      "Nachträglich: hat die Warnung gestimmt? Pro Alert einsehbar",
    ],
  },
  steve: {
    tagline: "Wetter, übersetzt in eine Geschäftsentscheidung.",
    description:
      "Steve liest das Wetter 48 Stunden voraus und übersetzt es in das, was es für dein Unternehmen bedeutet: öffnen, schließen, einkaufen oder absagen.",
    audience: "Strandbar, Gastronomie, Dachdecker, Gartenbauer, Bau, Events.",
    features: [
      "Tägliche Business-Mail + Live-Dashboard",
      "48 Stunden voraus in 2-Stunden-Blöcken, pro Standort",
      "Schwellenwerte pro Filiale: Wind, Regen, Temperatur, Gewitter",
      "Einkaufs- und Personalvorschläge pro Tag",
      "Messbare Genauigkeit pro Standort",
      "Mehrere Adressen und Filialen gleichzeitig",
    ],
  },
  // piet bestaat in PersonaTier-type maar wordt op DE niet getoond
  piet: {
    tagline: "",
    description: "",
    audience: "",
    features: [],
  },
};

const TIER_META: Record<PersonaTier, { icon: React.ReactNode; accent: string; soft: string; href: string }> = {
  karl: {
    icon: <CloudSun className="h-5 w-5" />,
    accent: "#22c55e",
    soft: "rgba(34,197,94,0.10)",
    href: "/app/signup?tier=karl&lang=de",
  },
  reed: {
    icon: <BellRing className="h-5 w-5" />,
    accent: "#ef4444",
    soft: "rgba(239,68,68,0.10)",
    href: "/app/signup?tier=reed&lang=de",
  },
  steve: {
    icon: <BriefcaseBusiness className="h-5 w-5" />,
    accent: "#3b7ff0",
    soft: "rgba(59,127,240,0.12)",
    href: "/de/uber-uns#steve",
  },
  piet: {
    icon: <CloudSun className="h-5 w-5" />,
    accent: "#22c55e",
    soft: "rgba(34,197,94,0.10)",
    href: "/app/signup?tier=piet",
  },
};

function PageShell({ children, initialCity, initialWeather }: {
  children: React.ReactNode;
  initialCity?: City;
  initialWeather?: WeatherData;
}) {
  return (
    <WeatherDashboard
      hideWeatherInfo
      initialCity={initialCity}
      initialWeather={initialWeather}
      locale="de"
      beforeFooter={children}
    />
  );
}

function StatusPage({
  label,
  title,
  body,
  href,
  initialCity,
  initialWeather,
}: {
  label: string;
  title: string;
  body: string;
  href: string;
  initialCity?: City;
  initialWeather?: WeatherData;
}) {
  return (
    <PageShell initialCity={initialCity} initialWeather={initialWeather}>
      <section className="card p-7 text-center">
        <p className="mb-3 text-[10px] font-black uppercase tracking-[0.24em] text-blue-600">{label}</p>
        <h1 className="mb-3 text-2xl font-black tracking-tight text-text-primary">{title}</h1>
        <p className="mb-6 text-sm leading-6 text-text-secondary">{body}</p>
        <Link href={href} className="btn btn-primary btn-block">
          Zum Dashboard <ArrowRight className="h-4 w-4" />
        </Link>
      </section>
    </PageShell>
  );
}

export default function PreiseClient({
  userTier,
  isFounder,
  initialCity,
  initialWeather,
}: Props) {
  if (isFounder) {
    return (
      <StatusPage
        label="Founder"
        title="Du hast vollen Zugriff."
        body="Als Founder hast du vollen Zugriff auf alles, was WEERZONE zu bieten hat."
        href="/app"
        initialCity={initialCity}
        initialWeather={initialWeather}
      />
    );
  }

  if (userTier === "reed" || userTier === "steve") {
    const p = PERSONAS[userTier];
    const de = DE_PERSONA_COPY[userTier];
    return (
      <StatusPage
        label="Aktives Abo"
        title={`Du bist ${p.name}-Abonnent.`}
        body={`${de.tagline} Alles steht bereit.`}
        href="/app"
        initialCity={initialCity}
        initialWeather={initialWeather}
      />
    );
  }

  return (
    <PageShell initialCity={initialCity} initialWeather={initialWeather}>
      <section className="space-y-5">
        <div className="card p-7 sm:p-9 text-center">
          <div className="mx-auto mb-5 inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-blue-600">
            <ShieldCheck className="h-3.5 w-3.5" />
            Beta-Zugang
          </div>
          <h1 className="mx-auto max-w-xl text-3xl font-black leading-tight tracking-tight text-text-primary sm:text-4xl">
            Wähle die Wetterhilfe, die zu deinem Tag passt.
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-text-secondary">
            Karl für tägliche Deutung, Reed für Warnungen auf deinen Schwellen und Steve für geschäftliche Entscheidungen.
          </p>
          <div className="mt-6 grid gap-2 sm:grid-cols-3">
            {["Keine Kreditkarte", "Werbefrei", "48 Stunden voraus"].map((item) => (
              <span key={item} className="rounded-2xl bg-slate-50 px-3 py-3 text-xs font-black text-slate-700">
                {item}
              </span>
            ))}
          </div>
        </div>

        <div>
          <div className="mb-4 flex flex-col gap-2 px-1">
            <p className="text-[10px] font-black uppercase tracking-[0.24em] text-white/70">Abos</p>
            <h2 className="text-2xl font-black tracking-tight text-white">Karl, Reed und Steve nebeneinander.</h2>
            <p className="text-xs font-bold leading-5 text-white/65">
              Während der Beta startest du kostenlos. Nach der Beta siehst du den Monatspreis vorab.
            </p>
          </div>

          <div className="grid gap-4">
            {VISIBLE_TIERS.map((tier) => (
              <TierCard key={tier} tier={tier} />
            ))}
          </div>
        </div>

        <div className="card p-6 sm:p-7">
          <h2 className="mb-4 text-xl font-black tracking-tight text-text-primary">Häufig gestellte Fragen</h2>
          <FAQ items={FAQS} />
        </div>
      </section>
    </PageShell>
  );
}

function TierCard({ tier }: { tier: PersonaTier }) {
  const p = PERSONAS[tier];
  const de = DE_PERSONA_COPY[tier];
  const meta = TIER_META[tier];
  const highlighted = tier === HIGHLIGHT;
  const unavailable = UNAVAILABLE.includes(tier);

  return (
    <article
      className={`card flex min-h-[560px] flex-col p-6 sm:p-7 ${
        highlighted ? "ring-4 ring-white/80" : ""
      } ${unavailable ? "opacity-85" : ""}`}
    >
      <div className="mb-5 flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div
            className="flex h-11 w-11 items-center justify-center rounded-2xl"
            style={{ background: meta.soft, color: meta.accent }}
          >
            {meta.icon}
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted">{p.label}</p>
            <h3 className="text-3xl font-black tracking-tight text-text-primary">{p.name}</h3>
          </div>
        </div>
        {highlighted && (
          <span className="rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-white" style={{ background: meta.accent }}>
            Beliebt
          </span>
        )}
        {unavailable && (
          <span className="rounded-full bg-slate-100 px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-slate-500">
            Demnächst
          </span>
        )}
      </div>

      <p className="min-h-[72px] text-sm font-semibold leading-6 text-text-secondary">{de.description}</p>

      <div className="my-5 rounded-3xl border border-slate-100 bg-slate-50 p-5">
        {unavailable ? (
          <>
            <p className="text-3xl font-black text-text-primary">{formatPrice(p.priceCents!)}</p>
            <p className="mt-1 text-xs font-bold text-text-muted">pro Monat, später in 2026</p>
          </>
        ) : (
          <>
            <p className="text-3xl font-black text-text-primary">Kostenlos</p>
            <p className="mt-1 text-xs font-bold text-text-muted">in der Beta, danach {formatPrice(p.priceCents!)}/Monat</p>
          </>
        )}
      </div>

      <Link
        href={unavailable ? meta.href : `/app/signup?tier=${tier}&lang=de`}
        className={`btn btn-block btn-lg mb-6 ${highlighted ? "btn-primary" : "btn-ghost"}`}
        style={highlighted ? { background: meta.accent, boxShadow: `0 14px 32px ${meta.accent}33` } : undefined}
      >
        {unavailable ? "Mehr ansehen" : "Kostenlos starten"}
        <ArrowRight className="h-4 w-4" />
      </Link>

      <ul className="space-y-3">
        {de.features.map((feature) => (
          <li key={feature} className="flex gap-3 text-sm font-semibold leading-5 text-text-secondary">
            <Check className="mt-0.5 h-4 w-4 shrink-0" style={{ color: meta.accent }} />
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      <p className="mt-auto pt-6 text-xs font-bold leading-5 text-text-muted">{de.audience}</p>
    </article>
  );
}

function FAQ({ items }: { items: Array<[string, string]> }) {
  const [open, setOpen] = useState(0);
  return (
    <div className="divide-y divide-slate-100">
      {items.map(([question, answer], index) => (
        <div key={question}>
          <button
            type="button"
            onClick={() => setOpen(open === index ? -1 : index)}
            className="flex w-full items-center justify-between gap-4 py-4 text-left"
          >
            <span className="text-sm font-black text-text-primary">{question}</span>
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-100 text-lg font-black text-text-muted">
              {open === index ? "-" : "+"}
            </span>
          </button>
          {open === index && (
            <p className="pb-4 text-sm leading-6 text-text-secondary">{answer}</p>
          )}
        </div>
      ))}
    </div>
  );
}
