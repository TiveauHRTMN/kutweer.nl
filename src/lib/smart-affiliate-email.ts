/**
 * Template voor de Smart Affiliate Agent e-mails.
 */
export function getSmartAffiliateEmailHtml(city: string, trigger: string, aiText: string): string {
  const emoji = trigger === "regen" ? "☔" : trigger === "storm" ? "🌪️" : trigger === "hitte" ? "☀️" : trigger === "kou" ? "❄️" : "⚠️";
  
  return `<!DOCTYPE html>
<html lang="nl">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>${trigger.toUpperCase()} Alert - ${city}</title>
</head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#0f172a;">
<div style="max-width:500px;margin:20px auto;background:#ffffff;border-radius:24px;overflow:hidden;box-shadow:0 10px 15px -3px rgba(0,0,0,0.1);">
  <div style="background:#0ea5e9;padding:24px;text-align:center;">
    <div style="font-size:48px;margin-bottom:8px;">${emoji}</div>
    <div style="color:#ffffff;font-size:12px;font-weight:800;letter-spacing:1px;text-transform:uppercase;">WEERZONE ALERT · ${city}</div>
  </div>
  
  <div style="padding:32px 24px;">
    <p style="margin:0 0 16px 0;font-size:18px;line-height:1.6;font-weight:500;color:#1e293b;">
      ${aiText}
    </p>
    
    <div style="margin-top:32px;padding-top:24px;border-top:1px solid #f1f5f9;">
      <a href="https://weerzone.nl/app" style="display:block;text-align:center;background:#0ea5e9;color:#ffffff;text-decoration:none;font-weight:800;padding:14px;border-radius:12px;font-size:15px;">
        Open Weerzone Dashboard
      </a>
    </div>
  </div>
  
  <div style="padding:16px;text-align:center;font-size:11px;color:#94a3b8;background:#f8fafc;">
    Je ontvangt dit omdat je "Impact Alerts" hebt ingeschakeld voor ${city}.
    <br/>
    <a href="https://weerzone.nl/app/instellingen" style="color:#94a3b8;">Instellingen aanpassen</a>
  </div>
</div>
</body>
</html>`;
}
