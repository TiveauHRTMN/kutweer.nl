import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { Resend } from "resend";
import { getWelcomeEmailHtml } from "@/lib/welcome-email";

export async function POST(req: Request) {
  try {
    const resend = new Resend(process.env.RESEND_API_KEY || "dummy");
    const { email, city, lat, lon } = await req.json();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Ongeldig e-mailadres" }, { status: 400 });
    }

    const supabase = getSupabase();
    if (!supabase) return NextResponse.json({ ok: true, demo: true });

    const { error } = await supabase
      .from("subscribers")
      .upsert(
        { email: email.toLowerCase().trim(), city: city || "Amsterdam", lat, lon, active: true },
        { onConflict: "email" }
      );

    if (error) return NextResponse.json({ error: "Opslaan mislukt" }, { status: 500 });

    if (process.env.RESEND_API_KEY) {
      try {
        const fromAddress = "WEERZONE <info@weerzone.nl>";
        const html = getWelcomeEmailHtml(email, "piet", city);

        await resend.emails.send({
          from: fromAddress,
          to: email,
          subject: "BOEM! 🚀 Je bent nu officieel de baas over het weer bij WEERZONE!",
          html,
        });
      } catch (err: any) {
        console.error("Welcome email failed:", err);
      }
    }

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: "Server error", details: e.message }, { status: 500 });
  }
}
