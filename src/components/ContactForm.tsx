"use client";

import { useState } from "react";

interface Props {
  locale?: "nl" | "de";
}

const COPY = {
  nl: {
    receivedTag: "Ontvangen",
    receivedTitle: "Bericht ontvangen!",
    receivedBody:
      "We hebben je gegevens in goede orde ontvangen. Check je inbox voor een bevestiging. We antwoorden doorgaans binnen 24 uur op werkdagen.",
    namePh: "Je naam",
    emailPh: "Je e-mailadres",
    messagePh: "Je bericht...",
    sending: "Bezig...",
    send: "Verstuur bericht",
    error: "Ging iets mis. Probeer opnieuw of mail direct naar info@weerzone.nl.",
  },
  de: {
    receivedTag: "Empfangen",
    receivedTitle: "Nachricht empfangen!",
    receivedBody:
      "Wir haben deine Daten erhalten. Schau in deinen Posteingang für eine Bestätigung. Wir antworten an Werktagen in der Regel innerhalb von 24 Stunden.",
    namePh: "Dein Name",
    emailPh: "Deine E-Mail-Adresse",
    messagePh: "Deine Nachricht...",
    sending: "Senden...",
    send: "Nachricht senden",
    error: "Etwas ist schiefgelaufen. Versuch es erneut oder mail direkt an info@weerzone.nl.",
  },
} as const;

export default function ContactForm({ locale = "nl" }: Props) {
  const t = COPY[locale];
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "ok" | "err">("idle");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status === "sending") return;
    setStatus("sending");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message, locale }),
      });
      if (res.ok) {
        setStatus("ok");
        setName("");
        setEmail("");
        setMessage("");
      } else {
        setStatus("err");
      }
    } catch {
      setStatus("err");
    }
  };

  if (status === "ok") {
    return (
      <div className="rounded-2xl border border-green-500/30 bg-green-500/10 p-8 text-center animate-fade-in">
        <div className="text-xs font-black uppercase tracking-[0.25em] text-green-200 mb-3">
          {t.receivedTag}
        </div>
        <p className="font-black text-white text-2xl mb-2">{t.receivedTitle}</p>
        <p className="text-white/70 leading-relaxed">{t.receivedBody}</p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <input
        type="text"
        required
        placeholder={t.namePh}
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/15 text-white placeholder-white/40 focus:outline-none focus:border-accent-orange"
      />
      <input
        type="email"
        required
        placeholder={t.emailPh}
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/15 text-white placeholder-white/40 focus:outline-none focus:border-accent-orange"
      />
      <textarea
        required
        placeholder={t.messagePh}
        rows={5}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/15 text-white placeholder-white/40 focus:outline-none focus:border-accent-orange resize-none"
      />
      <button
        type="submit"
        disabled={status === "sending"}
        className="w-full py-3 rounded-xl bg-accent-orange text-slate-900 font-bold hover:brightness-95 transition-all disabled:opacity-60"
      >
        {status === "sending" ? t.sending : t.send}
      </button>
      {status === "err" && (
        <p className="text-sm text-red-400 text-center">{t.error}</p>
      )}
    </form>
  );
}
