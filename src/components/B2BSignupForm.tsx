"use client";

import { useState } from "react";
import type { B2BIndustry } from "@/lib/b2b-emails";

const INDUSTRY_OPTIONS: { value: B2BIndustry; label: string }[] = [
  { value: "glazenwasser", label: "Glazenwasser" },
  { value: "bouw", label: "Bouw & Infra" },
  { value: "horeca", label: "Horeca & Terrassen" },
  { value: "evenementen", label: "Evenementen & Festivals" },
  { value: "agrarisch", label: "Agrarisch" },
  { value: "transport", label: "Transport & Logistiek" },
  { value: "sport", label: "Sportverenigingen" },
  { value: "schoonmaak", label: "Schoonmaak & Gevelreiniging" },
  { value: "schildersbedrijf", label: "Schildersbedrijf" },
  { value: "dakdekker", label: "Dakdekker" },
  { value: "tuinonderhoud", label: "Tuinonderhoud & Hoveniers" },
  { value: "bezorging", label: "Bezorging & Koeriers" },
];

export default function B2BSignupForm() {
  const [form, setForm] = useState({
    businessName: "",
    email: "",
    city: "",
    industry: "" as B2BIndustry | "",
    phone: "",
  });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");

    try {
      const res = await fetch("/api/b2b/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || "Er ging iets mis.");
        setStatus("error");
        return;
      }

      setStatus("success");
    } catch {
      setErrorMsg("Verbindingsfout. Probeer het opnieuw.");
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="bg-white/5 border border-accent-orange/30 rounded-2xl p-8 text-center">
        <div className="text-5xl mb-4">✅</div>
        <h3 className="text-2xl font-black text-white mb-2">Aanmelding ontvangen!</h3>
        <p className="text-white/60">
          We nemen binnen 24 uur contact op. Check je inbox voor een bevestiging.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white/5 border border-white/10 rounded-2xl p-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Bedrijfsnaam */}
        <div className="sm:col-span-2">
          <label htmlFor="businessName" className="block text-sm font-bold text-white/70 mb-1.5">
            Bedrijfsnaam *
          </label>
          <input
            id="businessName"
            type="text"
            required
            value={form.businessName}
            onChange={(e) => setForm((f) => ({ ...f, businessName: e.target.value }))}
            placeholder="Jansen Glazenwasserij"
            className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-accent-orange focus:ring-1 focus:ring-accent-orange transition-colors"
          />
        </div>

        {/* E-mail */}
        <div>
          <label htmlFor="email" className="block text-sm font-bold text-white/70 mb-1.5">
            E-mailadres *
          </label>
          <input
            id="email"
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            placeholder="info@jouwbedrijf.nl"
            className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-accent-orange focus:ring-1 focus:ring-accent-orange transition-colors"
          />
        </div>

        {/* Telefoon */}
        <div>
          <label htmlFor="phone" className="block text-sm font-bold text-white/70 mb-1.5">
            Telefoon
          </label>
          <input
            id="phone"
            type="tel"
            value={form.phone}
            onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
            placeholder="06-12345678"
            className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-accent-orange focus:ring-1 focus:ring-accent-orange transition-colors"
          />
        </div>

        {/* Stad */}
        <div>
          <label htmlFor="city" className="block text-sm font-bold text-white/70 mb-1.5">
            Stad / Werkgebied
          </label>
          <input
            id="city"
            type="text"
            value={form.city}
            onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
            placeholder="Amsterdam"
            className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-accent-orange focus:ring-1 focus:ring-accent-orange transition-colors"
          />
        </div>

        {/* Branche */}
        <div>
          <label htmlFor="industry" className="block text-sm font-bold text-white/70 mb-1.5">
            Branche *
          </label>
          <select
            id="industry"
            required
            value={form.industry}
            onChange={(e) => setForm((f) => ({ ...f, industry: e.target.value as B2BIndustry }))}
            className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/10 text-white focus:outline-none focus:border-accent-orange focus:ring-1 focus:ring-accent-orange transition-colors appearance-none"
          >
            <option value="" disabled className="bg-slate-900 text-white/50">
              Kies je branche
            </option>
            {INDUSTRY_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value} className="bg-slate-900 text-white">
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Error */}
      {status === "error" && (
        <div className="mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20">
          <p className="text-red-400 text-sm font-medium">{errorMsg}</p>
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={status === "loading"}
        className="mt-6 w-full py-4 rounded-xl bg-accent-orange text-text-primary font-bold text-lg hover:brightness-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {status === "loading" ? "Bezig met aanmelden..." : "Gratis aanmelden →"}
      </button>

      <p className="mt-3 text-center text-white/30 text-xs">
        Geen kosten, geen verplichtingen. We nemen binnen 24 uur contact op.
      </p>
    </form>
  );
}
