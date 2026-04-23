import { PERSONAS, type PersonaTier } from "@/lib/personas";
import type { PersonaBrief } from "@/lib/persona-brief";

export interface EmailAmazonTip {
  title: string;
  subtitle?: string;
  price?: string;
  url: string;
  emoji?: string;
  color?: string; // hex voor achtergrond-accent
}

/**
 * HTML-template voor de dagelijkse persona-brief. Bewust sober gehouden —
 * inbox-first, mobile-first. Kleurvlak = persona-kleur, niet de huisstijl.
 */
export function buildPersonaEmailHtml(
  tier: PersonaTier,
  brief: PersonaBrief,
  city: string,
  unsubscribeUrl: string,
  amazonTip?: EmailAmazonTip,
): string {
  const p = PERSONAS[tier];
  const date = new Date().toLocaleDateString("nl-NL", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  const bullets = brief.details
    .map(
      (d) =>
        `<li style="margin:0 0 8px 0;line-height:1.55;color:#1a1a1a;">${escapeHtml(d)}</li>`,
    )
    .join("");

  return `<!DOCTYPE html>
<html lang="nl">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>${escapeHtml(brief.subject)}</title>
</head>
<body style="margin:0;padding:0;background:#f4f7f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#1e293b;">
<div style="max-width:560px;margin:20px auto;background:#ffffff;border-radius:24px;overflow:hidden;box-shadow:0 10px 40px rgba(0,0,0,0.05);border:1px solid #e2e8f0;">
  <div style="background:${p.color};padding:32px 30px;color:#ffffff;">
    <div style="font-size:10px;font-weight:900;letter-spacing:2px;text-transform:uppercase;opacity:0.75;margin-bottom:8px;">WEERZONE INTELLIGENCE ENGINE</div>
    <div style="font-size:24px;font-weight:900;letter-spacing:-0.02em;">${escapeHtml(p.name)}: ${escapeHtml(city)}</div>
    <div style="font-size:13px;font-weight:500;opacity:0.9;margin-top:4px;">${escapeHtml(date)} · 48 uur vooruit</div>
  </div>

  <div style="padding:40px 30px 10px 30px;">
    <div style="font-size:18px;font-weight:800;color:#0f172a;margin-bottom:16px;">${escapeHtml(brief.greeting)}</div>
    <div style="font-size:16px;line-height:1.7;color:#334155;">${escapeHtml(brief.verdict).replace(/\n/g, "<br>")}</div>

    ${
      bullets
        ? `<ul style="margin:24px 0;padding:0 0 0 20px;font-size:15px;color:#475569;">${bullets}</ul>`
        : ""
    }

    <div style="margin:32px 0 0 0;padding:20px;background:#f8fafc;border-radius:16px;border-left:4px solid ${p.color};">
      <p style="margin:0;font-size:14px;color:#1e293b;font-weight:700;line-height:1.5;">${escapeHtml(brief.closing)}</p>
    </div>
  </div>

  <div style="padding:30px;text-align:center;">
    <a href="https://weerzone.nl/piet" style="display:inline-block;background:#0f172a;color:#ffffff;text-decoration:none;font-weight:800;padding:14px 28px;border-radius:14px;font-size:14px;box-shadow:0 4px 12px rgba(15,23,42,0.15);">
      Bekijk volledige 48-uurs analyse →
    </a>
  </div>

  ${amazonTip ? renderAmazonTip(amazonTip, p.name) : ""}

  <div style="padding:16px 24px;font-size:11px;color:#999;text-align:center;background:#fafafa;">
    Dit is je ${escapeHtml(p.label.toLowerCase())}-brief.
    Niet meer ontvangen? <a href="${unsubscribeUrl}" style="color:#999;">Uitschrijven</a>.
    WEERZONE — 48 uur vooruit. De rest is ruis.
  </div>
</div>
</body>
</html>`;
}

function renderAmazonTip(tip: EmailAmazonTip, personaName: string): string {
  const bg = tip.color ? `${tip.color}1a` : "#fef3e8";
  const border = tip.color ? `${tip.color}55` : "#f5a15f";
  return `
  <div style="padding:0 24px 20px 24px;">
    <a href="${escapeAttr(tip.url)}" target="_blank" rel="noopener sponsored" style="display:block;text-decoration:none;color:inherit;border:1px solid ${border};background:${bg};border-radius:14px;padding:14px 16px;">
      <div style="font-size:10px;letter-spacing:1.5px;text-transform:uppercase;color:#b45309;font-weight:800;margin-bottom:6px;">
        ${escapeHtml(personaName)}'s tip · Amazon
      </div>
      <div style="display:flex;align-items:center;gap:12px;">
        ${tip.emoji ? `<div style="font-size:32px;line-height:1;">${escapeHtml(tip.emoji)}</div>` : ""}
        <div style="flex:1;min-width:0;">
          <div style="font-size:14px;font-weight:800;color:#1a1a1a;line-height:1.3;">${escapeHtml(tip.title)}</div>
          ${tip.subtitle ? `<div style="font-size:12px;color:#555;margin-top:2px;line-height:1.35;">${escapeHtml(tip.subtitle)}</div>` : ""}
          ${tip.price ? `<div style="font-size:13px;font-weight:900;color:#1a1a1a;margin-top:4px;">${escapeHtml(tip.price)} <span style="color:#b45309;font-weight:700;">· Bekijk →</span></div>` : `<div style="font-size:12px;font-weight:800;color:#b45309;margin-top:4px;">Bekijk op Amazon →</div>`}
        </div>
      </div>
    </a>
    <div style="font-size:10px;color:#999;margin-top:6px;text-align:center;">
      Als je hier iets koopt, krijgt WEERZONE een kleine commissie. Prijs blijft gelijk.
    </div>
  </div>`;
}

function escapeAttr(str: string): string {
  return escapeHtml(str);
}

function escapeHtml(str: string): string {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
