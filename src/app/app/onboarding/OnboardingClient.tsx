"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Check, Loader2, MapPin } from "lucide-react";
import {
  PERSONAS,
  PERSONA_ORDER,
  formatPrice,
  type PersonaTier,
} from "@/lib/personas";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { sendWelcomeEmail, sendBrandedMagicLink } from "@/app/actions";

type Step = "tier" | "auth" | "sent" | "profile";

// ---------- Persona-specifieke prefs ----------

interface PietPrefs {
  hondNaam: string;
  fiets: boolean;
  tuin: boolean;
  kinderen: boolean;
  astma: boolean;
}
interface ReedPrefs {
  kelderGevoelig: boolean;
  platDak: boolean;
  baby: boolean;
  paardWei: boolean;
  waterschadeHistorie: string;
}
interface StevePrefs {
  branche: string;
  capaciteit: string;
  windBft: string;
  regenMm: string;
  tempMin: string;
  onweer: boolean;
  inkoopUur: string;
  annuleringUur: string;
}

const EMPTY_PIET: PietPrefs = {
  hondNaam: "",
  fiets: false,
  tuin: false,
  kinderen: false,
  astma: false,
};
const EMPTY_REED: ReedPrefs = {
  kelderGevoelig: false,
  platDak: false,
  baby: false,
  paardWei: false,
  waterschadeHistorie: "",
};
const EMPTY_STEVE: StevePrefs = {
  branche: "",
  capaciteit: "",
  windBft: "6",
  regenMm: "2",
  tempMin: "5",
  onweer: true,
  inkoopUur: "14",
  annuleringUur: "16",
};

