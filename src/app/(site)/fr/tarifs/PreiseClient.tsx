"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, BellRing, BriefcaseBusiness, Check, CloudSun, ShieldCheck } from "lucide-react";
import WeatherDashboard from "@/components/WeatherDashboard";
import { PERSONAS, formatPrice, type PersonaTier } from "@/lib/personas";
import type { City, WeatherData } from "@/lib/types";

const VISIBLE_TIERS: PersonaTier[] = ["piet", "reed", "steve"];
const HIGHLIGHT: PersonaTier = "reed";
const UNAVAILABLE: PersonaTier[] = ["steve"];

interface Props {
  userTier: PersonaTier | null;
  isFounder: boolean;
  initialCity?: City;
  initialWeather?: WeatherData;
}

const FAQS: Array<[string, string]> = [
  ["Pourquoi est-ce gratuit en ce moment ?", "WEERZONE est en phase bêta. Vous pouvez tester Piet et Reed sans carte bancaire, ce qui nous aide à améliorer le produit avec de vrais utilisateurs."],
  ["Quelle est la différence entre Piet et Reed ?", "Piet fournit une interprétation météo quotidienne. Reed ajoute des alertes personnelles lorsque le vent, la pluie, les orages, la chaleur ou le gel dépassent vos seuils."],
  ["Puis-je changer plus tard ?", "Oui. Vous pouvez passer à l'offre supérieure ou inférieure à tout moment. Vous n'êtes engagé à rien pendant la bêta."],
  ["Pourquoi 48 heures à l'avance ?", "Parce que cette période est utile pour prendre de vraies décisions. Plus loin dans le futur donne souvent une direction, mais pas de planification fiable."],
];

const FR_PERSONA_COPY: Record<PersonaTier, { tagline: string; description: string; audience: string; features: string[] }> = {
  piet: {
    tagline: "Votre assistant météo local.",
    description:
      "Piet vous envoie un court e-mail chaque matin avant 7 h : l'évolution de la météo aujourd'hui et demain à votre adresse précise.",
    audience: "Pour tous ceux qui veulent savoir en une minute ce que la journée leur réserve sur le plan météorologique.",
    features: [
      "Chaque matin avant 7 h dans votre boîte de réception",
      "Pour votre adresse exacte (hyperlocal, résolution 1 km)",
      "Vous décidez de ce dont Piet tient compte : vélo, jardin, enfants, chien",
      "Tableau de bord avec évolution horaire",
      "Pas de publicité, pas de traçage, pas de bannières de cookies",
    ],
  },
  reed: {
    tagline: "Une alerte lorsque la météo franchit vos limites.",
    description:
      "Reed vous envoie un message uniquement lorsque la météo franchit votre seuil. Pour le reste, il vous laisse tranquille.",
    audience: "Pour les familles et les propriétaires qui ne veulent pas être alertés à la moindre averse.",
    features: [
      "Tout ce que Piet envoie",
      "Alerte selon vos propres seuils (vent, pluie, gel, orages)",
      "Vous indiquez ce qui est sensible : cave, toit plat, animaux en plein air",
      "E-mail et notification push — sélectionnable par catégorie",
      "A posteriori : l'alerte était-elle correcte ? Consultable pour chaque alerte",
    ],
  },
  steve: {
    tagline: "La météo, traduite en décision commerciale.",
    description:
      "Steve lit la météo 48 heures à l'avance et la traduit en ce qu'elle signifie pour votre entreprise : ouvrir, fermer, acheter ou annuler.",
    audience: "Bar de plage, restauration, couvreur, paysagiste, construction, événements.",
    features: [
      "E-mail professionnel quotidien + tableau de bord en direct",
      "48 heures à l'avance par blocs de 2 heures, par lieu",
      "Valeurs seuils par établissement : vent, pluie, température, orages",
      "Propositions d'achats et de personnel par jour",
      "Précision mesurable par lieu",
      "Plusieurs adresses et établissements simultanément",
    ],
  },
  karl: {
    tagline: "",
    description: "",
    audience: "",
    features: [],
  },
};

