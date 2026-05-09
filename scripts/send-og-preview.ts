import { Resend } from "resend";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const resend = new Resend(process.env.RESEND_API_KEY);

async function sendPreview() {
  try {
    const { data, error } = await resend.emails.send({
      from: "WEERZONE <info@weerzone.nl>",
      to: "info@weerzone.nl",
      subject: "Preview: Nieuwe Dynamische Reddit/Social Thumbnail 🚀",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
          <h2 style="color: #0ea5e9;">Hier is je nieuwe OpenGraph Thumbnail!</h2>
          <p>Dit is het dynamische design dat mensen op Reddit, Twitter, en iMessage te zien krijgen als je een link naar een lokale weerpagina deelt (in dit voorbeeld: Amsterdam).</p>
          <p><strong>Geen AI, 100% Next.js code voor haarscherpe kwaliteit.</strong></p>
          
          <div style="margin-top: 30px; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.1);">
            <img src="https://weerzone.nl/weer/noord-holland/amsterdam/opengraph-image?v=${Date.now()}" alt="OpenGraph Preview Amsterdam" style="width: 100%; height: auto; display: block;" />
          </div>

          <p style="margin-top: 30px; font-size: 12px; color: #64748b;">
            Test het gerust zelf door een willekeurige plaatsnaam in de URL in te vullen.<br>
            — OpenClaw & Hermes
          </p>
        </div>
      `,
    });

    if (error) {
      console.error("Error sending email:", error);
    } else {
      console.log("✅ Preview email sent successfully!", data);
    }
  } catch (err) {
    console.error("Failed to send email:", err);
  }
}

sendPreview();