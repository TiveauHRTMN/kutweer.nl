"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Check, Loader2 } from "lucide-react";
import { PERSONAS, PERSONA_ORDER, formatPrice, daysUntilLaunch, type PersonaTier } from "@/lib/personas";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type Step = "tier" | "auth" | "sent" | "ready";

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

  const days = daysUntilLaunch();

  // Al ingelogd? Dan direct naar dashboard (tenzij nog geen tier gekozen)
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await supabase.auth.getUser();
      if (cancelled) return;
      if (data.user) {
        // Check of er al een sub is
        const { data: sub } = await supabase
          .from("subscriptions")
          .select("tier, status")
          .eq("user_id", data.user.id)
          .in("status", ["trialing", "active"])
          .maybeSingle();
        if (sub?.tier) {
          router.replace("/app");
          return;
        }
        // Ingelogd zonder sub — als queryTier aanwezig, direct aanmaken
        if (queryTier && PERSONA_ORDER.includes(queryTier)) {
          await createSubscription(queryTier, data.user.id);
          router.replace("/app");
          return;
        }
        setStep("tier");
      }
      setCheckingSession(false);
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function createSubscription(chosen: PersonaTier, userId: string) {
    const trialEnd = new Date("2026-06-01T00:00:00+02:00").toISOString();
    await supabase.from("subscriptions").upsert(
      {
        user_id: userId,
        tier: chosen,
        status: "trialing",
        trial_end: trialEnd,
        is_founder: true,
      },
      { onConflict: "user_id" },
    );
  }

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault();
    if (!tier || !email) return;
    setLoading(true);
    setError(null);

    const redirectTo = `${window.location.origin}/auth/callback?next=/app/onboarding&tier=${tier}`;

    const { error: otpError } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: redirectTo,
        data: { chosen_tier: tier },
      },
    });

    setLoading(false);
    if (otpError) {
      setError(otpError.message);
      return;
    }
    setStep("sent");
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
      setError(oauthError.message);
      setLoading(false);
    }
  }

  if (checkingSession) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-white" />
      </main>
    );
  }

  return (
    <main className="min-h-screen py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/90 backdrop-blur mb-4 shadow-sm">
            <span className="w-2 h-2 rounded-full animate-pulse bg-red-500" />
            <span className="text-xs font-black text-text-primary uppercase tracking-wider">
              Tijdelijk gratis · nog {days} dagen
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white drop-shadow mb-2">
            {step === "sent" ? "Check je inbox" : "Word founder"}
          </h1>
          <p className="text-white/90 text-sm">
            {step === "tier" && "Kies je persona — gratis tot 1 juni, founder-prijs voor altijd."}
            {step === "auth" && tier && (
              <>
                Je koos voor{" "}
                <strong style={{ color: PERSONAS[tier].color }}>
                  {PERSONAS[tier].name}
                </strong>
                . Log in om te bevestigen.
              </>
            )}
            {step === "sent" && "We stuurden je een inloglink."}
          </p>
        </div>

        {step === "tier" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {PERSONA_ORDER.map((t) => {
              const p = PERSONAS[t];
              return (
                <button
                  key={t}
                  onClick={() => {
                    setTier(t);
                    setStep("auth");
                  }}
                  className="bg-white/95 backdrop-blur rounded-2xl p-5 text-left hover:scale-[1.02] transition-transform shadow-xl"
                >
                  <div
                    className="w-3 h-3 rounded-full mb-3"
                    style={{ background: p.color }}
                  />
                  <h2 className="text-xl font-black text-text-primary mb-1">
                    {p.name}
                  </h2>
                  <p className="text-xs text-text-muted uppercase tracking-wider mb-3">
                    {p.label}
                  </p>
                  <p className="text-sm text-text-secondary mb-3">
                    {p.tagline}
                  </p>
                  <p className="text-sm">
                    <span className="font-black" style={{ color: p.color }}>
                      {formatPrice(p.founderPriceCents)}
                    </span>
                    <span className="text-text-muted"> /mnd founder</span>
                  </p>
                </button>
              );
            })}
          </div>
        )}

        {step === "auth" && tier && (
          <div className="bg-white/95 backdrop-blur rounded-3xl p-6 sm:p-8 shadow-xl">
            <form onSubmit={handleMagicLink} className="space-y-4">
              <label className="block">
                <span className="text-sm font-bold text-text-primary">
                  E-mailadres
                </span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="jij@voorbeeld.nl"
                  className="mt-1 w-full rounded-xl border border-black/10 px-4 py-3 text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-orange"
                />
                <span className="text-xs text-text-muted mt-1 block">
                  Elke e-mailprovider werkt (Gmail, Outlook, eigen domein…)
                </span>
              </label>

              {error && (
                <p className="text-sm text-red-600 bg-red-50 rounded-lg p-3">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-full px-6 py-3 font-black text-white disabled:opacity-60 flex items-center justify-center gap-2"
                style={{ background: PERSONAS[tier].color }}
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>Stuur inloglink</>
                )}
              </button>
            </form>

            <div className="flex items-center gap-3 my-5">
              <div className="flex-1 h-px bg-black/10" />
              <span className="text-xs text-text-muted uppercase tracking-wider">
                of
              </span>
              <div className="flex-1 h-px bg-black/10" />
            </div>

            <button
              onClick={handleGoogleOAuth}
              disabled={loading}
              className="w-full rounded-full px-6 py-3 font-bold text-text-primary border border-black/15 hover:bg-black/[0.03] disabled:opacity-60 flex items-center justify-center gap-2"
            >
              <GoogleIcon /> Doorgaan met Google
            </button>

            <button
              onClick={() => {
                setTier(null);
                setStep("tier");
              }}
              className="block mx-auto mt-5 text-xs text-text-muted hover:text-text-primary underline"
            >
              Andere persona kiezen
            </button>
          </div>
        )}

        {step === "sent" && (
          <div className="bg-white/95 backdrop-blur rounded-3xl p-8 shadow-xl text-center">
            <div className="w-14 h-14 rounded-full bg-green-100 text-green-600 flex items-center justify-center mx-auto mb-4">
              <Check className="w-7 h-7" />
            </div>
            <p className="text-text-primary font-bold mb-2">
              Inloglink verstuurd naar <br />
              <span className="text-accent-orange">{email}</span>
            </p>
            <p className="text-sm text-text-secondary">
              Check je inbox (en spam). Klik de link om door te gaan. Je kan
              dit tabblad sluiten.
            </p>
          </div>
        )}
      </div>
    </main>
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
