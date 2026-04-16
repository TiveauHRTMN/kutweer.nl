"use client";

import { useState } from "react";
import type { B2BIndustry } from "@/lib/b2b-emails";

const INDUSTRIES: { value: B2BIndustry; label: string }[] = [
  { value: "glazenwasser",     label: "Glazenwassers" },
  { value: "bouw",             label: "Bouw & Infra" },
  { value: "horeca",           label: "Horeca & Terrassen" },
  { value: "evenementen",      label: "Evenementen" },
  { value: "agrarisch",        label: "Agrarisch" },
  { value: "transport",        label: "Transport & Logistiek" },
  { value: "sport",            label: "Sportverenigingen" },
  { value: "schoonmaak",       label: "Schoonmaak" },
  { value: "schildersbedrijf", label: "Schildersbedrijven" },
  { value: "dakdekker",        label: "Dakdekkers" },
  { value: "tuinonderhoud",    label: "Hoveniers" },
  { value: "bezorging",        label: "Bezorging" },
];

const STATUS_COLORS: Record<string, string> = {
  new:          "bg-blue-500/20 text-blue-300",
  emailed:      "bg-yellow-500/20 text-yellow-300",
  subscribed:   "bg-green-500/20 text-green-300",
  unsubscribed: "bg-red-500/20 text-red-400",
};

interface Lead {
  id: string;
  business_name: string;
  email: string;
  city: string | null;
  industry: string;
  phone: string | null;
  status: string;
  outreach_count: number;
  source: string;
  created_at: string;
}

interface Stats {
  total: number;
  new: number;
  emailed: number;
  subscribed: number;
}

