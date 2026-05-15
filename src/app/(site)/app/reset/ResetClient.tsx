"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Check, Loader2 } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import WzAuthShell from "@/components/wz/WzAuthShell";
import { detectLocale } from "@/config/locales";
import { WzTextField } from "@/components/wz/WzForm";

export default function ResetClient() {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const searchParams = useSearchParams();
  const locale = searchParams?.get("lang") === "de" ? "de" : detectLocale("/");
  const isDE = locale === "de";

  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !/.+@.+\..+/.test(email)) {
      setError(isDE ? "Gib eine gültige E-Mail-Adresse ein" : "Vul een geldig e-mailadres in");
      return;
    }
    setError(null);
    setLoading(true);
    const redirectTo = `${window.location.origin}/auth/callback?next=/app/reset/confirm${isDE ? "&lang=de" : ""}`;
    const { error: resetErr } = await supabase.auth.resetPasswordForEmail(
      email.trim(),
      { redirectTo },
    );
    setLoading(false);
    if (resetErr) {
      setError(resetErr.message);
      return;
    }
    setSent(true);
  }

  return (
    <WzAuthShell
      title={isDE ? "Keine Sorge, das bekommen wir hin." : "Geen zorgen, dat lossen we zo op."}
      subtitle={isDE ? "Gib deine E-Mail-Adresse ein und wir schicken dir innerhalb einer Minute einen Link, um ein neues Passwort festzulegen." : "Vul je e-mailadres in en we sturen je binnen een minuut een link om een nieuw wachtwoord in te stellen."}
    >
      {!sent ? (
        <>
          <h1 className="wz-h-1 mb-2">{isDE ? "Passwort vergessen" : "Wachtwoord vergeten"}</h1>
          <p className="wz-body mb-6">
            {isDE ? "Gib deine E-Mail-Adresse ein. Wir schicken dir einen Link, um dein Passwort neu festzulegen." : "Vul je e-mailadres in. We sturen je een link om je wachtwoord opnieuw in te stellen."}
          </p>

          <form onSubmit={handleSubmit} noValidate>
            <WzTextField
              label={isDE ? "E-Mail-Adresse" : "E-mailadres"}
              type="email"
              value={email}
              onChange={setEmail}
              placeholder={isDE ? "du@beispiel.de" : "je@voorbeeld.nl"}
              error={error ?? undefined}
              autoFocus
              autoComplete="email"
            />
            <button
              type="submit"
              disabled={loading}
              className="wz-btn wz-btn-primary wz-btn-block wz-btn-lg disabled:opacity-60"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : isDE ? "Reset-Link senden" : "Stuur reset link"}
            </button>
          </form>

          <p className="text-sm text-center mt-5" style={{ color: "var(--wz-text-mute)" }}>
            <Link
              href={isDE ? "/app/login?lang=de" : "/app/login"}
              className="font-bold no-underline hover:underline"
              style={{ color: "var(--wz-brand)" }}
            >
              {isDE ? "← Zurück zum Login" : "← Terug naar inloggen"}
            </Link>
          </p>
        </>
      ) : (
        <div className="text-center py-5">
          <div
            className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-5"
            style={{ background: "var(--wz-success-bg)", color: "var(--wz-success)" }}
          >
            <Check className="w-8 h-8" strokeWidth={2.5} />
          </div>
          <h1 className="wz-h-1 mb-2">{isDE ? "Posteingang prüfen" : "Check je inbox"}</h1>
          <p className="wz-body mb-6">
            {isDE ? "Wir haben einen Link an" : "We hebben een link gestuurd naar"}{" "}
            <strong style={{ color: "var(--wz-text)" }}>{email}</strong>.
            {isDE ? " Klicke darauf, um dein Passwort zurückzusetzen." : " Klik erop om je wachtwoord opnieuw in te stellen."}
          </p>
          <Link href={isDE ? "/app/login?lang=de" : "/app/login"} className="wz-btn wz-btn-ghost wz-btn-block">
            {isDE ? "Zurück zum Login" : "Terug naar inloggen"}
          </Link>
          <p className="text-sm mt-5" style={{ color: "var(--wz-text-mute)" }}>
            {isDE ? "Keine E-Mail erhalten?" : "Geen e-mail ontvangen?"}{" "}
            <button
              type="button"
              onClick={() => setSent(false)}
              className="font-bold bg-transparent border-0 cursor-pointer p-0"
              style={{ color: "var(--wz-brand)" }}
            >
              {isDE ? "Erneut versuchen" : "Opnieuw proberen"}
            </button>
          </p>
        </div>
      )}
    </WzAuthShell>
  );
}