export default function OnboardingClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);

  const queryTier = searchParams.get("tier") as PersonaTier | null;
  const errorParam = searchParams.get("error");

  const [tier, setTier] = useState<PersonaTier | null>(
    queryTier && PERSONA_ORDER.includes(queryTier) ? queryTier : null,
  );
  const [step, setStep] = useState<Step>(tier ? "auth" : "tier");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(
    errorParam === "auth" ? "Inloglink ongeldig of verlopen. Probeer opnieuw." : null,
  );
  const [checkingSession, setCheckingSession] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  // Profile-step state
  const [fullName, setFullName] = useState("");
  const [postcode, setPostcode] = useState("");
  const [gpsCoords, setGpsCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [gpsStatus, setGpsStatus] = useState<"idle" | "asking" | "ok" | "denied">("idle");
  const [pietPrefs, setPietPrefs] = useState<PietPrefs>(EMPTY_PIET);
  const [reedPrefs, setReedPrefs] = useState<ReedPrefs>(EMPTY_REED);
  const [stevePrefs, setStevePrefs] = useState<StevePrefs>(EMPTY_STEVE);

  // On mount: session-check
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await supabase.auth.getUser();
      if (cancelled) return;
      if (!data.user) {
        setCheckingSession(false);
        return;
      }
      
      const user = data.user;
      setUserId(user.id);
      setEmail(user.email ?? "");

      // NIEUWE ROBUUSTE LOGICA: Check LocalStorage voor "pending" data
      const pendingRaw = localStorage.getItem("pending_onboarding");
      let pendingData = null;
      try { pendingData = pendingRaw ? JSON.parse(pendingRaw) : null; } catch (e) { console.error(e); }

      // Check ook metadata als fallback
      const meta = user.user_metadata;
      const metaTier = (pendingData?.chosen_tier || meta?.chosen_tier) as PersonaTier | null;
      
      // Actieve subscriptions ophalen
      const { data: subs } = await supabase
        .from("subscriptions")
        .select("tier, status")
        .eq("user_id", user.id)
        .in("status", ["trialing", "active"]);

      const activeSubs = subs || [];
      const tierRanking: Record<string, number> = { steve: 3, reed: 2, piet: 1, free: 0 };
      const bestSub = activeSubs.sort((a, b) => (tierRanking[b.tier] ?? 0) - (tierRanking[a.tier] ?? 0))[0];

      // FLOW: Hebben we pending data die nog verwerkt moet worden?
      if (metaTier && !activeSubs.some(s => s.tier === metaTier)) {
        setLoading(true);
        try {
          // Gegevens ophalen uit localStorage (voorkeur) of metadata
          const fullNameMeta = pendingData?.full_name || meta?.full_name || "";
          const postcodeMeta = pendingData?.postcode || meta?.postcode || "";
          const latMeta = pendingData?.lat || meta?.lat;
          const lonMeta = pendingData?.lon || meta?.lon;
          const prefsMeta = pendingData?.prefs || meta?.prefs || {};

          // 1. Abonnement
          await createSubscription(metaTier, user.id, user.email ?? "");
          
          // 2. Profiel & Locatie
          await supabase.from("user_profile").upsert({
            id: user.id,
            email: user.email ?? "",
            full_name: fullNameMeta,
            postcode: postcodeMeta,
            primary_lat: latMeta,
            primary_lon: lonMeta,
          });

          if (latMeta && lonMeta) {
            await supabase.from("user_locations").insert({
              user_id: user.id,
              label: "Thuis",
              lat: latMeta,
              lon: lonMeta,
              is_primary: true,
              persona_scope: [metaTier],
            });
          }

          // 3. Prefs
          await supabase.from("persona_preferences").upsert({
            user_id: user.id,
            persona: metaTier,
            prefs: prefsMeta,
            onboarding_stage: 1,
          });

          // Klaar! Opschonen en vliegen.
          localStorage.removeItem("pending_onboarding");
          router.replace("/app");
          return;
        } catch (err: any) {
          console.error("Auto-onboarding failed:", err);
          setError("Automatische activatie mislukt. Probeer het formulier hieronder.");
        } finally {
          setLoading(false);
        }
      }

      const activeTier = (metaTier || (bestSub?.tier ?? null)) as PersonaTier | null;

      if (activeTier) {
        setTier(activeTier);
        const { data: prefs } = await supabase
          .from("persona_preferences")
          .select("onboarding_stage")
          .eq("user_id", user.id)
          .eq("persona", activeTier)
          .maybeSingle();

        if (prefs && prefs.onboarding_stage >= 1) {
          router.replace("/app");
          return;
        }
        
        // Als we wel een sub hebben maar geen prefs: toon formulier
        setStep("auth"); // Nu "details" step
        setCheckingSession(false);
        return;
      }

      setStep("tier");
      setCheckingSession(false);
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function createSubscription(chosen: PersonaTier, uid: string, userEmail: string) {
    // Gebruik upsert om conflicten met gecancelde subs te voorkomen
    const trialEnd = new Date("2026-06-01T00:00:00+02:00").toISOString();
    const founderPrice = PERSONAS[chosen].founderPriceCents;
    
    // Check first if there's already an active one to avoid double welcome emails
    const { data: existing } = await supabase
      .from("subscriptions")
      .select("id")
      .eq("user_id", uid)
      .eq("tier", chosen)
      .in("status", ["trialing", "active"])
      .maybeSingle();
      
    if (existing) return;

    const { error: subError } = await supabase.from("subscriptions").insert({
      user_id: uid,
      tier: chosen,
      status: "trialing",
      trial_end: trialEnd,
      is_founder: true,
      founder_price_cents: founderPrice,
    });

    if (subError) {
      // Als de fout is dat het al bestaat (23505), dan is dat prima
      if (subError.code === "23505") {
        console.log("Subscription already exists, continuing...");
      } else {
        console.error("Subscription create failed:", subError);
        throw new Error(`Abonnement aanmaken mislukt: ${subError.message}`);
      }
    }

    // Stuur de branded welkomstmail via Resend
    if (userEmail) {
      await sendWelcomeEmail(userEmail, chosen);
    }
  }

  // ---------- Magic link + OAuth ----------

  async function handleUnifiedSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!tier || !email) return;
    setLoading(true);
    setError(null);

    const prefs = prefsForTier(tier);

    if (userId) {
      // Ingelogd: Direct opslaan
      try {
        await createSubscription(tier, userId, email);
        await supabase.from("user_profile").upsert({
          id: userId,
          email,
          full_name: fullName.trim(),
          postcode: postcode.trim().toUpperCase(),
          primary_lat: gpsCoords?.lat,
          primary_lon: gpsCoords?.lon,
        });
        await supabase.from("persona_preferences").upsert({
          user_id: userId,
          persona: tier,
          prefs,
          onboarding_stage: 1,
        });
        router.replace("/app");
      } catch (err: any) {
        setError(err.message);
        setLoading(false);
      }
    } else {
      // Niet ingelogd: Gegevens EERST lokaal opslaan (voor robuustheid)
      const dataToSave = {
        chosen_tier: tier,
        full_name: fullName.trim(),
        postcode: postcode.trim().toUpperCase(),
        lat: gpsCoords?.lat,
        lon: gpsCoords?.lon,
        prefs,
      };
      localStorage.setItem("pending_onboarding", JSON.stringify(dataToSave));

      // NIEUW: Branded mail sturen via Server Action (Resend) i.p.v. Supabase Auto-mail
      try {
        console.log("Starting branded magic link flow for:", email);
        await sendBrandedMagicLink(email, tier, fullName.trim());
        setLoading(false);
        setStep("sent");
      } catch (err: any) {
        console.error("Magic link error:", err);
        setError(`E-mail verzenden mislukt: ${err.message}`);
        setLoading(false);
      }
    }
  }

  async function handleGoogleOAuth() {
    if (!tier) return;
    setLoading(true);
    const redirectTo = `${window.location.origin}/auth/callback?next=/app/onboarding&tier=${tier}`;
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo },
    });
    if (oauthError) {
      // Supabase geeft "Unsupported provider" als Google in dashboard niet aanstaat.
      const msg = oauthError.message.toLowerCase();
      if (msg.includes("provider") || msg.includes("unsupported")) {
        setError(
          "Google-login is nog niet actief. Gebruik tijdelijk je e-mailadres — je bent in 30 seconden ingelogd.",
        );
      } else {
        setError(oauthError.message);
      }
      setLoading(false);
    }
  }

  // ---------- GPS ----------

  function captureGps() {
    if (!("geolocation" in navigator)) {
      setGpsStatus("denied");
      return;
    }
    // Veiligheidstimer: als de browser nooit reageert (bijv. op Windows met locatie uit)
    const safety = setTimeout(() => {
      setGpsStatus((current) => (current === "asking" ? "denied" : current));
    }, 12000);

    try {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          clearTimeout(safety);
          setGpsCoords({ lat: pos.coords.latitude, lon: pos.coords.longitude });
          setGpsStatus("ok");
        },
        (err) => {
          console.error("GPS Error:", err);
          clearTimeout(safety);
          setGpsStatus("denied");
        },
        { enableHighAccuracy: false, timeout: 10000, maximumAge: 60 * 60 * 1000 },
      );
    } catch (err) {
      console.error("GPS Exception:", err);
      clearTimeout(safety);
      setGpsStatus("denied");
    }
  }

  // ---------- Submit profiel ----------

  function prefsForTier(t: PersonaTier): Record<string, unknown> {
    if (t === "piet") {
      return {
        hond: pietPrefs.hondNaam ? { naam: pietPrefs.hondNaam.trim() } : null,
        fiets: pietPrefs.fiets,
        tuin: pietPrefs.tuin,
        kinderen: pietPrefs.kinderen,
        astma: pietPrefs.astma,
      };
    }
    if (t === "reed") {
      return {
        kelder_gevoelig: reedPrefs.kelderGevoelig,
        plat_dak: reedPrefs.platDak,
        baby: reedPrefs.baby,
        paard_wei: reedPrefs.paardWei,
        waterschade_historie: reedPrefs.waterschadeHistorie || null,
      };
    }
    return {
      branche: stevePrefs.branche || null,
      capaciteit: stevePrefs.capaciteit ? Number(stevePrefs.capaciteit) : null,
      drempels: {
        wind_bft: Number(stevePrefs.windBft) || 6,
        regen_mm: Number(stevePrefs.regenMm) || 2,
        temp_min: Number(stevePrefs.tempMin) || 5,
        onweer: stevePrefs.onweer,
      },
      deadlines: {
        inkoop_uur: Number(stevePrefs.inkoopUur) || 14,
        annulering_uur: Number(stevePrefs.annuleringUur) || 16,
      },
    };
  }

  async function handleSubmitProfile(e: React.FormEvent) {
    e.preventDefault();
    if (!tier || !userId) return;
    setLoading(true);
    setError(null);

    try {
      // user_profile upsert
      const { data: userData } = await supabase.auth.getUser();
      const userEmail = userData.user?.email ?? "";
      await supabase.from("user_profile").upsert(
        {
          id: userId,
          email: userEmail,
          full_name: fullName.trim() || null,
          postcode: postcode.trim().toUpperCase() || null,
          primary_lat: gpsCoords?.lat ?? null,
          primary_lon: gpsCoords?.lon ?? null,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "id" },
      );

      // user_locations: primary locatie als GPS bekend (geen unique constraint →
      // eerst bestaande primary weghalen, dan opnieuw invoegen)
      if (gpsCoords) {
        await supabase
          .from("user_locations")
          .delete()
          .eq("user_id", userId)
          .eq("is_primary", true);
        await supabase.from("user_locations").insert({
          user_id: userId,
          label: "Thuis",
          lat: gpsCoords.lat,
          lon: gpsCoords.lon,
          is_primary: true,
          persona_scope: [tier],
        });
      }

      // persona_preferences upsert
      await supabase.from("persona_preferences").upsert(
        {
          user_id: userId,
          persona: tier,
          prefs: prefsForTier(tier),
          onboarding_stage: 1,
          last_updated: new Date().toISOString(),
        },
        { onConflict: "user_id,persona" },
      );

      router.replace("/app");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Opslaan mislukt");
      setLoading(false);
    }
  }

  // ---------- Render ----------

  if (checkingSession) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-white" />
      </main>
    );
  }

  return (
    <main className="min-h-screen py-12 px-4 bg-[#4a9ee8] text-white">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-black text-white drop-shadow mb-2">
            {step === "sent" && "Check je inbox"}
            {step === "tier" && "Kies je abonnement"}
            {step === "auth" && "Even vastleggen"}
            {step === "profile" && tier && (
              <>
                Hoi — ik ben{" "}
                <span style={{ color: PERSONAS[tier].color }}>
                  {PERSONAS[tier].name}
                </span>
              </>
            )}
          </h1>
        </div>

        {step === "tier" && (
          <TierGrid
            onPick={async (t) => {
              setTier(t);
              if (userId) {
                // User is al ingelogd: subscription aanmaken en direct naar profiel
                setLoading(true);
                try {
                  await createSubscription(t, userId, email);
                  setStep("profile");
                } catch (err: any) {
                  setError(err.message);
                } finally {
                  setLoading(false);
                }
              } else {
                setStep("auth");
              }
            }}
          />
        )}

        {step === "auth" && tier && (
          <UnifiedForm
            tier={tier}
            email={email}
            setEmail={setEmail}
            fullName={fullName}
            setFullName={setFullName}
            postcode={postcode}
            setPostcode={setPostcode}
            gpsStatus={gpsStatus}
            onGps={captureGps}
            gpsCoords={gpsCoords}
            piet={pietPrefs}
            setPiet={setPietPrefs}
            reed={reedPrefs}
            setReed={setReedPrefs}
            steve={stevePrefs}
            setSteve={setStevePrefs}
            loading={loading}
            error={error}
            onSubmit={handleUnifiedSubmit}
            onBack={() => { setStep("tier"); }}
          />
        )}

        {step === "sent" && <SentCard email={email} tier={tier} />}
      </div>
    </main>
  );
}