const TIER_META: Record<PersonaTier, { icon: React.ReactNode; accent: string; soft: string; href: string }> = {
  piet: {
    icon: <CloudSun className="h-5 w-5" />,
    accent: "#22c55e",
    soft: "rgba(34,197,94,0.10)",
    href: "/app/signup?tier=piet&lang=fr",
  },
  reed: {
    icon: <BellRing className="h-5 w-5" />,
    accent: "#ef4444",
    soft: "rgba(239,68,68,0.10)",
    href: "/app/signup?tier=reed&lang=fr",
  },
  steve: {
    icon: <BriefcaseBusiness className="h-5 w-5" />,
    accent: "#3b7ff0",
    soft: "rgba(59,127,240,0.12)",
    href: "/fr/a-propos#steve",
  },
  karl: {
    icon: <CloudSun className="h-5 w-5" />,
    accent: "#22c55e",
    soft: "rgba(34,197,94,0.10)",
    href: "/app/signup?tier=karl",
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
      locale="fr"
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
          Vers le tableau de bord <ArrowRight className="h-4 w-4" />
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
        label="Fondateur"
        title="Vous avez un accès complet."
        body="En tant que fondateur, vous avez un accès complet à tout ce que WEERZONE a à offrir."
        href="/app"
        initialCity={initialCity}
        initialWeather={initialWeather}
      />
    );
  }

  if (userTier === "reed" || userTier === "steve" || userTier === "piet") {
    const p = PERSONAS[userTier];
    const fr = FR_PERSONA_COPY[userTier];
    return (
      <StatusPage
        label="Abonnement actif"
        title={`Vous êtes abonné à ${p.name}.`}
        body={`${fr.tagline} Tout est prêt.`}
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
            Accès Bêta
          </div>
          <h1 className="mx-auto max-w-xl text-3xl font-black leading-tight tracking-tight text-text-primary sm:text-4xl">
            Choisissez l'assistant météo qui correspond à votre journée.
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-text-secondary">
            Piet pour une interprétation quotidienne, Reed pour des alertes sur vos seuils et Steve pour des décisions commerciales.
          </p>
          <div className="mt-6 grid gap-2 sm:grid-cols-3">
            {["Pas de carte bancaire", "Sans publicité", "48 heures à l'avance"].map((item) => (
              <span key={item} className="rounded-2xl bg-slate-50 px-3 py-3 text-xs font-black text-slate-700">
                {item}
              </span>
            ))}
          </div>
        </div>

        <div>
          <div className="mb-4 flex flex-col gap-2 px-1">
            <p className="text-[10px] font-black uppercase tracking-[0.24em] text-white/70">Abonnements</p>
            <h2 className="text-2xl font-black tracking-tight text-white">Piet, Reed et Steve côte à côte.</h2>
            <p className="text-xs font-bold leading-5 text-white/65">
              Pendant la bêta, vous commencez gratuitement. Après la bêta, vous verrez le prix mensuel à l'avance.
            </p>
          </div>

          <div className="grid gap-4">
            {VISIBLE_TIERS.map((tier) => (
              <TierCard key={tier} tier={tier} />
            ))}
          </div>
        </div>

        <div className="card p-6 sm:p-7">
          <h2 className="mb-4 text-xl font-black tracking-tight text-text-primary">Questions fréquentes</h2>
          <FAQ items={FAQS} />
        </div>
      </section>
    </PageShell>
  );
}

function TierCard({ tier }: { tier: PersonaTier }) {
  const p = PERSONAS[tier];
  const fr = FR_PERSONA_COPY[tier];
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
            Populaire
          </span>
        )}
        {unavailable && (
          <span className="rounded-full bg-slate-100 px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-slate-500">
            Bientôt
          </span>
        )}
      </div>

      <p className="min-h-[72px] text-sm font-semibold leading-6 text-text-secondary">{fr.description}</p>

      <div className="my-5 rounded-3xl border border-slate-100 bg-slate-50 p-5">
        {unavailable ? (
          <>
            <p className="text-3xl font-black text-text-primary">{formatPrice(p.priceCents!)}</p>
            <p className="mt-1 text-xs font-bold text-text-muted">par mois, plus tard en 2026</p>
          </>
        ) : (
          <>
            <p className="text-3xl font-black text-text-primary">Gratuit</p>
            <p className="mt-1 text-xs font-bold text-text-muted">en bêta, puis {formatPrice(p.priceCents!)}/mois</p>
          </>
        )}
      </div>

      <Link
        href={unavailable ? meta.href : `/app/signup?tier=${tier}&lang=fr`}
        className={`btn btn-block btn-lg mb-6 ${highlighted ? "btn-primary" : "btn-ghost"}`}
        style={highlighted ? { background: meta.accent, boxShadow: `0 14px 32px ${meta.accent}33` } : undefined}
      >
        {unavailable ? "Voir plus" : "Commencer gratuitement"}
        <ArrowRight className="h-4 w-4" />
      </Link>

      <ul className="space-y-3">
        {fr.features.map((feature) => (
          <li key={feature} className="flex gap-3 text-sm font-semibold leading-5 text-text-secondary">
            <Check className="mt-0.5 h-4 w-4 shrink-0" style={{ color: meta.accent }} />
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      <p className="mt-auto pt-6 text-xs font-bold leading-5 text-text-muted">{fr.audience}</p>
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
