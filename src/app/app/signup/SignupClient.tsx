"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, MapPin, Check } from "lucide-react";
import { PERSONAS, PERSONA_ORDER, formatPrice, type PersonaTier } from "@/lib/personas";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { registerUser } from "@/app/actions";

/**
 * Infoplaza-stijl signup: voornaam + e-mail + wachtwoord + postcode/GPS.
 * Geen magic link. Na registerUser() meteen signInWithPassword() client-side,
 * dan profile + locatie + persona_preferences upserten, dan /app.
 */
export default function SignupClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);

  const queryTier = searchParams.get("tier") as PersonaTier | null;
  const [tier, setTier] = useState<PersonaTier | null>(
    queryTier && PERSONA_ORDER.includes(queryTier) ? queryTier : null,
  );

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [postcode, setPostcode] = useState("");
  const [gpsCoords, setGpsCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [gpsStatus, setGpsStatus] = useState<"idle" | "asking" | "ok" | "denied">("idle");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function captureGps() {
    if (!("geolocation" in navigator)) {
      setGpsStatus("denied");
      return;
    }
    setGpsStatus("asking");
    const safety = setTimeout(() => {
      setGpsStatus((c) => (c === "asking" ? "denied" : c));
    }, 12000);
    try {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          clearTimeout(safety);
          setGpsCoords({ lat: pos.coords.latitude, lon: pos.coords.longitude });
          setGpsStatus("ok");
        },
        () => {
          clearTimeout(safety);
          setGpsStatus("denied");
        },
        { enableHighAccuracy: false, timeout: 10000, maximumAge: 60 * 60 * 1000 },
      );
    } catch {
      clearTimeout(safety);
      setGpsStatus("denied");
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!tier) {
      setError("Kies eerst een persona.");
      return;
    }
    if (!fullName.trim()) {
      setError("Vul je voornaam in.");
      return;
    }
    if (!postcode.trim() && !gpsCoords) {
      setError("Vul je postcode in of deel je GPS.");
      return;
    }
    setLoading(true);
    setError(null);

    try {
      // 1. Account aanmaken via server action (pre-confirmed)
      const result = await registerUser({
        email: email.trim(),
        password,
        tier,
        fullName: fullName.trim(),
      });
      if (!result.ok) {
        setError(result.error);
        setLoading(false);
        return;
      }

      // 2. Client-side inloggen om cookies te zetten
      const { error: signInErr } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (signInErr) {
        setError(`Inloggen mislukt: ${signInErr.message}`);
        setLoading(false);
        return;
      }

      // 3. Profielgegevens opslaan
      const { data: userData } = await supabase.auth.getUser();
      const uid = userData.user?.id;
      if (!uid) {
        setError("Sessie kon niet worden gestart. Probeer opnieuw in te loggen.");
        setLoading(false);
        return;
      }

      await supabase.from("user_profile").upsert({
        id: uid,
        email: email.trim(),
        full_name: fullName.trim(),
        postcode: postcode.trim().toUpperCase() || null,
        primary_lat: gpsCoords?.lat ?? null,
        primary_lon: gpsCoords?.lon ?? null,
        updated_at: new Date().toISOString(),
      });

      if (gpsCoords) {
        await supabase.from("user_locations").insert({
          user_id: uid,
          label: "Thuis",
          lat: gpsCoords.lat,
          lon: gpsCoords.lon,
          is_primary: true,
          persona_scope: [tier],
        });
      }

      await supabase.from("persona_preferences").upsert(
        {
          user_id: uid,
          persona: tier,
          prefs: {},
          onboarding_stage: 1,
          last_updated: new Date().toISOString(),
        },
        { onConflict: "user_id,persona" },
      );

      // 4. Door naar dashboard
      router.replace("/app");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Er ging iets mis.");
      setLoading(false);
    }
  }

  async function handleGoogle() {
    if (!tier) {
      setError("Kies eerst een persona.");
      return;
    }
    setLoading(true);
    setError(null);
    const redirectTo = `${window.location.origin}/auth/callback?next=/app&tier=${tier}`;
    const { error: oauthErr } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo },
    });
    if (oauthErr) {
      const msg = oauthErr.message.toLowerCase();
      if (msg.includes("provider") || msg.includes("unsupported")) {
        setError("Google-login is nog niet actief. Gebruik e-mail + wachtwoord.");
      } else {
        setError(oauthErr.message);
      }
      setLoading(false);
    }
  }

  const p = tier ? PERSONAS[tier] : null;

  return (
    <main className="min-h-screen py-10 px-4 bg-[#4a9ee8] text-white">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-6">
          <h1 className="text-3xl sm:text-4xl font-black drop-shadow mb-2">
            Maak je account
          </h1>
          <p className="text-sm text-white/90">
            Al een account?{" "}
            <Link href="/app/login" className="underline font-bold">
              Inloggen
            </Link>
          </p>
        </div>

        {!tier ? (
          <div className="bg-white/95 backdrop-blur rounded-3xl p-6 shadow-xl text-text-primary">
            <h2 className="text-lg font-black mb-4">Kies je persona</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {PERSONA_ORDER.map((t) => {
                const pp = PERSONAS[t];
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTier(t)}
                    className="rounded-2xl p-4 text-left border border-black/10 hover:scale-[1.02] transition-transform"
                  >
                    <div className="w-3 h-3 rounded-full mb-2" style={{ background: pp.color }} />
                    <p className="font-black">{pp.name}</p>
                    <p className="text-xs text-text-muted">{pp.label}</p>
                    <p className="text-sm mt-2 font-black" style={{ color: pp.color }}>
                      {formatPrice(pp.founderPriceCents)}
                      <span className="text-xs font-normal text-text-muted"> /mnd</span>
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <div
            className="bg-white/95 backdrop-blur rounded-3xl p-6 sm:p-8 shadow-xl text-text-primary border-t-4"
            style={{ borderColor: p!.color }}
          >
            <div className="flex items-center justify-between mb-5">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-text-muted">
                  Gekozen persona
                </p>
                <p className="text-lg font-black" style={{ color: p!.color }}>
                  {p!.name} — {p!.label}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setTier(null)}
                className="text-xs text-text-muted hover:text-text-primary underline"
              >
                Wijzig
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <Field label="Voornaam">
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Roy"
                  className={INPUT}
                />
              </Field>

              <Field label="E-mailadres">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="jij@voorbeeld.nl"
                  autoComplete="email"
                  className={INPUT}
                />
              </Field>

              <Field label="Wachtwoord (minimaal 8 tekens)">
                <input
                  type="password"
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                  className={INPUT}
                />
              </Field>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field label="Postcode">
                  <input
                    type="text"
                    value={postcode}
                    onChange={(e) => setPostcode(e.target.value)}
                    placeholder="1012 AB"
                    className={INPUT}
                  />
                </Field>
                <Field label="Of deel GPS">
                  <button
                    type="button"
                    onClick={captureGps}
                    disabled={gpsStatus === "asking" || gpsStatus === "ok"}
                    className={`${INPUT} flex items-center justify-between text-left disabled:opacity-60`}
                  >
                    <span className="flex items-center gap-2 text-xs">
                      <MapPin className="w-4 h-4" />
                      {gpsStatus === "ok" && gpsCoords
                        ? `${gpsCoords.lat.toFixed(3)}, ${gpsCoords.lon.toFixed(3)}`
                        : gpsStatus === "asking"
                          ? "Even kijken…"
                          : gpsStatus === "denied"
                            ? "Niet gelukt — gebruik postcode"
                            : "Klik voor GPS"}
                    </span>
                    {gpsStatus === "ok" && <Check className="w-4 h-4 text-green-600" />}
                  </button>
                </Field>
              </div>

              {error && (
                <p className="text-sm text-red-600 bg-red-50 rounded-lg p-3">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-full px-6 py-3 font-black text-white disabled:opacity-60 flex items-center justify-center gap-2 shadow-lg hover:brightness-110 active:scale-[0.98] transition-all"
                style={{ background: p!.color }}
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Registreer"}
              </button>

              <div className="relative py-2">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-black/10" />
                </div>
                <div className="relative flex justify-center text-[10px] uppercase tracking-widest">
                  <span className="bg-white px-2 text-text-muted">of</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleGoogle}
                disabled={loading}
                className="w-full rounded-full px-6 py-3 font-bold bg-white border border-black/15 flex items-center justify-center gap-3 hover:bg-black/[0.02] transition-colors disabled:opacity-60"
              >
                <GoogleIcon />
                <span>Verder met Google</span>
              </button>

              <p className="text-[11px] text-text-muted text-center">
                Je eerste brief arriveert morgenochtend 07:00.
              </p>
            </form>
          </div>
        )}
      </div>
    </main>
  );
}

const INPUT =
  "w-full rounded-xl border border-black/10 px-4 py-3 text-[#1e293b] bg-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-accent-orange transition-all";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs font-bold text-text-primary block mb-1">{label}</span>
      {children}
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
