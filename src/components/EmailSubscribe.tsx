"use client";

import { useState } from "react";
import { Mail, Check, Loader2 } from "lucide-react";
import type { City } from "@/lib/types";

interface Props {
  city: City;
}

export default function EmailSubscribe({ city }: Props) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || status === "loading") return;

    setStatus("loading");
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, city: city.name, lat: city.lat, lon: city.lon }),
      });
      if (!res.ok) throw new Error();
      setStatus("done");
    } catch {
      setStatus("error");
    }
  }

  if (status === "done") {
    return (
      <div className="card p-5 text-center space-y-2">
        <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-accent-green/15">
          <Check className="w-5 h-5 text-accent-green" />
        </div>
        <p className="text-sm font-bold text-text-primary">Aanmelding Voltooid</p>
        <p className="text-xs text-text-secondary">
          Morgenochtend stipt om 08:00 krijg je de eerste keiharde feiten voor {city.name} in je inbox. Hou het lokaal.
        </p>
      </div>
    );
  }

  return (
    <div className="card p-5 space-y-3">
      <div className="flex items-center gap-2">
        <Mail className="w-4 h-4 text-accent-orange" />
        <h3 className="text-sm font-bold text-text-primary">De 48-Uur Update</h3>
      </div>
      <p className="text-xs text-text-secondary">
        Elke ochtend om 08:00 de keiharde voorspelling voor {city.name}. Geen standaard weerman-poespas. Gratis.
      </p>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => { setEmail(e.target.value); setStatus("idle"); }}
          placeholder="je@email.nl"
          required
          className="flex-1 min-w-0 px-3 py-2.5 rounded-xl border border-black/10 bg-white/70 text-sm text-text-primary placeholder:text-text-muted outline-none focus:border-accent-orange/40 focus:ring-2 focus:ring-accent-orange/10"
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className="px-4 py-2.5 rounded-xl bg-accent-orange text-text-primary text-sm font-bold hover:brightness-90 transition-all active:scale-[0.98] disabled:opacity-60 shrink-0"
        >
          {status === "loading" ? <Loader2 className="w-4 h-4 animate-spin" /> : "Aanmelden"}
        </button>
      </form>
      {status === "error" && (
        <p className="text-xs text-accent-red font-semibold">Er ging iets mis. Probeer het opnieuw.</p>
      )}
    </div>
  );
}
