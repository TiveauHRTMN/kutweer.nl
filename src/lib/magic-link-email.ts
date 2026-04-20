import { PERSONAS, type PersonaTier } from "@/lib/personas";

/**
 * De "WeerZone House Style" Magic Link mail.
 * Geen saaie tekst, maar een professionele uitnodiging om te starten.
 */
export function getBrandedMagicLinkHtml(
  tier: PersonaTier,
  actionLink: string,
  name: string
): string {
  const persona = PERSONAS[tier];
  
  return `
<!DOCTYPE html>
<html lang="nl">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welkom bij WEERZONE</title>
</head>
<body style="margin:0;padding:0;background-color:#f1f5f9;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <div style="max-width:560px;margin:20px auto;background-color:#ffffff;border-radius:24px;overflow:hidden;box-shadow:0 10px 25px rgba(0,0,0,0.05);border:1px solid #e2e8f0;">
    
    <!-- HEADER -->
    <div style="background:linear-gradient(135deg, ${persona.color} 0%, #1e293b 100%);padding:40px 30px;text-align:center;">
      <div style="font-size:12px;font-weight:900;color:rgba(255,255,255,0.7);text-transform:uppercase;letter-spacing:2px;margin-bottom:10px;">WEERZONE · ${persona.name.toUpperCase()}</div>
      <h1 style="color:#ffffff;font-size:28px;font-weight:900;margin:0;text-transform:uppercase;letter-spacing:-0.5px;">Eén klik verwijderd van de data 🚀</h1>
    </div>

    <!-- CONTENT -->
    <div style="padding:40px 30px;text-align:center;">
      <p style="font-size:18px;color:#1e293b;font-weight:700;margin:0 0 16px;">Hé ${name || 'weerliefhebber'},</p>
      <p style="font-size:15px;color:#475569;line-height:1.6;margin:0 0 32px;">
        Bedankt voor je aanmelding bij WEERZONE. Je hebt gekozen voor ${persona.name}. Klik op de knop hieronder om je account te activeren en direct je dashboard te bekijken.
      </p>

      <!-- CTA BUTTON -->
      <a href="${actionLink}" style="display:inline-block;background-color:${persona.color};color:#ffffff;padding:18px 40px;border-radius:100px;text-decoration:none;font-weight:900;font-size:16px;text-transform:uppercase;box-shadow:0 8px 20px ${persona.color}40;">
        Activeer mijn account →
      </a>

      <p style="font-size:12px;color:#94a3b8;margin-top:32px;line-height:1.5;">
        Werkt de knop niet? Kopieer en plak deze link in je browser:<br>
        <a href="${actionLink}" style="color:${persona.color};text-decoration:underline;">${actionLink}</a>
      </p>
    </div>

    <!-- FOOTER -->
    <div style="background-color:#f8fafc;padding:30px;text-align:center;border-top:1px solid #f1f5f9;">
      <p style="margin:0;font-size:13px;color:#1e293b;font-weight:800;text-transform:uppercase;letter-spacing:1px;">48 uur vooruit. De rest is ruis.</p>
      <p style="margin:8px 0 0;font-size:11px;color:#94a3b8;">Je ontvangt deze mail omdat je je hebt aangemeld op weerzone.nl.</p>
    </div>
  </div>
</body>
</html>
  `.trim();
}