// ============================================================
// Sub-components
// ============================================================

function TierGrid({ onPick }: { onPick: (t: PersonaTier) => void }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {PERSONA_ORDER.map((t) => {
        const p = PERSONAS[t];
        return (
          <button
            key={t}
            onClick={() => onPick(t)}
            className="bg-white/95 backdrop-blur rounded-2xl p-5 text-left hover:scale-[1.02] transition-transform shadow-xl"
          >
            <div className="w-3 h-3 rounded-full mb-3" style={{ background: p.color }} />
            <h2 className="text-xl font-black text-text-primary mb-1">{p.name}</h2>
            <p className="text-xs text-text-muted uppercase tracking-wider mb-3">{p.label}</p>
            <p className="text-sm text-text-secondary mb-3">{p.tagline}</p>
            <p className="text-sm">
              <span className="font-black" style={{ color: p.color }}>
                {formatPrice(p.founderPriceCents)}
              </span>
              <span className="text-text-muted"> /mnd introductieprijs</span>
            </p>
          </button>
        );
      })}
    </div>
  );
}

function UnifiedForm(props: {
  tier: PersonaTier;
  email: string;
  setEmail: (v: string) => void;
  fullName: string;
  setFullName: (v: string) => void;
  postcode: string;
  setPostcode: (v: string) => void;
  gpsStatus: string;
  onGps: () => void;
  gpsCoords: any;
  piet: any;
  setPiet: any;
  reed: any;
  setReed: any;
  steve: any;
  setSteve: any;
  loading: boolean;
  error: string | null;
  onSubmit: (e: React.FormEvent) => void;
  onBack: () => void;
}) {
  const { tier, email, setEmail, fullName, setFullName, postcode, setPostcode, gpsStatus, onGps, gpsCoords, loading, error, onSubmit, onBack } = props;
  const p = PERSONAS[tier];

  return (
    <div className="bg-white/95 backdrop-blur rounded-3xl p-6 sm:p-8 shadow-xl max-w-2xl mx-auto border-t-4" style={{ borderColor: p.color }}>
      <form onSubmit={onSubmit} className="space-y-6">
        {/* Email Sectie */}
        <section className="space-y-4">
          <h3 className="text-lg font-black text-text-primary flex items-center gap-2">
            <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs text-white" style={{ background: p.color }}>1</span>
            Je account
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="E-mailadres">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="jij@voorbeeld.nl"
                className={INPUT_CLASS}
              />
            </Field>
            <Field label="Hoe heet je?">
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Je naam"
                className={INPUT_CLASS}
              />
            </Field>
          </div>
        </section>

        {/* Locatie Sectie */}
        <section className="space-y-4 border-t border-black/5 pt-6">
          <h3 className="text-lg font-black text-text-primary flex items-center gap-2">
            <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs text-white" style={{ background: p.color }}>2</span>
            Je locatie
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Postcode">
              <input
                type="text"
                value={postcode}
                onChange={(e) => setPostcode(e.target.value)}
                placeholder="1012 AB"
                className={INPUT_CLASS}
              />
            </Field>
            <Field label="Of deel GPS">
              <button
                type="button"
                onClick={onGps}
                className={`${INPUT_CLASS} flex items-center justify-between text-left`}
                disabled={gpsStatus === "ok"}
              >
                <span className="truncate text-xs">
                  {gpsStatus === "ok" ? "Gevonden! ✅" : "Klik voor GPS 📍"}
                </span>
              </button>
            </Field>
          </div>
        </section>

        {/* Persona Opties */}
        <section className="space-y-4 border-t border-black/5 pt-6">
          <h3 className="text-lg font-black text-text-primary flex items-center gap-2">
            <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs text-white" style={{ background: p.color }}>3</span>
            {p.name}&apos;s vragen
          </h3>
          
          {tier === 'piet' && <PietFields piet={props.piet} setPiet={props.setPiet} />}
          {tier === 'reed' && <ReedFields reed={props.reed} setReed={props.setReed} />}
          {tier === 'steve' && <SteveFields steve={props.steve} setSteve={props.setSteve} />}
        </section>

        {error && <p className="text-sm text-red-600 bg-red-50 rounded-lg p-3">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full px-6 py-4 font-black text-white disabled:opacity-60 flex items-center justify-center gap-2 shadow-lg hover:brightness-110 active:scale-[0.98] transition-all text-lg"
          style={{ background: p.color }}
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Aanmelden via e-mail →</>}
        </button>

        <button
          type="button"
          onClick={onBack}
          className="block mx-auto text-xs text-text-muted hover:text-text-primary underline"
        >
          Terug naar overzicht
        </button>
      </form>
    </div>
  );
}

