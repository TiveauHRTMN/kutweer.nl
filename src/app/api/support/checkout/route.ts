import { NextResponse } from "next/server";
import { createSimplePayment } from "@/lib/mollie";

export async function POST(req: Request) {
  try {
    const { amount, name, email, message } = await req.json();

    if (!amount || amount < 1) {
      return NextResponse.json({ error: "Ongeldig bedrag" }, { status: 400 });
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://weerzone.nl";
    const amountCents = Math.round(amount * 100);

    const payment = await createSimplePayment({
      amountCents,
      description: `Support voor een koekje — ${name || "Anoniem"}`,
      redirectUrl: `${siteUrl}/steun/bedankt`,
      webhookUrl: `${siteUrl}/api/webhooks/mollie`,
      metadata: {
        type: "donation",
        name: name || "Anoniem",
        email: email || "",
        message: message || ""
      }
    });

    return NextResponse.json({ url: payment._links.checkout?.href });
  } catch (err) {
    console.error("[support/checkout]", err);
    return NextResponse.json({ error: "Betaling mislukt" }, { status: 500 });
  }
}