export default function B2BAdminPanel({
  stats,
  leads,
  secret,
}: {
  stats: Stats;
  leads: Lead[];
  secret: string;
}) {
  // Discovery form
  const [industry, setIndustry] = useState<B2BIndustry>("glazenwasser");
  const [city, setCity]         = useState("Amsterdam");
  const [discovering, setDiscovering] = useState(false);
  const [discoverResult, setDiscoverResult] = useState<string | null>(null);

  // Outreach
  const [sendingOutreach, setSendingOutreach] = useState(false);
  const [outreachResult, setOutreachResult]   = useState<string | null>(null);

  async function handleDiscover() {
    setDiscovering(true);
    setDiscoverResult(null);
    try {
      const res = await fetch("/api/b2b/discover", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${secret}`,
        },
        body: JSON.stringify({ industry, city }),
      });
      const data = await res.json();
      if (!res.ok) {
        setDiscoverResult(`❌ ${data.error}${data.hint ? ` — ${data.hint}` : ""}`);
      } else {
        setDiscoverResult(
          `✅ ${data.found} bedrijven gevonden · ${data.saved} opgeslagen · ${data.noEmail} zonder e-mail`
        );
      }
    } catch {
      setDiscoverResult("❌ Verbindingsfout");
    } finally {
      setDiscovering(false);
    }
  }

  async function handleSendOutreach() {
    setSendingOutreach(true);
    setOutreachResult(null);
    try {
      const res = await fetch("/api/b2b/outreach", {
        headers: { Authorization: `Bearer ${secret}` },
      });
      const data = await res.json();
      if (!res.ok) {
        setOutreachResult(`❌ ${data.error}`);
      } else {
        setOutreachResult(
          `✅ ${data.sent} e-mails verstuurd van ${data.total} leads${data.errors?.length ? ` · ${data.errors.length} fouten` : ""}`
        );
      }
    } catch {
      setOutreachResult("❌ Verbindingsfout");
    } finally {
      setSendingOutreach(false);
    }
  }

  return (
    <div style={{ background: "linear-gradient(160deg, #1e293b 0%, #0f172a 100%)", minHeight: "100vh", padding: "32px 16px", fontFamily: "system-ui, -apple-system, sans-serif" }}>
      <div style={{ maxWidth: 960, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <p style={{ margin: "0 0 4px", fontSize: 11, color: "#f59e0b", fontWeight: 700, textTransform: "uppercase", letterSpacing: 2 }}>WeerZone</p>
          <h1 style={{ margin: 0, fontSize: 28, fontWeight: 900, color: "#ffffff" }}>B2B Outreach Dashboard</h1>
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 32 }}>
          {[
            { label: "Totaal", value: stats.total, color: "#94a3b8" },
            { label: "Nieuw",  value: stats.new,   color: "#60a5fa" },
            { label: "Gemaild", value: stats.emailed, color: "#fbbf24" },
            { label: "Ingeschreven", value: stats.subscribed, color: "#4ade80" },
          ].map(({ label, value, color }) => (
            <div key={label} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, padding: "16px 20px" }}>
              <p style={{ margin: "0 0 4px", fontSize: 11, color: "#94a3b8", fontWeight: 700, textTransform: "uppercase" }}>{label}</p>
              <p style={{ margin: 0, fontSize: 32, fontWeight: 900, color }}>{value}</p>
            </div>
          ))}
        </div>

        {/* Discovery */}
        <div style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 16, padding: 24, marginBottom: 24 }}>
          <h2 style={{ margin: "0 0 16px", fontSize: 18, fontWeight: 800, color: "#ffffff" }}>🔍 Bedrijven zoeken</h2>
          <p style={{ margin: "0 0 16px", fontSize: 13, color: "#94a3b8" }}>
            Zoekt via Google Places naar bedrijven in de opgegeven stad, scrapet e-mailadressen van hun websites en slaat ze op als lead.
            Vereist: <code style={{ background: "rgba(255,255,255,0.1)", padding: "1px 6px", borderRadius: 4, fontSize: 12 }}>GOOGLE_MAPS_API_KEY</code> in Vercel.
          </p>

          <div style={{ display: "flex", gap: 12, alignItems: "flex-end", flexWrap: "wrap" }}>
            <div>
              <p style={{ margin: "0 0 6px", fontSize: 12, color: "#94a3b8", fontWeight: 600 }}>Branche</p>
              <select
                value={industry}
                onChange={(e) => setIndustry(e.target.value as B2BIndustry)}
                style={{ padding: "10px 14px", borderRadius: 10, background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)", color: "#fff", fontSize: 14 }}
              >
                {INDUSTRIES.map((i) => (
                  <option key={i.value} value={i.value} style={{ background: "#1e293b" }}>{i.label}</option>
                ))}
              </select>
            </div>
            <div>
              <p style={{ margin: "0 0 6px", fontSize: 12, color: "#94a3b8", fontWeight: 600 }}>Stad</p>
              <input
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Amsterdam"
                style={{ padding: "10px 14px", borderRadius: 10, background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)", color: "#fff", fontSize: 14, width: 160 }}
              />
            </div>
            <button
              onClick={handleDiscover}
              disabled={discovering}
              style={{ padding: "10px 24px", borderRadius: 10, background: "#f59e0b", color: "#1e293b", fontWeight: 800, fontSize: 14, border: "none", cursor: discovering ? "not-allowed" : "pointer", opacity: discovering ? 0.7 : 1 }}
            >
              {discovering ? "Zoeken..." : "Zoek bedrijven →"}
            </button>
          </div>

          {discoverResult && (
            <p style={{ margin: "12px 0 0", fontSize: 13, color: "#ffffff", background: "rgba(255,255,255,0.08)", padding: "10px 14px", borderRadius: 8 }}>
              {discoverResult}
            </p>
          )}
        </div>

        {/* Outreach */}
        <div style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.2)", borderRadius: 16, padding: 24, marginBottom: 24 }}>
          <h2 style={{ margin: "0 0 8px", fontSize: 18, fontWeight: 800, color: "#ffffff" }}>📨 Outreach versturen</h2>
          <p style={{ margin: "0 0 16px", fontSize: 13, color: "#94a3b8" }}>
            Stuurt outreach-e-mails naar maximaal 10 nieuwe leads per keer. Elke lead krijgt maximaal 3 pogingen, minimaal 7 dagen tussentijd.
            Dit draait ook automatisch via de cron (ma–vr 09:00).
          </p>
          <button
            onClick={handleSendOutreach}
            disabled={sendingOutreach}
            style={{ padding: "10px 24px", borderRadius: 10, background: "#f59e0b", color: "#1e293b", fontWeight: 800, fontSize: 14, border: "none", cursor: sendingOutreach ? "not-allowed" : "pointer", opacity: sendingOutreach ? 0.7 : 1 }}
          >
            {sendingOutreach ? "Versturen..." : "Stuur outreach nu →"}
          </button>
          {outreachResult && (
            <p style={{ margin: "12px 0 0", fontSize: 13, color: "#ffffff", background: "rgba(255,255,255,0.08)", padding: "10px 14px", borderRadius: 8 }}>
              {outreachResult}
            </p>
          )}
        </div>

        {/* Leads table */}
        <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, overflow: "hidden" }}>
          <div style={{ padding: "16px 20px", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
            <h2 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: "#ffffff" }}>Recente leads ({leads.length})</h2>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "rgba(255,255,255,0.03)" }}>
                  {["Bedrijf", "E-mail", "Stad", "Branche", "Bron", "Status", "Pogingen"].map((h) => (
                    <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontSize: 11, color: "#94a3b8", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {leads.length === 0 && (
                  <tr>
                    <td colSpan={7} style={{ padding: "32px 16px", textAlign: "center", color: "#94a3b8", fontSize: 14 }}>
                      Nog geen leads. Gebruik de discovery hierboven om te beginnen.
                    </td>
                  </tr>
                )}
                {leads.map((lead, i) => (
                  <tr key={lead.id} style={{ borderTop: "1px solid rgba(255,255,255,0.05)", background: i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.02)" }}>
                    <td style={{ padding: "10px 16px", fontSize: 13, color: "#ffffff", fontWeight: 600 }}>{lead.business_name}</td>
                    <td style={{ padding: "10px 16px", fontSize: 12, color: "#94a3b8" }}>{lead.email}</td>
                    <td style={{ padding: "10px 16px", fontSize: 12, color: "#94a3b8" }}>{lead.city ?? "—"}</td>
                    <td style={{ padding: "10px 16px", fontSize: 12, color: "#94a3b8" }}>{lead.industry}</td>
                    <td style={{ padding: "10px 16px", fontSize: 11, color: "#64748b" }}>{lead.source}</td>
                    <td style={{ padding: "10px 16px" }}>
                      <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 99, background: lead.status === "new" ? "rgba(96,165,250,0.15)" : lead.status === "emailed" ? "rgba(251,191,36,0.15)" : lead.status === "subscribed" ? "rgba(74,222,128,0.15)" : "rgba(248,113,113,0.15)", color: lead.status === "new" ? "#93c5fd" : lead.status === "emailed" ? "#fcd34d" : lead.status === "subscribed" ? "#86efac" : "#fca5a5" }}>
                        {lead.status}
                      </span>
                    </td>
                    <td style={{ padding: "10px 16px", fontSize: 12, color: "#64748b", textAlign: "center" }}>{lead.outreach_count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <p style={{ marginTop: 24, textAlign: "center", fontSize: 11, color: "#475569" }}>
          WeerZone B2B Admin · <a href="/zakelijk" style={{ color: "#f59e0b" }}>Bekijk /zakelijk pagina</a>
        </p>
      </div>
    </div>
  );
}