function PietFields({ piet, setPiet }: any) {
  return (
    <div className="space-y-3">
      <Field label="Heb je een hond (naam)?">
        <input type="text" value={piet.hondNaam} onChange={(e) => setPiet({ ...piet, hondNaam: e.target.value })} placeholder="Laat leeg indien nee" className={INPUT_CLASS} />
      </Field>
      <div className="grid grid-cols-2 gap-2">
        <CheckRow label="Fiets veel" checked={piet.fiets} onChange={(v) => setPiet({ ...piet, fiets: v })} />
        <CheckRow label="Heeft tuin" checked={piet.tuin} onChange={(v) => setPiet({ ...piet, tuin: v })} />
      </div>
    </div>
  );
}

function ReedFields({ reed, setReed }: any) {
  return (
    <div className="space-y-3">
      <CheckRow label="Kritieke apparatuur in kelder" checked={reed.kelderGevoelig} onChange={(v) => setReed({ ...reed, kelderGevoelig: v })} />
      <CheckRow label="Plat dak / Kwetsbare gevel" checked={reed.platDak} onChange={(v) => setReed({ ...reed, platDak: v })} />
    </div>
  );
}

function SteveFields({ steve, setSteve }: any) {
  return (
    <div className="space-y-4">
      <Field label="Naam van je zaak / bedrijf">
        <input 
          type="text" 
          value={steve.branche} 
          onChange={(e) => setSteve({ ...steve, branche: e.target.value })} 
          placeholder="Bijv. Strandtent Blijburg of Bouwbedrijf Jansen" 
          className={INPUT_CLASS} 
        />
      </Field>
      <div className="bg-accent-cyan/5 border border-accent-cyan/20 rounded-xl p-3">
        <p className="text-[10px] text-accent-cyan font-bold uppercase tracking-wider mb-1">AI Intelligence</p>
        <p className="text-xs text-text-secondary leading-snug">
          Steve analyseert je bedrijfstype automatisch om de juiste weerdrempels (wind, regen, temperatuur) te bepalen. Je hoeft zelf niets in te stellen.
        </p>
      </div>
    </div>
  );
}

