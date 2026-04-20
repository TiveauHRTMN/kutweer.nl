"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export default function LoginClient() {
  const router = useRouter();
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error: signInErr } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    if (signInErr) {
      setError("E-mail of wachtwoord klopt niet.");
      setLoading(false);
      return;
    }
    router.replace("/app");
  }

  async function handleGoogle() {
    setLoading(true);
    setError(null);
    const redirectTo = `${window.location.origin}/auth/callback?next=/app`;
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

  return (
    <main className="min-h-screen py-10 px-4 bg-[#4a9ee8] text-white flex items-center">
      <div className="max-w-md mx-auto w-full">
        <div className="text-center mb-6">
          <h1 className="text-3xl sm:text-4xl font-black drop-shadow mb-2">Inloggen</h1>
          <p className="text-sm text-white/90">
            Nog geen account?{" "}
            <Link href="/prijzen" className="underline font-bold">
              Kies je persona
            </Link>
          </p>
        </div>

        <div className="bg-white/95 backdrop-blur rounded-3xl p-6 sm:p-8 shadow-xl text-text-primary">
          <form onSubmit={handleSubmit} className="space-y-4">
            <label className="block">
              <span className="text-xs font-bold block mb-1">E-mailadres</span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                className={INPUT}
              />
            </label>

            <label className="block">
              <span className="text-xs font-bold block mb-1">Wachtwoord</span>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                className={INPUT}
              />
            </label>

            {error && <p className="text-sm text-red-600 bg-red-50 rounded-lg p-3">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full px-6 py-3 font-black text-white bg-accent-orange shadow-lg hover:brightness-110 active:scale-[0.98] disabled:opacity-60 flex items-center justify-center gap-2 transition-all"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Inloggen"}
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
          </form>
        </div>
      </div>
    </main>
  );
}

const INPUT =
  "w-full rounded-xl border border-black/10 px-4 py-3 text-[#1e293b] bg-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-accent-orange transition-all";

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