function SentCard({ email, tier }: { email: string; tier: PersonaTier | null }) {
  const p = tier ? PERSONAS[tier] : null;
  const accent = p?.color ?? "#f59e0b";

  return (
    <div className="space-y-5">
      {/* Hoofd-confirmatiekaart — glass, in huisstijl */}
      <div className="bg-white/95 backdrop-blur rounded-3xl p-8 sm:p-10 shadow-2xl text-center relative overflow-hidden">
        {/* Persona-accentstrook bovenin */}
        <div
          className="absolute top-0 left-0 right-0 h-1.5"
          style={{ background: accent }}
        />

        <div
          className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5 shadow-lg"
          style={{ background: `${accent}1f`, color: accent }}
        >
          <Check className="w-8 h-8" strokeWidth={3} />
        </div>

        <h2 className="text-2xl sm:text-3xl font-black text-text-primary mb-3 leading-tight">
          Check je inbox
        </h2>
        <p className="text-text-secondary text-base leading-relaxed mb-1">
          We hebben een inloglink gestuurd naar
        </p>
        <p className="text-lg font-black text-text-primary mb-5 break-all">
          {email}
        </p>

        <div className="bg-black/[0.03] rounded-2xl p-4 text-left space-y-2.5 mb-5">
          <div className="flex items-start gap-3">
            <span className="shrink-0 w-6 h-6 rounded-full bg-white flex items-center justify-center text-xs font-black text-text-primary shadow-sm">1</span>
            <p className="text-sm text-text-primary pt-0.5">Open de mail van <strong>info@weerzone.nl</strong></p>
          </div>
          <div className="flex items-start gap-3">
            <span className="shrink-0 w-6 h-6 rounded-full bg-white flex items-center justify-center text-xs font-black text-text-primary shadow-sm">2</span>
            <p className="text-sm text-text-primary pt-0.5">Klik de inloglink (geldig 1 uur)</p>
          </div>
          <div className="flex items-start gap-3">
            <span className="shrink-0 w-6 h-6 rounded-full bg-white flex items-center justify-center text-xs font-black text-text-primary shadow-sm">3</span>
            <p className="text-sm text-text-primary pt-0.5">Vul je postcode + voorkeuren in</p>
          </div>
        </div>

        <p className="text-xs text-text-muted">
          Niks gezien? Check je spam-map, of wacht een minuutje. Dit tabblad mag dicht.
        </p>
      </div>

      {/* Preview van wat ze straks gaan ontvangen */}
      {p && (
        <div className="bg-white/90 backdrop-blur rounded-3xl p-6 shadow-xl">
          <p className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-2">
            Morgenochtend om 07:00
          </p>
          <div className="flex items-start gap-3">
            <div
              className="w-12 h-12 rounded-full shrink-0 flex items-center justify-center text-white font-black text-lg"
              style={{ background: accent }}
            >
              {p.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-black text-text-primary">{p.name} | WEERZONE</p>
              <p className="text-xs text-text-secondary">Jouw {p.label.toLowerCase()}-brief — op jouw postcode</p>
              <p className="text-[13px] text-text-primary mt-2 leading-snug italic">
                &ldquo;{p.tagline}&rdquo;
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const INPUT_CLASS = "w-full rounded-xl border border-black/10 px-4 py-3 text-[#1e293b] bg-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-accent-orange transition-all";

function ProfileForm(props: {
  tier: PersonaTier;
  fullName: string;
  setFullName: (v: string) => void;
  postcode: string;
  setPostcode: (v: string) => void;
  gpsCoords: { lat: number; lon: number } | null;
  gpsStatus: "idle" | "asking" | "ok" | "denied";
  onGps: () => void;
  piet: PietPrefs;
  setPiet: (v: PietPrefs) => void;
  reed: ReedPrefs;
  setReed: (v: ReedPrefs) => void;
  steve: StevePrefs;
  setSteve: (v: StevePrefs) => void;
  loading: boolean;
  error: string | null;
  onSubmit: (e: React.FormEvent) => void;
}) {
  const {
    tier, fullName, setFullName, postcode, setPostcode,
    gpsCoords, gpsStatus, onGps,
    piet, setPiet, reed, setReed, steve, setSteve,
    loading, error, onSubmit,
  } = props;
  const color = PERSONAS[tier].color;

  return (
    <form onSubmit={onSubmit} className="bg-white/95 backdrop-blur rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
      {/* Basis */}
      <section className="space-y-4">
        <Field label="Hoe heet je?">
          <input
            type="text"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Roy"
            className={INPUT_CLASS}
          />
        </Field>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Waar woon je?">
            <input
              type="text"
              value={postcode}
              onChange={(e) => setPostcode(e.target.value)}
              placeholder="1012 AB"
              className={INPUT_CLASS}
            />
          </Field>
          <Field label="Of deel je GPS (preciezer)">
            <button
              type="button"
              onClick={onGps}
              disabled={gpsStatus === "asking" || gpsStatus === "ok"}
              className={`${INPUT_CLASS} flex items-center justify-between text-left disabled:opacity-60`}
            >
              <span className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                {gpsStatus === "ok" && gpsCoords
                  ? `Op de meter — ${gpsCoords.lat.toFixed(3)}, ${gpsCoords.lon.toFixed(3)}`
                  : gpsStatus === "asking"
                    ? "Even kijken…"
                    : gpsStatus === "denied"
                      ? "Niet gelukt — postcode is prima"
                      : "Klik hier"}
              </span>
              {gpsStatus === "ok" && <Check className="w-4 h-4 text-green-600" />}
            </button>
          </Field>
        </div>
      </section>

      {/* Persona-specifiek */}
      <section className="space-y-5 border-t border-black/5 pt-6">
        {tier === "piet" && (
          <>
            <p className="text-sm text-text-secondary leading-relaxed">
              Kort vraagje, dan laat ik je met rust. Alles wat je invult komt
              terug in de briefjes — alles wat je leeg laat, laat ik liggen.
            </p>

            <Field label="Hond?">
              <input
                type="text"
                value={piet.hondNaam}
                onChange={(e) => setPiet({ ...piet, hondNaam: e.target.value })}
                placeholder="Naam — of laat leeg als je geen hond hebt"
                className={INPUT_CLASS}
              />
            </Field>
            <div className="space-y-2">
              <p className="text-xs font-bold text-text-primary">
                Wat doe je nog meer?
              </p>
              <CheckRow label="Fiets is m'n hoofdvervoer" checked={piet.fiets} onChange={(v) => setPiet({ ...piet, fiets: v })} />
              <CheckRow label="Ik heb een tuin — das soms relevant" checked={piet.tuin} onChange={(v) => setPiet({ ...piet, tuin: v })} />
              <CheckRow label="Kinderen in huis" checked={piet.kinderen} onChange={(v) => setPiet({ ...piet, kinderen: v })} />
              <CheckRow label="Luchtwegen zijn gevoelig (astma, hooikoorts)" checked={piet.astma} onChange={(v) => setPiet({ ...piet, astma: v })} />
            </div>
          </>
        )}

        {tier === "reed" && (
          <>
            <p className="text-sm text-text-secondary leading-relaxed">
              Ik bel je alleen als het écht ertoe doet. Geen code-geel-spam.
              Vertel wat er thuis op het spel staat, dan weet ik waar ik op moet
              letten.
            </p>

            <div className="space-y-2">
              <p className="text-xs font-bold text-text-primary">
                Waar ben jij gevoelig voor?
              </p>
              <CheckRow label="Kelder die onderloopt bij hoosbui" checked={reed.kelderGevoelig} onChange={(v) => setReed({ ...reed, kelderGevoelig: v })} />
              <CheckRow label="Plat dak dat bij storm kan rammen" checked={reed.platDak} onChange={(v) => setReed({ ...reed, platDak: v })} />
              <CheckRow label="Baby in huis — hitte is dan anders" checked={reed.baby} onChange={(v) => setReed({ ...reed, baby: v })} />
              <CheckRow label="Dieren buiten (paard, schapen, kippen)" checked={reed.paardWei} onChange={(v) => setReed({ ...reed, paardWei: v })} />
            </div>
            <Field label="Ooit waterschade gehad? Welk jaar? (laat leeg als nee)">
              <input
                type="text"
                value={reed.waterschadeHistorie}
                onChange={(e) => setReed({ ...reed, waterschadeHistorie: e.target.value })}
                placeholder="2018"
                className={INPUT_CLASS}
              />
            </Field>
          </>
        )}

        {tier === "steve" && (
          <>
            <p className="text-sm text-text-secondary leading-relaxed">
              Ik hoef geen balans of KvK-nummer. Gewoon: wat doe je, hoe groot
              ben je, en wanneer kijkt het weer je omzet in de wielen. Dan
              reken ik vanaf morgen mee.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Wat doe je?">
                <input
                  type="text"
                  required
                  value={steve.branche}
                  onChange={(e) => setSteve({ ...steve, branche: e.target.value })}
                  placeholder="strandtent, dakdekker, horeca…"
                  className={INPUT_CLASS}
                />
              </Field>
              <Field label="Hoe groot? (plekken, couverts, zzp=1)">
                <input
                  type="number"
                  value={steve.capaciteit}
                  onChange={(e) => setSteve({ ...steve, capaciteit: e.target.value })}
                  placeholder="120"
                  className={INPUT_CLASS}
                />
              </Field>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-bold text-text-primary">
                Wanneer wordt het een probleem?
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <Field label="Wind vanaf (bft)">
                  <input type="number" value={steve.windBft} onChange={(e) => setSteve({ ...steve, windBft: e.target.value })} className={INPUT_CLASS} />
                </Field>
                <Field label="Regen vanaf (mm)">
                  <input type="number" value={steve.regenMm} onChange={(e) => setSteve({ ...steve, regenMm: e.target.value })} className={INPUT_CLASS} />
                </Field>
                <Field label="Te koud onder (°C)">
                  <input type="number" value={steve.tempMin} onChange={(e) => setSteve({ ...steve, tempMin: e.target.value })} className={INPUT_CLASS} />
                </Field>
                <Field label="Onweer telt mee">
                  <select
                    value={steve.onweer ? "ja" : "nee"}
                    onChange={(e) => setSteve({ ...steve, onweer: e.target.value === "ja" })}
                    className={INPUT_CLASS}
                  >
                    <option value="ja">Ja</option>
                    <option value="nee">Nee</option>
                  </select>
                </Field>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-bold text-text-primary">
                Tot wanneer kan je nog schakelen vandaag?
              </p>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Inkoop uiterlijk om (uur)">
                  <input type="number" min={0} max={23} value={steve.inkoopUur} onChange={(e) => setSteve({ ...steve, inkoopUur: e.target.value })} className={INPUT_CLASS} />
                </Field>
                <Field label="Annuleren uiterlijk om (uur)">
                  <input type="number" min={0} max={23} value={steve.annuleringUur} onChange={(e) => setSteve({ ...steve, annuleringUur: e.target.value })} className={INPUT_CLASS} />
                </Field>
              </div>
            </div>
          </>
        )}
      </section>

      {error && <p className="text-sm text-red-600 bg-red-50 rounded-lg p-3">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-full px-6 py-3 font-black text-white disabled:opacity-60 flex items-center justify-center gap-2 bg-[#f59e0b] shadow-lg hover:brightness-110 active:scale-[0.98] transition-all"
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Klaar. Stuur morgen mijn eerste brief.</>}
      </button>

      <p className="text-[11px] text-text-muted text-center">
        Bedacht je je? Pas het later aan vanuit je dashboard.
      </p>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs font-bold text-text-primary block mb-1">{label}</span>
      {children}
    </label>
  );
}

function CheckRow({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center gap-3 cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="w-4 h-4 rounded border-black/20"
      />
      <span className="text-sm text-text-primary">{label}</span>
    </label>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden>
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
    </svg>
  );
}
